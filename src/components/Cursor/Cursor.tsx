import { motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "../../hooks/useMedia";

export function Cursor() {
  const fine = useFinePointer();
  const x = useMotionValue(-80);
  const y = useMotionValue(-80);
  const [label, setLabel] = useState("");
  const labelRef = useRef("");

  useEffect(() => {
    if (!fine) return;
    document.documentElement.classList.add("cursor-on");
    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target instanceof Element ? event.target : null;
      const next = target?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? "";
      if (next !== labelRef.current) {
        labelRef.current = next;
        setLabel(next);
      }
    };
    window.addEventListener("pointermove", move);
    return () => {
      document.documentElement.classList.remove("cursor-on");
      window.removeEventListener("pointermove", move);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[100] flex items-center gap-2"
      style={{ x, y, translateX: "-10%", translateY: "-10%" }}
    >
      <span className="block h-3.5 w-3.5 rounded-full border border-brass" />
      {label ? (
        <span className="text-[10px] tracking-[0.2em] text-bone">{label}</span>
      ) : null}
    </motion.div>
  );
}
