export type MemberId = "vitin" | "will" | "hiagolas" | "biel";

export type Member = {
  id: MemberId;
  name: string;
  roles: string[];
  instrument: string;
  image: string;
  imageAlt: string;
};

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  ratio: string;
  tilt: number;
};

export type Track = {
  id: string;
  title: string;
  duration: string;
  cover: string;
  coverAlt: string;
  url: string;
  audio: string;
};

export type VideoItem = {
  id: string;
  title: string;
  context: string;
  youtube: string;
  thumbnail: string;
  thumbnailAlt: string;
  file: string;
};

export type SiteContent = {
  brand: {
    logo: string;
    logoAlt: string;
  };
  band: {
    name: string;
    description: string;
    location: string;
    style: string;
  };
  hero: {
    tagline: string;
    cta: string;
    image: string;
    imageAlt: string;
  };
  copy: {
    membersTitle: string;
    membersIntro: string;
    galleryTitle: string;
    galleryIntro: string;
    videosTitle: string;
    videosIntro: string;
    musicTitle: string;
    musicIntro: string;
    playTitle: string;
    playIntro: string;
    socialTitle: string;
  };
  members: Member[];
  gallery: GalleryItem[];
  tracks: Track[];
  videos: VideoItem[];
  social: {
    spotify: string;
    youtube: string;
    instagram: string;
    tiktok: string;
  };
};

export const memberIds: MemberId[] = ["vitin", "will", "hiagolas", "biel"];
