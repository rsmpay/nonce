"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface ConversationInfo {
  conversation_id: string;
  conversation_name: string | null;
  conversation_type: "dm" | "group" | "channel";
  member_count: number;
}

export default function InvitePage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [checkingCode, setCheckingCode] = useState(!!initialCode);
  const [error, setError] = useState<string | null>(null);
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check if it's a conversation invite when code is provided via URL
  useEffect(() => {
    if (initialCode) {
      checkInviteCode(initialCode);
    }
  }, [initialCode]);

  const checkInviteCode = async (inviteCode: string) => {
    setCheckingCode(true);
    setError(null);

    try {
      // First try to get conversation info (for conversation invites)
      const { data, error: rpcError } = await supabase.rpc("get_conversation_by_invite_code", {
        invite_code: inviteCode.trim(),
      });

      if (!rpcError && data && data.length > 0) {
        setConversationInfo(data[0]);
      } else {
        setConversationInfo(null);
      }
    } catch (err) {
      console.error("Error checking invite:", err);
    } finally {
      setCheckingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("초대 코드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Store code and redirect to login
        sessionStorage.setItem("pendingInviteCode", code.trim());
        router.push(`/auth/login?next=/invite?code=${code.trim()}`);
        return;
      }

      // If it's a conversation invite
      if (conversationInfo) {
        const { data, error: joinError } = await supabase.rpc("join_conversation_by_invite", {
          invite_code: code.trim(),
        });

        if (joinError) throw joinError;

        // Redirect to the conversation
        router.push(`/chat?conversation=${data}`);
        return;
      }

      // Otherwise, it's a community invite
      const { data: isValid, error: validateError } = await supabase.rpc(
        "validate_invite_code",
        { invite_code: code.trim() }
      );

      if (validateError) throw validateError;

      if (!isValid) {
        setError("유효하지 않거나 만료된 초대 코드입니다.");
        setLoading(false);
        return;
      }

      // Use invite code
      const { error: useError } = await supabase.rpc("use_invite_code", {
        invite_code: code.trim(),
      });

      if (useError) throw useError;

      // Check if user has profile
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        router.push("/profile/setup");
      } else {
        router.push("/chat");
      }
    } catch (err) {
      console.error("Invite error:", err);
      setError("초대 코드 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const typeLabel = {
    dm: "개인 대화",
    group: "그룹",
    channel: "채널",
  };

  if (checkingCode) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-surface">
        <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  // Show conversation invite UI if we have conversation info
  if (conversationInfo) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-surface">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto bg-primary-600/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              {typeLabel[conversationInfo.conversation_type]}에 초대되었습니다
            </p>
            <h1 className="text-2xl font-bold text-white">
              {conversationInfo.conversation_name || "대화방"}
            </h1>
            <p className="text-gray-400">
              {conversationInfo.member_count}명의 멤버
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="w-full"
            >
              참여하기
            </Button>

            <Link href="/" className="block">
              <Button variant="ghost" className="w-full">
                취소
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Default community invite UI
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-surface">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 mx-auto bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">초대 코드 입력</h1>
          <p className="text-gray-400">
            커뮤니티에 참여하려면 초대 코드를 입력하세요
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (e.target.value.length >= 6) {
                checkInviteCode(e.target.value);
              }
            }}
            placeholder="초대 코드 입력"
            maxLength={20}
            className="text-center text-lg tracking-widest"
          />
          <Button
            type="submit"
            loading={loading}
            disabled={!code.trim()}
            className="w-full"
          >
            참여하기
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" className="text-primary-500 hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
