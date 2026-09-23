export type VideoItem = {
  id: string;
  title: string;
  context: string;
  youtubeId: string;
  thumbnail: string;
  thumbnailAlt: string;
  placeholder: true;
};

export const videos: VideoItem[] = [
  {
    id: "video-1",
    title: "[Substituir] Título do vídeo",
    context: "Clipe",
    youtubeId: "",
    thumbnail: "/images/band/room-side.jpg",
    thumbnailAlt: "Imagem provisória de ensaio, usada no lugar da capa do vídeo.",
    placeholder: true,
  },
  {
    id: "video-2",
    title: "[Substituir] Título do vídeo",
    context: "Apresentação",
    youtubeId: "",
    thumbnail: "/images/band/room.jpg",
    thumbnailAlt: "Imagem provisória do quarto, usada no lugar da capa do vídeo.",
    placeholder: true,
  },
  {
    id: "video-3",
    title: "[Substituir] Título do vídeo",
    context: "Ensaio",
    youtubeId: "",
    thumbnail: "/images/band/drums.jpg",
    thumbnailAlt: "Imagem provisória da bateria, usada no lugar da capa do vídeo.",
    placeholder: true,
  },
  {
    id: "video-4",
    title: "[Substituir] Título do vídeo",
    context: "Bastidores",
    youtubeId: "",
    thumbnail: "/images/band/cables.jpg",
    thumbnailAlt: "Imagem provisória de cabos, usada no lugar da capa do vídeo.",
    placeholder: true,
  },
];
