export type Track = {
  id: string;
  title: string;
  duration: string;
  cover: string;
  coverAlt: string;
  spotifyUrl: string;
  placeholder: true;
};

export const tracks: Track[] = [
  {
    id: "track-1",
    title: "[Substituir] Título da faixa",
    duration: "--:--",
    cover: "/images/band/cymbal.jpg",
    coverAlt: "Imagem provisória de capa.",
    spotifyUrl: "",
    placeholder: true,
  },
  {
    id: "track-2",
    title: "[Substituir] Título da faixa",
    duration: "--:--",
    cover: "/images/band/pedals.jpg",
    coverAlt: "Imagem provisória de capa.",
    spotifyUrl: "",
    placeholder: true,
  },
  {
    id: "track-3",
    title: "[Substituir] Título da faixa",
    duration: "--:--",
    cover: "/images/band/amp.jpg",
    coverAlt: "Imagem provisória de capa.",
    spotifyUrl: "",
    placeholder: true,
  },
];
