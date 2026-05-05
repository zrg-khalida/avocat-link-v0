import { motion } from "framer-motion";
import { useState } from "react";

/**
 * Classified-style hover reveal: covers text with a dark block that slides away on hover.
 */
export function Redacted({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative inline-block align-baseline rounded-[3px] px-1 py-px overflow-hidden cursor-help ${className}`}
    >
      <span className={`relative z-0 transition ${hover ? "text-foreground" : "text-transparent"} select-none`}>
        {children}
      </span>
      <motion.span
        aria-hidden
        initial={false}
        animate={{ x: hover ? "105%" : "0%" }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="absolute inset-0 z-10 bg-foreground/90 dark:bg-foreground/80 rounded-[3px]"
      />
    </span>
  );
}
