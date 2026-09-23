import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { fadeProps } from "./scrollMotion";

export function Reveal({ children, className, delay = 0, y = 22 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} {...fadeProps(reduced, delay, y)}>
      {children}
    </motion.div>
  );
}

export function ParallaxImage({
  src,
  alt,
  frameClassName,
  loading,
  zoom = false,
  drift = 5,
}: {
  src: string;
  alt: string;
  frameClassName: string;
  loading?: "lazy" | "eager";
  zoom?: boolean;
  drift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const distance = `${Math.min(Math.abs(drift), 8)}%`;
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : drift < 0 ? [`-${distance}`, distance] : [distance, `-${distance}`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${frameClassName}`}>
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        style={{ y }}
        whileHover={zoom && !reduced ? { scale: 1.06 } : undefined}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 -top-[12%] h-[124%] w-full max-w-none object-cover"
      />
    </div>
  );
}
