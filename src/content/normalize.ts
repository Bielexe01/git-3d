import { defaultContent } from "./defaults";
import { isLocalAsset } from "./links";
import type { GalleryItem, Member, MemberId, SiteContent, Track, VideoItem } from "./types";
import { memberIds } from "./types";

const ratios = new Set(["16/9", "4/3", "3/2", "1/1", "2/3", "3/4"]);

function record(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) return value as Record<string, unknown>;
  return null;
}

function text(value: unknown, fallback: string, max: number): string {
  if (typeof value !== "string") return fallback;
  const clean = value.replaceAll("\0", "");
  return clean.length > max ? clean.slice(0, max) : clean;
}

function media(value: unknown, fallback: string, allowEmpty: boolean): string {
  if (typeof value !== "string") return fallback;
  const clean = value.trim();
  if (!clean) return allowEmpty ? "" : fallback;
  if (isLocalAsset(clean) || /^https?:\/\/\S+$/i.test(clean)) return clean;
  return fallback;
}

function tiltOf(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(3, Math.max(-3, Math.round(value * 10) / 10));
}

function rolesOf(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.replaceAll("\0", "").trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 8);
}

function itemId(value: unknown, fallback: string): string {
  if (typeof value === "string" && /^[a-z0-9-]{1,48}$/.test(value)) return value;
  return fallback;
}

function member(id: MemberId, source: unknown): Member {
  const base = defaultContent.members.find((item) => item.id === id) ?? defaultContent.members[0];
  const row = record(source);
  return {
    id,
    name: text(row?.name, base.name, 80),
    roles: rolesOf(row?.roles, base.roles),
    instrument: text(row?.instrument, base.instrument, 80),
    image: media(row?.image, base.image, false),
    imageAlt: text(row?.imageAlt, base.imageAlt, 400),
  };
}

function galleryItem(source: unknown, index: number): GalleryItem | null {
  const row = record(source);
  if (!row) return null;
  const src = media(row.src, "", true);
  if (!src) return null;
  const ratio = typeof row.ratio === "string" && ratios.has(row.ratio) ? row.ratio : "4/3";
  return {
    id: itemId(row.id, `foto-${index + 1}`),
    src,
    alt: text(row.alt, "", 400),
    ratio,
    tilt: tiltOf(row.tilt, 0),
  };
}

function track(source: unknown, index: number): Track | null {
  const row = record(source);
  if (!row) return null;
  return {
    id: itemId(row.id, `faixa-${index + 1}`),
    title: text(row.title, "", 140),
    duration: text(row.duration, "", 16),
    cover: media(row.cover, "", true),
    coverAlt: text(row.coverAlt, "", 400),
    url: text(row.url, "", 500).trim(),
    audio: media(row.audio, "", true),
  };
}

function video(source: unknown, index: number): VideoItem | null {
  const row = record(source);
  if (!row) return null;
  return {
    id: itemId(row.id, `video-${index + 1}`),
    title: text(row.title, "", 140),
    context: text(row.context, "", 40),
    youtube: text(row.youtube, "", 300).trim(),
    thumbnail: media(row.thumbnail, "", true),
    thumbnailAlt: text(row.thumbnailAlt, "", 400),
    file: media(row.file, "", true),
  };
}

function unique<T extends { id: string }>(items: T[], prefix: string): T[] {
  const seen = new Set<string>();
  return items.map((item, index) => {
    let id = item.id;
    if (seen.has(id)) id = `${prefix}-${index + 1}-${id}`.slice(0, 48);
    seen.add(id);
    return { ...item, id };
  });
}

export function normalize(input: unknown): SiteContent {
  const row = record(input);
  const brand = record(row?.brand);
  const band = record(row?.band);
  const hero = record(row?.hero);
  const copy = record(row?.copy);
  const social = record(row?.social);
  const members = Array.isArray(row?.members) ? row.members : [];

  return {
    brand: {
      logo: media(brand?.logo, defaultContent.brand.logo, false),
      logoAlt: text(brand?.logoAlt, defaultContent.brand.logoAlt, 80),
    },
    band: {
      name: text(band?.name, defaultContent.band.name, 80),
      description: text(band?.description, defaultContent.band.description, 2000),
      location: text(band?.location, defaultContent.band.location, 80),
      style: text(band?.style, defaultContent.band.style, 80),
    },
    hero: {
      tagline: text(hero?.tagline, defaultContent.hero.tagline, 180),
      cta: text(hero?.cta, defaultContent.hero.cta, 40),
      image: media(hero?.image, defaultContent.hero.image, false),
      imageAlt: text(hero?.imageAlt, defaultContent.hero.imageAlt, 400),
    },
    copy: {
      membersTitle: text(copy?.membersTitle, defaultContent.copy.membersTitle, 120),
      membersIntro: text(copy?.membersIntro, defaultContent.copy.membersIntro, 800),
      galleryTitle: text(copy?.galleryTitle, defaultContent.copy.galleryTitle, 120),
      galleryIntro: text(copy?.galleryIntro, defaultContent.copy.galleryIntro, 800),
      videosTitle: text(copy?.videosTitle, defaultContent.copy.videosTitle, 120),
      videosIntro: text(copy?.videosIntro, defaultContent.copy.videosIntro, 800),
      musicTitle: text(copy?.musicTitle, defaultContent.copy.musicTitle, 120),
      musicIntro: text(copy?.musicIntro, defaultContent.copy.musicIntro, 800),
      playTitle: text(copy?.playTitle, defaultContent.copy.playTitle, 120),
      playIntro: text(copy?.playIntro, defaultContent.copy.playIntro, 800),
      socialTitle: text(copy?.socialTitle, defaultContent.copy.socialTitle, 120),
    },
    members: memberIds.map((id) => member(id, members.find((item) => record(item)?.id === id))),
    gallery: unique(
      (Array.isArray(row?.gallery) ? row.gallery : []).slice(0, 60).map(galleryItem).filter((item): item is GalleryItem => item !== null),
      "foto",
    ),
    tracks: unique(
      (Array.isArray(row?.tracks) ? row.tracks : []).slice(0, 40).map(track).filter((item): item is Track => item !== null),
      "faixa",
    ),
    videos: unique(
      (Array.isArray(row?.videos) ? row.videos : []).slice(0, 40).map(video).filter((item): item is VideoItem => item !== null),
      "video",
    ),
    social: {
      spotify: text(social?.spotify, "", 500).trim(),
      youtube: text(social?.youtube, "", 500).trim(),
      instagram: text(social?.instagram, "", 500).trim(),
      tiktok: text(social?.tiktok, "", 500).trim(),
    },
  };
}
