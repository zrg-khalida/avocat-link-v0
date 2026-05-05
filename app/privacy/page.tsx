import Link from "next/link";
import { Scale, ArrowLeft, Shield, Lock, Eye, Server } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - Avocat-Link",
  description: "How Avocat-Link protects your personal data and privacy.",
};

export default function PrivacyPage() {
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
        <h1 className="font-display text-4xl md:text-5xl mb-4">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: January 1, 2026
        </p>

        {/* Security Highlights */}
        <div className="grid gap-4 sm:grid-cols-2 mb-12">
          {[
            { icon: Lock, title: "AES-256 Encryption", desc: "All data encrypted at rest and in transit" },
            { icon: Shield, title: "Zero-Knowledge", desc: "We cannot access your documents" },
            { icon: Eye, title: "GDPR Compliant", desc: "Full compliance with EU regulations" },
            { icon: Server, title: "EU Data Centers", desc: "Data stored exclusively in Europe" },
          ].map((item) => (
            <div key={item.title} className="surface rounded-xl p-4 flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg chip-emerald flex-shrink-0">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-8">
          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">Information We Collect</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Account Information:</strong> Name, email address, and professional credentials (for attorneys).</p>
              <p><strong className="text-foreground">Usage Data:</strong> How you interact with our platform, including pages visited and features used.</p>
              <p><strong className="text-foreground">Documents:</strong> Files you upload are encrypted and accessible only to you and your designated attorney.</p>
            </div>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">How We Use Your Data</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• To provide and maintain our legal matching services</li>
              <li>• To process payments and send transaction confirmations</li>
              <li>• To send important service updates and security alerts</li>
              <li>• To improve our platform based on aggregate usage patterns</li>
              <li>• To comply with legal obligations and protect our rights</li>
            </ul>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">Data Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We never sell your personal data. We only share information in these limited circumstances:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• With attorneys you explicitly choose to connect with</li>
              <li>• With payment processors to complete transactions</li>
              <li>• When required by law or to protect our legal rights</li>
            </ul>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              Under GDPR and applicable privacy laws, you have the right to:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Access your personal data</li>
              <li>• Correct inaccurate data</li>
              <li>• Request deletion of your data</li>
              <li>• Export your data in a portable format</li>
              <li>• Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your data for as long as your account is active or as needed to provide services. Legal documents are retained according to statutory requirements. You may request deletion of your account and associated data at any time.
            </p>
          </section>

          <section className="surface rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              For privacy-related inquiries or to exercise your rights, contact our Data Protection Officer at privacy@avocat-link.io
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
