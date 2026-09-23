const idPattern = /^[a-zA-Z0-9_-]{11}$/;

export function youtubeId(input: string): string {
  const value = input.trim();
  if (!value) return "";
  if (idPattern.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      return idPattern.test(id) ? id : "";
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
      const watch = url.searchParams.get("v");
      if (watch && idPattern.test(watch)) return watch;
      const parts = url.pathname.split("/").filter(Boolean);
      const marker = parts.findIndex((part) => part === "embed" || part === "shorts" || part === "live" || part === "v");
      const id = marker >= 0 ? (parts[marker + 1] ?? "") : "";
      return idPattern.test(id) ? id : "";
    }
  } catch {
    return "";
  }

  return "";
}
