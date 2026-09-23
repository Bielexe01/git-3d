import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { audioManager } from "../../audio/AudioManager";
import { BENCH_IDS } from "../../audio/samples";
import { safeHref } from "../../content/links";
import { useSite } from "../../content/SiteProvider";
import { InteractiveAmp } from "../InteractiveAmp/InteractiveAmp";
import { InteractiveBass } from "../InteractiveBass/InteractiveBass";
import { InteractiveDrums } from "../InteractiveDrums/InteractiveDrums";
import { InteractiveGuitar } from "../InteractiveGuitar/InteractiveGuitar";
import { InteractiveMicrophone } from "../InteractiveMicrophone/InteractiveMicrophone";
import { LiveWave } from "../ui/LiveWave";
import { Reveal } from "../ui/Scroll";

function ListenLink() {
  const { content } = useSite();
  const spotify = safeHref(content.social.spotify);
  const [note, setNote] = useState(false);
  if (spotify) {
    return (
      <a href={spotify} target="_blank" rel="noreferrer noopener" data-cursor="ABRIR" className="inline-flex bg-brass px-5 py-3 text-sm tracking-[0.16em] text-ink">
        Ouvir a B'ritt
      </a>
    );
  }
  return (
    <div>
      <button type="button" className="inline-flex border border-brass px-5 py-3 text-sm tracking-[0.16em] text-bone" onClick={() => setNote(true)}>
        Ouvir a B'ritt
      </button>
      {note ? <p className="mt-3 text-sm text-bone-dim">O link do Spotify ainda não foi definido.</p> : null}
    </div>
  );
}

export function PlayBench() {
  const { content } = useSite();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { margin: "320px", once: true });

  useEffect(() => {
    if (seen) void audioManager.preload(BENCH_IDS);
  }, [seen]);

  return (
    <section ref={ref} id="som" className="bg-black">
      <Reveal className="mx-auto max-w-[1500px] px-5 pt-24 pb-10 md:px-10">
        <h2 className="font-display text-5xl leading-none tracking-tight md:text-7xl">{content.copy.playTitle || "Toque a B'ritt"}</h2>
        {content.copy.playIntro ? <p className="mt-4 max-w-[42ch] text-bone-dim">{content.copy.playIntro}</p> : null}
        <LiveWave className="mt-6 max-w-lg" />
      </Reveal>
      <InteractiveDrums />
      <div className="grid md:grid-cols-2">
        <InteractiveGuitar player="vitin" />
        <InteractiveGuitar player="will" />
      </div>
      <div className="grid items-end md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.8fr)]">
        <InteractiveMicrophone who="vitin" />
        <InteractiveBass />
        <InteractiveMicrophone who="will" />
      </div>
      <div className="mx-auto max-w-3xl px-5 py-16 md:px-10">
        <InteractiveAmp />
        <div className="mt-10">
          <ListenLink />
        </div>
      </div>
    </section>
  );
}
