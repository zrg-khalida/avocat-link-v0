import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { useApp } from "@/lib/store";
import { homeFor } from "@/lib/rbac";

export function AccessDenied({ reason, requiredRole }: { reason?: string; requiredRole?: "client" | "lawyer" }) {
  const user = useApp((s) => s.user);
  const home = user ? homeFor(user.role) : "/login";

  return (
    <div
      role="alert"
      aria-label="Access denied"
      data-testid="access-denied"
      className="mx-auto max-w-xl px-6 pt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="surface-lg rounded-3xl p-10 text-center"
      >
        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl chip-rose">
          <ShieldAlert className="h-8 w-8" />
          <span className="absolute inset-0 rounded-2xl pulse-ring" />
        </div>
        <h1 className="mt-6 font-display text-3xl">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {reason ??
            (requiredRole
              ? `This area is restricted to ${requiredRole === "lawyer" ? "Lawyers" : "Clients"}.`
              : "Your current role does not have permission to view this page.")}
        </p>
        {user && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full surface px-3 py-1 text-[11px]">
            Signed in as <span className="font-semibold">{user.name}</span> · <span className="uppercase tracking-wider">{user.role}</span>
          </div>
        )}
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            to={home}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to safety
          </Link>
          {!user && (
            <Link to="/login" className="inline-flex items-center gap-2 rounded-xl surface px-4 py-2.5 text-sm font-semibold">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
