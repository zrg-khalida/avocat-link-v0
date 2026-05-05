import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Inbox, CheckCircle2, XCircle, FileText, Star, Clock, Wallet, Receipt } from "lucide-react";
import { useAudit } from "@/lib/audit";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyConsultations, initialsOf, type ConsultationRow } from "@/lib/supabase-data";
import { Decrypt } from "@/components/Decrypt";
import { VaultUnlock } from "@/components/VaultUnlock";
import { PdfViewer } from "@/components/PdfViewer";
import { StickyNote } from "@/components/StickyNote";
import { InvoiceModal, type InvoiceData } from "@/components/InvoiceModal";
import { Redacted } from "@/components/Redacted";
import { RoleGuard } from "@/components/RoleGuard";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileSummary = {
  name: string;
  email: string;
  specialty: string | null;
  barreau: string | null;
  rate: number | null;
};

type Bucket = "pending" | "accepted" | "declined";
function bucketOf(status: ConsultationRow["status"]): Bucket {
  if (status === "Pending" || status === "Analyzing") return "pending";
  if (status === "Confirmed") return "accepted";
  return "declined";
}

export const Route = createFileRoute("/workspace")({
  component: WorkspacePage,
});

function WorkspacePage() {
  return (
    <RoleGuard action="view:workspace" requiredRole="lawyer">
      <WorkspaceInner />
    </RoleGuard>
  );
}

function WorkspaceInner() {
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [consultations, setConsultations] = useState<ConsultationRow[] | null>(null);
  const [vaultFor, setVaultFor] = useState<string | null>(null);
  const [viewerFor, setViewerFor] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (uid) {
        const { data: p } = await supabase
          .from("profiles")
          .select("name,email,specialty,barreau,rate")
          .eq("id", uid)
          .maybeSingle();
        if (!cancelled && p) setProfile(p as ProfileSummary);
      }
      try {
        const list = await fetchMyConsultations();
        if (!cancelled) setConsultations(list);
      } catch (e) {
        console.error("[workspace] fetchMyConsultations", e);
        if (!cancelled) setConsultations([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const decide = async (id: string, decision: "accepted" | "declined") => {
    const next = decision === "accepted" ? "Confirmed" : "Declined";
    const prev = consultations;
    setConsultations((cur) => cur?.map((c) => c.id === id ? { ...c, status: next as ConsultationRow["status"] } : c) ?? cur);
    const { error } = await supabase.from("consultations").update({ status: next }).eq("id", id);
    if (error) {
      console.error("[workspace] decide", error);
      setConsultations(prev ?? null);
    }
  };

  const list = consultations ?? [];

  const stats = useMemo(() => {
    const accepted = list.filter((c) => bucketOf(c.status) === "accepted");
    const pending = list.filter((c) => bucketOf(c.status) === "pending");
    const rate = profile?.rate ?? 0;
    const revenue = accepted.length * rate * 4; // 4h estimate
    return { revenue, pending: pending.length, accepted: accepted.length };
  }, [list, profile]);

  if (consultations === null || profile === null) {
    return (
      <div className="mx-auto max-w-7xl px-6 pt-8 pb-24">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const activeConsult = list.find((c) => c.id === viewerFor);
  const lastName = (profile.name || profile.email).split(" ").slice(-1)[0];

  const pending = list.filter((c) => bucketOf(c.status) === "pending");
  const accepted = list.filter((c) => bucketOf(c.status) === "accepted");
  const declined = list.filter((c) => bucketOf(c.status) === "declined");

  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full chip-emerald px-3 py-1 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Lawyer Portal · {profile.barreau ? `Bar of ${profile.barreau}` : "Bar verified"}
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl">
              <Decrypt text={`Welcome, ${lastName}`} duration={900} />
            </h1>
            <p className="mt-2 text-muted-foreground">Specialty · {profile.specialty ?? "Generalist"}</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <StatCard icon={Wallet} label="Total Earnings" value={`€${stats.revenue.toLocaleString()}`} tone="emerald" delay={0} />
        <StatCard icon={Inbox} label="Pending Requests" value={String(stats.pending)} tone="amber" delay={0.1} />
        <StatCard icon={TrendingUp} label="Active Cases" value={String(stats.accepted)} tone="emerald" delay={0.2} />
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Case Management</h2>
          <div className="text-xs text-muted-foreground">Auto-sorted by status</div>
        </div>

        {list.length === 0 ? (
          <div className="surface rounded-2xl p-10 text-center text-muted-foreground">
            No client requests yet. New consultations will appear here in real time.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            <Column title="Pending" tone="amber" count={pending.length}>
              <AnimatePresence mode="popLayout">
                {pending.map((c) => (
                  <RequestCard
                    key={c.id} c={c} hourly={profile.rate ?? 0}
                    onAccept={() => {
                      decide(c.id, "accepted");
                      useAudit.getState().log({ type: "role_switch", actor: profile.name, role: "lawyer", detail: `Accepted request from ${c.client?.name ?? "client"}` });
                    }}
                    onDecline={() => {
                      decide(c.id, "declined");
                      useAudit.getState().log({ type: "access_denied", actor: profile.name, role: "lawyer", detail: `Declined request from ${c.client?.name ?? "client"}` });
                    }}
                    onReview={() => setVaultFor(c.id)}
                  />
                ))}
              </AnimatePresence>
            </Column>
            <Column title="Accepted" tone="emerald" count={accepted.length}>
              <AnimatePresence mode="popLayout">
                {accepted.map((c) => {
                  const fee = (profile.rate ?? 0) * 4;
                  return (
                    <RequestCard
                      key={c.id} c={c} hourly={profile.rate ?? 0}
                      onReview={() => setVaultFor(c.id)}
                      onInvoice={() => {
                        const data: InvoiceData = {
                          clientName: c.client?.name ?? "Client",
                          lawyerName: profile.name,
                          rate: profile.rate ?? 0,
                          hours: 4,
                          date: new Date().toISOString(),
                          reference: `AVL-${new Date().getFullYear()}-${c.id.slice(0, 6).toUpperCase()}`,
                        };
                        setInvoice(data);
                        useAudit.getState().log({ type: "invoice_generated", actor: profile.name, role: "lawyer", detail: `Invoice ${data.reference} for ${c.client?.name ?? "client"} · €${fee}` });
                      }}
                      muted
                    />
                  );
                })}
              </AnimatePresence>
            </Column>
            <Column title="Declined" tone="rose" count={declined.length}>
              <AnimatePresence mode="popLayout">
                {declined.map((c) => (
                  <RequestCard key={c.id} c={c} hourly={profile.rate ?? 0} muted />
                ))}
              </AnimatePresence>
            </Column>
          </div>
        )}
      </div>

      <VaultUnlock
        open={vaultFor !== null}
        clientName={list.find((c) => c.id === vaultFor)?.client?.name ?? ""}
        onClose={() => setVaultFor(null)}
        onUnlocked={() => {
          const id = vaultFor;
          const req = list.find((c) => c.id === id);
          if (req) {
            useAudit.getState().log({ type: "vault_unlock", actor: profile.name, role: "lawyer", detail: `Unlocked vault: ${req.client?.name ?? "client"} · ${req.document_name}` });
          }
          setVaultFor(null);
          setViewerFor(id);
        }}
      />

      <PdfViewer
        open={!!viewerFor && !!activeConsult}
        onClose={() => setViewerFor(null)}
        documentName={activeConsult?.document_name ?? ""}
        userName={activeConsult?.client?.name ?? ""}
        layoutId={`vault-${viewerFor ?? "x"}`}
      />

      <InvoiceModal open={!!invoice} onClose={() => setInvoice(null)} data={invoice} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone, delay }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: "emerald" | "amber"; delay: number }) {
  const chip = tone === "emerald" ? "chip-emerald" : "chip-amber";
  const grad = tone === "emerald" ? "text-gradient" : "text-gradient-amber";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 22 }}
      className="surface relative rounded-2xl p-6 overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${chip}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className={`mt-3 font-display text-4xl ${grad}`}>
        <Decrypt text={value} duration={700} />
      </div>
    </motion.div>
  );
}

