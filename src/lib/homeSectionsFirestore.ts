import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import type { HomeSection } from "../types";

function normalizeImages(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((u) => (typeof u === "string" ? u.trim() : ""))
      .filter((s) => s.includes("://") && !s.includes(" "));
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const keys = Object.keys(o).filter((k) => /^\d+$/.test(k));
    if (keys.length)
      return keys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => String(o[k]).trim())
        .filter((s) => s.includes("://") && !s.includes(" "));
  }
  return [];
}

/** Read `images` from Firestore (array or legacy map) into URL strings. */
export function parseImagesFromRaw(raw: unknown): string[] {
  return normalizeImages(raw);
}

export function homeSectionFromDoc(d: QueryDocumentSnapshot<DocumentData>): HomeSection {
  const x = d.data();
  const images = normalizeImages(x.images);
  return {
    id: d.id,
    title: String(x.title ?? ""),
    description: String(x.description ?? ""),
    order: typeof x.order === "number" ? x.order : Number(x.order ?? 0) || 0,
    images,
  };
}

export function sortHomeSections(rows: HomeSection[]): HomeSection[] {
  return [...rows].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.id.localeCompare(b.id);
  });
}
