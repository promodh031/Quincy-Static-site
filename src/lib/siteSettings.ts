import type { SiteSettings } from "../types";

export const DEFAULT_SETTINGS: SiteSettings = {
  schoolName: "Your School Name",
  tagline: "Nurturing young minds with care, curiosity, and strong foundations.",
  contactPhone: "+91 — — — — —",
  contactEmail: "office@school.edu.in",
  address: "City, State, India",
  affiliationNote: "",
  heroImageUrl: "",
  menuShowWhy: true,
  menuShowPrograms: true,
  menuShowGallery: true,
  menuShowCampus: true,
  menuShowVideos: true,
  menuShowLeadership: true,
  menuShowFaq: true,
};

function optStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

function optBool(v: unknown, fallback: boolean): boolean {
  if (typeof v === "boolean") return v;
  return fallback;
}

/** Merge Firestore `siteSettings/main` into a full `SiteSettings` for UI. */
export function mergeSiteSettings(d: Partial<SiteSettings> & Record<string, unknown> | undefined): SiteSettings {
  return {
    ...DEFAULT_SETTINGS,
    schoolName: optStr(d?.schoolName) ?? DEFAULT_SETTINGS.schoolName,
    tagline: optStr(d?.tagline) ?? DEFAULT_SETTINGS.tagline,
    contactPhone: optStr(d?.contactPhone) ?? DEFAULT_SETTINGS.contactPhone,
    contactEmail: optStr(d?.contactEmail) ?? DEFAULT_SETTINGS.contactEmail,
    address: optStr(d?.address) ?? DEFAULT_SETTINGS.address,
    affiliationNote: optStr(d?.affiliationNote),
    heroImageUrl: optStr(d?.heroImageUrl) ?? "",

    heroEyebrow: optStr(d?.heroEyebrow),
    heroHeadline: optStr(d?.heroHeadline),
    heroSubline: optStr(d?.heroSubline),
    heroCta1Label: optStr(d?.heroCta1Label),
    heroCta1Href: optStr(d?.heroCta1Href),
    heroCta2Label: optStr(d?.heroCta2Label),
    heroCta2Href: optStr(d?.heroCta2Href),
    instagramUrl: optStr(d?.instagramUrl),
    facebookUrl: optStr(d?.facebookUrl),
    youtubeUrl: optStr(d?.youtubeUrl),

    trustPill1: optStr(d?.trustPill1),
    trustPill2: optStr(d?.trustPill2),
    trustPill3: optStr(d?.trustPill3),
    trustPill4: optStr(d?.trustPill4),

    recognitionEyebrow: optStr(d?.recognitionEyebrow),
    recognitionTitle: optStr(d?.recognitionTitle),
    recognitionQuote: optStr(d?.recognitionQuote),

    narrativeTitle: optStr(d?.narrativeTitle),
    narrativeBody: optStr(d?.narrativeBody),

    whyEyebrow: optStr(d?.whyEyebrow),
    whyTitle: optStr(d?.whyTitle),
    whyIntro: optStr(d?.whyIntro),

    programsEyebrow: optStr(d?.programsEyebrow),
    programsTitle: optStr(d?.programsTitle),

    spaceEyebrow: optStr(d?.spaceEyebrow),
    spaceTitle: optStr(d?.spaceTitle),
    spaceIntro: optStr(d?.spaceIntro),

    galleryEyebrow: optStr(d?.galleryEyebrow),
    galleryTitle: optStr(d?.galleryTitle),

    videosEyebrow: optStr(d?.videosEyebrow),
    videosTitle: optStr(d?.videosTitle),
    videosIntro: optStr(d?.videosIntro),

    parentsEyebrow: optStr(d?.parentsEyebrow),
    parentsTitle: optStr(d?.parentsTitle),
    parentsFootnote: optStr(d?.parentsFootnote),

    faqEyebrow: optStr(d?.faqEyebrow),
    faqTitle: optStr(d?.faqTitle),
    faqIntro: optStr(d?.faqIntro),

    ctaBandTitle: optStr(d?.ctaBandTitle),
    ctaBandBody: optStr(d?.ctaBandBody),
    ctaBandBtn1: optStr(d?.ctaBandBtn1),
    ctaBandLink1: optStr(d?.ctaBandLink1),
    ctaBandBtn2: optStr(d?.ctaBandBtn2),
    ctaBandLink2: optStr(d?.ctaBandLink2),

    footerCol1Title: optStr(d?.footerCol1Title),
    footerCol1Body: optStr(d?.footerCol1Body),
    menuShowWhy: optBool(d?.menuShowWhy, DEFAULT_SETTINGS.menuShowWhy ?? true),
    menuShowPrograms: optBool(d?.menuShowPrograms, DEFAULT_SETTINGS.menuShowPrograms ?? true),
    menuShowGallery: optBool(d?.menuShowGallery, DEFAULT_SETTINGS.menuShowGallery ?? true),
    menuShowCampus: optBool(d?.menuShowCampus, DEFAULT_SETTINGS.menuShowCampus ?? true),
    menuShowVideos: optBool(d?.menuShowVideos, DEFAULT_SETTINGS.menuShowVideos ?? true),
    menuShowLeadership: optBool(d?.menuShowLeadership, DEFAULT_SETTINGS.menuShowLeadership ?? true),
    menuShowFaq: optBool(d?.menuShowFaq, DEFAULT_SETTINGS.menuShowFaq ?? true),
  };
}
