import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { safeHref } from "../../content/links";
import { useSite } from "../../content/SiteProvider";
import { Reveal } from "../ui/Scroll";
import { fadeProps } from "../ui/scrollMotion";

export function SocialLinks() {
  const { content } = useSite();
  const reduced = useReducedMotion();
  const [note, setNote] = useState<string | null>(null);
  const items = [
    { id: "spotify", label: "Spotify", href: safeHref(content.social.spotify) },
    { id: "youtube", label: "YouTube", href: safeHref(content.social.youtube) },
    { id: "instagram", label: "Instagram", href: safeHref(content.social.instagram) },
    { id: "tiktok", label: "TikTok", href: safeHref(content.social.tiktok) },
  ];

  return (
    <section id="seguir" className="px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <h2 className="font-display text-5xl tracking-tight md:text-7xl">{content.copy.socialTitle || "Continue a experiência"}</h2>
        </Reveal>
        <ul className="mt-12 border-b border-bone/15">
          {items.map((item, index) => (
            <motion.li key={item.id} className="group border-t border-bone/15" {...fadeProps(reduced, index * 0.07, 18)}>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="ABRIR"
                  className="flex items-center justify-between py-7"
                >
                  <span className="font-display text-4xl transition-transform duration-300 group-hover:translate-x-2 md:text-6xl">
                    {item.label}
                  </span>
                  <span className="flex items-center gap-3 text-sm text-brass">
                    Abrir
                    <ArrowUpRight size={18} strokeWidth={1.5} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                  <span className="sr-only"> em nova aba</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-7 text-left"
                  onClick={() => setNote(item.label)}
                >
                  <span className="font-display text-4xl transition-transform duration-300 group-hover:translate-x-2 md:text-6xl">{item.label}</span>
                  <span className="text-sm text-bone-dim">Em breve</span>
                </button>
              )}
              <span className="draw-line block h-px w-full bg-brass" />
            </motion.li>
          ))}
        </ul>
        {note ? <p className="mt-4 text-sm text-bone-dim">O link de {note} ainda não foi definido.</p> : null}
      </div>
    </section>
  );
}
