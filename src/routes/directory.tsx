import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Lawyer, Specialty } from "@/lib/mock-data";
import { LawyerCard } from "@/components/LawyerCard";
import { BookingModal } from "@/components/BookingModal";
import { useApp } from "@/lib/store";
import { useAudit } from "@/lib/audit";
import { RoleGuard } from "@/components/RoleGuard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchLawyers, createConsultation, initialsOf, type LawyerRow } from "@/lib/supabase-data";

export const Route = createFileRoute("/directory")({
  component: DirectoryPage,
});

const SPECIALTIES: ("All" | Specialty)[] = ["All", "Business", "Penal", "Family"];

function DirectoryPage() {
  return (
    <RoleGuard action="view:directory" requiredRole="client">
      <DirectoryInner />
    </RoleGuard>
  );
}

function rowToLawyer(r: LawyerRow): Lawyer {
  return {
    id: r.id,
    name: r.name || r.email,
    specialty: (r.specialty as Specialty) ?? "Business",
    rate: r.rate ?? 0,
    rating: r.rating ?? 0,
    cases: r.cases ?? 0,
    city: r.city ?? "—",
    initials: initialsOf(r.name || r.email),
    bio: r.bio ?? "Profile under review.",
  };
}

function DirectoryInner() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState<"All" | Specialty>("All");
  const [maxRate, setMaxRate] = useState(450);
  const [selected, setSelected] = useState<Lawyer | null>(null);
  const [rows, setRows] = useState<LawyerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetchLawyers({ specialty: spec, maxRate, q })
      .then((data) => { if (!cancelled) setRows(data); })
      .catch((e) => { if (!cancelled) { setError(e.message ?? "Failed to load"); setRows([]); } });
    return () => { cancelled = true; };
  }, [spec, maxRate, q]);

  const lawyers = useMemo(() => (rows ?? []).map(rowToLawyer), [rows]);

  return (
    <div className="mx-auto max-w-7xl px-6 pt-8 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-4xl md:text-5xl">The Directory</h1>
        <p className="mt-2 text-muted-foreground">Discover bar-verified attorneys, ready to take your case.</p>
      </motion.div>

      {/* Filters */}
      <div className="surface-lg sticky top-24 z-30 rounded-2xl p-4 md:p-5 mb-8">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div className="flex items-center gap-2 surface rounded-xl px-3.5 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or city…"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-secondary p-1">
            {SPECIALTIES.map((s) => (
              <button
                key={s}
                onClick={() => setSpec(s)}
                className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${spec === s ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {spec === s && (
                  <motion.div
                    layoutId="spec-pill"
                    className="absolute inset-0 rounded-lg bg-primary glow-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{s}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 min-w-[220px]">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Max rate</span>
                <span className="text-gradient font-semibold">€{maxRate}/h</span>
              </div>
              <input
                type="range"
                min={150}
                max={500}
                step={10}
                value={maxRate}
                onChange={(e) => setMaxRate(+e.target.value)}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {rows === null && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Grid */}
      {rows !== null && (
        <motion.div
          layout
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
          }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {lawyers.map((l) => (
              <motion.div
                key={l.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 32, scale: 0.94 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", stiffness: 180, damping: 22, mass: 0.9 }}
              >
                <LawyerCard lawyer={l} onBook={setSelected} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {rows !== null && lawyers.length === 0 && (
        <div className="text-center text-muted-foreground py-16">
          {error ? `Failed to load lawyers: ${error}` : "No lawyers match your filters yet."}
        </div>
      )}

      <BookingModal
        lawyer={selected}
        onClose={() => setSelected(null)}
        onConfirm={async (c) => {
          try {
            await createConsultation({
              lawyer_id: c.lawyer.id,
              scheduled_at: c.date,
              document_name: c.documentName,
            });
            const u = useApp.getState().user;
            useAudit.getState().log({
              type: "booking",
              actor: u?.name ?? "Anonymous",
              role: u?.role ?? "anonymous",
              detail: `Booked ${c.lawyer.name} · ${c.documentName}`,
            });
            useAudit.getState().log({
              type: "upload",
              actor: u?.name ?? "Anonymous",
              role: u?.role ?? "anonymous",
              detail: `Encrypted brief uploaded: ${c.documentName}`,
            });
          } catch (err) {
            console.error("[directory] createConsultation failed", err);
          }
        }}
      />
    </div>
  );
}
