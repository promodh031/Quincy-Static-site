import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { homeSectionFromDoc, sortHomeSections } from "../lib/homeSectionsFirestore";
import { sortByOrder } from "../lib/pageContentSort";
import { DEFAULT_SETTINGS, mergeSiteSettings } from "../lib/siteSettings";
import type {
  CampusSpot,
  FaqItem,
  HomeSection,
  ManagementMember,
  ProgramCard,
  SiteSettings,
  VideoCategory,
  VideoItem,
  WhyPillar,
} from "../types";

export { DEFAULT_SETTINGS } from "../lib/siteSettings";

export function usePublicContent() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [management, setManagement] = useState<ManagementMember[]>([]);
  const [whyPillars, setWhyPillars] = useState<WhyPillar[]>([]);
  const [programCards, setProgramCards] = useState<ProgramCard[]>([]);
  const [campusSpots, setCampusSpots] = useState<CampusSpot[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubs: Unsubscribe[] = [];
    let didResolveInitialSettings = false;

    unsubs.push(
      onSnapshot(
        doc(db, "siteSettings", "main"),
        (snap) => {
          if (snap.exists()) setSettings(mergeSiteSettings(snap.data() as Partial<SiteSettings>));
          else setSettings(DEFAULT_SETTINGS);
          if (!didResolveInitialSettings) {
            didResolveInitialSettings = true;
            setLoading(false);
          }
        },
        (e) => {
          setError(e.message);
          if (!didResolveInitialSettings) {
            didResolveInitialSettings = true;
            setLoading(false);
          }
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, "videoCategories"), orderBy("order", "asc")),
        (snap) => {
          setCategories(
            snap.docs.map((d) => {
              const x = d.data();
              return {
                id: d.id,
                name: String(x.name ?? "Untitled"),
                order: Number(x.order ?? 0),
              };
            })
          );
        },
        (e) => setError(e.message)
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, "homeSections"),
        (snap) => {
          const rows = snap.docs.map((d) => homeSectionFromDoc(d));
          setHomeSections(sortHomeSections(rows));
        },
        (e) => setError(`Sections: ${e.message}`)
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, "videos"), orderBy("order", "asc")),
        (snap) => {
          setVideos(
            snap.docs.map((d) => {
              const x = d.data();
              return {
                id: d.id,
                categoryId: String(x.categoryId ?? ""),
                youtubeVideoId: String(x.youtubeVideoId ?? ""),
                title: String(x.title ?? "Video"),
                order: Number(x.order ?? 0),
              };
            })
          );
        },
        (e) => setError(e.message)
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, "management"), orderBy("order", "asc")),
        (snap) => {
          setManagement(
            snap.docs.map((d) => {
              const x = d.data();
              return {
                id: d.id,
                name: String(x.name ?? ""),
                role: String(x.role ?? ""),
                photoUrl: String(x.photoUrl ?? ""),
                testimonial: String(x.testimonial ?? ""),
                order: Number(x.order ?? 0),
              };
            })
          );
        },
        (e) => setError(e.message)
      )
    );

    const mapWhy = (d: { id: string; data: () => Record<string, unknown> }): WhyPillar => {
      const x = d.data();
      return {
        id: d.id,
        title: String(x.title ?? ""),
        body: String(x.body ?? ""),
        order: Number(x.order ?? 0),
      };
    };
    unsubs.push(
      onSnapshot(
        collection(db, "whyPillars"),
        (snap) => setWhyPillars(sortByOrder(snap.docs.map(mapWhy))),
        (e) => setError(`Why pillars: ${e.message}`)
      )
    );

    const mapProg = (d: { id: string; data: () => Record<string, unknown> }): ProgramCard => {
      const x = d.data();
      return {
        id: d.id,
        title: String(x.title ?? ""),
        metaLine: String(x.metaLine ?? ""),
        description: String(x.description ?? ""),
        href: String(x.href ?? "#contact"),
        order: Number(x.order ?? 0),
      };
    };
    unsubs.push(
      onSnapshot(
        collection(db, "programCards"),
        (snap) => setProgramCards(sortByOrder(snap.docs.map(mapProg))),
        (e) => setError(`Programs: ${e.message}`)
      )
    );

    const mapSpot = (d: { id: string; data: () => Record<string, unknown> }): CampusSpot => {
      const x = d.data();
      return {
        id: d.id,
        title: String(x.title ?? ""),
        body: String(x.body ?? ""),
        order: Number(x.order ?? 0),
      };
    };
    unsubs.push(
      onSnapshot(
        collection(db, "campusSpots"),
        (snap) => setCampusSpots(sortByOrder(snap.docs.map(mapSpot))),
        (e) => setError(`Campus: ${e.message}`)
      )
    );

    const mapFaq = (d: { id: string; data: () => Record<string, unknown> }): FaqItem => {
      const x = d.data();
      return {
        id: d.id,
        question: String(x.question ?? ""),
        answer: String(x.answer ?? ""),
        order: Number(x.order ?? 0),
      };
    };
    unsubs.push(
      onSnapshot(
        collection(db, "faqItems"),
        (snap) => setFaqItems(sortByOrder(snap.docs.map(mapFaq))),
        (e) => setError(`FAQ: ${e.message}`)
      )
    );

    return () => unsubs.forEach((u) => u());
  }, []);

  return {
    settings,
    categories,
    homeSections,
    videos,
    management,
    whyPillars,
    programCards,
    campusSpots,
    faqItems,
    loading,
    error,
  };
}
