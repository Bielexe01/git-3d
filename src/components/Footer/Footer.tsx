import { useReducedMotion } from "motion/react";
import { safeHref, safeMedia } from "../../content/links";
import { useSite } from "../../content/SiteProvider";

export function Footer() {
  const { content } = useSite();
  const reduced = useReducedMotion();
  const links = [
    ["Spotify", safeHref(content.social.spotify)],
    ["YouTube", safeHref(content.social.youtube)],
    ["Instagram", safeHref(content.social.instagram)],
  ] as const;
  const names = content.members
    .map((member) => member.name.trim())
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="border-t border-bone/10 px-5 pt-16 pb-32 md:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <img src={safeMedia(content.brand.logo)} alt={content.brand.logoAlt || "B'ritt"} className="h-16 w-auto self-start" />
        {names ? <p className="font-display text-lg">{names}</p> : null}
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
        <a href="#painel" className="self-start text-sm tracking-[0.14em] text-bone-dim">
          Editar o site
        </a>
      </div>
    </footer>
  );
}
