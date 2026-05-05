import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef, type ReactNode, createContext, useContext } from "react";

type TiltCtx = {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  hovering: MotionValue<number>;
};
const Ctx = createContext<TiltCtx | null>(null);

/**
 * Pseudo-3D parallax tilt wrapper.
 * - Tracks cursor relative to card center
 * - Applies rotateX/rotateY (max ~15°) with weighty spring physics
 * - Provides a moving radial glare overlay
 * - Children can use <TiltLayer z={30}> to float at a given Z depth
 */
export function Tilt3D({
  children,
  className = "",
  max = 15,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const hovering = useMotionValue(0);

  const spring = { stiffness: 180, damping: 18, mass: 0.6 };
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), spring);
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), spring);

  const glareX = useTransform(mx, (v) => `${v * 100}%`);
  const glareY = useTransform(my, (v) => `${v * 100}%`);
  const glareOpacity = useSpring(hovering, { stiffness: 120, damping: 20 });

  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const handleEnter = () => hovering.set(1);
  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
    hovering.set(0);
  };

  return (
    <Ctx.Provider value={{ mx, my, hovering }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{
          rotateX: rx,
          rotateY: ry,
          transformPerspective: 1200,
          transformStyle: "preserve-3d",
        }}
        className={className}
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
            style={{
              opacity: glareOpacity,
              background: useTransform(
                [glareX, glareY] as never,
                ([gx, gy]: string[]) =>
                  `radial-gradient(420px circle at ${gx} ${gy}, rgba(255,255,255,0.55), rgba(255,255,255,0.12) 28%, transparent 55%)`,
              ),
              transform: "translateZ(80px)",
            }}
          />
        )}
      </motion.div>
    </Ctx.Provider>
  );
}

/** Float a child at a given Z depth (px). Wrap text/buttons inside <Tilt3D>. */
export function TiltLayer({
  z = 0,
  children,
  className = "",
}: {
  z?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div style={{ transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }} className={className}>
      {children}
    </div>
  );
}

export function useTiltCtx() {
  return useContext(Ctx);
}
