import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { audioAccept, imageAccept, videoAccept } from "../../content/files";
import { safeMedia } from "../../content/links";
import { useSite } from "../../content/SiteProvider";
import type { GalleryItem, MemberId, SiteContent, Track, VideoItem } from "../../content/types";
import { youtubeId } from "../../content/youtube";
import { Area, Block, Field, FileButton, LinkHint, TextButton } from "./ui";

const tabs = [
  { id: "textos", label: "Textos" },
  { id: "fotos", label: "Fotos" },
  { id: "musicas", label: "Músicas" },
  { id: "videos", label: "Vídeos" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const ratios = [
  ["2/3", "Retrato"],
  ["4/3", "Paisagem"],
  ["16/9", "Larga"],
  ["1/1", "Quadrada"],
  ["3/2", "Foto"],
  ["3/4", "Alta"],
] as const;

const sections: { key: keyof SiteContent["copy"]; label: string; long?: boolean }[] = [
  { key: "playTitle", label: "Título da seção de tocar" },
  { key: "playIntro", label: "Texto da seção de tocar", long: true },
  { key: "membersTitle", label: "Título dos integrantes" },
  { key: "membersIntro", label: "Texto dos integrantes", long: true },
  { key: "galleryTitle", label: "Título da galeria" },
  { key: "galleryIntro", label: "Texto da galeria", long: true },
  { key: "videosTitle", label: "Título dos vídeos" },
  { key: "videosIntro", label: "Texto dos vídeos", long: true },
  { key: "musicTitle", label: "Título das músicas" },
  { key: "musicIntro", label: "Texto das músicas", long: true },
  { key: "socialTitle", label: "Título dos links" },
];

const socials: { key: keyof SiteContent["social"]; label: string; placeholder: string }[] = [
  { key: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/artist/..." },
  { key: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@..." },
  { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/..." },
  { key: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@..." },
];

function nid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`;
}

function move<T>(list: T[], index: number, direction: -1 | 1) {
  const next = index + direction;
  if (next < 0 || next >= list.length) return list;
  const copy = list.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

function fileLabel(url: string) {
  if (!url) return "Nenhum arquivo";
  const name = url.split("/").pop() || url;
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

async function durationOf(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    const seconds = await new Promise<number>((resolve, reject) => {
      audio.onloadedmetadata = () => resolve(audio.duration);
      audio.onerror = () => reject(new Error("sem duração"));
      audio.src = url;
    });
    if (!Number.isFinite(seconds)) return "";
    const minutes = Math.floor(seconds / 60);
    const remain = Math.round(seconds % 60) % 60;
    return `${minutes}:${String(remain).padStart(2, "0")}`;
  } catch {
    return "";
  } finally {
    URL.revokeObjectURL(url);
  }
}

function RoleEditor({ id, roles, revision }: { id: MemberId; roles: string[]; revision: number }) {
  const { edit } = useSite();
  const [text, setText] = useState(roles.join(", "));
  const [seen, setSeen] = useState(revision);
  if (seen !== revision) {
    setSeen(revision);
    setText(roles.join(", "));
  }

  return (
    <Field
      label="Funções, separadas por vírgula"
      name={`member.${id}.roles`}
      value={text}
      maxLength={200}
      placeholder="Guitarrista, Vocalista"
      onChange={(value) => {
        setText(value);
        const next = value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 8);
        edit((current) => ({
          ...current,
          members: current.members.map((member) => (member.id === id ? { ...member, roles: next } : member)),
        }));
      }}
    />
  );
}

function TextosTab() {
  const { draft, edit, revision } = useSite();
  const set =
    <K extends keyof SiteContent>(key: K) =>
    (patch: Partial<SiteContent[K]>) => {
      edit((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
    };
  const band = set("band");
  const hero = set("hero");
  const copy = set("copy");
  const social = set("social");

  return (
    <>
      <Block title="Abertura" hint="A frase sobre o logo e o botão que leva para os instrumentos.">
        <Field label="Frase" name="hero.tagline" value={draft.hero.tagline} maxLength={180} onChange={(tagline) => hero({ tagline })} />
        <Field label="Botão" name="hero.cta" value={draft.hero.cta} maxLength={40} onChange={(cta) => hero({ cta })} />
      </Block>
      <Block title="A banda">
        <Field label="Nome" name="band.name" value={draft.band.name} maxLength={80} onChange={(name) => band({ name })} />
        <Area label="Descrição" name="band.description" value={draft.band.description} maxLength={2000} onChange={(description) => band({ description })} />
        <div className="grid gap-8 md:grid-cols-2">
          <Field label="Cidade" name="band.location" value={draft.band.location} maxLength={80} onChange={(location) => band({ location })} />
          <Field label="Estilo" name="band.style" value={draft.band.style} maxLength={80} onChange={(style) => band({ style })} />
        </div>
      </Block>
      <Block title="Os quatro" hint="Os nomes aparecem nas fotos. As fotos em si ficam na aba Fotos.">
        {draft.members.map((member) => (
          <div key={member.id} className="grid gap-6 border-t border-bone/10 pt-6 first:border-t-0 first:pt-0">
            <p className="font-display text-2xl">{member.name || member.id}</p>
            <div className="grid gap-6 md:grid-cols-2">
              <Field
                label="Nome"
                name={`member.${member.id}.name`}
                value={member.name}
                maxLength={80}
                onChange={(name) =>
                  edit((current) => ({
                    ...current,
                    members: current.members.map((item) => (item.id === member.id ? { ...item, name } : item)),
                  }))
                }
              />
              <Field
                label="Instrumento"
                name={`member.${member.id}.instrument`}
                value={member.instrument}
                maxLength={80}
                onChange={(instrument) =>
                  edit((current) => ({
                    ...current,
                    members: current.members.map((item) => (item.id === member.id ? { ...item, instrument } : item)),
                  }))
                }
              />
            </div>
            <RoleEditor id={member.id} roles={member.roles} revision={revision} />
          </div>
        ))}
      </Block>
      <Block title="Seções">
        {sections.map((section) =>
          section.long ? (
            <Area
              key={section.key}
              label={section.label}
              name={`copy.${section.key}`}
              value={draft.copy[section.key]}
              maxLength={800}
              onChange={(value) => copy({ [section.key]: value })}
            />
          ) : (
            <Field
              key={section.key}
              label={section.label}
              name={`copy.${section.key}`}
              value={draft.copy[section.key]}
              maxLength={120}
              onChange={(value) => copy({ [section.key]: value })}
            />
          ),
        )}
      </Block>
      <Block title="Links" hint="Estes endereços abrem o Spotify, o YouTube, o Instagram e o TikTok.">
        {socials.map((item) => (
          <div key={item.key} className="grid gap-2">
            <Field
              label={item.label}
              name={`social.${item.key}`}
              value={draft.social[item.key]}
              placeholder={item.placeholder}
              maxLength={500}
              onChange={(value) => social({ [item.key]: value })}
            />
            <LinkHint value={draft.social[item.key]} />
          </div>
        ))}
      </Block>
    </>
  );
}

function PhotoCard({ src, alt, children }: { src: string; alt: string; children: ReactNode }) {
  const safe = safeMedia(src);
  return (
    <div className="grid gap-4 border border-bone/15 p-4 md:grid-cols-[180px_1fr] md:items-start">
      {safe ? <img src={safe} alt={alt} className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-ink-2 text-sm text-bone-dim">Sem foto</div>}
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function FotosTab() {
  const { draft, edit, upload, uploading } = useSite();

  async function pick(file: File, apply: (url: string) => void) {
    try {
      apply(await upload(file));
    } catch {
      /* o aviso fica na barra de baixo */
    }
  }

  return (
    <>
      <Block title="Logo" hint="Aparece na abertura, no menu e no rodapé.">
        <PhotoCard src={draft.brand.logo} alt="">
          <Field label="Texto alternativo" name="brand.logoAlt" value={draft.brand.logoAlt} maxLength={80} onChange={(logoAlt) => edit((current) => ({ ...current, brand: { ...current.brand, logoAlt } }))} />
          <FileButton label="Trocar logo" accept={imageAccept} name="brand.logo" disabled={uploading} onPick={(file) => void pick(file, (logo) => edit((current) => ({ ...current, brand: { ...current.brand, logo } })))} />
        </PhotoCard>
      </Block>
      <Block title="Estúdio" hint="Foto usada quando o palco em 3D não abre neste aparelho.">
        <PhotoCard src={draft.hero.image} alt="">
          <Field label="Texto alternativo" name="hero.imageAlt" value={draft.hero.imageAlt} maxLength={400} onChange={(imageAlt) => edit((current) => ({ ...current, hero: { ...current.hero, imageAlt } }))} />
          <FileButton label="Trocar foto" accept={imageAccept} name="hero.image" disabled={uploading} onPick={(file) => void pick(file, (image) => edit((current) => ({ ...current, hero: { ...current.hero, image } })))} />
        </PhotoCard>
      </Block>
      <Block title="Integrantes">
        {draft.members.map((member) => (
          <PhotoCard key={member.id} src={member.image} alt="">
            <p className="font-display text-2xl">{member.name || member.id}</p>
            <Field
              label="Texto alternativo"
              name={`member.${member.id}.imageAlt`}
              value={member.imageAlt}
              maxLength={400}
              onChange={(imageAlt) =>
                edit((current) => ({
                  ...current,
                  members: current.members.map((item) => (item.id === member.id ? { ...item, imageAlt } : item)),
                }))
              }
            />
            <FileButton
              label="Trocar foto"
              accept={imageAccept}
              name={`member.${member.id}.image`}
              disabled={uploading}
              onPick={(file) =>
                void pick(file, (image) =>
                  edit((current) => ({
                    ...current,
                    members: current.members.map((item) => (item.id === member.id ? { ...item, image } : item)),
                  })),
                )
              }
            />
          </PhotoCard>
        ))}
      </Block>
      <Block title="Galeria" hint="A primeira foto fica em destaque. A ordem daqui é a ordem do site.">
        {draft.gallery.map((photo, index) => (
          <PhotoCard key={photo.id} src={photo.src} alt="">
            <Field
              label="Texto alternativo"
              name={`gallery.${photo.id}.alt`}
              value={photo.alt}
              maxLength={400}
              onChange={(alt) =>
                edit((current) => ({
                  ...current,
                  gallery: current.gallery.map((item) => (item.id === photo.id ? { ...item, alt } : item)),
                }))
              }
            />
            <label className="block">
              <span className="block text-xs tracking-[0.16em] text-brass">PROPORÇÃO</span>
              <select
                data-field={`gallery.${photo.id}.ratio`}
                value={photo.ratio}
                className="mt-2 w-full border-b border-bone/20 bg-transparent py-3 text-lg outline-none focus:border-brass"
                onChange={(event) =>
                  edit((current) => ({
                    ...current,
                    gallery: current.gallery.map((item) => (item.id === photo.id ? { ...item, ratio: event.target.value } : item)),
                  }))
                }
              >
                {ratios.map(([value, label]) => (
                  <option key={value} value={value} className="bg-ink">
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-4">
              <FileButton
                label="Trocar foto"
                accept={imageAccept}
                name={`gallery.${photo.id}.src`}
                disabled={uploading}
                onPick={(file) =>
                  void pick(file, (src) =>
                    edit((current) => ({
                      ...current,
                      gallery: current.gallery.map((item) => (item.id === photo.id ? { ...item, src } : item)),
                    })),
                  )
                }
              />
              <TextButton disabled={index === 0} onClick={() => edit((current) => ({ ...current, gallery: move(current.gallery, index, -1) }))}>
                Subir
              </TextButton>
              <TextButton disabled={index === draft.gallery.length - 1} onClick={() => edit((current) => ({ ...current, gallery: move(current.gallery, index, 1) }))}>
                Descer
              </TextButton>
              <TextButton onClick={() => edit((current) => ({ ...current, gallery: current.gallery.filter((item) => item.id !== photo.id) }))}>Remover</TextButton>
            </div>
          </PhotoCard>
        ))}
        <FileButton
          label="Adicionar foto"
          accept={imageAccept}
          name="gallery.add"
          disabled={uploading}
          onPick={(file) =>
            void pick(file, (src) =>
              edit((current) => ({
                ...current,
                gallery: [...current.gallery, { id: nid("foto"), src, alt: "", ratio: "4/3", tilt: 0 } satisfies GalleryItem],
              })),
            )
          }
        />
      </Block>
    </>
  );
}

function MusicasTab() {
  const { draft, edit, upload, uploading } = useSite();

  async function pick(file: File, apply: (url: string) => void) {
    try {
      apply(await upload(file));
    } catch {
      /* o aviso fica na barra de baixo */
    }
  }

  function update(id: string, patch: Partial<Track>) {
    edit((current) => ({
      ...current,
      tracks: current.tracks.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  return (
    <Block title="Faixas" hint="Se houver um arquivo de áudio, o play toca no site. Sem arquivo, o play abre o link.">
      {draft.tracks.map((track, index) => (
        <article key={track.id} className="grid gap-6 border-t border-bone/10 pt-8 first:border-t-0 first:pt-0">
          <div className="flex items-center gap-4">
            {safeMedia(track.cover) ? (
              <img src={safeMedia(track.cover)} alt="" className="h-16 w-16 object-cover" />
            ) : (
              <div className="h-16 w-16 bg-ink-2" />
            )}
            <p className="font-display text-2xl">{track.title || "Nova faixa"}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-[1fr_140px]">
            <Field label="Título" name={`track.${track.id}.title`} value={track.title} maxLength={140} onChange={(title) => update(track.id, { title })} />
            <Field label="Duração" name={`track.${track.id}.duration`} value={track.duration} maxLength={16} placeholder="3:42" onChange={(duration) => update(track.id, { duration })} />
          </div>
          <div className="grid gap-2">
            <Field label="Link para ouvir" name={`track.${track.id}.url`} value={track.url} maxLength={500} placeholder="https://open.spotify.com/track/..." onChange={(url) => update(track.id, { url })} />
            <LinkHint value={track.url} />
          </div>
          <Field label="Texto da capa" name={`track.${track.id}.coverAlt`} value={track.coverAlt} maxLength={400} onChange={(coverAlt) => update(track.id, { coverAlt })} />
          <div className="flex flex-wrap items-center gap-4">
            <FileButton label="Capa" accept={imageAccept} name={`track.${track.id}.cover`} disabled={uploading} onPick={(file) => void pick(file, (cover) => update(track.id, { cover }))} />
            <FileButton
              label="Áudio"
              accept={audioAccept}
              name={`track.${track.id}.audio`}
              disabled={uploading}
              onPick={(file) =>
                void pick(file, async (audio) => {
                  const duration = track.duration && track.duration !== "--:--" ? track.duration : await durationOf(file);
                  update(track.id, { audio, ...(duration ? { duration } : {}) });
                })
              }
            />
            <span className="text-sm text-bone-dim">{fileLabel(track.audio)}</span>
            {track.audio ? <TextButton onClick={() => update(track.id, { audio: "" })}>Tirar áudio</TextButton> : null}
          </div>
          <div className="flex flex-wrap gap-4">
            <TextButton disabled={index === 0} onClick={() => edit((current) => ({ ...current, tracks: move(current.tracks, index, -1) }))}>
              Subir
            </TextButton>
            <TextButton disabled={index === draft.tracks.length - 1} onClick={() => edit((current) => ({ ...current, tracks: move(current.tracks, index, 1) }))}>
              Descer
            </TextButton>
            <TextButton onClick={() => edit((current) => ({ ...current, tracks: current.tracks.filter((item) => item.id !== track.id) }))}>Remover</TextButton>
          </div>
        </article>
      ))}
      <button
        type="button"
        className="justify-self-start border border-brass px-4 py-3 text-sm tracking-[0.14em] text-brass"
        onClick={() =>
          edit((current) => ({
            ...current,
            tracks: [
              ...current.tracks,
              { id: nid("faixa"), title: "Nova faixa", duration: "", cover: "", coverAlt: "", url: "", audio: "" },
            ],
          }))
        }
      >
        Adicionar música
      </button>
    </Block>
  );
}

function VideosTab() {
  const { draft, edit, upload, uploading } = useSite();

  async function pick(file: File, apply: (url: string) => void) {
    try {
      apply(await upload(file));
    } catch {
      /* o aviso fica na barra de baixo */
    }
  }

  function update(id: string, patch: Partial<VideoItem>) {
    edit((current) => ({
      ...current,
      videos: current.videos.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  return (
    <Block title="Vídeos" hint="Cole um link do YouTube ou envie um arquivo. A capa é a imagem da lista.">
      {draft.videos.map((video, index) => {
        const recognized = youtubeId(video.youtube);
        return (
          <article key={video.id} className="grid gap-6 border-t border-bone/10 pt-8 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-4">
              {safeMedia(video.thumbnail) ? (
                <img src={safeMedia(video.thumbnail)} alt="" className="aspect-video w-32 object-cover" />
              ) : (
                <div className="aspect-video w-32 bg-ink-2" />
              )}
              <p className="font-display text-2xl">{video.title || "Novo vídeo"}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-[1fr_180px]">
              <Field label="Título" name={`video.${video.id}.title`} value={video.title} maxLength={140} onChange={(title) => update(video.id, { title })} />
              <Field label="Tipo" name={`video.${video.id}.context`} value={video.context} maxLength={40} placeholder="Clipe, ensaio, show" onChange={(context) => update(video.id, { context })} />
            </div>
            <div className="grid gap-2">
              <Field
                label="Link do YouTube"
                name={`video.${video.id}.youtube`}
                value={video.youtube}
                maxLength={300}
                placeholder="https://www.youtube.com/watch?v=..."
                onChange={(youtube) => update(video.id, { youtube })}
              />
              {video.youtube.trim() && !recognized ? <p className="text-sm text-brass">Não reconheci esse link. Cole o endereço do YouTube.</p> : null}
              {recognized ? <p className="text-sm text-bone-dim">Vídeo reconhecido.</p> : null}
            </div>
            <Field label="Texto da capa" name={`video.${video.id}.thumbnailAlt`} value={video.thumbnailAlt} maxLength={400} onChange={(thumbnailAlt) => update(video.id, { thumbnailAlt })} />
            <div className="flex flex-wrap items-center gap-4">
              <FileButton label="Capa" accept={imageAccept} name={`video.${video.id}.thumbnail`} disabled={uploading} onPick={(file) => void pick(file, (thumbnail) => update(video.id, { thumbnail }))} />
              <FileButton label="Arquivo de vídeo" accept={videoAccept} name={`video.${video.id}.file`} disabled={uploading} onPick={(file) => void pick(file, (fileUrl) => update(video.id, { file: fileUrl }))} />
              <span className="text-sm text-bone-dim">{fileLabel(video.file)}</span>
              {video.file ? <TextButton onClick={() => update(video.id, { file: "" })}>Tirar arquivo</TextButton> : null}
            </div>
            <div className="flex flex-wrap gap-4">
              <TextButton disabled={index === 0} onClick={() => edit((current) => ({ ...current, videos: move(current.videos, index, -1) }))}>
                Subir
              </TextButton>
              <TextButton disabled={index === draft.videos.length - 1} onClick={() => edit((current) => ({ ...current, videos: move(current.videos, index, 1) }))}>
                Descer
              </TextButton>
              <TextButton onClick={() => edit((current) => ({ ...current, videos: current.videos.filter((item) => item.id !== video.id) }))}>Remover</TextButton>
            </div>
          </article>
        );
      })}
      <button
        type="button"
        className="justify-self-start border border-brass px-4 py-3 text-sm tracking-[0.14em] text-brass"
        onClick={() =>
          edit((current) => ({
            ...current,
            videos: [
              ...current.videos,
              { id: nid("video"), title: "Novo vídeo", context: "Clipe", youtube: "", thumbnail: "", thumbnailAlt: "", file: "" },
            ],
          }))
        }
      >
        Adicionar vídeo
      </button>
    </Block>
  );
}

export function AdminPanel({ onViewSite }: { onViewSite: () => void }) {
  const { dirty, saving, uploading, notice, save } = useSite();
  const [tab, setTab] = useState<TabId>("textos");
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  function leave(event: MouseEvent<HTMLAnchorElement>) {
    if (dirty && !window.confirm("Há mudanças que ainda não foram salvas. Ver o site mesmo assim?")) {
      event.preventDefault();
      return;
    }
    onViewSite();
  }

  return (
    <div className="fixed inset-0 z-[50] overflow-y-auto bg-black text-bone">
      <div className="mx-auto max-w-5xl px-5 pt-10 pb-36 md:px-10">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.22em] text-brass">PAINEL</p>
            <h1 ref={heading} tabIndex={-1} className="mt-2 font-display text-5xl tracking-tight outline-none md:text-6xl">
              Editar a B'ritt
            </h1>
            <p className="mt-4 max-w-[48ch] text-bone-dim">
              Troque fotos e textos, e acrescente músicas e vídeos. Salvar grava no projeto enquanto esta página está aberta no computador.
            </p>
          </div>
          <a href="#palco" onClick={leave} className="text-sm tracking-[0.14em] text-brass">
            Ver o site
          </a>
        </header>
        <div role="tablist" aria-label="Partes do site" className="mt-10 flex gap-6 overflow-x-auto border-b border-bone/15">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`aba-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`painel-${item.id}`}
              className={`shrink-0 border-b-2 py-3 text-sm tracking-[0.14em] ${tab === item.id ? "border-brass text-bone" : "border-transparent text-bone-dim"}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`painel-${tab}`} aria-labelledby={`aba-${tab}`} className="mt-2">
          {tab === "textos" ? <TextosTab /> : null}
          {tab === "fotos" ? <FotosTab /> : null}
          {tab === "musicas" ? <MusicasTab /> : null}
          {tab === "videos" ? <VideosTab /> : null}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-[52] border-t border-bone/15 bg-black/95 px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p data-status={notice?.tone ?? (dirty ? "dirty" : "clean")} className={notice?.tone === "err" ? "text-sm text-brass" : "text-sm text-bone-dim"} aria-live="polite">
            {notice?.text ?? (dirty ? "Há mudanças por salvar." : "Nada por salvar.")}
          </p>
          <button
            type="button"
            data-field="save"
            disabled={saving || uploading || !dirty}
            className="inline-flex bg-brass px-6 py-3 text-sm tracking-[0.16em] text-ink disabled:opacity-40"
            onClick={() => void save()}
          >
            {saving ? "Salvando" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
