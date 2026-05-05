import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useRef } from "react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const onClick = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    else toggle();
  };
  return (
    <button
      ref={ref}
      onClick={onClick}
      data-magnetic
      aria-label="Toggle theme"
      className="relative grid h-10 w-10 place-items-center rounded-xl surface hover:bg-secondary transition overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="absolute"
          >
            <Moon className="h-4.5 w-4.5 text-accent" strokeWidth={2.2} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="absolute"
          >
            <Sun className="h-4.5 w-4.5 text-accent" strokeWidth={2.2} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
