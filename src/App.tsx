import { lazy, Suspense, useEffect, useState } from "react";
import { AudioController } from "./components/AudioController/AudioController";
import { Cursor } from "./components/Cursor/Cursor";
import { Hero } from "./components/Hero/Hero";
import { PlayBench } from "./components/InteractiveStage/PlayBench";
import { Loader } from "./components/Loader/Loader";
import { Nav } from "./components/Nav/Nav";
import { SiteProvider } from "./content/SiteProvider";

const AdminPanel = lazy(() => import("./components/Admin/AdminPanel").then((mod) => ({ default: mod.AdminPanel })));
const BandMembers = lazy(() => import("./components/BandMembers/BandMembers").then((mod) => ({ default: mod.BandMembers })));
const About = lazy(() => import("./components/About/About").then((mod) => ({ default: mod.About })));
const Gallery = lazy(() => import("./components/Gallery/Gallery").then((mod) => ({ default: mod.Gallery })));
const Videos = lazy(() => import("./components/Videos/Videos").then((mod) => ({ default: mod.Videos })));
const Music = lazy(() => import("./components/Music/Music").then((mod) => ({ default: mod.Music })));
const SocialLinks = lazy(() => import("./components/SocialLinks/SocialLinks").then((mod) => ({ default: mod.SocialLinks })));
const Footer = lazy(() => import("./components/Footer/Footer").then((mod) => ({ default: mod.Footer })));

function Experience() {
  return (
    <>
      <a href="#palco" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[90] focus:bg-brass focus:px-3 focus:py-2 focus:text-ink">
        Pular para o palco
      </a>
      <Nav />
      <main>
        <Hero />
        <PlayBench />
        <Suspense fallback={<div className="h-24" />}>
          <BandMembers />
          <About />
          <Gallery />
          <Videos />
          <Music />
          <SocialLinks />
          <Footer />
        </Suspense>
      </main>
      <AudioController />
    </>
  );
}

function usePainel() {
  const [open, setOpen] = useState(() => window.location.hash === "#painel");
  useEffect(() => {
    const sync = () => setOpen(window.location.hash === "#painel");
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  return open;
}

function Shell() {
  const painel = usePainel();
  const [entered, setEntered] = useState(false);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      {painel ? null : <Cursor />}
      {painel ? (
        <Suspense fallback={<div className="fixed inset-0 z-[50] bg-black" />}>
          <AdminPanel onViewSite={() => setEntered(true)} />
        </Suspense>
      ) : entered ? (
        <Experience />
      ) : (
        <Loader onEnter={() => setEntered(true)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <Shell />
    </SiteProvider>
  );
}
