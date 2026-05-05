import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Scale, Users, LayoutDashboard, MessageSquare, Briefcase,
  LogOut, Search, FileText, Shield, ScrollText, Settings as Cog,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { useAudit } from "@/lib/audit";
import { supabase } from "@/integrations/supabase/client";
import { NotificationsBell } from "./NotificationsBell";
import { ThemeToggle } from "./ThemeToggle";
import type { ComponentType } from "react";

interface NavItem { to: string; label: string; icon: ComponentType<{ className?: string }>; }

const clientNav: NavItem[] = [
  { to: "/directory", label: "Directory", icon: Users },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/messages",  label: "Messages",  icon: MessageSquare },
  { to: "/audit",     label: "Audit log", icon: ScrollText },
  { to: "/settings",  label: "Settings",  icon: Cog },
];
const lawyerNav: NavItem[] = [
  { to: "/workspace", label: "Workspace", icon: Briefcase },
  { to: "/messages",  label: "Messages",  icon: MessageSquare },
  { to: "/audit",     label: "Audit log", icon: ScrollText },
  { to: "/settings",  label: "Settings",  icon: Cog },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useApp((s) => s.user);
  const setUser = useApp((s) => s.setUser);
  const loc = useLocation();
  const navigate = useNavigate();
  const items = user?.role === "lawyer" ? lawyerNav : clientNav;

  const signOut = async () => {
    if (user) {
      useAudit.getState().log({
        type: "logout",
        actor: user.name,
        role: user.role,
        detail: "Session ended from sidebar",
      });
    }
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    setUser(null);
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex sticky top-0 h-screen w-[260px] flex-col p-4 border-r-2 border-border bg-[oklch(0.975_0.005_250)]">
        <div className="glass-strong flex h-full flex-col rounded-2xl p-4 shadow-md">
          <Link to="/" className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] ring-1 ring-accent/60">
              <Scale className="h-4.5 w-4.5 text-accent" strokeWidth={2.4} />
              <div className="absolute inset-0 rounded-xl bg-accent/20 blur-lg opacity-70" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold">Avocat<span className="text-gradient">·</span>Link</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {user?.role === "lawyer" ? "Lawyer Suite" : "Client Suite"}
              </div>
            </div>
          </Link>

          <nav className="mt-6 flex flex-col gap-1">
            {items.map((it) => {
              const active = loc.pathname === it.to || (it.to !== "/workspace" && loc.pathname.startsWith(it.to));
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className="relative px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="relative z-10 inline-flex items-center gap-3">
                    <it.icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                    {it.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="side-pill"
                      className="absolute inset-0 rounded-xl bg-primary/10 ring-1 ring-primary/20"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-xl chip-emerald p-3">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                <Shield className="h-3 w-3" /> E2E Encrypted
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">All sessions are sealed in your private vault.</div>
            </div>

            {user && (
              <div className="surface rounded-xl p-3 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 ring-1 ring-accent/60 font-semibold text-sm">
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{user.role}</div>
                </div>
                <button onClick={signOut} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary transition" aria-label="Sign out">
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 px-2 text-[11px] text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground">Terms</Link>
              <span>·</span>
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top header */}
        <header className="sticky top-0 z-40 px-4 md:px-6 pt-4 pb-3 border-b-2 border-border bg-[oklch(0.965_0.006_250)]/80 backdrop-blur-md">
          <div className="glass-strong flex items-center justify-between rounded-2xl px-4 py-2.5 shadow-md">
            <div className="flex items-center gap-3 flex-1">
              <div className="md:hidden flex items-center gap-2">
                <Scale className="h-5 w-5 text-accent" />
                <span className="font-display font-semibold">Avocat<span className="text-gradient">·</span>Link</span>
              </div>
              <div className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-xl px-3 py-2 bg-[oklch(0.93_0.010_250)] border border-border">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search the suite…"
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <kbd className="hidden lg:inline-flex items-center gap-1 rounded-md bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border">⌘K</kbd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationsBell />
              <Link
                to="/messages"
                data-magnetic
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground glow-primary"
              >
                <MessageSquare className="h-4 w-4" /> Chat
              </Link>
              <button
                onClick={signOut}
                aria-label="Sign out"
                className="inline-flex items-center gap-2 rounded-xl surface px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="px-6 py-6 text-xs text-muted-foreground flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <FileText className="h-3 w-3" /> © 2026 Avocat-Link
          </div>
          <div className="flex items-center gap-3">
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
