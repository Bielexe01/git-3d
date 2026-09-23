import type { IncomingMessage, ServerResponse } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin, PreviewServer, ViteDevServer } from "vite";

const contentMax = 2_000_000;
const uploadMax = 80 * 1024 * 1024;
const memberIds = ["vitin", "will", "hiagolas", "biel"] as const;
const ratios = new Set(["16/9", "4/3", "3/2", "1/1", "2/3", "3/4"]);
const copyKeys = [
  "membersTitle",
  "membersIntro",
  "galleryTitle",
  "galleryIntro",
  "videosTitle",
  "videosIntro",
  "musicTitle",
  "musicIntro",
  "playTitle",
  "playIntro",
  "socialTitle",
] as const;

const alias: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "audio/mp3": "audio/mpeg",
  "audio/x-wav": "audio/wav",
  "audio/wave": "audio/wav",
  "audio/x-m4a": "audio/mp4",
  "audio/m4a": "audio/mp4",
};

const byExt: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

const extensionOf: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "audio/mp4": ".m4a",
  "audio/ogg": ".ogg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

const byteLimit: Record<string, number> = {
  "image/jpeg": 12 * 1024 * 1024,
  "image/png": 12 * 1024 * 1024,
  "image/webp": 12 * 1024 * 1024,
  "image/gif": 12 * 1024 * 1024,
  "audio/mpeg": 40 * 1024 * 1024,
  "audio/wav": 40 * 1024 * 1024,
  "audio/mp4": 40 * 1024 * 1024,
  "audio/ogg": 40 * 1024 * 1024,
  "video/mp4": uploadMax,
  "video/webm": uploadMax,
  "video/quicktime": uploadMax,
};

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function statusOf(error: unknown) {
  if (typeof error === "object" && error !== null && "status" in error && typeof error.status === "number") return error.status;
  return 500;
}

function send(res: ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

function assertLocal(req: IncomingMessage) {
  const ip = req.socket.remoteAddress ?? "";
  if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") return;
  throw httpError(403, "O painel só grava neste computador.");
}

function header(req: IncomingMessage, name: string) {
  const value = req.headers[name];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

async function readBody(req: IncomingMessage, limit: number) {
  const declared = Number(header(req, "content-length"));
  if (Number.isFinite(declared) && declared > limit) throw httpError(413, "Arquivo grande demais.");
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > limit) {
      req.destroy();
      throw httpError(413, "Arquivo grande demais.");
    }
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}

function record(value: unknown, label: string) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw httpError(400, `${label} está incompleto.`);
  return value as Record<string, unknown>;
}

function text(value: unknown, max: number) {
  if (value == null) return "";
  if (typeof value !== "string" || value.includes("\0") || value.length > max) throw httpError(400, "Há um texto longo ou inválido.");
  return value;
}

function localOrRemote(value: unknown, allowEmpty: boolean) {
  const raw = text(value, 500).trim();
  if (!raw) {
    if (allowEmpty) return "";
    throw httpError(400, "Falta uma foto obrigatória.");
  }
  const local = raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("..") && !raw.includes("\\") && !raw.includes(":");
  if (local || /^https?:\/\/\S+$/i.test(raw)) return raw;
  throw httpError(400, "Use um arquivo enviado pelo painel ou um link http(s).");
}

function looseText(value: unknown, max: number) {
  const raw = text(value, max).trim();
  if (/^(javascript|data):/i.test(raw)) throw httpError(400, "Link inválido.");
  return raw;
}

function itemId(value: unknown) {
  if (typeof value !== "string" || !/^[a-z0-9-]{1,48}$/.test(value)) throw httpError(400, "Identificador inválido.");
  return value;
}

function roles(value: unknown) {
  if (!Array.isArray(value) || value.length > 8) throw httpError(400, "Funções inválidas.");
  return value.map((item) => text(item, 80).trim()).filter(Boolean);
}

function numberIn(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < -3 || value > 3) return 0;
  return Math.round(value * 10) / 10;
}

