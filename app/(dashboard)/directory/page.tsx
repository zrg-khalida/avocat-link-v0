"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { LAWYERS, type Lawyer, type Specialty } from "@/lib/mock-data";
import { LawyerCard } from "@/components/LawyerCard";
import { BookingModal } from "@/components/BookingModal";
import { useApp } from "@/lib/store";
import { useAudit } from "@/lib/audit";

const SPECIALTIES: (Specialty | "All")[] = ["All", "Business", "Penal", "Family"];

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState<Specialty | "All">("All");
  const [selected, setSelected] = useState<Lawyer | null>(null);
  const addConsultation = useApp((s) => s.addConsultation);
  const user = useApp((s) => s.user);

  const filtered = LAWYERS.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty = specialty === "All" || l.specialty === specialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBook = (lawyer: Lawyer) => {
    setSelected(lawyer);
  };

  const handleConfirm = (c: Parameters<typeof addConsultation>[0]) => {
    addConsultation(c);
    useAudit.getState().log({
      type: "booking",
      actor: user?.name || "Guest",
      role: user?.role || "client",
      detail: `Booked consultation with ${c.lawyer.name}`,
    });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl">Lawyer Directory</h1>
        <p className="mt-2 text-muted-foreground">
          Find and connect with vetted attorneys across all specialties
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl surface pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            {SPECIALTIES.map((s) => (
              <button
                key={s}
                onClick={() => setSpecialty(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  specialty === s
                    ? "bg-primary text-primary-foreground"
                    : "surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((lawyer, i) => (
          <motion.div
            key={lawyer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <LawyerCard lawyer={lawyer} onBook={handleBook} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No lawyers match your criteria</p>
        </div>
      )}

      <BookingModal
        lawyer={selected}
        onClose={() => setSelected(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
