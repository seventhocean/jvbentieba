"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Search, Plus, Menu, X, LogOut, User, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoginDialog } from "@/components/login-dialog";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNewPost = () => {
    if (!session) {
      setShowLoginDialog(true);
      return;
    }
    router.push("/posts/new");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-brand-light">剧本圈</span>
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                type="text"
                placeholder="搜索帖子..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleNewPost}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>发帖</span>
            </button>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-bg-elevated transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-sm font-medium">
                    {session.user?.name?.[0] || "U"}
                  </div>
                  <span className="hidden sm:block text-sm text-ink-muted">
                    {session.user?.name}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-bg-elevated border border-border rounded-xl shadow-glow py-2 z-50">
                    <Link
                      href="/me"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-bg-card transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      个人中心
                    </Link>
                    {(session.user as any)?.role === "ADMIN" && (
                      <Link
                        href="/admin/topics"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-bg-card transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        话题管理
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setShowUserMenu(false); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-bg-card transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginDialog(true)}
                className="px-4 py-2 border border-brand text-brand rounded-lg text-sm font-medium hover:bg-brand/10 transition-colors"
              >
                登录
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-ink-muted"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-bg-card border-b border-border p-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="text"
                  placeholder="搜索帖子..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand"
                />
              </div>
            </form>
            <button
              onClick={() => { handleNewPost(); setShowMobileMenu(false); }}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              发帖
            </button>
          </div>
        )}
      </header>

      <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
    </>
  );
}
