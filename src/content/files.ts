export const imageAccept = ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";
export const audioAccept = ".mp3,.wav,.m4a,.ogg,audio/mpeg,audio/wav,audio/mp4,audio/ogg";
export const videoAccept = ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime";

const imageMax = 12 * 1024 * 1024;
const audioMax = 40 * 1024 * 1024;
const videoMax = 80 * 1024 * 1024;

export function fileLimit(file: File): number {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (type.startsWith("video/") || /\.(mp4|webm|mov)$/.test(name)) return videoMax;
  if (type.startsWith("audio/") || /\.(mp3|wav|m4a|ogg)$/.test(name)) return audioMax;
  return imageMax;
}

export function fileTooBig(file: File): string {
  const limit = fileLimit(file);
  if (file.size <= limit) return "";
  return `Arquivo grande demais. O máximo é ${Math.round(limit / (1024 * 1024))} MB.`;
}
