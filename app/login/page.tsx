"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, Lock, ArrowRight, User, KeyRound, Search, Check, Briefcase, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp, type Role } from "@/lib/store";
import { useAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/client";

const SPECIALTIES = ["Business", "Penal", "Family"] as const;

export default function LoginPage() {
  const supabase = createClient();
  const [step, setStep] = useState<"login" | 1 | 2 | 3>("login");
  const [role, setRole] = useState<Role>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState<(typeof SPECIALTIES)[number]>("Business");
  const [barreau, setBarreau] = useState("Paris");
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const setUser = useApp((s) => s.setUser);

  // If a session is already active, route the user to their portal.
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted || !data.session) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email, role, specialty, barreau")
        .eq("id", data.session.user.id)
        .maybeSingle();
      if (!mounted) return;
      const r: Role = (profile?.role as Role) ?? "client";
      setUser({
        name: profile?.name || data.session.user.email || "",
        email: profile?.email || data.session.user.email || "",
        role: r,
        ...(r === "lawyer"
          ? { specialty: (profile?.specialty as never) ?? "Business", barreau: profile?.barreau ?? "" }
          : {}),
      });
      router.push(r === "lawyer" ? "/workspace" : "/directory");
    });
    return () => { mounted = false; };
  }, [router, setUser, supabase]);

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Pull profile so we know role/name before the wizard
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id;
      if (uid) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, role, specialty, barreau")
          .eq("id", uid)
          .maybeSingle();
        if (profile?.name) setName(profile.name);
        if (profile?.role === "lawyer") {
          setRole("lawyer");
          if (profile.specialty) setSpecialty(profile.specialty as typeof specialty);
          if (profile.barreau) setBarreau(profile.barreau);
        } else {
          setRole("client");
        }
      }
      setStep(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setAuthError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const finish = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) {
      setAuthError("Session expired. Please sign in again.");
      setStep("login");
      return;
    }

    // Upsert the profile with the latest wizard inputs
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          email,
          name: name || email.split("@")[0],
          role,
          specialty: role === "lawyer" ? specialty : null,
          barreau: role === "lawyer" ? barreau : null,
        },
        { onConflict: "id" },
      );
    if (profileError) {
      setAuthError(profileError.message);
      return;
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
      detail: `Signed in as ${role} · ${email}`,
    });
    router.push(role === "lawyer" ? "/workspace" : "/directory");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left — form */}
      <div className="relative flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary ring-1 ring-accent/60">
              <Scale className="h-4 w-4 text-accent" strokeWidth={2.4} />
            </div>
            <span className="font-display text-xl font-semibold">Avocat<span className="text-gradient">·</span>Link</span>
          </Link>

          <AnimatePresence mode="wait">
            {step === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                onSubmit={submitLogin}
                className="mt-8"
              >
                <h1 className="font-display text-3xl">Welcome back.</h1>
                <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to your suite.</p>

                <label className="mt-6 block text-xs uppercase tracking-wider text-muted-foreground">Email</label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl px-3.5 py-3 bg-[oklch(0.94_0.008_250)] border border-border">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
                <label className="mt-4 block text-xs uppercase tracking-wider text-muted-foreground">Password</label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl px-3.5 py-3 bg-[oklch(0.94_0.008_250)] border border-border">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>

                {authError && (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !email || !password}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground glow-primary disabled:opacity-60"
                >
                  {submitting ? "Signing in..." : "Sign in"}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="mt-3 text-center text-xs text-muted-foreground">
                  New to Avocat-Link?{" "}
                  <Link href="/signup" className="text-primary font-semibold hover:underline">Create an account</Link>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full chip-emerald px-3 py-1 text-[10px] font-semibold">
                  <ShieldCheck className="h-3 w-3" /> Secure E2E Encrypted Login
                </div>

                <div className="mt-6 text-[11px] text-muted-foreground">
                  By continuing you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms</Link>{" "}and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </div>
              </motion.form>
            )}

            {step !== "login" && (
              <OnboardingFlow
                key={`step-${step}`}
                role={role}
                step={step as 1 | 2 | 3}
                name={name}
                setName={setName}
                onNext={() => (step === 3 ? finish() : setStep(((step as number) + 1) as 1 | 2 | 3))}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right — Scales of Justice visual */}
      <div className="relative hidden md:block overflow-hidden">
        <Image
          src="/images/scales-of-justice.jpg"
          alt="Bronze scales of justice on a judge's desk"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/70 via-background/30 to-background/80" />
        <div className="absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute -bottom-24 -right-24 h-[480px] w-[480px] rounded-full bg-secondary/40 blur-[140px]" />

        <div className="relative h-full flex flex-col items-center justify-center p-10">
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
            className="glass-strong rounded-3xl p-10 max-w-md text-center backdrop-blur-2xl"
          >
            <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-primary glow-primary ring-2 ring-accent/50">
              <ShieldCheck className="h-10 w-10 text-accent" />
              <span className="absolute inset-0 rounded-2xl pulse-ring" />
            </div>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full chip-emerald px-3 py-1 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              End-to-End Encrypted
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <h2 className="mt-6 font-display text-3xl">
                  {role === "client" ? "Your privilege, protected." : "Your practice, amplified."}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {role === "client"
                    ? "Communications are encrypted client-side. We physically cannot access them."
                    : "Receive vetted leads, manage cases, and review encrypted briefs in one workspace."}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-xl surface px-3 py-2 text-xs">
                  {role === "client" ? <User className="h-3.5 w-3.5" /> : <Briefcase className="h-3.5 w-3.5" />}
                  Routing to: <span className="text-gradient font-semibold">{role === "client" ? "/directory" : "/workspace"}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function OnboardingFlow({ role, step, name, setName, onNext }: { role: Role; step: 1 | 2 | 3; name: string; setName: (s: string) => void; onNext: () => void }) {
  const stepsClient = [
    { icon: User, title: "Profile setup", text: "Tell us who you are. This stays private." },
    { icon: KeyRound, title: "Security brief", text: "Your data is encrypted with keys only you hold." },
    { icon: Search, title: "Find your lawyer", text: "We'll match you in seconds." },
  ];
  const stepsLawyer = [
    { icon: Briefcase, title: "Practice profile", text: "Confirm your name as it appears on the bar register." },
    { icon: KeyRound, title: "Security brief", text: "Client briefs are encrypted in transit and at rest." },
    { icon: Scale, title: "Open your workspace", text: "Review pending requests and start accepting cases." },
  ];
  const steps = role === "lawyer" ? stepsLawyer : stepsClient;
  const meta = steps[step - 1];

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="mt-10"
    >
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>

      <div className="grid h-12 w-12 place-items-center rounded-xl chip-emerald">
        <meta.icon className="h-5 w-5" />
      </div>
      <h2 className="mt-4 font-display text-3xl">{meta.title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{meta.text}</p>

      {step === 1 && (
        <div className="mt-6">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl px-3.5 py-3 text-sm outline-none bg-[oklch(0.94_0.008_250)] border border-border"
          />
        </div>
      )}
      {step === 2 && (
        <div className="mt-6 surface rounded-xl p-4 text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Documents encrypted client-side with AES-256.</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Zero-knowledge architecture — staff cannot decrypt.</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Annual independent security audits.</li>
          </ul>
        </div>
      )}
      {step === 3 && (
        <div className="mt-6 surface rounded-xl p-5 text-center">
          <div className="text-4xl">{role === "lawyer" ? "\u2696\uFE0F" : "\uD83D\uDD0D"}</div>
          <p className="mt-2 text-sm text-muted-foreground">
            {role === "lawyer" ? "Your inbox is ready — pending requests await." : "Ready to browse 1,200+ vetted lawyers."}
          </p>
        </div>
      )}

      <button
        onClick={onNext}
        className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground glow-primary"
      >
        {step === 3 ? `Enter ${role === "lawyer" ? "Workspace" : "Avocat-Link"}` : "Continue"} <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
