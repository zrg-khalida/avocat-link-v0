import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Lock, Zap, Users, Scale, MessageSquare, FileText, Sparkles } from "lucide-react";
import { Decrypt } from "@/components/Decrypt";
import { LandingPage } from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Avocat-Link — Premium LegalTech, reimagined for trust" },
      { name: "description", content: "Bar-vetted attorneys, end-to-end encrypted briefs, instant matching. The lawyers' network for the modern era." },
      { property: "og:title", content: "Avocat-Link — Premium LegalTech" },
      { property: "og:description", content: "Bar-vetted attorneys, end-to-end encrypted briefs, instant matching." },
    ],
  }),
});

// Re-exports kept for backwards compatibility with any older imports.
export { Decrypt };
export const _icons = { ShieldCheck, ArrowRight, Lock, Zap, Users, Scale, MessageSquare, FileText, Sparkles, motion };
