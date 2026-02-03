"use client";

import { Avatar } from "@/components/ui/Avatar";
import { formatMessageTime } from "@/lib/utils";
import { useChatStore } from "@/stores/chat";
import type { ConversationWithDetails, User } from "@/types/database";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  onSelect,
}: ConversationListProps) {
  const { activeConversationId, currentUser } = useChatStore();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-500"
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
        <p className="text-gray-400">아직 대화가 없습니다</p>
        <p className="text-sm text-gray-500 mt-1">
          새 대화를 시작하거나 그룹에 참여하세요
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          currentUser={currentUser}
          isActive={conversation.id === activeConversationId}
          onClick={() => onSelect(conversation.id)}
        />
      ))}
    </div>
  );
}

interface ConversationItemProps {
  conversation: ConversationWithDetails;
  currentUser: User | null;
  isActive: boolean;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  currentUser,
  isActive,
  onClick,
}: ConversationItemProps) {
  // For DMs, show the other user's info
  const getDisplayInfo = () => {
    if (conversation.type === "dm") {
      const otherMember = conversation.members.find(
        (m) => m.user_id !== currentUser?.id
      );
      return {
        name: otherMember?.user?.nickname || "알 수 없음",
        avatar: otherMember?.user?.avatar_url,
      };
    }
    return {
      name: conversation.name || "그룹",
      avatar: conversation.image_url,
    };
  };

  const { name, avatar } = getDisplayInfo();
  const lastMessage = conversation.last_message;

  const getTypeIcon = () => {
    if (conversation.type === "channel") {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-surface rounded-full flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }
    if (conversation.type === "group") {
      return (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-surface rounded-full flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 hover:bg-surface-light transition-colors text-left",
        isActive && "bg-surface-light"
      )}
    >
      <div className="relative">
        <Avatar src={avatar} name={name} size="lg" />
        {getTypeIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-white truncate">{name}</span>
          {lastMessage && (
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatMessageTime(lastMessage.created_at)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 truncate mt-0.5">
          {lastMessage ? (
            <>
              {lastMessage.image_url && !lastMessage.content
                ? "📷 이미지"
                : lastMessage.content}
            </>
          ) : (
            "메시지가 없습니다"
          )}
        </p>
      </div>
    </button>
  );
}
