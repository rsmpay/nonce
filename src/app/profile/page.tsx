"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCurrentUser } from "@/hooks/useSupabase";
import { useChatStore } from "@/stores/chat";

export default function ProfilePage() {
  const { user, loading } = useCurrentUser();
  const { setCurrentUser } = useChatStore();
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Initialize form when user loads
  useState(() => {
    if (user) {
      setNickname(user.nickname);
      setAvatarUrl(user.avatar_url);
    }
  });

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("이미지는 5MB 이하여야 합니다.");
        return;
      }
      setAvatarFile(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const handleStartEdit = () => {
    if (user) {
      setNickname(user.nickname);
      setAvatarUrl(user.avatar_url);
      setAvatarFile(null);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setNickname(user.nickname);
      setAvatarUrl(user.avatar_url);
      setAvatarFile(null);
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !nickname.trim()) return;
    setSaving(true);

    try {
      let finalAvatarUrl = avatarUrl;

      // Upload avatar if new file selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const filePath = `avatars/${user.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        finalAvatarUrl = publicUrl + `?t=${Date.now()}`;
      }

      // Update user profile
      const { data, error } = await supabase
        .from("users")
        // @ts-expect-error - Supabase type inference issue
        .update({
          nickname: nickname.trim(),
          avatar_url: finalAvatarUrl,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentUser(data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("프로필 업데이트에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <main className="min-h-screen bg-obsidian">
      {/* Header */}
      <div className="sticky top-0 bg-onyx border-b border-steel-500/30 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
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
          <h1 className="text-xl font-bold text-steel-100 font-display">프로필 설정</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Avatar */}
          <div className="relative">
            <button
              onClick={handleAvatarClick}
              disabled={!isEditing}
              className={`relative w-28 h-28 rounded-xl overflow-hidden ${
                isEditing
                  ? "cursor-pointer ring-2 ring-gold/50"
                  : "cursor-default"
              }`}
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <Avatar src={null} name={user.nickname} size="xl" className="w-28 h-28 text-2xl" />
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-obsidian/60 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* User info */}
          {isEditing ? (
            <div className="w-full space-y-4">
              <Input
                label="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  loading={saving}
                  disabled={!nickname.trim()}
                  className="flex-1"
                >
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-steel-100 font-display">
                  {user.nickname}
                </h2>
                <p className="text-steel-400 mt-1">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-glass rounded-lg text-sm text-gold border border-gold-hairline">
                  {user.role === "owner"
                    ? "Owner"
                    : user.role === "admin"
                    ? "Admin"
                    : user.role === "moderator"
                    ? "Moderator"
                    : "Member"}
                </span>
              </div>
              <Button variant="secondary" onClick={handleStartEdit}>
                프로필 수정
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
