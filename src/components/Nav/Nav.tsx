import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { href: "#palco", label: "Palco" },
  { href: "#som", label: "Som" },
  { href: "#quatro", label: "Os quatro" },
  { href: "#momentos", label: "Momentos" },
  { href: "#videos", label: "Vídeos" },
  { href: "#ouca", label: "Ouça" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`fixed top-0 right-0 left-0 h-16 bg-gradient-to-b from-black via-black/75 to-transparent ${open ? "z-[80]" : "z-30"}`}>
      <nav className="mx-auto flex h-full max-w-[1400px] items-center gap-6 px-4 md:px-8" aria-label="Seções">
        <a href="#palco" className="shrink-0" data-cursor="ABRIR">
          <img src="/brand/logo.png" alt="B'ritt" className="h-12 w-auto mix-blend-lighten" />
        </a>
        <ul className="ml-auto hidden items-center gap-5 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} data-cursor="ABRIR" className="text-sm text-bone/90">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
        </button>
      </nav>
      {open ? (
        <div className="fixed inset-x-0 top-16 bottom-0 z-[70] bg-ink px-6 pt-10 lg:hidden">
          <ul className="grid gap-6">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-display text-4xl"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
