import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "./terms";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Avocat-Link" },
      { name: "description", content: "How Avocat-Link collects, processes, and protects your personal data." },
    ],
  }),
});

const SECTIONS = [
  {
    h: "1. Who we are",
    p: "Avocat-Link SAS, registered in Paris, France, is the data controller for personal information processed through this platform. Our DPO can be reached at dpo@avocat-link.io.",
  },
  {
    h: "2. Data we collect",
    p: "We collect account details (name, email), professional information for attorneys (bar registration, specialty), payment metadata, and end-to-end encrypted documents and messages that we cannot decrypt.",
  },
  {
    h: "3. Zero-knowledge architecture",
    p: "All consultation documents and chat messages are encrypted client-side using AES-256 with keys derived from your password. The server stores only ciphertext. We physically cannot read your privileged content.",
  },
  {
    h: "4. Lawful basis",
    p: "We process your data based on the contract you enter when creating an account, your explicit consent for marketing, and our legitimate interest in fraud prevention and platform integrity.",
  },
  {
    h: "5. How we use your data",
    p: "To deliver the service, match clients with attorneys, process payments, secure your account, comply with legal obligations, and (with consent) send service updates. We do not sell your data — ever.",
  },
  {
    h: "6. Sharing & sub-processors",
    p: "Limited categories of data are shared with vetted sub-processors for payment processing, infrastructure hosting (EU region), and email delivery. A current list is published at avocat-link.io/subprocessors.",
  },
  {
    h: "7. International transfers",
    p: "Personal data is stored within the European Union. Where a sub-processor operates outside the EU, we rely on Standard Contractual Clauses and supplementary technical measures.",
  },
  {
    h: "8. Retention",
    p: "Account data is retained for the duration of your subscription plus 12 months. Encrypted documents can be deleted on demand. Billing records are retained for 10 years per accounting law.",
  },
  {
    h: "9. Your rights",
    p: "Under GDPR you have rights of access, rectification, erasure, restriction, portability, and objection. To exercise them, email dpo@avocat-link.io. You may also lodge a complaint with the CNIL.",
  },
  {
    h: "10. Cookies",
    p: "We use strictly necessary cookies for authentication and a single optional analytics cookie (anonymized). The cookie banner lets you opt in or out at any time.",
  },
  {
    h: "11. Security",
    p: "We use TLS 1.3 in transit, AES-256 at rest, hardware-backed key management, annual penetration testing, and SOC 2 Type II audited controls.",
  },
  {
    h: "12. Updates",
    p: "We will notify you of material changes by email and via in-app banner at least 30 days before they take effect.",
  },
];

function PrivacyPage() {
  return <LegalLayout title="Privacy Policy" updated="April 18, 2026" sections={SECTIONS} />;
}
