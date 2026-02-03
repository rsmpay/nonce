"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCurrentUser } from "@/hooks/useSupabase";
import { generateInviteCode, formatFullTime } from "@/lib/utils";
import type { InviteLink } from "@/types/database";

export default function InviteManagePage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [invites, setInvites] = useState<InviteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [maxUses, setMaxUses] = useState<string>("");
  const [expiresInDays, setExpiresInDays] = useState<string>("7");
  const router = useRouter();
  const supabase = createClient();

  const isAdmin = user?.role === "owner" || user?.role === "admin";

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/chat");
    }
  }, [userLoading, isAdmin, router]);

  useEffect(() => {
    const fetchInvites = async () => {
      const { data } = await supabase
        .from("invite_links")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setInvites(data);
      }
      setLoading(false);
    };

    if (isAdmin) {
      fetchInvites();
    }
  }, [supabase, isAdmin]);

  const handleCreateInvite = async () => {
    if (!user) return;
    setCreating(true);

    try {
      const code = generateInviteCode();
      const expiresAt = expiresInDays
        ? new Date(
            Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000
          ).toISOString()
        : null;

      const insertData = {
        code,
        created_by: user.id,
        expires_at: expiresAt,
        max_uses: maxUses ? parseInt(maxUses) : null,
      };

      const { data, error } = await supabase
        .from("invite_links")
        // @ts-expect-error - Supabase type inference issue with RLS
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      setInvites([data, ...invites]);
      setShowCreateModal(false);
      setMaxUses("");
      setExpiresInDays("7");
    } catch (err) {
      console.error("Failed to create invite:", err);
      alert("초대 링크 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (invite: InviteLink) => {
    try {
      const { error } = await supabase
        .from("invite_links")
        // @ts-expect-error - Supabase type inference issue with RLS
        .update({ is_active: !invite.is_active })
        .eq("id", invite.id);

      if (error) throw error;

      setInvites(
        invites.map((i) =>
          i.id === invite.id ? { ...i, is_active: !i.is_active } : i
        )
      );
    } catch (err) {
      console.error("Failed to toggle invite:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 초대 링크를 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("invite_links").delete().eq("id", id);

      if (error) throw error;

      setInvites(invites.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Failed to delete invite:", err);
    }
  };

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/invite/${code}`;
    navigator.clipboard.writeText(url);
    alert("초대 링크가 복사되었습니다.");
  };

  const getInviteStatus = (invite: InviteLink) => {
    if (!invite.is_active) return { text: "비활성", color: "text-steel-500" };
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return { text: "만료됨", color: "text-red-400" };
    }
    if (invite.max_uses && invite.current_uses >= invite.max_uses) {
      return { text: "소진됨", color: "text-orange-400" };
    }
    return { text: "활성", color: "text-green-400" };
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <main className="min-h-screen bg-obsidian">
      {/* Header */}
      <div className="sticky top-0 bg-onyx border-b border-steel-500/30 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            <h1 className="text-xl font-bold text-steel-100 font-display">초대 링크 관리</h1>
          </div>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            + 새 링크
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {invites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-glass rounded-xl flex items-center justify-center mb-4 border border-steel-500/30">
              <svg
                className="w-8 h-8 text-steel-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <p className="text-steel-300">아직 초대 링크가 없습니다</p>
            <p className="text-sm text-steel-500 mt-1">
              새 초대 링크를 만들어 멤버를 초대하세요
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => {
              const status = getInviteStatus(invite);
              return (
                <div
                  key={invite.id}
                  className="bg-onyx rounded-xl p-4 space-y-3 border border-steel-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-mono text-gold bg-glass px-3 py-1 rounded-lg border border-gold-hairline">
                        {invite.code}
                      </code>
                      <span className={`text-sm ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(invite.code)}
                        className="p-2 hover:bg-glass rounded-lg transition-colors"
                        title="링크 복사"
                      >
                        <svg
                          className="w-4 h-4 text-steel-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleActive(invite)}
                        className="p-2 hover:bg-glass rounded-lg transition-colors"
                        title={invite.is_active ? "비활성화" : "활성화"}
                      >
                        <svg
                          className={`w-4 h-4 ${
                            invite.is_active
                              ? "text-green-400"
                              : "text-steel-400"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              invite.is_active
                                ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            }
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(invite.id)}
                        className="p-2 hover:bg-glass rounded-lg transition-colors"
                        title="삭제"
                      >
                        <svg
                          className="w-4 h-4 text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-steel-400">
                    <span>
                      사용:{" "}
                      <span className="text-steel-100">
                        {invite.current_uses}
                        {invite.max_uses ? `/${invite.max_uses}` : ""}
                      </span>
                    </span>
                    {invite.expires_at && (
                      <span>
                        만료:{" "}
                        <span className="text-steel-100">
                          {formatFullTime(invite.expires_at)}
                        </span>
                      </span>
                    )}
                    <span>
                      생성:{" "}
                      <span className="text-steel-100">
                        {formatFullTime(invite.created_at)}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full sm:max-w-md bg-onyx rounded-t-2xl sm:rounded-2xl p-6 space-y-6 border border-gold-hairline vault-reveal vault-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-steel-100 font-display">
                새 초대 링크 만들기
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-glass rounded-lg transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="최대 사용 횟수 (선택)"
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="무제한"
                min={1}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-steel-200">
                  만료 기간
                </label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  className="w-full px-4 py-3 bg-obsidian border border-steel-500 rounded-xl text-steel-100 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
                >
                  <option value="">무제한</option>
                  <option value="1">1일</option>
                  <option value="7">7일</option>
                  <option value="30">30일</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleCreateInvite}
              loading={creating}
              className="w-full"
            >
              링크 생성
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
