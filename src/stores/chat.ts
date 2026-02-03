import { create } from "zustand";
import type {
  User,
  Conversation,
  ConversationWithDetails,
  Message,
  MessageWithSender,
} from "@/types/database";

interface ChatState {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Conversations
  conversations: ConversationWithDetails[];
  setConversations: (conversations: ConversationWithDetails[]) => void;
  updateConversation: (conversation: ConversationWithDetails) => void;
  addConversation: (conversation: ConversationWithDetails) => void;

  // Active conversation
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  getActiveConversation: () => ConversationWithDetails | undefined;

  // Messages
  messages: Record<string, MessageWithSender[]>;
  setMessages: (conversationId: string, messages: MessageWithSender[]) => void;
  addMessage: (conversationId: string, message: MessageWithSender) => void;
  updateMessage: (conversationId: string, message: MessageWithSender) => void;

  // Users cache
  users: Record<string, User>;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;

  // UI state
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Current user
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Conversations
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  updateConversation: (conversation) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversation.id ? conversation : c
      ),
    })),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  // Active conversation
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    return conversations.find((c) => c.id === activeConversationId);
  },

  // Messages
  messages: {},
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),
  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          message,
        ],
      },
    })),
  updateMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) =>
          m.id === message.id ? message : m
        ),
      },
    })),

  // Users cache
  users: {},
  setUsers: (users) =>
    set((state) => ({
      users: {
        ...state.users,
        ...Object.fromEntries(users.map((u) => [u.id, u])),
      },
    })),
  addUser: (user) =>
    set((state) => ({
      users: { ...state.users, [user.id]: user },
    })),

  // UI state
  isSidebarOpen: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
