import { Play } from "lucide-react";
import { useState } from "react";
import { tracks } from "../../data/music";
import { socialLinks } from "../../data/social";

export function Music() {
  const [note, setNote] = useState(false);

  function open(url: string) {
    const target = url || socialLinks.spotify;
    if (!target) {
      setNote(true);
      return;
    }
    window.open(target, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="ouca" className="px-5 py-28 md:px-10">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="font-display text-5xl tracking-tight md:text-7xl">Ouça a B'ritt</h2>
        <p className="mt-4 max-w-[46ch] text-bone-dim">As faixas entram aqui quando os links forem definidos.</p>
        <ol className="mt-12 max-w-4xl">
          {tracks.map((track, index) => (
            <li key={track.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 border-t border-bone/15 py-4">
              <img src={track.cover} alt={track.coverAlt} className="h-16 w-16 object-cover" loading="lazy" />
              <div>
                <p className="text-xs text-bone-dim">{String(index + 1).padStart(2, "0")}</p>
                <p className="font-display text-2xl">{track.title}</p>
                <p className="text-sm text-bone-dim">{track.duration}</p>
                <div className="mt-2 h-px w-full bg-bone/15" aria-hidden="true" />
                <span className="sr-only">Prévia no site indisponível.</span>
              </div>
              <button
                type="button"
                data-cursor="ABRIR"
                className="inline-flex h-11 w-11 items-center justify-center border border-bone/20"
                aria-label={`Abrir ${track.title}`}
                onClick={() => open(track.spotifyUrl)}
              >
                <Play size={16} strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <button
            type="button"
            data-cursor="ABRIR"
            className="inline-flex rounded-[2px] bg-brass px-5 py-3 text-sm tracking-[0.16em] text-ink"
            onClick={() => open(socialLinks.spotify)}
          >
            Ouvir no Spotify
          </button>
          {note ? <p className="mt-3 text-sm text-bone-dim">O link do Spotify ainda não foi definido.</p> : null}
        </div>
      </div>
    </section>
  );
}
