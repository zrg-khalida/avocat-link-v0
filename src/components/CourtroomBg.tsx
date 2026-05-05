import { motion } from "framer-motion";
import courtroom from "@/assets/courtroom-cinematic.jpg";

/**
 * Cinematic courtroom backdrop. Cool slate-blue tone (no sepia).
 *  - Slow Ken Burns motion
 *  - ~25% pearl wash for legibility
 *  - Subtle slate vignette to focus on the UI
 */
export function CourtroomBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <motion.img
        src={courtroom}
        alt=""
        width={1920}
        height={1080}
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1, x: "0%", y: "0%" }}
        animate={{
          scale: [1, 1.05, 1.03, 1],
          x: ["0%", "-1.2%", "1%", "0%"],
          y: ["0%", "1%", "-0.8%", "0%"],
        }}
        transition={{ duration: 40, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Pearl wash — keeps text legible without obscuring the artwork */}
      <div className="absolute inset-0 bg-[oklch(0.985_0.004_250)]/25 dark:bg-[oklch(0.10_0.03_260)]/55" />

      {/* Slate vignette — clear center, deeper edges */}
      <div
        className="absolute inset-0
          [background:radial-gradient(ellipse_65%_60%_at_50%_38%,transparent_0%,transparent_50%,oklch(0.40_0.04_258/0.20)_78%,oklch(0.20_0.05_260/0.45)_100%)]
          md:[background:radial-gradient(ellipse_58%_62%_at_46%_42%,transparent_0%,transparent_50%,oklch(0.40_0.04_258/0.20)_78%,oklch(0.20_0.05_260/0.45)_100%)]
          dark:[background:radial-gradient(ellipse_65%_60%_at_50%_34%,transparent_0%,transparent_46%,oklch(0_0_0/0.55)_80%,oklch(0_0_0/0.85)_100%)]"
      />

      {/* Cool blue halo over hero region */}
      <div className="absolute left-1/2 top-[32%] md:left-[44%] md:top-[40%] h-[55vmax] w-[55vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.65_0.08_258)]/12 blur-3xl dark:bg-[oklch(0.50_0.12_258)]/16" />
    </div>
  );
}
