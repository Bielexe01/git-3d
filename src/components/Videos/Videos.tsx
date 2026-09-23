import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { safeHref, safeMedia } from "../../content/links";
import { useSite } from "../../content/SiteProvider";
import type { VideoItem } from "../../content/types";
import { youtubeId } from "../../content/youtube";
import { ParallaxImage, Reveal } from "../ui/Scroll";
import { fadeProps } from "../ui/scrollMotion";

export function Videos() {
  const { content } = useSite();
  const videos = content.videos;
  const [active, setActive] = useState<VideoItem | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [note, setNote] = useState(false);
  const feature = videos[0];
  const rest = videos.slice(1);
  const channel = safeHref(content.social.youtube);
  const reduced = useReducedMotion();

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

  const activeId = active ? youtubeId(active.youtube) : "";
  const activeFile = active ? safeMedia(active.file) : "";
  const watch = activeId ? `https://www.youtube.com/watch?v=${activeId}` : channel;

  return (
    <section id="videos" className="px-5 py-28 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <h2 className="font-display text-5xl tracking-tight md:text-7xl">{content.copy.videosTitle || "Veja a B'ritt"}</h2>
          {content.copy.videosIntro ? <p className="mt-4 max-w-[46ch] text-bone-dim">{content.copy.videosIntro}</p> : null}
        </Reveal>
        {feature ? (
          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            <motion.button
              type="button"
              data-cursor="ASSISTIR"
              className="text-left lg:col-span-8"
              {...fadeProps(reduced, 0, 28)}
              onClick={(event) => open(feature, event.currentTarget)}
            >
              {safeMedia(feature.thumbnail) ? (
                <ParallaxImage src={safeMedia(feature.thumbnail)} alt={feature.thumbnailAlt} drift={6} frameClassName="aspect-[16/9] w-full" />
              ) : (
                <div className="aspect-[16/9] w-full bg-ink-2" />
              )}
              {feature.context ? <span className="mt-3 block text-sm text-brass">{feature.context}</span> : null}
              <span className="mt-1 block font-display text-3xl">{feature.title}</span>
            </motion.button>
            <div className="grid gap-6 lg:col-span-4">
              {rest.map((video, index) => (
                <motion.button
                  key={video.id}
                  type="button"
                  data-cursor="ASSISTIR"
                  className="text-left"
                  {...fadeProps(reduced, 0.08 + index * 0.06, 20)}
                  onClick={(event) => open(video, event.currentTarget)}
                >
                  {safeMedia(video.thumbnail) ? (
                    <ParallaxImage
                      src={safeMedia(video.thumbnail)}
                      alt={video.thumbnailAlt}
                      loading="lazy"
                      drift={index % 2 === 0 ? -4 : 4}
                      frameClassName="aspect-[16/9] w-full"
                    />
                  ) : (
                    <div className="aspect-[16/9] w-full bg-ink-2" />
                  )}
                  {video.context ? <span className="mt-2 block text-sm text-brass">{video.context}</span> : null}
                  <span className="mt-1 block text-lg">{video.title}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      {active ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/95 p-4" role="dialog" aria-modal="true" aria-label={active.title}>
          <button type="button" className="absolute top-4 right-4 inline-flex h-11 items-center gap-2" onClick={close}>
            <X size={18} strokeWidth={1.5} />
            Fechar
          </button>
          <div className="w-full max-w-4xl">
            {activeFile ? (
              <video className="aspect-video w-full bg-black" controls autoPlay playsInline src={activeFile} />
            ) : activeId ? (
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(activeId)}?autoplay=1`}
                title={active.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div>
                {safeMedia(active.thumbnail) ? <img src={safeMedia(active.thumbnail)} alt="" className="aspect-video w-full object-cover" /> : null}
                <p className="mt-4 text-bone-dim">O link deste vídeo ainda não foi definido.</p>
              </div>
            )}
            <div className="mt-4">
              {watch ? (
                <a href={watch} target="_blank" rel="noreferrer noopener" data-cursor="ABRIR" className="text-brass">
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
