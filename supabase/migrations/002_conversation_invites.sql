-- Add conversation_id to invite_links for conversation-specific invites
ALTER TABLE invite_links ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Index for conversation invites
CREATE INDEX idx_invite_links_conversation ON invite_links(conversation_id) WHERE conversation_id IS NOT NULL;

-- Update RLS policies for conversation invites

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view invite links" ON invite_links;
DROP POLICY IF EXISTS "Admins can create invite links" ON invite_links;
DROP POLICY IF EXISTS "Admins can update invite links" ON invite_links;
DROP POLICY IF EXISTS "Admins can delete invite links" ON invite_links;

-- New policies: Community-wide invites (conversation_id IS NULL) require admin
-- Conversation invites require conversation owner/admin

CREATE POLICY "Users can view invite links"
    ON invite_links FOR SELECT
    TO authenticated
    USING (
        -- Community invites: only admins
        (conversation_id IS NULL AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('owner', 'admin')
        ))
        OR
        -- Conversation invites: conversation members can view
        (conversation_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM conversation_members
            WHERE conversation_members.conversation_id = invite_links.conversation_id
            AND conversation_members.user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can create invite links"
    ON invite_links FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = created_by
        AND (
            -- Community invites: only admins
            (conversation_id IS NULL AND EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role IN ('owner', 'admin')
            ))
            OR
            -- Conversation invites: conversation owner/admin can create
            (conversation_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM conversation_members
                WHERE conversation_members.conversation_id = invite_links.conversation_id
                AND conversation_members.user_id = auth.uid()
                AND conversation_members.role IN ('owner', 'admin')
            ))
        )
    );

CREATE POLICY "Users can update invite links"
    ON invite_links FOR UPDATE
    TO authenticated
    USING (
        -- Community invites: only admins
        (conversation_id IS NULL AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('owner', 'admin')
        ))
        OR
        -- Conversation invites: creator or conversation owner/admin
        (conversation_id IS NOT NULL AND (
            created_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM conversation_members
                WHERE conversation_members.conversation_id = invite_links.conversation_id
                AND conversation_members.user_id = auth.uid()
                AND conversation_members.role IN ('owner', 'admin')
            )
        ))
    );

CREATE POLICY "Users can delete invite links"
    ON invite_links FOR DELETE
    TO authenticated
    USING (
        -- Community invites: only admins
        (conversation_id IS NULL AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('owner', 'admin')
        ))
        OR
        -- Conversation invites: creator or conversation owner/admin
        (conversation_id IS NOT NULL AND (
            created_by = auth.uid()
            OR EXISTS (
                SELECT 1 FROM conversation_members
                WHERE conversation_members.conversation_id = invite_links.conversation_id
                AND conversation_members.user_id = auth.uid()
                AND conversation_members.role IN ('owner', 'admin')
            )
        ))
    );

-- Function to validate conversation invite code (public for join flow)
CREATE OR REPLACE FUNCTION get_conversation_by_invite_code(invite_code TEXT)
RETURNS TABLE (
    conversation_id UUID,
    conversation_name TEXT,
    conversation_type conversation_type,
    member_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.type,
        (SELECT COUNT(*) FROM conversation_members cm WHERE cm.conversation_id = c.id)
    FROM invite_links il
    JOIN conversations c ON c.id = il.conversation_id
    WHERE il.code = invite_code
    AND il.is_active = TRUE
    AND (il.expires_at IS NULL OR il.expires_at > NOW())
    AND (il.max_uses IS NULL OR il.current_uses < il.max_uses);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join conversation via invite code
CREATE OR REPLACE FUNCTION join_conversation_by_invite(invite_code TEXT)
RETURNS UUID AS $$
DECLARE
    conv_id UUID;
    already_member BOOLEAN;
BEGIN
    -- Get conversation from invite
    SELECT il.conversation_id INTO conv_id
    FROM invite_links il
    WHERE il.code = invite_code
    AND il.is_active = TRUE
    AND (il.expires_at IS NULL OR il.expires_at > NOW())
    AND (il.max_uses IS NULL OR il.current_uses < il.max_uses);

    IF conv_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invite code';
    END IF;

    -- Check if already a member
    SELECT EXISTS (
        SELECT 1 FROM conversation_members
        WHERE conversation_id = conv_id AND user_id = auth.uid()
    ) INTO already_member;

    IF already_member THEN
        RETURN conv_id;
    END IF;

    -- Add user to conversation
    INSERT INTO conversation_members (conversation_id, user_id, role)
    VALUES (conv_id, auth.uid(), 'member');

    -- Increment invite usage
    UPDATE invite_links
    SET current_uses = current_uses + 1
    WHERE code = invite_code;

    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
