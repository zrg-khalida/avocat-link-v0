import { motion } from "framer-motion";

const STEPS = ["Pending", "Analyzing", "Confirmed"] as const;
type Step = (typeof STEPS)[number];

/**
 * Semantic stepper — every state maps to a status token (pending/warning/success).
 * No inline color literals; palette changes propagate via CSS variables only.
 */
export function StatusStepper({ status }: { status: Step }) {
  const current = STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const isConfirmed = active && s === "Confirmed";
        const isPending = !active && !done;

        const dotClass = isPending
          ? "dot-pending"
          : isConfirmed
          ? "dot-success"
          : active
          ? "dot-warning"
          : "dot-success";

        const labelClass = isPending
          ? "text-muted-foreground"
          : "text-foreground/80";

        return (
          <div key={s} className="flex items-center gap-2">
            <div className="relative">
              <motion.div
                initial={false}
                animate={{ scale: active ? 1.2 : 1 }}
                className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
              />
              {active && <span className="absolute inset-0 pulse-ring rounded-full" />}
            </div>
            <span className={`text-xs font-semibold ${labelClass}`}>{s}</span>
            {i < STEPS.length - 1 && (
              <div className="relative h-px w-8 bg-border overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: i < current ? "100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-primary"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
