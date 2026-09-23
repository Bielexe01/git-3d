import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { safeMedia } from "../../content/links";
import { useSite } from "../../content/SiteProvider";
import { ParallaxImage, Reveal } from "../ui/Scroll";
import { fadeProps } from "../ui/scrollMotion";

export function Gallery() {
  const { content } = useSite();
  const gallery = content.gallery.filter((item) => safeMedia(item.src));
  const [index, setIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const opener = useRef<HTMLElement | null>(null);
  const hero = gallery[0];
  const rest = gallery.slice(1);
  const open = index !== null;

  useEffect(() => {
    if (index === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIndex(null);
        opener.current?.focus();
      }
      if (event.key === "ArrowRight") {
        setIndex((current) => (current === null ? current : (current + 1) % gallery.length));
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) => (current === null ? current : (current - 1 + gallery.length) % gallery.length));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, gallery.length]);

  function step(direction: number) {
    setIndex((current) => {
      if (current === null) return current;
      return (current + direction + gallery.length) % gallery.length;
    });
  }

  function close() {
    setIndex(null);
    opener.current?.focus();
  }

  function openAt(next: number, target: HTMLElement) {
    opener.current = target;
    setIndex(next);
  }

  if (!hero) {
    return (
      <section id="momentos" className="px-5 py-28 md:px-10">
        <div className="mx-auto max-w-[1500px]">
          <Reveal>
            <h2 className="font-display text-5xl tracking-tight md:text-7xl">{content.copy.galleryTitle || "Momentos"}</h2>
            {content.copy.galleryIntro ? <p className="mt-4 max-w-[46ch] text-bone-dim">{content.copy.galleryIntro}</p> : null}
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="momentos" className="px-5 py-28 md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <Reveal>
          <h2 className="font-display text-5xl tracking-tight md:text-7xl">{content.copy.galleryTitle || "Momentos"}</h2>
          {content.copy.galleryIntro ? <p className="mt-4 max-w-[46ch] text-bone-dim">{content.copy.galleryIntro}</p> : null}
        </Reveal>
        <div className="mt-12">
          <button
            type="button"
            data-cursor="VER"
            className="block w-full text-left"
            onClick={(event) => openAt(0, event.currentTarget)}
          >
            <ParallaxImage src={safeMedia(hero.src)} alt={hero.alt} drift={6} frameClassName="aspect-[16/9] w-full" />
          </button>
        </div>
        <ul className="mt-4 columns-1 gap-4 md:columns-2 lg:columns-3">
          {rest.map((item, itemIndex) => (
            <motion.li key={item.id} className="mb-4 break-inside-avoid" {...fadeProps(reduced, Math.min(itemIndex, 8) * 0.05, 16)}>
              <button
                type="button"
                data-cursor="VER"
                className="block w-full overflow-hidden"
                style={reduced ? undefined : { transform: `rotate(${item.tilt}deg)` }}
                onClick={(event) => openAt(itemIndex + 1, event.currentTarget)}
              >
                <img
                  src={safeMedia(item.src)}
                  alt={item.alt}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                  style={{ aspectRatio: item.ratio }}
                />
              </button>
            </motion.li>
          ))}
        </ul>
      </div>
      {open && index !== null ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/95 p-4" role="dialog" aria-modal="true" aria-label="Foto ampliada">
          <button type="button" className="absolute top-4 right-4 inline-flex h-11 items-center gap-2 px-3" onClick={close}>
            <X size={18} strokeWidth={1.5} />
            Fechar
          </button>
          <img src={safeMedia(gallery[index].src)} alt={gallery[index].alt} className="max-h-[78dvh] max-w-full object-contain" />
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-4">
            <button type="button" className="inline-flex h-11 items-center gap-2" onClick={() => step(-1)}>
              <ChevronLeft size={18} strokeWidth={1.5} />
              Anterior
            </button>
            <p>
              {index + 1} / {gallery.length}
            </p>
            <button type="button" className="inline-flex h-11 items-center gap-2" onClick={() => step(1)}>
              Próximo
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
