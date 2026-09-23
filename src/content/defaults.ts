import raw from "./site.json" with { type: "json" };
import type { MemberId, SiteContent } from "./types";
import { memberIds } from "./types";

function member(id: MemberId) {
  const found = raw.members.find((item) => item.id === id);
  if (!found) throw new Error(`Integrante ausente no conteúdo inicial: ${id}`);
  return {
    id,
    name: found.name,
    roles: [...found.roles],
    instrument: found.instrument,
    image: found.image,
    imageAlt: found.imageAlt,
  };
}

export const defaultContent: SiteContent = {
  brand: { ...raw.brand },
  band: { ...raw.band },
  hero: { ...raw.hero },
  copy: { ...raw.copy },
  members: memberIds.map(member),
  gallery: raw.gallery.map((item) => ({ ...item })),
  tracks: raw.tracks.map((item) => ({ ...item })),
  videos: raw.videos.map((item) => ({ ...item })),
  social: { ...raw.social },
};
