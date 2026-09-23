import type { Transition } from "motion/react";

const ease: Transition["ease"] = [0.16, 1, 0.3, 1];

export function fadeProps(reduced: boolean | null, delay = 0, y = 22) {
  if (reduced) return {};
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -8% 0px" },
    transition: { duration: 0.72, delay, ease },
  };
}

export function fadeInProps(reduced: boolean | null, delay = 0) {
  if (reduced) return {};
  return {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: "0px 0px -8% 0px" },
    transition: { duration: 0.8, delay, ease },
  };
}
