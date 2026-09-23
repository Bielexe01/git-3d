import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { socialList } from "../../data/social";

export function SocialLinks() {
  const [note, setNote] = useState<string | null>(null);

  return (
    <section id="seguir" className="px-5 py-24 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="font-display text-5xl tracking-tight md:text-7xl">Continue a experiência</h2>
        <ul className="mt-12 border-b border-bone/15">
          {socialList.map((item) => (
            <li key={item.id} className="group border-t border-bone/15">
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
            </li>
          ))}
        </ul>
        {note ? <p className="mt-4 text-sm text-bone-dim">O link de {note} ainda não foi definido.</p> : null}
      </div>
    </section>
  );
}
