import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { socialLinks } from "../../data/social";
import { videos, type VideoItem } from "../../data/videos";

export function Videos() {
  const [active, setActive] = useState<VideoItem | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [note, setNote] = useState(false);
  const feature = videos[0];
  const rest = videos.slice(1);

  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
        setNote(false);
        opener.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  function close() {
    setActive(null);
    setNote(false);
    opener.current?.focus();
  }

  function open(video: VideoItem, target: HTMLElement) {
    opener.current = target;
    setNote(false);
    setActive(video);
  }

  if (!feature) return null;

  return (
    <section id="videos" className="px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="font-display text-5xl tracking-tight md:text-7xl">Veja a B'ritt</h2>
        <p className="mt-4 max-w-[46ch] text-bone-dim">Os vídeos entram quando os links do YouTube forem definidos.</p>
        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <button
            type="button"
            data-cursor="ASSISTIR"
            className="text-left lg:col-span-8"
            onClick={(event) => open(feature, event.currentTarget)}
          >
            <img src={feature.thumbnail} alt={feature.thumbnailAlt} className="aspect-[16/9] w-full object-cover" />
            <span className="mt-3 block text-sm text-brass">{feature.context}</span>
            <span className="mt-1 block font-display text-3xl">{feature.title}</span>
          </button>
          <div className="grid gap-6 lg:col-span-4">
            {rest.map((video) => (
              <button
                key={video.id}
                type="button"
                data-cursor="ASSISTIR"
                className="text-left"
                onClick={(event) => open(video, event.currentTarget)}
              >
                <img src={video.thumbnail} alt={video.thumbnailAlt} className="aspect-[16/9] w-full object-cover" loading="lazy" />
                <span className="mt-2 block text-sm text-brass">{video.context}</span>
                <span className="mt-1 block text-lg">{video.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {active ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/95 p-4" role="dialog" aria-modal="true" aria-label={active.title}>
          <button type="button" className="absolute top-4 right-4 inline-flex h-11 items-center gap-2" onClick={close}>
            <X size={18} strokeWidth={1.5} />
            Fechar
          </button>
          <div className="w-full max-w-4xl">
            {active.youtubeId ? (
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=1`}
                title={active.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div>
                <img src={active.thumbnail} alt="" className="aspect-video w-full object-cover" />
                <p className="mt-4 text-bone-dim">O link deste vídeo ainda não foi definido.</p>
              </div>
            )}
            <div className="mt-4">
              {socialLinks.youtube ? (
                <a href={socialLinks.youtube} target="_blank" rel="noreferrer noopener" data-cursor="ABRIR" className="text-brass">
                  Ver no YouTube
                </a>
              ) : (
                <button type="button" className="text-brass" onClick={() => setNote(true)}>
                  Ver no YouTube
                </button>
              )}
              {note ? <p className="mt-2 text-sm text-bone-dim">O link do YouTube ainda não foi definido.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
