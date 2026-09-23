import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useSite } from "../../content/SiteProvider";
import { fadeInProps } from "../ui/scrollMotion";

export function About() {
  const { content } = useSite();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const nameY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -56]);
  const copyY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [16, -20]);
  const fields = [
    ["Descrição", content.band.description],
    ["Cidade", content.band.location],
    ["Estilo", content.band.style],
  ];

  return (
    <section ref={ref} id="banda" className="px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1400px] items-end gap-12 lg:grid-cols-12">
        <motion.h2
          className="font-display text-7xl leading-[0.85] tracking-tight md:text-8xl lg:col-span-6"
          style={{ y: nameY }}
          {...fadeInProps(reduced)}
        >
          {content.band.name || "B'ritt"}
        </motion.h2>
        <motion.div className="border-t border-bone/20 pt-6 lg:col-span-5 lg:col-start-8" style={{ y: copyY }} {...fadeInProps(reduced, 0.12)}>
          {fields.map(([label, value]) =>
            value ? (
              <p key={label} className="mt-8 first:mt-0">
                <span className="block text-xs tracking-[0.16em] text-brass">{label.toUpperCase()}</span>
                <span className="mt-2 block max-w-[42ch] text-lg text-bone-dim">{value}</span>
              </p>
            ) : null,
          )}
        </motion.div>
      </div>
    </section>
  );
}
