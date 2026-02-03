"use client";

import { useState, useEffect } from "react";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { NewChatModal } from "@/components/chat/NewChatModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { useCurrentUser, useConversations } from "@/hooks/useSupabase";
import { useChatStore } from "@/stores/chat";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const { conversations, loading: conversationsLoading, refetch } = useConversations();
  const {
    activeConversationId,
    setActiveConversationId,
    getActiveConversation,
    isSidebarOpen,
    setSidebarOpen,
  } = useChatStore();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const activeConversation = getActiveConversation();
  const isLoading = userLoading || conversationsLoading;

  // Refresh conversations when a new one is created
  const handleConversationCreated = (conversationId: string) => {
    refetch();
    setActiveConversationId(conversationId);
    setIsNewChatOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-steel-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-obsidian overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Conversation list view */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            activeConversation && "hidden md:flex md:w-80 md:border-r md:border-steel-500/30"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-onyx border-b border-steel-500/30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 hover:bg-glass rounded-lg transition-colors lg:hidden"
              >
                <svg
                  className="w-5 h-5 text-steel-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-steel-100 font-display">대화</h1>
            </div>
            <button
              onClick={() => setIsNewChatOpen(true)}
              className="p-2 hover:bg-glass rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          {/* Conversation list */}
          <ConversationList
            conversations={conversations}
            onSelect={setActiveConversationId}
          />
        </div>

        {/* Chat room view */}
        {activeConversation ? (
          <div className="flex-1 md:flex-1">
            <ChatRoom
              conversation={activeConversation}
              onBack={() => setActiveConversationId(null)}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-obsidian">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-glass rounded-xl flex items-center justify-center mb-4 border border-steel-500/30">
                <svg
                  className="w-10 h-10 text-steel-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-steel-400">대화를 선택하세요</p>
            </div>
          </div>
        )}
      </div>

      {/* New chat modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreated={handleConversationCreated}
      />
    </div>
  );
}
