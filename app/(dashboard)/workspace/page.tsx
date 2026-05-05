"use client";

import { motion } from "framer-motion";
import { Briefcase, Clock, FileText, Euro, Check, X, Eye } from "lucide-react";
import { useApp } from "@/lib/store";
import { useAudit } from "@/lib/audit";

export default function WorkspacePage() {
  const user = useApp((s) => s.user);
  const requests = useApp((s) => s.requests);
  const decideRequest = useApp((s) => s.decideRequest);

  const pending = requests.filter((r) => r.status === "pending");
  const decided = requests.filter((r) => r.status !== "pending");

  const handleDecision = (id: string, decision: "accepted" | "declined") => {
    decideRequest(id, decision);
    const request = requests.find((r) => r.id === id);
    useAudit.getState().log({
      type: decision === "accepted" ? "booking" : "access_denied",
      actor: user?.name || "Lawyer",
      role: user?.role || "lawyer",
      detail: `${decision === "accepted" ? "Accepted" : "Declined"} request from ${request?.clientName}`,
    });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const stats = [
    { label: "Pending Requests", value: pending.length, icon: Clock },
    { label: "Cases This Month", value: decided.filter((r) => r.status === "accepted").length + 4, icon: Briefcase },
    { label: "Total Revenue", value: "€12,480", icon: Euro },
    { label: "Documents Reviewed", value: 23, icon: FileText },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">
          Lawyer Workspace
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage client requests and your caseload
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="surface rounded-2xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-display text-3xl">{stat.value}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl chip-amber">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pending Requests */}
      <div className="surface-lg rounded-2xl p-6 mb-6">
        <h2 className="font-display text-xl mb-6">Pending Requests</h2>
        
        {pending.length === 0 ? (
          <div className="text-center py-12">
            <Check className="mx-auto h-12 w-12 text-emerald-500/50" />
            <p className="mt-4 text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((request, i) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-accent/50 font-display">
                    {request.clientInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{request.clientName}</p>
                    <p className="text-sm text-muted-foreground truncate">{request.subject}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                    request.specialty === "Business" ? "chip-emerald" :
                    request.specialty === "Penal" ? "chip-rose" : "chip-amber"
                  }`}>
                    {request.specialty}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg text-gradient">&euro;{request.estimatedFee}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(request.submittedAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg surface px-3 py-2 text-xs font-medium hover:bg-secondary transition"
                    title="View document"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDecision(request.id, "declined")}
                    className="rounded-lg surface px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDecision(request.id, "accepted")}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110 transition"
                  >
                    Accept
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Decisions */}
      {decided.length > 0 && (
        <div className="surface-lg rounded-2xl p-6">
          <h2 className="font-display text-xl mb-6">Recent Decisions</h2>
          <div className="space-y-3">
            {decided.slice(0, 5).map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/20"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-sm font-medium">
                    {request.clientInitials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{request.clientName}</p>
                    <p className="text-xs text-muted-foreground">{request.subject}</p>
                  </div>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                  request.status === "accepted" ? "chip-emerald" : "chip-rose"
                }`}>
                  {request.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
