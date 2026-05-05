import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { MagneticCursor } from "@/components/MagneticCursor";
import { ScrollGlow } from "@/components/ScrollGlow";
import { AppShell } from "@/components/AppShell";
import { CourtroomBg } from "@/components/CourtroomBg";
import { PageTransition } from "@/components/PageTransition";
import { ThemeProvider } from "@/lib/theme";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4">
      <div className="surface-lg rounded-2xl p-10 max-w-md text-center">
        <h1 className="font-display text-6xl text-gradient">404</h1>
        <h2 className="mt-3 font-display text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow-primary"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Avocat-Link — Premium LegalTech" },
      { name: "description", content: "Find, book, and consult vetted lawyers with end-to-end encryption." },
      { name: "author", content: "Avocat-Link" },
      { property: "og:title", content: "Avocat-Link — Premium LegalTech" },
      { property: "og:description", content: "Find, book, and consult vetted lawyers with end-to-end encryption." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const loc = useLocation();
  // Login & landing have their own layouts (no chrome)
  const bare = loc.pathname === "/login" || loc.pathname === "/signup" || loc.pathname === "/" || loc.pathname === "/terms" || loc.pathname === "/privacy";
  return (
    <ThemeProvider>
      <CourtroomBg />
      <ScrollGlow />
      <MagneticCursor />
      {bare ? (
        <div className="min-h-screen bg-app">
          <PageTransition><Outlet /></PageTransition>
        </div>
      ) : (
        <AppShell>
          <PageTransition><Outlet /></PageTransition>
        </AppShell>
      )}
    </ThemeProvider>
  );
}
