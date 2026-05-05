import { LandingPage } from "@/components/LandingPage";

export const metadata = {
  title: "Avocat-Link — Premium LegalTech, reimagined for trust",
  description: "Bar-vetted attorneys, end-to-end encrypted briefs, instant matching. The lawyers' network for the modern era.",
  openGraph: {
    title: "Avocat-Link — Premium LegalTech",
    description: "Bar-vetted attorneys, end-to-end encrypted briefs, instant matching.",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
