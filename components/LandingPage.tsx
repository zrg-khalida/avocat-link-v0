"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, ArrowRight, Lock, Zap, Users, Scale, MessageSquare, FileText, Gavel } from "lucide-react";
import { Decrypt } from "@/components/Decrypt";

const SPRING = { type: "spring" as const, stiffness: 140, damping: 24, mass: 0.9 };

export function LandingPage() {
  return (
    <>
      <header className="sticky top-4 z-40 mx-auto mt-4 w-[min(1200px,calc(100%-2rem))]">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-5 py-3 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] ring-1 ring-accent/60">
              <Scale className="h-4 w-4 text-accent" strokeWidth={2.4} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold">Avocat<span className="text-gradient">·</span>Link</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Premium LegalTech</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link href="/terms" className="px-3 py-2 text-muted-foreground hover:text-foreground transition">Terms</Link>
            <Link href="/privacy" className="px-3 py-2 text-muted-foreground hover:text-foreground transition">Privacy</Link>
          </nav>
          <Link
            href="/login"
            data-magnetic="true"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow-primary"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* HERO with Supreme Court backdrop */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] surface-lg">
          {/* Backdrop image */}
          <div className="absolute inset-0">
            <Image
              src="/images/supreme-court-hero.jpg"
              alt="Neoclassical supreme court at golden hour"
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />
          </div>

          <div className="relative grid gap-10 px-6 md:px-12 py-20 md:py-28 md:grid-cols-[1.1fr_1fr] items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING}
            >
              <div className="inline-flex items-center gap-2 rounded-full chip-emerald px-4 py-1.5 text-xs backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" />
                End-to-End Encrypted · Bar-vetted lawyers
              </div>

              <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1.02] tracking-[-0.015em] md:tracking-[-0.02em] text-foreground text-legible">
                The lawyers&apos; network <br />
                <span className="text-gradient">
                  <Decrypt text="reimagined for trust." duration={1400} />
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base text-muted-foreground tracking-[0.005em]">
                Avocat-Link pairs you with vetted attorneys in seconds. Encrypted documents,
                confidential consultations, zero friction.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }} transition={SPRING}>
                  <Link
                    href="/signup"
                    data-magnetic="true"
                    className="shimmer-navy ripple-navy group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground glow-primary transition-colors duration-300 hover:brightness-110"
                  >
                    <span className="relative z-10 inline-flex items-center gap-2">
                      Get Started
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur-md transition-colors hover:text-primary"
                >
                  Sign in
                </Link>
              </div>
            </motion.div>

            {/* Glass info card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.15 }}
              className="relative"
            >
              <div className="glass-strong rounded-3xl p-8 backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary glow-primary ring-1 ring-accent/60">
                    <Gavel className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-display text-lg">Live Counsel Network</div>
                    <div className="text-xs text-muted-foreground">1,247 attorneys online</div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { k: "Avg. match", v: "12s" },
                    { k: "Encrypted", v: "AES-256" },
                    { k: "Bar verified", v: "100%" },
                  ].map((m) => (
                    <div key={m.k} className="rounded-xl surface px-3 py-2.5 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.k}</div>
                      <div className="font-display text-base mt-0.5">{m.v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full chip-emerald px-3 py-1 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Zero-knowledge vault active
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Lock, title: "Zero-knowledge vault", text: "AES-256 encryption. Even we cannot read your briefs." },
            { icon: Zap, title: "Match in seconds", text: "Specialty-tuned matching across 1,200+ practitioners." },
            { icon: Users, title: "Bar-verified", text: "Every lawyer is vetted, insured, and continuously rated." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ...SPRING }}
              className="glass-soft rounded-2xl p-6"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl chip-emerald">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 surface-lg rounded-3xl p-10 text-center backdrop-blur-2xl"
        >
          <Sparkles className="mx-auto h-6 w-6 text-accent" />
          <h2 className="mt-3 font-display text-3xl tracking-[-0.015em]">Ready to find your counsel?</h2>
          <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }} transition={SPRING} className="mt-6 inline-block">
            <Link
              href="/signup"
              data-magnetic="true"
              className="shimmer-navy ripple-navy group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground glow-primary transition-colors duration-300 hover:brightness-110"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        </motion.div>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground border-t border-border pt-6">
          <div className="inline-flex items-center gap-2">
            <FileText className="h-3 w-3" /> &copy; 2026 Avocat-Link
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/messages" className="inline-flex items-center gap-1 hover:text-foreground"><MessageSquare className="h-3 w-3" /> Support</Link>
          </div>
        </footer>
      </section>
    </>
  );
}
