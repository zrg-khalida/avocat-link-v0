import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Smooth slow opacity fade page transition wrapper.
 * Crossfades between major route trees (Landing, Auth, Client, Lawyer).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const loc = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={loc.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="contents"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
