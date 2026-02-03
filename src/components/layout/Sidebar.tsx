"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useChatStore } from "@/stores/chat";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentUser } = useChatStore();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isAdmin =
    currentUser?.role === "owner" || currentUser?.role === "admin";

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-onyx z-50",
          "border-r border-steel-500/30",
          "transform transition-transform duration-300 ease-out",
          "lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Gold accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold via-gold-dark to-transparent" />

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-steel-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center shadow-gold-sm">
                <span className="text-lg font-bold text-obsidian font-display">N</span>
              </div>
              <span className="font-semibold text-steel-100 font-display">Nonce</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-glass rounded-lg transition-colors lg:hidden"
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

          {/* User info - Premium Card Style */}
          {currentUser && (
            <div className="p-4 border-b border-steel-500/30">
              <div className="p-3 rounded-xl bg-glass border border-gold-hairline vault-shadow">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={currentUser.avatar_url}
                    name={currentUser.nickname}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-steel-100 truncate">
                      {currentUser.nickname}
                    </p>
                    <p className="text-sm text-steel-400 truncate">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Menu */}
          <nav className="flex-1 p-2 space-y-1">
            <MenuItem
              href="/chat"
              icon={
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              }
              label="대화"
              isActive={pathname === "/chat"}
              onClick={onClose}
            />
            <MenuItem
              href="/profile"
              icon={
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              label="프로필 설정"
              isActive={pathname === "/profile"}
              onClick={onClose}
            />
            {isAdmin && (
              <>
                <div className="my-3 px-3">
                  <p className="text-xs font-semibold text-steel-500 uppercase tracking-wider">
                    관리
                  </p>
                </div>
                <MenuItem
                  href="/admin/members"
                  icon={
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  }
                  label="멤버 관리"
                  isActive={pathname === "/admin/members"}
                  onClick={onClose}
                />
                <MenuItem
                  href="/admin/invites"
                  icon={
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
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  }
                  label="초대 링크 관리"
                  isActive={pathname === "/admin/invites"}
                  onClick={onClose}
                />
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-steel-500/30">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-steel-400 hover:text-steel-100 hover:bg-glass rounded-xl transition-all duration-200"
            >
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

function MenuItem({ href, icon, label, isActive, onClick }: MenuItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
        isActive
          ? "text-gold bg-gradient-to-r from-gold/10 to-transparent border-l-2 border-gold ml-[-2px] pl-[14px]"
          : "text-steel-400 hover:text-steel-100 hover:bg-glass"
      )}
    >
      {icon}
      <span className={isActive ? "font-medium" : ""}>{label}</span>
    </Link>
  );
}
