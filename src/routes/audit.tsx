import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ScrollText, ShieldAlert, LogIn, LogOut, RefreshCw, Calendar, Upload, Unlock, Receipt, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AUDIT_LABEL, useAudit, type AuditEventType } from "@/lib/audit";
import { useApp } from "@/lib/store";
import { RoleGuard } from "@/components/RoleGuard";
import { Decrypt } from "@/components/Decrypt";

export const Route = createFileRoute("/audit")({
  component: AuditPage,
  head: () => ({
    meta: [
      { title: "Audit Log — Avocat-Link" },
      { name: "description", content: "Tamper-evident trail of every privileged action." },
    ],
  }),
});

const ICONS: Record<AuditEventType, React.ComponentType<{ className?: string }>> = {
  login: LogIn,
  logout: LogOut,
  role_switch: RefreshCw,
  booking: Calendar,
  upload: Upload,
  vault_unlock: Unlock,
  invoice_generated: Receipt,
  access_denied: ShieldAlert,
};

const TONE: Record<AuditEventType, string> = {
  login: "chip-emerald",
  logout: "chip-amber",
  role_switch: "chip-amber",
  booking: "chip-emerald",
  upload: "chip-emerald",
  vault_unlock: "chip-emerald",
  invoice_generated: "chip-emerald",
  access_denied: "chip-rose",
};

const FILTERS: ("all" | AuditEventType)[] = [
  "all", "login", "role_switch", "booking", "upload", "vault_unlock", "invoice_generated", "access_denied",
];

function AuditPage() {
  return (
    <RoleGuard action="view:audit">
      <AuditInner />
    </RoleGuard>
  );
}

function AuditInner() {
  const events = useAudit((s) => s.events);
  const clear = useAudit((s) => s.clear);
  const user = useApp((s) => s.user);
  const [filter, setFilter] = useState<"all" | AuditEventType>("all");

  const visible = useMemo(() => {
    let list = events;
    // Clients only see their own actions; lawyers see everything in their scope
    if (user?.role === "client") {
      list = list.filter((e) => e.actor === user.name || e.role === "client" || e.type === "access_denied");
    }
    if (filter !== "all") list = list.filter((e) => e.type === filter);
    return list;
  }, [events, filter, user]);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-8 pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-flex items-center gap-2 rounded-full chip-emerald px-3 py-1 text-xs font-semibold">
          <ScrollText className="h-3 w-3" /> Audit Trail
        </div>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">
          <Decrypt text="Audit log" duration={700} />
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tamper-evident record of every privileged action. {visible.length} events visible to your role.
        </p>
      </motion.div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === f ? "bg-primary text-primary-foreground glow-primary" : "surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : AUDIT_LABEL[f]}
          </button>
        ))}
        <button
          onClick={clear}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg surface px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      <div className="mt-6 surface-lg rounded-2xl divide-y divide-border overflow-hidden">
        {visible.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-16">No audit events for this filter.</div>
        )}
        {visible.map((e, i) => {
          const Icon = ICONS[e.type];
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/30 transition"
              data-testid="audit-row"
              data-event-type={e.type}
            >
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${TONE[e.type]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-sm">{AUDIT_LABEL[e.type]}</span>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{e.role}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">{e.detail}</div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  {e.actor} · {new Date(e.at).toLocaleString()}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
