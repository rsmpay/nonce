"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCurrentUser } from "@/hooks/useSupabase";
import { formatFullTime } from "@/lib/utils";
import type { User, UserRole } from "@/types/database";

export default function MemberManagePage() {
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const isAdmin =
    currentUser?.role === "owner" || currentUser?.role === "admin";

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/chat");
    }
  }, [userLoading, isAdmin, router]);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setMembers(data);
      }
      setLoading(false);
    };

    if (isAdmin) {
      fetchMembers();
    }
  }, [supabase, isAdmin]);

  const filteredMembers = members.filter(
    (m) =>
      m.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleChange = async (member: User, newRole: UserRole) => {
    if (currentUser?.role !== "owner" && newRole === "owner") {
      alert("Owner 권한은 Owner만 부여할 수 있습니다.");
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        // @ts-expect-error - Supabase type inference issue with RLS
        .update({ role: newRole })
        .eq("id", member.id);

      if (error) throw error;

      setMembers(
        members.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
      );
      setSelectedMember(null);
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("역할 변경에 실패했습니다.");
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "owner":
        return "bg-gold/20 text-gold border border-gold-hairline";
      case "admin":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/20";
      case "moderator":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/20";
      default:
        return "bg-steel-500/20 text-steel-300 border border-steel-500/20";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderator";
      default:
        return "Member";
    }
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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
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
          <h1 className="text-xl font-bold text-steel-100 font-display">멤버 관리</h1>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <Input
          placeholder="이름 또는 이메일로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Member count */}
      <div className="max-w-2xl mx-auto px-4 pb-2">
        <p className="text-sm text-steel-400">
          총 {filteredMembers.length}명의 멤버
        </p>
      </div>

      {/* Member list */}
      <div className="max-w-2xl mx-auto px-4 pb-6">
        <div className="space-y-2">
          {filteredMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="w-full flex items-center gap-3 p-4 bg-onyx rounded-xl hover:bg-glass transition-colors text-left border border-steel-500/20"
            >
              <Avatar
                src={member.avatar_url}
                name={member.nickname}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-steel-100 truncate">
                    {member.nickname}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium ${getRoleBadgeColor(
                      member.role
                    )}`}
                  >
                    {getRoleLabel(member.role)}
                  </span>
                </div>
                <p className="text-sm text-steel-400 truncate">{member.email}</p>
              </div>
              <svg
                className="w-5 h-5 text-steel-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Member detail modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}
          />
          <div className="relative w-full sm:max-w-md bg-onyx rounded-t-2xl sm:rounded-2xl p-6 space-y-6 border border-gold-hairline vault-reveal vault-shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-steel-100 font-display">멤버 정보</h2>
              <button
                onClick={() => setSelectedMember(null)}
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

            {/* Member info */}
            <div className="flex items-center gap-4">
              <Avatar
                src={selectedMember.avatar_url}
                name={selectedMember.nickname}
                size="xl"
              />
              <div>
                <h3 className="text-xl font-semibold text-steel-100 font-display">
                  {selectedMember.nickname}
                </h3>
                <p className="text-steel-400">{selectedMember.email}</p>
                <p className="text-sm text-steel-500 mt-1">
                  가입일: {formatFullTime(selectedMember.created_at)}
                </p>
              </div>
            </div>

            {/* Role selection */}
            {selectedMember.id !== currentUser?.id && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-steel-200">
                  역할 변경
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["member", "moderator", "admin", "owner"] as UserRole[]).map(
                    (role) => {
                      const canSelect =
                        currentUser?.role === "owner" ||
                        (role !== "owner" && role !== "admin");
                      return (
                        <button
                          key={role}
                          onClick={() =>
                            canSelect && handleRoleChange(selectedMember, role)
                          }
                          disabled={!canSelect}
                          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            selectedMember.role === role
                              ? "bg-gradient-to-b from-gold to-gold-dark text-obsidian"
                              : canSelect
                              ? "bg-glass text-steel-200 hover:bg-onyx border border-steel-500/30"
                              : "bg-glass text-steel-500 cursor-not-allowed border border-steel-500/20"
                          }`}
                        >
                          {getRoleLabel(role)}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              onClick={() => setSelectedMember(null)}
              className="w-full"
            >
              닫기
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