function uniqueIds(ids: string[]) {
  if (new Set(ids).size !== ids.length) throw httpError(400, "Há itens repetidos na lista.");
}

function sanitize(input: unknown) {
  const row = record(input, "Conteúdo");
  const brand = record(row.brand, "Logo");
  const band = record(row.band, "Banda");
  const hero = record(row.hero, "Abertura");
  const copy = record(row.copy, "Textos");
  const social = record(row.social, "Links");
  if (!Array.isArray(row.members) || !Array.isArray(row.gallery) || !Array.isArray(row.tracks) || !Array.isArray(row.videos)) {
    throw httpError(400, "As listas do site estão incompletas.");
  }
  if (row.gallery.length > 60 || row.tracks.length > 40 || row.videos.length > 40) throw httpError(400, "Lista longa demais.");

  const members = memberIds.map((id) => {
    const found = row.members.find((item) => record(item, "Integrante").id === id);
    const member = record(found, `Integrante ${id}`);
    return {
      id,
      name: text(member.name, 80),
      roles: roles(member.roles),
      instrument: text(member.instrument, 80),
      image: localOrRemote(member.image, false),
      imageAlt: text(member.imageAlt, 400),
    };
  });

  const gallery = row.gallery.map((item) => {
    const photo = record(item, "Foto");
    const ratio = photo.ratio;
    if (typeof ratio !== "string" || !ratios.has(ratio)) throw httpError(400, "Proporção de foto inválida.");
    return {
      id: itemId(photo.id),
      src: localOrRemote(photo.src, false),
      alt: text(photo.alt, 400),
      ratio,
      tilt: numberIn(photo.tilt),
    };
  });

  const tracks = row.tracks.map((item) => {
    const track = record(item, "Música");
    return {
      id: itemId(track.id),
      title: text(track.title, 140),
      duration: text(track.duration, 16),
      cover: localOrRemote(track.cover, true),
      coverAlt: text(track.coverAlt, 400),
      url: looseText(track.url, 500),
      audio: localOrRemote(track.audio, true),
    };
  });

  const videos = row.videos.map((item) => {
    const video = record(item, "Vídeo");
    return {
      id: itemId(video.id),
      title: text(video.title, 140),
      context: text(video.context, 40),
      youtube: looseText(video.youtube, 300),
      thumbnail: localOrRemote(video.thumbnail, true),
      thumbnailAlt: text(video.thumbnailAlt, 400),
      file: localOrRemote(video.file, true),
    };
  });

  uniqueIds(gallery.map((item) => item.id));
  uniqueIds(tracks.map((item) => item.id));
  uniqueIds(videos.map((item) => item.id));

  const copyOut = Object.fromEntries(copyKeys.map((key) => [key, text(copy[key], key.endsWith("Intro") ? 800 : 120)])) as Record<(typeof copyKeys)[number], string>;

  return {
    brand: {
      logo: localOrRemote(brand.logo, false),
      logoAlt: text(brand.logoAlt, 80),
    },
    band: {
      name: text(band.name, 80),
      description: text(band.description, 2000),
      location: text(band.location, 80),
      style: text(band.style, 80),
    },
    hero: {
      tagline: text(hero.tagline, 180),
      cta: text(hero.cta, 40),
      image: localOrRemote(hero.image, false),
      imageAlt: text(hero.imageAlt, 400),
    },
    copy: copyOut,
    members,
    gallery,
    tracks,
    videos,
    social: {
      spotify: looseText(social.spotify, 500),
      youtube: looseText(social.youtube, 500),
      instagram: looseText(social.instagram, 500),
      tiktok: looseText(social.tiktok, 500),
    },
  };
}

