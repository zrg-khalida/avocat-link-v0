import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Use — Avocat-Link" },
      { name: "description", content: "The legal terms governing your use of the Avocat-Link platform." },
    ],
  }),
});

function TermsPage() {
  return <LegalLayout title="Terms of Use" updated="April 18, 2026" sections={SECTIONS} />;
}

const SECTIONS = [
  {
    h: "1. Acceptance of Terms",
    p: "By accessing or using Avocat-Link, you agree to be bound by these Terms of Use. If you do not agree, you may not use the service. These terms apply to clients, attorneys, and any visitors to the platform.",
  },
  {
    h: "2. Eligibility",
    p: "You must be at least 18 years old and capable of entering into a legally binding contract. Attorneys must be currently registered with a recognized bar association and provide accurate verification information.",
  },
  {
    h: "3. Account & Security",
    p: "You are responsible for safeguarding your credentials. All sessions are end-to-end encrypted; however you must promptly notify us of any unauthorized access. Sharing your account constitutes a breach of these terms.",
  },
  {
    h: "4. Confidentiality",
    p: "Documents and communications exchanged through the platform are protected by attorney-client privilege where applicable. Avocat-Link operates under a zero-knowledge architecture and cannot access your encrypted content.",
  },
  {
    h: "5. Fees & Payments",
    p: "Consultation fees are set by individual attorneys and clearly displayed before booking. Avocat-Link charges a service fee disclosed at checkout. Refund requests are evaluated case-by-case under our refund policy.",
  },
  {
    h: "6. Acceptable Use",
    p: "You may not use the service to upload illegal content, harass other users, attempt to circumvent security controls, or engage in unauthorized practice of law. Violations may result in immediate account termination.",
  },
  {
    h: "7. Intellectual Property",
    p: "The Avocat-Link platform, brand, and software are owned by Avocat-Link SAS. You retain full ownership of any documents you upload. You grant us a limited license solely to operate the encrypted vault on your behalf.",
  },
  {
    h: "8. Limitation of Liability",
    p: "To the maximum extent permitted by law, Avocat-Link is not liable for indirect, incidental, or consequential damages arising from your use of the service. Our total liability is capped at fees paid in the prior 12 months.",
  },
  {
    h: "9. Termination",
    p: "Either party may terminate this agreement at any time. Upon termination your encrypted vault is wiped within 30 days, except where retention is required by applicable law or pending legal proceedings.",
  },
  {
    h: "10. Governing Law",
    p: "These terms are governed by the laws of France. Any disputes will be resolved in the competent courts of Paris, unless mandatory consumer protection law provides otherwise.",
  },
  {
    h: "11. Changes",
    p: "We may update these terms periodically. Material changes will be notified via email at least 30 days in advance. Continued use after the effective date constitutes acceptance.",
  },
  {
    h: "12. Contact",
    p: "Questions about these terms? Contact us at legal@avocat-link.io. Our DPO is reachable at dpo@avocat-link.io.",
  },
];

export function LegalLayout({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string }[] }) {
  return (
    <div className="min-h-screen bg-app">
      <header className="mx-auto max-w-5xl px-6 pt-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </header>

      <article className="mx-auto max-w-5xl px-6 pt-8 pb-24">
        <div className="surface-lg rounded-3xl p-8 md:p-12">
          <div className="inline-flex items-center gap-2 chip-emerald rounded-full px-3 py-1 text-[11px] font-semibold">
            <ShieldCheck className="h-3 w-3" /> Legal Document
          </div>
          <h1 className="mt-4 font-display text-5xl text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: <span className="text-foreground font-semibold">{updated}</span></p>
        </div>

        <div className="mt-8 columns-1 md:columns-2 gap-10 [column-fill:_balance]">
          {sections.map((s) => (
            <section key={s.h} className="break-inside-avoid mb-8">
              <h2 className="font-display text-xl text-foreground mb-2">{s.h}</h2>
              <p className="text-[15px] leading-7 text-muted-foreground">{s.p}</p>
            </section>
          ))}
        </div>

        <footer className="mt-12 surface rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="text-muted-foreground">© 2026 Avocat-Link SAS · 9 rue de la Paix, 75002 Paris</div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/" className="text-primary font-semibold hover:underline">Home</Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