function Column({ title, tone, count, children }: { title: string; tone: "amber" | "emerald" | "rose"; count: number; children: React.ReactNode }) {
  const dot = tone === "emerald" ? "bg-primary" : tone === "rose" ? "bg-destructive" : "bg-accent";
  return (
    <div className="surface rounded-2xl p-4 min-h-[200px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          <h3 className="font-display text-lg">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      <div className="space-y-3">
        {children}
        {count === 0 && <div className="text-center text-xs text-muted-foreground py-8">Empty</div>}
      </div>
    </div>
  );
}

function RequestCard({
  c,
  hourly,
  onAccept,
  onDecline,
  onReview,
  onInvoice,
  muted,
}: {
  c: ConsultationRow;
  hourly: number;
  onAccept?: () => void;
  onDecline?: () => void;
  onReview?: () => void;
  onInvoice?: () => void;
  muted?: boolean;
}) {
  const [strike, setStrike] = useState(false);
  const handleAccept = () => {
    setStrike(true);
    setTimeout(() => { setStrike(false); onAccept?.(); }, 520);
  };
  const clientName = c.client?.name || "Client";
  const clientInitials = initialsOf(clientName);
  const estimatedFee = hourly * 4;
  const subject = `Consultation · ${c.lawyer?.specialty ?? "case"}`;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={`relative rounded-xl p-4 ring-1 ring-border ${muted ? "bg-secondary/40" : "bg-card"} ${strike ? "gavel-strike" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border font-display text-sm">
            {clientInitials}
          </div>
          <div>
            <div className="text-sm font-semibold">{clientName}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.lawyer?.specialty ?? "—"}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gradient font-bold">€{estimatedFee}</div>
          <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" /> {new Date(c.scheduled_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{subject}</p>

      <div className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
        Direct line: <Redacted>+33 6 12 34 56 78</Redacted>
      </div>

      <button
        onClick={onReview}
        disabled={!onReview}
        className="mt-3 w-full surface inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-secondary transition disabled:opacity-50"
      >
        <FileText className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold truncate">{c.document_name}</span>
        <span className="text-[oklch(0.42_0.06_50)]">· encrypted</span>
      </button>

      {onAccept && onDecline && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAccept}
            data-magnetic
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground glow-primary"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Accept
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDecline}
            data-magnetic
            className="inline-flex items-center justify-center gap-1.5 rounded-lg surface px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <XCircle className="h-3.5 w-3.5" /> Decline
          </motion.button>
        </div>
      )}

      {!onAccept && c.status === "Confirmed" && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-[oklch(0.42_0.06_50)]">
            <Star className="h-3 w-3 fill-current" /> Active engagement
          </div>
          {onInvoice && (
            <button
              onClick={onInvoice}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/15 transition"
            >
              <Receipt className="h-3.5 w-3.5" /> Generate Invoice
            </button>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border/60">
        <StickyNote defaultValue={c.status === "Confirmed" ? "Counterparty seems open to settlement — confirm next call." : ""} />
      </div>
    </motion.div>
  );
}