function looksLike(buf: Buffer, mime: string) {
  if (mime === "image/jpeg") return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (mime === "image/png") return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === "image/gif") {
    const mark = buf.subarray(0, 6).toString("ascii");
    return mark === "GIF87a" || mark === "GIF89a";
  }
  if (mime === "image/webp") return buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
  if (mime === "audio/wav") return buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WAVE";
  if (mime === "audio/mpeg") return buf.length >= 3 && ((buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0));
  if (mime === "audio/ogg") return buf.subarray(0, 4).toString("ascii") === "OggS";
  if (mime === "video/webm") return buf.length >= 4 && buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3;
  if (mime === "video/mp4" || mime === "video/quicktime" || mime === "audio/mp4") return buf.length >= 12 && buf.subarray(4, 8).toString("ascii") === "ftyp";
  return false;
}

function resolveMime(headerType: string, filename: string) {
  const raw = headerType.split(";")[0].trim().toLowerCase();
  const named = alias[raw] ?? raw;
  if (byteLimit[named]) return named;
  return byExt[path.extname(filename).toLowerCase()] ?? "";
}

function safeFilename(original: string, ext: string) {
  const stem = path
    .basename(original)
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "arquivo";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${stem}${ext}`;
}

function isInside(parent: string, target: string) {
  const root = path.resolve(parent);
  const file = path.resolve(target);
  const rel = path.relative(root, file);
  return rel.length > 0 && !rel.startsWith("..") && !path.isAbsolute(rel);
}

export function brittContent(): Plugin {
  let publicDir = "";

  async function route(req: IncomingMessage, res: ServerResponse, pathname: string) {
    if (!publicDir) throw httpError(500, "Pasta pública indisponível.");
    const contentFile = path.join(publicDir, "content", "site.json");

    if (pathname === "/api/content" && req.method === "GET") {
      const json = await readFile(contentFile, "utf8");
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(json);
      return;
    }

    assertLocal(req);

    if (pathname === "/api/content" && req.method === "PUT") {
      const raw = await readBody(req, contentMax);
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw.toString("utf8"));
      } catch {
        throw httpError(400, "O conteúdo enviado não é válido.");
      }
      const clean = sanitize(parsed);
      await mkdir(path.dirname(contentFile), { recursive: true });
      await writeFile(contentFile, `${JSON.stringify(clean, null, 2)}\n`, "utf8");
      send(res, 200, clean);
      return;
    }

    if (pathname === "/api/upload" && req.method === "POST") {
      const encoded = header(req, "x-filename");
      if (encoded.length > 400) throw httpError(400, "Nome de arquivo inválido.");
      let original = "arquivo";
      try {
        original = decodeURIComponent(encoded || "arquivo");
      } catch {
        throw httpError(400, "Nome de arquivo inválido.");
      }
      const mime = resolveMime(header(req, "content-type"), original);
      const limit = byteLimit[mime];
      if (!mime || !limit) throw httpError(415, "Envie JPG, PNG, WebP, GIF, MP3, WAV, M4A, OGG, MP4, WebM ou MOV.");
      const bytes = await readBody(req, limit);
      if (!looksLike(bytes, mime)) throw httpError(415, "Não consegui ler esse arquivo. Exporte de novo e tente outra vez.");
      const name = safeFilename(original, extensionOf[mime]);
      const dir = path.join(publicDir, "uploads");
      const target = path.join(dir, name);
      if (!isInside(dir, target)) throw httpError(400, "Nome de arquivo inválido.");
      await mkdir(dir, { recursive: true });
      await writeFile(target, bytes);
      send(res, 200, { url: `/uploads/${name}` });
      return;
    }

    throw httpError(405, "Método não aceito.");
  }

  const attach = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((req, res, next) => {
      const pathname = (req.url ?? "").split("?")[0];
      if (pathname !== "/api/content" && pathname !== "/api/upload") {
        next();
        return;
      }
      void route(req, res, pathname).catch((error) => {
        if (res.headersSent) return;
        const message = error instanceof Error ? error.message : "Erro interno.";
        send(res, statusOf(error), { error: message });
      });
    });
  };

  return {
    name: "britt-content",
    configResolved(config) {
      if (typeof config.publicDir === "string") publicDir = config.publicDir;
    },
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
