export function isLocalAsset(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("..") && !value.includes("\\") && !value.includes(":");
}

export function safeHref(value: string): string {
  const href = value.trim();
  return /^https?:\/\/\S+$/i.test(href) ? href : "";
}

export function safeMedia(value: string): string {
  const media = value.trim();
  if (!media) return "";
  if (isLocalAsset(media)) return media;
  return /^https?:\/\/\S+$/i.test(media) ? media : "";
}
