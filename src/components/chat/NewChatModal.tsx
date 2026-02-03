"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useChatStore } from "@/stores/chat";
import { useUsers } from "@/hooks/useSupabase";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { User, ConversationType } from "@/types/database";
import { cn } from "@/lib/utils";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

type Step = "type" | "members" | "details";

export function NewChatModal({ isOpen, onClose, onCreated }: NewChatModalProps) {
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<ConversationType>("dm");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { users } = useUsers();
  const { currentUser, addConversation } = useChatStore();
  const supabase = createClient();

  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUser?.id &&
      u.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (user: User) => {
    if (type === "dm") {
      setSelectedUsers([user]);
    } else {
      if (selectedUsers.find((u) => u.id === user.id)) {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleCreate = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      if (type === "dm") {
        // Use the get_or_create_dm function
        const { data, error } = await supabase.rpc("get_or_create_dm", {
          other_user_id: selectedUsers[0].id,
        });

        if (error) throw error;
        onCreated(data);
      } else {
        // Create group or channel using database function
        const { data: conversationId, error: convError } = await supabase.rpc(
          "create_group_conversation",
          {
            conv_type: type,
            conv_name: name,
            conv_description: description || null,
            member_ids: selectedUsers.map((user) => user.id),
          }
        );

        if (convError) throw convError;

        onCreated(conversationId);
      }

      // Reset state
      setStep("type");
      setType("dm");
      setSelectedUsers([]);
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error("Failed to create conversation:", err);
      alert("대화 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "members") {
      setStep("type");
      setSelectedUsers([]);
    } else if (step === "details") {
      setStep("members");
    }
  };

  const handleNext = () => {
    if (step === "type") {
      setStep("members");
    } else if (step === "members") {
      if (type === "dm") {
        handleCreate();
      } else {
        setStep("details");
      }
    }
  };

  const canProceed = () => {
    if (step === "members") {
      // DM requires selecting a user, group/channel can proceed without members
      if (type === "dm") {
        return selectedUsers.length > 0;
      }
      return true; // Groups/channels can be created without initial members
    }
    if (step === "details") {
      return name.trim().length > 0;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            {step !== "type" && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-surface-light rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
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
            )}
            <h2 className="text-lg font-semibold text-white">
              {step === "type" && "새 대화"}
              {step === "members" && (type === "dm" ? "대화 상대 선택" : "멤버 선택")}
              {step === "details" && (type === "group" ? "그룹 정보" : "채널 정보")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-light rounded-full transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-400"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === "type" && (
            <div className="space-y-3">
              <TypeOption
                type="dm"
                title="1:1 대화"
                description="두 사람 간의 개인 대화"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                selected={type === "dm"}
                onClick={() => setType("dm")}
              />
              <TypeOption
                type="group"
                title="그룹 채팅"
                description="여러 멤버가 참여하는 대화방"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                selected={type === "group"}
                onClick={() => setType("group")}
              />
              <TypeOption
                type="channel"
                title="채널"
                description="공지/정보 전달용 (관리자만 글 작성)"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                }
                selected={type === "channel"}
                onClick={() => setType("channel")}
              />
            </div>
          )}

          {step === "members" && (
            <div className="space-y-4">
              {type !== "dm" && (
                <p className="text-sm text-gray-400">
                  멤버를 선택하거나, 건너뛰고 나중에 초대 링크로 초대할 수 있습니다.
                </p>
              )}
              <Input
                placeholder="이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {selectedUsers.length > 0 && type !== "dm" && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="flex items-center gap-1 px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm"
                    >
                      {user.nickname}
                      <button
                        onClick={() => handleSelectUser(user)}
                        className="hover:text-primary-300"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                      selectedUsers.find((u) => u.id === user.id)
                        ? "bg-primary-600/20"
                        : "hover:bg-surface-light"
                    )}
                  >
                    <Avatar src={user.avatar_url} name={user.nickname} size="md" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{user.nickname}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    {selectedUsers.find((u) => u.id === user.id) && (
                      <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-4">
              <Input
                label={type === "channel" ? "채널 이름" : "그룹 이름"}
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">
                  설명 (선택)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="설명을 입력하세요"
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 bg-surface-light border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 safe-area-bottom">
          <Button
            onClick={step === "details" ? handleCreate : handleNext}
            disabled={!canProceed()}
            loading={loading}
            className="w-full"
          >
            {step === "type" && "다음"}
            {step === "members" && (type === "dm" ? "대화 시작" : "다음")}
            {step === "details" && "만들기"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TypeOptionProps {
  type: ConversationType;
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

function TypeOption({
  title,
  description,
  icon,
  selected,
  onClick,
}: TypeOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left",
        selected
          ? "border-primary-500 bg-primary-600/10"
          : "border-gray-700 hover:border-gray-600 hover:bg-surface-light"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          selected ? "bg-primary-600 text-white" : "bg-surface-light text-gray-400"
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      {selected && (
        <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
