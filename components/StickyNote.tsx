import { motion } from "framer-motion";
import { StickyNote as NoteIcon } from "lucide-react";
import { useState } from "react";

export function StickyNote({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={false}
      animate={{ rotate: open ? -1.5 : -2.5 }}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[oklch(0.42_0.06_50)] hover:underline"
      >
        <NoteIcon className="h-3.5 w-3.5" />
        {open ? "Hide private notes" : "Private notes"}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="mt-2 p-3 rounded-md shadow-md"
          style={{
            background: "linear-gradient(180deg, oklch(0.96 0.10 95) 0%, oklch(0.92 0.13 90) 100%)",
            boxShadow: "2px 4px 14px oklch(0.5 0.1 80 / 0.25)",
          }}
        >
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Private — only you can read this…"
            className="w-full h-20 bg-transparent text-[12px] text-[oklch(0.25_0.05_70)] placeholder-[oklch(0.4_0.1_70)] outline-none resize-none font-handwriting"
            style={{ fontFamily: "'Caveat', 'Bradley Hand', cursive" }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
