"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { formatMessageTime } from "@/lib/utils";
import { useChatStore } from "@/stores/chat";
import { useMessages } from "@/hooks/useSupabase";
import { createClient } from "@/lib/supabase/client";
import type { ConversationWithDetails, MessageWithSender } from "@/types/database";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { InviteLinkModal } from "./InviteLinkModal";

interface ChatRoomProps {
  conversation: ConversationWithDetails;
  onBack: () => void;
}

export function ChatRoom({ conversation, onBack }: ChatRoomProps) {
  const { currentUser } = useChatStore();
  const { messages, loading } = useMessages(conversation.id);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Get display name for DMs
  const getDisplayName = () => {
    if (conversation.type === "dm") {
      const otherMember = conversation.members.find(
        (m) => m.user_id !== currentUser?.id
      );
      return otherMember?.user?.nickname || "알 수 없음";
    }
    return conversation.name || "그룹";
  };

  const getDisplayAvatar = () => {
    if (conversation.type === "dm") {
      const otherMember = conversation.members.find(
        (m) => m.user_id !== currentUser?.id
      );
      return otherMember?.user?.avatar_url;
    }
    return conversation.image_url;
  };

  // Check if user can send messages (channels: only admins)
  const canSendMessage = () => {
    if (conversation.type !== "channel") return true;
    const member = conversation.members.find(
      (m) => m.user_id === currentUser?.id
    );
    return member?.role === "owner" || member?.role === "admin";
  };

  // Check if user can invite (owner/admin of group/channel)
  const canInvite = () => {
    if (conversation.type === "dm") return false;
    const member = conversation.members.find(
      (m) => m.user_id === currentUser?.id
    );
    return member?.role === "owner" || member?.role === "admin";
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("이미지는 5MB 이하여야 합니다.");
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedImage) || !currentUser || sending) {
      return;
    }

    setSending(true);

    try {
      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop();
        const filePath = `messages/${conversation.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("messages")
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("messages").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Send message
      // @ts-expect-error - Supabase type inference issue
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        content: messageText.trim(),
        image_url: imageUrl,
      });

      if (error) throw error;

      setMessageText("");
      handleRemoveImage();
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages by sender and time
  const groupedMessages = groupMessages(messages, currentUser?.id);

  return (
    <div className="flex flex-col h-full bg-obsidian">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-onyx border-b border-steel-500/30">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-glass rounded-lg transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <Avatar src={getDisplayAvatar()} name={getDisplayName()} size="md" />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-steel-100 truncate font-display">
            {getDisplayName()}
          </h2>
          <p className="text-xs text-steel-400">
            {conversation.type === "channel"
              ? "채널"
              : conversation.type === "group"
              ? `${conversation.members.length}명 참여`
              : "개인 메시지"}
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-glass rounded-lg transition-colors"
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-glass border border-steel-500/30 rounded-xl shadow-lg overflow-hidden z-50 vault-reveal">
              {canInvite() && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowInviteModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-onyx transition-colors text-left"
                >
                  <svg className="w-5 h-5 text-steel-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="text-steel-100 text-sm">초대 링크</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  // TODO: Show members
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-onyx transition-colors text-left"
              >
                <svg className="w-5 h-5 text-steel-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-steel-100 text-sm">멤버 목록</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invite Link Modal */}
      <InviteLinkModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        conversation={conversation}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-steel-400">메시지가 없습니다</p>
            <p className="text-sm text-steel-500 mt-1">첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          groupedMessages.map((group, i) => (
            <MessageGroup key={i} group={group} currentUserId={currentUser?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 py-2 bg-onyx border-t border-steel-500/30">
          <div className="relative inline-block">
            <Image
              src={imagePreview}
              alt="Preview"
              width={120}
              height={120}
              className="rounded-lg object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      {canSendMessage() ? (
        <div className="p-4 bg-onyx border-t border-steel-500/30 safe-area-bottom">
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 hover:bg-glass rounded-lg transition-colors flex-shrink-0"
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <div className="flex-1 relative">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지 입력..."
                rows={1}
                className="w-full px-4 py-3 bg-glass border border-steel-500/30 rounded-2xl text-steel-100 placeholder-steel-500 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all resize-none max-h-32"
                style={{ minHeight: "48px" }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={(!messageText.trim() && !selectedImage) || sending}
              className={cn(
                "p-3 rounded-xl transition-all flex-shrink-0",
                (!messageText.trim() && !selectedImage) || sending
                  ? "bg-steel-500 text-steel-400 cursor-not-allowed"
                  : "bg-gradient-to-b from-gold to-gold-dark text-obsidian shadow-gold-sm hover:shadow-gold-md"
              )}
            >
              {sending ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-onyx border-t border-steel-500/30 text-center text-steel-500 text-sm safe-area-bottom">
          이 채널에서는 관리자만 메시지를 보낼 수 있습니다
        </div>
      )}
    </div>
  );
}

interface MessageGroupData {
  senderId: string;
  sender: MessageWithSender["sender"];
  messages: MessageWithSender[];
  isCurrentUser: boolean;
}

function groupMessages(
  messages: MessageWithSender[],
  currentUserId: string | undefined
): MessageGroupData[] {
  const groups: MessageGroupData[] = [];
  let currentGroup: MessageGroupData | null = null;

  for (const message of messages) {
    const isCurrentUser = message.sender_id === currentUserId;

    if (
      !currentGroup ||
      currentGroup.senderId !== message.sender_id ||
      // Split groups if more than 5 minutes apart
      new Date(message.created_at).getTime() -
        new Date(
          currentGroup.messages[currentGroup.messages.length - 1].created_at
        ).getTime() >
        5 * 60 * 1000
    ) {
      currentGroup = {
        senderId: message.sender_id,
        sender: message.sender,
        messages: [message],
        isCurrentUser,
      };
      groups.push(currentGroup);
    } else {
      currentGroup.messages.push(message);
    }
  }

  return groups;
}

interface MessageGroupProps {
  group: MessageGroupData;
  currentUserId: string | undefined;
}

function MessageGroup({ group, currentUserId }: MessageGroupProps) {
  const { sender, messages, isCurrentUser } = group;

  return (
    <div
      className={cn(
        "flex gap-2",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isCurrentUser && (
        <Avatar
          src={sender?.avatar_url}
          name={sender?.nickname || "?"}
          size="sm"
          className="mt-auto"
        />
      )}
      <div
        className={cn(
          "flex flex-col gap-0.5 max-w-[75%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {!isCurrentUser && (
          <span className="text-xs text-steel-500 ml-1">
            {sender?.nickname || "알 수 없음"}
          </span>
        )}
        {messages.map((message, i) => (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={isCurrentUser}
            isFirst={i === 0}
            isLast={i === messages.length - 1}
          />
        ))}
        <span
          className={cn(
            "text-[10px] text-steel-500 mt-0.5",
            isCurrentUser ? "mr-1" : "ml-1"
          )}
        >
          {formatMessageTime(messages[messages.length - 1].created_at)}
        </span>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: MessageWithSender;
  isCurrentUser: boolean;
  isFirst: boolean;
  isLast: boolean;
}

function MessageBubble({
  message,
  isCurrentUser,
  isFirst,
  isLast,
}: MessageBubbleProps) {
  const hasImage = !!message.image_url;
  const hasText = !!message.content;

  return (
    <div
      className={cn(
        "message-enter px-3 py-2 max-w-full",
        isCurrentUser
          ? "bg-gradient-to-br from-gold to-gold-dark text-obsidian"
          : "bg-glass text-steel-100 border border-steel-500/20",
        // Rounded corners based on position
        isFirst && isLast
          ? "rounded-2xl"
          : isFirst
          ? isCurrentUser
            ? "rounded-2xl rounded-br-md"
            : "rounded-2xl rounded-bl-md"
          : isLast
          ? isCurrentUser
            ? "rounded-2xl rounded-tr-md"
            : "rounded-2xl rounded-tl-md"
          : isCurrentUser
          ? "rounded-2xl rounded-r-md"
          : "rounded-2xl rounded-l-md"
      )}
    >
      {hasImage && (
        <div className="mb-1">
          <Image
            src={message.image_url!}
            alt="Image"
            width={240}
            height={240}
            className="rounded-lg max-w-full h-auto"
          />
        </div>
      )}
      {hasText && (
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.content}
        </p>
      )}
    </div>
  );
}
