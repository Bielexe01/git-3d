import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { members } from "../../data/members";

const place = {
  vitin: "lg:col-span-7",
  will: "lg:col-span-4 lg:col-start-9 lg:mt-28",
  hiagolas: "lg:col-span-5 lg:-mt-8",
  biel: "lg:col-span-6 lg:col-start-7",
};

export function BandMembers() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  return (
    <section
      id="quatro"
      className="px-5 py-28 md:px-10 md:py-36"
      style={{
        background: active
          ? "radial-gradient(520px 320px at 70% 40%, rgba(198,163,106,0.14), transparent 70%)"
          : undefined,
      }}
    >
      <div className="mx-auto max-w-[1400px]">
        <h2 className="max-w-[10ch] font-display text-5xl leading-[0.9] tracking-tight md:text-7xl">
          Quem faz o som
        </h2>
        <p className="mt-5 max-w-[42ch] text-bone-dim">
          As fotos dos quatro ainda entram aqui. Por enquanto, o estúdio segura o lugar.
        </p>
        <ul className="mt-16 grid grid-cols-1 gap-y-16 md:grid-cols-12 md:gap-x-6">
          {members.map((member) => (
            <li
              key={member.id}
              className={place[member.id]}
              onMouseEnter={() => setActive(member.id)}
              onMouseLeave={() => setActive((current) => (current === member.id ? null : current))}
            >
              <article data-cursor="VER" className="group relative overflow-hidden">
                <motion.img
                  src={member.image}
                  alt={member.imageAlt}
                  width={832}
                  height={1248}
                  loading="lazy"
                  className={`w-full object-cover ${member.id === "biel" ? "aspect-[4/3]" : "aspect-[2/3]"}`}
                  whileHover={reduced ? undefined : { scale: 1.045 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-4xl tracking-tight md:text-5xl">{member.name}</h3>
                  <p className="mt-1 text-sm text-bone-dim">{member.roles.join(" / ")}</p>
                  <p className="text-sm text-brass">{member.instrument}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
