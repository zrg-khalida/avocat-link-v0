"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, Lock, ArrowRight, User, Scale, Briefcase, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp, type Role } from "@/lib/store";
import { useAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/client";

export const metadata = {
  title: "Create your account - Avocat-Link",
  description: "Join Avocat-Link as a client or a vetted lawyer. End-to-end encrypted from day one.",
};

const SPECIALTIES = ["Business", "Penal", "Family"] as const;

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();
  const setUser = useApp((s) => s.setUser);

  const [role, setRole] = useState<Role>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState<(typeof SPECIALTIES)[number]>("Business");
  const [barreau, setBarreau] = useState("Paris");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Forward to portal.
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted || !data.session) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .maybeSingle();
      const r = (profile?.role as Role) ?? "client";
      router.push(r === "lawyer" ? "/workspace" : "/directory");
    });
    return () => { mounted = false; };
  }, [router, supabase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`;
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name || email.split("@")[0],
            role,
            ...(role === "lawyer" ? { specialty, barreau } : {}),
          },
        },
      });
      if (signUpError) throw signUpError;

      // Persist final profile shape
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id;
      if (uid) {
        await supabase.from("profiles").upsert(
          {
            id: uid,
            email,
            name: name || email.split("@")[0],
            role,
            specialty: role === "lawyer" ? specialty : null,
            barreau: role === "lawyer" ? barreau : null,
          },
          { onConflict: "id" },
        );
      }

      setUser({
        name: name || email.split("@")[0],
        email,
        role,
        ...(role === "lawyer" ? { specialty, barreau } : {}),
      });
      useAudit.getState().log({
        type: "login",
        actor: name || email,
        role,
        detail: `Created ${role} account - ${email}`,
      });
      router.push(role === "lawyer" ? "/workspace" : "/directory");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary ring-1 ring-accent/60">
              <Scale className="h-4 w-4 text-accent" strokeWidth={2.4} />
            </div>
            <span className="font-display text-xl font-semibold">Avocat<span className="text-gradient">·</span>Link</span>
          </Link>

          <motion.form
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={submit}
            className="mt-8"
          >
            <h1 className="font-display text-3xl">Create your account.</h1>
            <p className="mt-1 text-sm text-muted-foreground">Choose how you want to use Avocat-Link.</p>

            {/* Role selector */}
            <div className="mt-6 relative grid grid-cols-2 gap-1 surface rounded-2xl p-1.5">
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="absolute inset-y-1.5 w-[calc(50%-6px)] rounded-xl bg-primary glow-primary"
                style={{ left: role === "client" ? 6 : "calc(50%)" }}
              />
              {(["client", "lawyer"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    role === r ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {r === "client" ? <User className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                  {r === "client" ? "I am a Client" : "I am a Lawyer"}
                </button>
              ))}
            </div>

            <label className="mt-6 block text-xs uppercase tracking-wider text-muted-foreground">Full name</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl px-3.5 py-3 bg-[oklch(0.94_0.008_250)] border border-border">
              <User className="h-4 w-4 text-muted-foreground" />
              <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
            </div>

            <label className="mt-4 block text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl px-3.5 py-3 bg-[oklch(0.94_0.008_250)] border border-border">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className="flex-1 bg-transparent text-sm outline-none" />
            </div>

            <label className="mt-4 block text-xs uppercase tracking-wider text-muted-foreground">Password</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl px-3.5 py-3 bg-[oklch(0.94_0.008_250)] border border-border">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="new-password" placeholder="Min. 6 characters" className="flex-1 bg-transparent text-sm outline-none" />
            </div>

            <AnimatePresence>
              {role === "lawyer" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground">Specialty</label>
                      <select value={specialty} onChange={(e) => setSpecialty(e.target.value as typeof specialty)} className="mt-1.5 w-full rounded-xl px-3 py-3 text-sm outline-none bg-[oklch(0.94_0.008_250)] border border-border">
                        {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-muted-foreground">Bar Association</label>
                      <input value={barreau} onChange={(e) => setBarreau(e.target.value)} className="mt-1.5 w-full rounded-xl px-3 py-3 text-sm outline-none bg-[oklch(0.94_0.008_250)] border border-border" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground glow-primary disabled:opacity-60"
            >
              {submitting ? "Creating account..." : `Create ${role === "client" ? "Client" : "Lawyer"} account`}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="mt-3 text-center text-xs text-muted-foreground">
              Already a member?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full chip-emerald px-3 py-1 text-[10px] font-semibold">
              <ShieldCheck className="h-3 w-3" /> Secure E2E Encrypted Onboarding
            </div>
          </motion.form>
        </div>
      </div>

      <div className="relative hidden md:block overflow-hidden">
        <Image src="/images/scales-of-justice.jpg" alt="Scales of justice" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/30 to-background/80" />
        <div className="absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute -bottom-24 -right-24 h-[480px] w-[480px] rounded-full bg-secondary/40 blur-[140px]" />

        <div className="relative h-full flex flex-col items-center justify-center p-10">
          <motion.div initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 160, damping: 22 }} className="glass-strong rounded-3xl p-10 max-w-md text-center backdrop-blur-2xl">
            <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-primary glow-primary ring-2 ring-accent/50">
              <Sparkles className="h-10 w-10 text-accent" />
            </div>
            <h2 className="mt-6 font-display text-3xl">
              {role === "client" ? "Welcome to your private counsel." : "Grow your practice with confidence."}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {role === "client"
                ? "Match with a vetted lawyer in seconds. Encrypted from your browser to theirs."
                : "Vetted leads, encrypted briefs, and an elegant case workspace — all in one suite."}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
