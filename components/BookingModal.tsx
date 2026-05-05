import { AnimatePresence, motion } from "framer-motion";
import { X, ShieldCheck, Upload, FileCheck2, User, Fingerprint, CalendarPlus, Loader2, Check } from "lucide-react";
import { useState, useRef } from "react";
import type { Lawyer, Consultation } from "@/lib/mock-data";

type Phase = "idle" | "uploading" | "scanning" | "secured";

export function BookingModal({
  lawyer,
  onClose,
  onConfirm,
}: {
  lawyer: Lawyer | null;
  onClose: () => void;
  onConfirm: (c: Omit<Consultation, "id" | "status">) => void;
}) {
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [gcalState, setGcalState] = useState<"idle" | "syncing" | "done">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setUploaded(null); setDragOver(false); setPhase("idle"); setGcalState("idle"); };

  const syncGoogle = () => {
    if (gcalState !== "idle") return;
    setGcalState("syncing");
    setTimeout(() => setGcalState("done"), 1600);
  };

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setUploaded(f.name);
    setPhase("uploading");
    setTimeout(() => setPhase("scanning"), 600);
    setTimeout(() => setPhase("secured"), 2100);
  };

  const confirm = () => {
    if (!lawyer) return;
    onConfirm({
      lawyer,
      date: new Date(Date.now() + 3 * 86400000).toISOString(),
      documentName: uploaded || "consultation_brief.pdf",
    });
    reset();
    onClose();
  };

  return (
    <AnimatePresence onExitComplete={reset}>
      {lawyer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center bg-foreground/30 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="surface-lg relative w-full max-w-2xl rounded-3xl p-8 overflow-hidden bg-card"
          >
            <button onClick={onClose} className="absolute right-5 top-5 text-muted-foreground hover:text-foreground transition">
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-display text-2xl">Match & Connect</h2>
            <p className="text-sm text-muted-foreground mt-1">Secure pairing with end-to-end encryption</p>

            {/* Match animation */}
            <div className="mt-8 flex items-center justify-center gap-6 relative h-32">
              <motion.div
                initial={{ x: -120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.1 }}
                className="grid place-items-center h-20 w-20 rounded-2xl chip-emerald"
              >
                <User className="h-8 w-8" />
              </motion.div>

              <div className="relative">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.95] }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="h-3 w-3 rounded-full bg-primary"
                  style={{ boxShadow: "0 0 30px 10px rgba(11, 27, 58, 0.55)" }}
                />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="absolute h-3 w-3 rounded-full pulse-ring" />
                </span>
              </div>

              <motion.div
                initial={{ x: 120, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.1 }}
                className="grid place-items-center h-20 w-20 rounded-2xl chip-amber font-display text-xl"
              >
                {lawyer.initials}
              </motion.div>
            </div>

            <div className="mt-2 text-center text-xs text-muted-foreground">
              Pairing with <span className="text-foreground">{lawyer.name}</span> — €{lawyer.rate}/h
            </div>

            {/* Dropzone / encrypted morph */}
            <div className="mt-6">
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <AnimatePresence mode="wait">
                {phase === "idle" && (
                  <motion.button
                    key="dz"
                    layout
                    layoutId="dropzone"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                    className={`relative w-full rounded-2xl p-8 text-center transition ${dragOver ? "bg-primary/10" : "bg-secondary/40"}`}
                  >
                    <div className="absolute inset-0 rounded-2xl dashed-glow opacity-90" />
                    <Upload className="mx-auto h-7 w-7 text-primary" />
                    <div className="mt-2 font-medium">Drop your PDF proof here</div>
                    <div className="text-xs text-muted-foreground">or click to browse — encrypted in transit</div>
                  </motion.button>
                )}

                {(phase === "uploading" || phase === "scanning") && (
                  <motion.div
                    key="scan"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full rounded-2xl bg-secondary/40 ring-1 ring-border p-8 text-center overflow-hidden"
                  >
                    <div className="relative mx-auto h-16 w-16">
                      <Fingerprint className="h-16 w-16 text-primary mx-auto" strokeWidth={1.6} />
                      {phase === "scanning" && (
                        <span className="absolute inset-x-0 top-0 h-1 scan-line" />
                      )}
                    </div>
                    <div className="mt-3 font-medium text-sm">
                      {phase === "uploading" ? "Uploading…" : "Biometric scan in progress…"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{uploaded}</div>
                  </motion.div>
                )}

                {phase === "secured" && (
                  <motion.div
                    key="encrypted"
                    layout
                    layoutId="dropzone"
                    initial={{ borderRadius: 24, scale: 0.9 }}
                    animate={{ borderRadius: 999, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className="mx-auto inline-flex items-center gap-2 rounded-full chip-emerald px-5 py-3 text-sm font-semibold glow-primary"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    Document Encrypted & Secured
                    <span className="ml-1 text-muted-foreground text-xs">· {uploaded}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> AES-256 · Zero-knowledge storage
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={syncGoogle}
                  aria-label="Sync with Google Calendar"
                  title="Sync with Google Calendar"
                  className={`group inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    gcalState === "done"
                      ? "chip-emerald"
                      : "surface text-foreground hover:bg-secondary/60"
                  }`}
                  disabled={gcalState !== "idle"}
                >
                  <span className="relative inline-grid h-4 w-4 place-items-center">
                    <AnimatePresence mode="wait" initial={false}>
                      {gcalState === "idle" && (
                        <motion.span key="i" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
                          <CalendarPlus className="h-4 w-4" />
                        </motion.span>
                      )}
                      {gcalState === "syncing" && (
                        <motion.span
                          key="s"
                          initial={{ opacity: 0, rotate: 0 }}
                          animate={{ opacity: 1, rotate: 360 }}
                          exit={{ opacity: 0 }}
                          transition={{ rotate: { repeat: Infinity, duration: 0.9, ease: "linear" }, opacity: { duration: 0.2 } }}
                        >
                          <Loader2 className="h-4 w-4" />
                        </motion.span>
                      )}
                      {gcalState === "done" && (
                        <motion.span
                          key="d"
                          initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 320, damping: 18 }}
                        >
                          <Check className="h-4 w-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  {gcalState === "done" ? "Synced" : gcalState === "syncing" ? "Syncing…" : "Google Calendar"}
                </button>
                <button
                  onClick={confirm}
                  data-magnetic
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground glow-primary"
                >
                  Confirm booking
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
