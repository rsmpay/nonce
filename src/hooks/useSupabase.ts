"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useChatStore } from "@/stores/chat";
import type {
  ConversationWithDetails,
  MessageWithSender,
  User,
} from "@/types/database";

export function useCurrentUser() {
  const { currentUser, setCurrentUser } = useChatStore();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profile) {
          setCurrentUser(profile);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [supabase, setCurrentUser]);

  return { user: currentUser, loading };
}

export function useConversations() {
  const { conversations, setConversations, currentUser } = useChatStore();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchConversations = async () => {
    if (!currentUser) return;

    // Get conversations with members and last message
    const { data: memberData } = await supabase
      .from("conversation_members")
      .select(
        `
        conversation_id,
        conversations (
          id,
          type,
          name,
          description,
          image_url,
          created_by,
          created_at,
          updated_at
        )
      `
      )
      .eq("user_id", currentUser.id);

    if (!memberData) {
      setLoading(false);
      return;
    }

    const conversationIds = memberData.map((m) => m.conversation_id);

    // Get all members for these conversations
    const { data: allMembers } = await supabase
      .from("conversation_members")
      .select(
        `
        *,
        user:users (*)
      `
      )
      .in("conversation_id", conversationIds);

    // Get last message for each conversation
    const { data: lastMessages } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:users (*)
      `
      )
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false });

    // Build conversation objects
    const conversationsWithDetails: ConversationWithDetails[] = memberData
      .map((m) => {
        const conv = m.conversations as unknown as ConversationWithDetails;
        if (!conv) return null;

        const members = (allMembers || []).filter(
          (member) => member.conversation_id === conv.id
        );
        const lastMessage = (lastMessages || []).find(
          (msg) => msg.conversation_id === conv.id
        );

        return {
          ...conv,
          members,
          last_message: lastMessage as MessageWithSender | undefined,
        };
      })
      .filter(Boolean) as ConversationWithDetails[];

    // Sort by last message time
    conversationsWithDetails.sort((a, b) => {
      const aTime = a.last_message?.created_at || a.created_at;
      const bTime = b.last_message?.created_at || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    setConversations(conversationsWithDetails);
    setLoading(false);
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchConversations();
  }, [currentUser]);

  const refetch = () => {
    fetchConversations();
  };

  return { conversations, loading, refetch };
}

export function useMessages(conversationId: string | null) {
  const { messages, setMessages, addMessage } = useChatStore();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const conversationMessages = conversationId
    ? messages[conversationId] || []
    : [];

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:users (*)
        `
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data) {
        setMessages(conversationId, data as MessageWithSender[]);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the full message with sender
          const { data } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:users (*)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            addMessage(conversationId, data as MessageWithSender);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, setMessages, addMessage]);

  return { messages: conversationMessages, loading };
}

export function useUsers() {
  const { users, setUsers } = useChatStore();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("users").select("*");

      if (data) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [supabase, setUsers]);

  return { users: Object.values(users), loading };
}
