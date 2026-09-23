import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { audioManager } from "../../audio/AudioManager";
import { useAudioSnapshot } from "../../hooks/useAudioSnapshot";

const buses = [
  ["drums", "Bateria"],
  ["guitar", "Guitarras"],
  ["bass", "Baixo"],
  ["vocals", "Voz"],
  ["fx", "Ampli"],
  ["ambience", "Sala"],
] as const;

export function AudioController() {
  const audio = useAudioSnapshot();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-3 bottom-3 left-3 z-40 md:left-auto md:w-80">
      <div className="rounded-[2px] border border-bone/15 bg-ink/95">
        <div className="flex items-center gap-3 px-3 py-2">
          <button
            type="button"
            aria-pressed={!audio.muted}
            onClick={() => audioManager.setMuted(!audio.muted)}
            className="inline-flex items-center gap-2 text-xs tracking-[0.16em] text-bone"
          >
            {audio.muted ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
            {audio.muted ? "SOM MUDO" : "SOM LIGADO"}
          </button>
          <button
            type="button"
            className="ml-auto text-xs tracking-[0.14em] text-bone-dim"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "FECHAR" : "VOLUME"}
          </button>
        </div>
        {open ? (
          <form className="grid gap-3 border-t border-bone/10 px-3 py-3" onSubmit={(event) => event.preventDefault()}>
            <label className="grid gap-2 text-[11px] tracking-[0.12em] text-bone-dim">
              <span className="flex justify-between">
                <span>MASTER</span>
                <span>{Math.round(audio.master * 100)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={audio.master}
                aria-label="Volume master"
                onChange={(event) => audioManager.setBus("master", Number(event.target.value))}
              />
            </label>
            {buses.map(([bus, label]) => (
              <label key={bus} className="grid gap-2 text-[11px] tracking-[0.12em] text-bone-dim">
                <span className="flex justify-between">
                  <span>{label.toUpperCase()}</span>
                  <span>{Math.round(audio[bus] * 100)}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={audio[bus]}
                  aria-label={`Volume de ${label}`}
                  onChange={(event) => audioManager.setBus(bus, Number(event.target.value))}
                />
              </label>
            ))}
          </form>
        ) : null}
      </div>
    </div>
  );
}
