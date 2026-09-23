import { useReducedMotion } from "motion/react";
import { socialLinks } from "../../data/social";

const links = [
  ["Spotify", socialLinks.spotify],
  ["YouTube", socialLinks.youtube],
  ["Instagram", socialLinks.instagram],
] as const;

export function Footer() {
  const reduced = useReducedMotion();

  return (
    <footer className="border-t border-bone/10 px-5 pt-16 pb-32 md:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <img src="/brand/logo.png" alt="B'ritt" className="h-16 w-auto self-start" />
        <p className="font-display text-lg">Vitin · Will · Hiagolas · Biel</p>
        <ul className="flex flex-wrap gap-5 text-sm">
          {links.map(([label, href]) => (
            <li key={label}>
              {href ? (
                <a href={href} target="_blank" rel="noreferrer noopener" data-cursor="ABRIR">
                  {label}
                </a>
              ) : (
                <span className="text-bone-dim">{label}</span>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="self-start text-sm tracking-[0.14em] text-brass"
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
        >
          Recomeçar experiência
        </button>
      </div>
    </footer>
  );
}
