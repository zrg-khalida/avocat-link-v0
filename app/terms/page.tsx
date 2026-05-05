import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service - Avocat-Link",
  description: "Terms and conditions for using Avocat-Link legal services platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-4 z-40 mx-auto mt-4 w-[min(900px,calc(100%-2rem))]">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-5 py-3 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] ring-1 ring-accent/60">
              <Scale className="h-4 w-4 text-accent" strokeWidth={2.4} />
            </div>
            <span className="font-display text-lg font-semibold">Avocat<span className="text-gradient">·</span>Link</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl md:text-5xl mb-8">Terms of Service</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <p className="text-lg text-muted-foreground">
            Last updated: January 1, 2026
          </p>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Avocat-Link, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
            </p>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">2. Legal Services Disclaimer</h2>
            <p className="text-muted-foreground">
              Avocat-Link is a platform that connects clients with licensed attorneys. We do not provide legal advice directly. All legal services are provided by independent, licensed legal professionals who use our platform.
            </p>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">4. Attorney Verification</h2>
            <p className="text-muted-foreground">
              All attorneys on our platform are verified members of their respective bar associations. However, we recommend that users independently verify attorney credentials and insurance coverage before engaging services.
            </p>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">5. Payment Terms</h2>
            <p className="text-muted-foreground">
              Payment for legal services is processed through our secure payment system. All fees are clearly displayed before engagement. Refund policies vary by attorney and service type.
            </p>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">6. Confidentiality</h2>
            <p className="text-muted-foreground">
              All communications between clients and attorneys through our platform are protected by end-to-end encryption and attorney-client privilege where applicable under law.
            </p>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">7. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at legal@avocat-link.io
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
