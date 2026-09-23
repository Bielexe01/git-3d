import { Pause, Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { safeHref, safeMedia } from "../../content/links";
import { useSite } from "../../content/SiteProvider";
import type { Track } from "../../content/types";
import { Reveal } from "../ui/Scroll";
import { fadeProps } from "../ui/scrollMotion";

export function Music() {
  const { content } = useSite();
  const [note, setNote] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reduced = useReducedMotion();
  const spotify = safeHref(content.social.spotify);

  useEffect(() => () => audioRef.current?.pause(), []);

  function playFile(id: string, src: string) {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    if (playing === id) {
      audio.pause();
      setPlaying(null);
      return;
    }
    audio.src = src;
    audio.onended = () => setPlaying(null);
    audio.onerror = () => {
      setPlaying(null);
      setNote("Não foi possível tocar esse arquivo.");
    };
    void audio.play().then(
      () => setPlaying(id),
      () => {
        setPlaying(null);
        setNote("Não foi possível tocar esse arquivo.");
      },
    );
  }

  function open(url: string) {
    const target = safeHref(url) || spotify;
    if (!target) {
      setNote("O link ainda não foi definido.");
      return;
    }
    setNote("");
    window.open(target, "_blank", "noopener,noreferrer");
  }

  function onTrack(track: Track) {
    const audio = safeMedia(track.audio);
    if (audio) {
      setNote("");
      playFile(track.id, audio);
      return;
    }
    open(track.url);
  }

  return (
    <section id="ouca" className="px-5 py-28 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <h2 className="font-display text-5xl tracking-tight md:text-7xl">{content.copy.musicTitle || "Ouça a B'ritt"}</h2>
          {content.copy.musicIntro ? <p className="mt-4 max-w-[46ch] text-bone-dim">{content.copy.musicIntro}</p> : null}
        </Reveal>
        <ol className="mt-12 max-w-4xl">
          {content.tracks.map((track, index) => {
            const cover = safeMedia(track.cover);
            const active = playing === track.id;
            return (
              <motion.li key={track.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 border-t border-bone/15 py-4" {...fadeProps(reduced, Math.min(index, 8) * 0.04, 14)}>
                {cover ? (
                  <img src={cover} alt={track.coverAlt} className="h-16 w-16 object-cover" loading="lazy" />
                ) : (
                  <div className="h-16 w-16 bg-ink-2" />
                )}
                <div>
                  <p className="text-xs text-bone-dim">{String(index + 1).padStart(2, "0")}</p>
                  <p className="font-display text-2xl">{track.title}</p>
                  {track.duration ? <p className="text-sm text-bone-dim">{track.duration}</p> : null}
                  <div className="mt-2 h-px w-full bg-bone/15" aria-hidden="true" />
                </div>
                <button
                  type="button"
                  data-cursor={track.audio ? (active ? "PAUSA" : "TOCAR") : "ABRIR"}
                  className="inline-flex h-11 w-11 items-center justify-center border border-bone/20"
                  aria-label={track.audio ? (active ? `Pausar ${track.title}` : `Tocar ${track.title}`) : `Abrir ${track.title}`}
                  onClick={() => onTrack(track)}
                >
                  {active ? <Pause size={16} strokeWidth={1.5} /> : <Play size={16} strokeWidth={1.5} />}
                </button>
              </motion.li>
            );
          })}
        </ol>
        <Reveal delay={0.1}>
        <div className="mt-8">
          <button
            type="button"
            data-cursor="ABRIR"
            className="inline-flex rounded-[2px] bg-brass px-5 py-3 text-sm tracking-[0.16em] text-ink"
            onClick={() => open(content.social.spotify)}
          >
            Ouvir no Spotify
          </button>
          {note ? <p className="mt-3 text-sm text-bone-dim">{note}</p> : null}
        </div>
        </Reveal>
      </div>
    </section>
  );
}
