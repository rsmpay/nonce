export type UserRole = "owner" | "admin" | "moderator" | "member";
export type ConversationType = "dm" | "group" | "channel";
export type ConversationMemberRole = "owner" | "admin" | "member";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          nickname: string;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nickname: string;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nickname?: string;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          type: ConversationType;
          name: string | null;
          description: string | null;
          image_url: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: ConversationType;
          name?: string | null;
          description?: string | null;
          image_url?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: ConversationType;
          name?: string | null;
          description?: string | null;
          image_url?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversation_members: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          role: ConversationMemberRole;
          joined_at: string;
          last_read_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          role?: ConversationMemberRole;
          joined_at?: string;
          last_read_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
          role?: ConversationMemberRole;
          joined_at?: string;
          last_read_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invite_links: {
        Row: {
          id: string;
          code: string;
          conversation_id: string | null;
          created_by: string;
          expires_at: string | null;
          max_uses: number | null;
          current_uses: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          conversation_id?: string | null;
          created_by: string;
          expires_at?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          conversation_id?: string | null;
          created_by?: string;
          expires_at?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      conversation_type: ConversationType;
      conversation_member_role: ConversationMemberRole;
    };
  };
}

// Convenience types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type ConversationMember = Database["public"]["Tables"]["conversation_members"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type InviteLink = Database["public"]["Tables"]["invite_links"]["Row"];

// Extended types with joins
export interface MessageWithSender extends Message {
  sender: User;
}

export interface ConversationWithDetails extends Conversation {
  members: (ConversationMember & { user: User })[];
  last_message?: MessageWithSender;
  unread_count?: number;
}
