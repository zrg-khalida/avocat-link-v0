"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, FileText, TrendingUp, ArrowRight, Download } from "lucide-react";
import { useApp } from "@/lib/store";
import { StatusStepper } from "@/components/StatusStepper";
import { InvoiceModal } from "@/components/InvoiceModal";
import { useState } from "react";
import type { Consultation } from "@/lib/mock-data";
import { generateICS } from "@/lib/ics";

export default function DashboardPage() {
  const user = useApp((s) => s.user);
  const consultations = useApp((s) => s.consultations);
  const advance = useApp((s) => s.advance);
  const [invoiceConsultation, setInvoiceConsultation] = useState<Consultation | null>(null);

  const stats = [
    { label: "Active Cases", value: consultations.filter((c) => c.status !== "Confirmed").length, icon: FileText, trend: "+2 this week" },
    { label: "Confirmed", value: consultations.filter((c) => c.status === "Confirmed").length, icon: Calendar, trend: "3 upcoming" },
    { label: "Total Hours", value: "24.5", icon: Clock, trend: "+8.2 hrs" },
    { label: "Savings", value: "€2,340", icon: TrendingUp, trend: "vs. market avg" },
  ];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const downloadCalendar = (c: Consultation) => {
    const ics = generateICS({
      title: `Consultation with ${c.lawyer.name}`,
      start: new Date(c.date),
      duration: 60,
      description: `Legal consultation regarding ${c.documentName}`,
    });
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consultation-${c.lawyer.name.replace(/\s+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">
          Welcome back, {user?.name?.split(" ")[0] || "Client"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s an overview of your legal consultations
        </p>
      </div>

      {/* Stats Grid */}
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
              <div className="grid h-10 w-10 place-items-center rounded-xl chip-emerald">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Consultations List */}
      <div className="surface-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl">Your Consultations</h2>
          <button className="text-xs text-primary hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-4">
          {consultations.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-accent/50 font-display text-lg">
                  {c.lawyer.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.lawyer.name}</p>
                  <p className="text-xs text-muted-foreground">{c.lawyer.specialty} &middot; {c.documentName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <p className="font-medium">{formatDate(c.date)}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(c.date)}</p>
                </div>
                <StatusStepper status={c.status} />
              </div>

              <div className="flex items-center gap-2">
                {c.status === "Confirmed" && (
                  <>
                    <button
                      onClick={() => downloadCalendar(c)}
                      className="rounded-lg surface px-3 py-1.5 text-xs font-medium hover:bg-secondary transition"
                      title="Download calendar event"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setInvoiceConsultation(c)}
                      className="rounded-lg surface px-3 py-1.5 text-xs font-medium hover:bg-secondary transition"
                    >
                      Invoice
                    </button>
                  </>
                )}
                {c.status !== "Confirmed" && (
                  <button
                    onClick={() => advance(c.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:brightness-110 transition"
                  >
                    Advance
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {consultations.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No consultations yet</p>
          </div>
        )}
      </div>

      <InvoiceModal
        consultation={invoiceConsultation}
        onClose={() => setInvoiceConsultation(null)}
      />
    </div>
  );
}
