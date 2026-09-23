import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { armExperience } from "../../audio/AudioManager";

const bars = Array.from({ length: 42 }, (_, index) => {
  const distance = Math.abs(index - 21) / 21;
  return 18 + (1 - distance) * 46;
});

export function Loader({ onEnter }: { onEnter: () => void }) {
  const reduced = useReducedMotion();
  const [pending, setPending] = useState(false);

  async function enter() {
    if (pending) return;
    setPending(true);
    try {
      await armExperience();
    } catch {
      /* a experiência segue mesmo se o áudio falhar */
    }
    onEnter();
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink px-6">
      <div className="flex w-full max-w-md flex-col items-center">
        <motion.img
          src="/brand/logo.png"
          alt="B'ritt"
          className="w-[min(280px,70vw)]"
          initial={reduced ? false : { opacity: 0, filter: "blur(12px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="mt-10 flex h-16 items-center gap-[3px]"
          aria-hidden="true"
          initial={reduced ? false : { opacity: 0.04 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
        >
          {bars.map((height, index) => (
            <span
              key={index}
              className="wave-bar"
              style={{
                height,
                animationDelay: reduced ? undefined : `${(index % 14) * 0.07}s`,
              }}
            />
          ))}
        </motion.div>
        <motion.button
          type="button"
          onClick={() => void enter()}
          disabled={pending}
          className="mt-12 rounded-[2px] bg-brass px-10 py-3 text-sm font-medium tracking-[0.22em] text-ink disabled:opacity-70"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 1.5, duration: 0.6 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
        >
          {pending ? "ABRINDO" : "ENTRAR"}
        </motion.button>
      </div>
    </div>
  );
}
