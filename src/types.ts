export type SiteSettings = {
  schoolName: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  affiliationNote?: string;
  heroImageUrl?: string;

  /** Homepage hero (Mini Minds–style layered headline + CTAs) */
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSubline?: string;
  heroCta1Label?: string;
  heroCta1Href?: string;
  heroCta2Label?: string;
  heroCta2Href?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;

  trustPill1?: string;
  trustPill2?: string;
  trustPill3?: string;
  trustPill4?: string;

  recognitionEyebrow?: string;
  recognitionTitle?: string;
  recognitionQuote?: string;

  narrativeTitle?: string;
  narrativeBody?: string;

  whyEyebrow?: string;
  whyTitle?: string;
  whyIntro?: string;

  programsEyebrow?: string;
  programsTitle?: string;

  spaceEyebrow?: string;
  spaceTitle?: string;
  spaceIntro?: string;

  galleryEyebrow?: string;
  galleryTitle?: string;

  videosEyebrow?: string;
  videosTitle?: string;
  videosIntro?: string;

  parentsEyebrow?: string;
  parentsTitle?: string;
  parentsFootnote?: string;

  faqEyebrow?: string;
  faqTitle?: string;
  faqIntro?: string;

  ctaBandTitle?: string;
  ctaBandBody?: string;
  ctaBandBtn1?: string;
  ctaBandLink1?: string;
  ctaBandBtn2?: string;
  ctaBandLink2?: string;

  footerCol1Title?: string;
  footerCol1Body?: string;

  /** Header menu + section visibility toggles */
  menuShowWhy?: boolean;
  menuShowPrograms?: boolean;
  menuShowGallery?: boolean;
  menuShowCampus?: boolean;
  menuShowVideos?: boolean;
  menuShowLeadership?: boolean;
  menuShowFaq?: boolean;
};

/** Homepage photo blocks (gallery strips) — Admin → Sections */
export type HomeSection = {
  id: string;
  title: string;
  description: string;
  order: number;
  images: string[];
};

export type WhyPillar = { id: string; title: string; body: string; order: number };
export type ProgramCard = {
  id: string;
  title: string;
  metaLine: string;
  description: string;
  href: string;
  order: number;
};
export type CampusSpot = { id: string; title: string; body: string; order: number };
export type FaqItem = { id: string; question: string; answer: string; order: number };

export type VideoCategory = {
  id: string;
  name: string;
  order: number;
};

export type VideoItem = {
  id: string;
  categoryId: string;
  youtubeVideoId: string;
  title: string;
  order: number;
};

export type ManagementMember = {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  testimonial: string;
  order: number;
};
