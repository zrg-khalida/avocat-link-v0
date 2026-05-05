import { motion, useScroll, useTransform } from "framer-motion";

export function ScrollGlow() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["10%", "85%"]);
  const x = useTransform(scrollYProgress, [0, 0.5, 1], ["20%", "70%", "30%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["80%", "10%"]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        style={{ top: y, left: x }}
        className="absolute h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(166,123,91,0.22),transparent_60%)]" />
      </motion.div>
      <motion.div
        style={{ top: y2 }}
        className="absolute right-[-10%] h-[440px] w-[440px] rounded-full blur-[160px]"
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.16),transparent_60%)]" />
      </motion.div>
    </div>
  );
}
