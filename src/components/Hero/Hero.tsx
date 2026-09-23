import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { SampleId } from "../../audio/samples";
import { safeMedia } from "../../content/links";
import { useSite } from "../../content/SiteProvider";
import { hasWebGL } from "../../hooks/useMedia";
import { heroCamera, HeroStage } from "../stage3d/HeroStage";
import { HitKeys } from "../stage3d/HitKeys";
import { StageBoundary, StageView } from "../stage3d/StageView";
import { SpotButton, type Spot } from "../stage/Spot";

const spots: Spot[] = [
  { id: "guitar-vitin", sample: "vitin-strum" as SampleId, name: "VITIN", role: "Guitarra + Voz", x: 14, y: 62, w: 14, h: 26, round: true },
  { id: "guitar-will", sample: "will-strum" as SampleId, name: "WILL", role: "Guitarra + Voz", x: 31, y: 60, w: 12, h: 26, round: true },
  { id: "bass-hiagolas", sample: "bass-strum" as SampleId, name: "HIAGOLAS", role: "Baixo", x: 44, y: 58, w: 11, h: 28, round: true },
  { id: "drums-kick", sample: "kick" as SampleId, name: "BIEL", role: "Bumbo", x: 55, y: 44, w: 11, h: 14, round: true },
  { id: "drums-ride", sample: "ride" as SampleId, name: "BIEL", role: "Ride", x: 47, y: 33, w: 10, h: 7, round: true, rot: -12 },
  { id: "drums-crash", sample: "crash" as SampleId, name: "BIEL", role: "Crash", x: 61, y: 31, w: 11, h: 6, round: true, rot: 8 },
  { id: "amp-hiagolas", sample: "amp" as SampleId, name: "HIAGOLAS", role: "Amplificador", x: 53, y: 54, w: 15, h: 18 },
  { id: "mic-vitin", sample: "voice-vitin" as SampleId, name: "VITIN", role: "Voz", x: 75, y: 22, w: 5, h: 8, round: true },
  { id: "mic-will", sample: "voice-will" as SampleId, name: "WILL", role: "Voz", x: 83, y: 21, w: 5, h: 8, round: true },
];

const heroHits: { id: string; sample: SampleId; label: string }[] = [
  { id: "guitar-vitin", sample: "vitin-strum", label: "Vitin, guitarra" },
  { id: "guitar-will", sample: "will-strum", label: "Will, guitarra" },
  { id: "bass-hiagolas", sample: "bass-strum", label: "Hiagolas, baixo" },
  { id: "drums-kick", sample: "kick", label: "Biel, bumbo" },
  { id: "drums-ride", sample: "ride", label: "Biel, ride" },
  { id: "drums-crash", sample: "crash", label: "Biel, crash" },
  { id: "amp-hiagolas", sample: "amp", label: "Hiagolas, amplificador" },
  { id: "mic-vitin", sample: "voice-vitin", label: "Vitin, voz" },
  { id: "mic-will", sample: "voice-will", label: "Will, voz" },
];

function PhotoRoom() {
  const { content } = useSite();
  return (
    <>
      <img
        src={safeMedia(content.hero.image)}
        alt={content.hero.imageAlt}
        className="h-full w-full object-fill"
      />
      {spots.map((spot) => (
        <SpotButton key={spot.id} spot={spot} />
      ))}
    </>
  );
}

export function Hero() {
  const { content } = useSite();
  const sectionRef = useRef<HTMLElement>(null);
  const tilt = useRef({ x: 0, y: 0 });
  const reduced = useReducedMotion();
  const webgl = hasWebGL();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 0.94]);
  const stageY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [28, -64]);
  const veil = useTransform(scrollYProgress, [0.62, 1], reduced ? [0, 0] : [0, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.28], reduced ? [1, 1] : [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.35], reduced ? [0, 0] : [0, -28]);

  return (
    <section ref={sectionRef} id="palco" className="relative h-[150dvh] bg-black">
      <div
        className="sticky top-0 h-[100dvh] overflow-hidden bg-black"
        onPointerMove={(event) => {
          if (reduced) return;
          const rect = event.currentTarget.getBoundingClientRect();
          tilt.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * -0.32;
          tilt.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.18;
        }}
        onPointerLeave={() => {
          tilt.current.x = 0;
          tilt.current.y = 0;
        }}
      >
        <div className="absolute top-1/2 left-1/2 aspect-video w-[max(124vw,calc(124dvh*16/9))] -translate-x-1/2 -translate-y-1/2">
          <motion.div className="relative h-full w-full" style={{ scale, y: stageY }}>
            {webgl ? (
              <StageBoundary fallback={<PhotoRoom />}>
                <StageView className="absolute inset-0" camera={heroCamera}>
                  <HeroStage tilt={tilt} still={!!reduced} />
                </StageView>
              </StageBoundary>
            ) : (
              <PhotoRoom />
            )}
            <HitKeys hits={heroHits} />
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.62)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        <motion.div
          className="pointer-events-none absolute top-20 left-5 z-20 max-w-md md:left-10 md:top-24"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <h1>
            <img src={safeMedia(content.brand.logo)} alt={content.brand.logoAlt || "B'ritt"} className="w-[min(250px,62vw)]" />
          </h1>
          {content.hero.tagline ? (
            <p className="mt-1 max-w-[24ch] text-lg text-bone" style={{ textShadow: "0 2px 18px #000" }}>
              {content.hero.tagline}
            </p>
          ) : null}
          {content.hero.cta ? (
            <a
              href="#som"
              data-cursor="ABRIR"
              className="pointer-events-auto mt-5 inline-flex bg-brass px-5 py-3 text-sm tracking-[0.16em] text-ink"
            >
              {content.hero.cta}
            </a>
          ) : null}
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: veil }} />
      </div>
    </section>
  );
}
