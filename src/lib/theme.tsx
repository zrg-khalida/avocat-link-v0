import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Theme = "light" | "dark";
interface ThemeCtx {
  theme: Theme;
  toggle: (origin?: { x: number; y: number }) => void;
}
const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("avl-theme") as Theme | null;
    return stored ?? "light";
  });
  const [ripple, setRipple] = useState<{ x: number; y: number; to: Theme; key: number } | null>(null);
  const keyRef = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("avl-theme", theme);
  }, [theme]);

  const toggle = useCallback((origin?: { x: number; y: number }) => {
    const next: Theme = theme === "light" ? "dark" : "light";
    const x = origin?.x ?? window.innerWidth - 80;
    const y = origin?.y ?? 60;
    keyRef.current += 1;
    setRipple({ x, y, to: next, key: keyRef.current });
  }, [theme]);

  // When ripple covers screen, swap theme
  useEffect(() => {
    if (!ripple) return;
    const swap = setTimeout(() => setTheme(ripple.to), 280);
    const clear = setTimeout(() => setRipple(null), 900);
    return () => { clearTimeout(swap); clearTimeout(clear); };
  }, [ripple]);

  // Compute max radius from origin
  const maxR = ripple
    ? Math.hypot(Math.max(ripple.x, window.innerWidth - ripple.x), Math.max(ripple.y, window.innerHeight - ripple.y))
    : 0;

  return (
    <Ctx.Provider value={{ theme, toggle }}>
      {children}
      <AnimatePresence>
        {ripple && (
          <motion.div
            key={ripple.key}
            aria-hidden
            initial={{ clipPath: `circle(0px at ${ripple.x}px ${ripple.y}px)` }}
            animate={{ clipPath: `circle(${maxR + 40}px at ${ripple.x}px ${ripple.y}px)` }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.83, 0, 0.17, 1] }}
            className="fixed inset-0 z-[9998] pointer-events-none"
            style={{
              background: ripple.to === "dark"
                ? "radial-gradient(circle at center, #302015 0%, #1A100A 100%)"
                : "radial-gradient(circle at center, #FDFDFD 0%, #F6E6D1 100%)",
            }}
          />
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme outside provider");
  return c;
}
