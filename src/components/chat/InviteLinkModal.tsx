"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { ConversationWithDetails, InviteLink } from "@/types/database";

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: ConversationWithDetails;
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function InviteLinkModal({ isOpen, onClose, conversation }: InviteLinkModalProps) {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviteLink, setInviteLink] = useState<InviteLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchExistingInvite();
    }
  }, [isOpen, conversation.id]);

  const fetchExistingInvite = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("invite_links")
        .select("*")
        .eq("conversation_id", conversation.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Check if expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setInviteLink(null);
        } else if (data.max_uses && data.current_uses >= data.max_uses) {
          setInviteLink(null);
        } else {
          setInviteLink(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch invite:", err);
    } finally {
      setLoading(false);
    }
  };

  const createInviteLink = async () => {
    setCreating(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const code = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data, error } = await supabase
        .from("invite_links")
        .insert({
          code,
          conversation_id: conversation.id,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
          max_uses: 100,
        })
        .select()
        .single();

      if (error) throw error;

      setInviteLink(data);
    } catch (err) {
      console.error("Failed to create invite:", err);
      setError("초대 링크 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const revokeInviteLink = async () => {
    if (!inviteLink) return;

    try {
      const { error } = await supabase
        .from("invite_links")
        .update({ is_active: false })
        .eq("id", inviteLink.id);

      if (error) throw error;

      setInviteLink(null);
    } catch (err) {
      console.error("Failed to revoke invite:", err);
      setError("초대 링크 취소에 실패했습니다.");
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;

    const url = `${window.location.origin}/invite/${inviteLink.code}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareInvite = async () => {
    if (!inviteLink) return;

    const url = `${window.location.origin}/invite/${inviteLink.code}`;
    const text = `${conversation.name || "대화방"}에 참여하세요!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "초대 링크",
          text,
          url,
        });
      } catch (err) {
        // User cancelled or error
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (!isOpen) return null;

  const inviteUrl = inviteLink ? `${window.location.origin}/invite/${inviteLink.code}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">초대 링크</h2>
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
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
          ) : inviteLink ? (
            <>
              <p className="text-sm text-gray-400">
                이 링크를 공유하면 누구나 &quot;{conversation.name || "대화방"}&quot;에 참여할 수 있습니다.
              </p>

              {/* Link display */}
              <div className="bg-surface-light rounded-xl p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copied ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• {inviteLink.current_uses}/{inviteLink.max_uses || "무제한"} 사용됨</p>
                {inviteLink.expires_at && (
                  <p>• {new Date(inviteLink.expires_at).toLocaleDateString("ko-KR")}에 만료</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={shareInvite} className="flex-1">
                  공유하기
                </Button>
                <Button onClick={revokeInviteLink} variant="danger">
                  링크 취소
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-400 text-center py-4">
                초대 링크가 없습니다. 새 링크를 생성하세요.
              </p>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button onClick={createInviteLink} loading={creating} className="w-full">
                초대 링크 생성
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
