export type Member = {
  id: "vitin" | "will" | "hiagolas" | "biel";
  name: string;
  roles: string[];
  instrument: string;
  image: string;
  imageAlt: string;
  placeholder: true;
};

export const members: Member[] = [
  {
    id: "vitin",
    name: "Vitin",
    roles: ["Compositor", "Guitarrista", "Vocalista"],
    instrument: "Guitarra + Voz",
    image: "/images/band/guitar-vitin.jpg",
    imageAlt: "Imagem provisória de uma guitarra clara em estúdio. Substituir pela foto de Vitin.",
    placeholder: true,
  },
  {
    id: "will",
    name: "Will",
    roles: ["Compositor", "Guitarrista", "Vocalista"],
    instrument: "Guitarra + Voz",
    image: "/images/band/guitar-will.jpg",
    imageAlt: "Imagem provisória de uma guitarra escura em estúdio. Substituir pela foto de Will.",
    placeholder: true,
  },
  {
    id: "hiagolas",
    name: "Hiagolas",
    roles: ["Baixista"],
    instrument: "Baixo",
    image: "/images/band/bass.jpg",
    imageAlt: "Imagem provisória de um baixo em estúdio. Substituir pela foto de Hiagolas.",
    placeholder: true,
  },
  {
    id: "biel",
    name: "Biel",
    roles: ["Baterista"],
    instrument: "Bateria",
    image: "/images/band/drums.jpg",
    imageAlt: "Imagem provisória de uma bateria em estúdio. Substituir pela foto de Biel.",
    placeholder: true,
  },
];
