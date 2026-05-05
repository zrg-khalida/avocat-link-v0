"use client";

import { motion } from "framer-motion";
import { ScrollText, Shield, Clock, User, Trash2, Filter } from "lucide-react";
import { useAudit, AUDIT_LABEL, type AuditEventType } from "@/lib/audit";
import { useState } from "react";

const EVENT_ICONS: Record<AuditEventType, typeof Shield> = {
  login: User,
  logout: User,
  role_switch: User,
  booking: Clock,
  upload: Shield,
  vault_unlock: Shield,
  invoice_generated: ScrollText,
  access_denied: Shield,
};

const EVENT_COLORS: Record<AuditEventType, string> = {
  login: "chip-emerald",
  logout: "chip-amber",
  role_switch: "chip-amber",
  booking: "chip-emerald",
  upload: "chip-emerald",
  vault_unlock: "chip-emerald",
  invoice_generated: "chip-emerald",
  access_denied: "chip-rose",
};

export default function AuditPage() {
  const events = useAudit((s) => s.events);
  const clear = useAudit((s) => s.clear);
  const [filter, setFilter] = useState<AuditEventType | "all">("all");

  const filtered = filter === "all" 
    ? events 
    : events.filter((e) => e.type === filter);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const uniqueTypes = [...new Set(events.map((e) => e.type))];

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">Audit Log</h1>
          <p className="mt-2 text-muted-foreground">
            Complete history of all security events and actions
          </p>
        </div>
        <button
          onClick={() => clear()}
          className="inline-flex items-center gap-2 rounded-xl surface px-4 py-2 text-sm font-medium text-muted-foreground hover:text-rose-500 transition"
        >
          <Trash2 className="h-4 w-4" />
          Clear Log
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition flex-shrink-0 ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "surface text-muted-foreground hover:text-foreground"
          }`}
        >
          All Events
        </button>
        {uniqueTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition flex-shrink-0 ${
              filter === type
                ? "bg-primary text-primary-foreground"
                : "surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {AUDIT_LABEL[type]}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="surface-lg rounded-2xl overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.map((event, i) => {
            const Icon = EVENT_ICONS[event.type];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition"
              >
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${EVENT_COLORS[event.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{AUDIT_LABEL[event.type]}</p>
                    <span className="text-xs text-muted-foreground">by {event.actor}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                      event.role === "lawyer" ? "chip-amber" : "chip-emerald"
                    }`}>
                      {event.role}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{event.detail}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{formatTime(event.at)}</p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {new Date(event.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <ScrollText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No audit events to display</p>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 rounded-xl chip-emerald p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">All events are cryptographically signed</p>
          <p className="text-xs text-muted-foreground mt-1">
            Audit logs are immutable and stored with SHA-256 verification for compliance purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
