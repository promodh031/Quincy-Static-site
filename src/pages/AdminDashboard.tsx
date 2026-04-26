import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { homeSectionFromDoc, parseImagesFromRaw, sortHomeSections } from "../lib/homeSectionsFirestore";
import { refFromDownloadUrl } from "../lib/storagePaths";
import { auth, db, storage } from "../lib/firebase";
import { parseYoutubeVideoId } from "../lib/youtube";
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
import { DEFAULT_SETTINGS, mergeSiteSettings } from "../lib/siteSettings";
import {
  CampusSpotsEditor,
  FaqItemsEditor,
  ProgramCardsEditor,
  WhyPillarsEditor,
} from "./admin/PageListEditors";
import "./Admin.css";

type Tab = "settings" | "sections" | "pillars" | "programs" | "spaces" | "faqs" | "videos" | "management" | "footer";
type MenuToggleKey =
  | "menuShowWhy"
  | "menuShowPrograms"
  | "menuShowGallery"
  | "menuShowCampus"
  | "menuShowVideos"
  | "menuShowLeadership"
  | "menuShowFaq";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("settings");
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [management, setManagement] = useState<ManagementMember[]>([]);
  const [whyPillars, setWhyPillars] = useState<WhyPillar[]>([]);
  const [programCards, setProgramCards] = useState<ProgramCard[]>([]);
  const [campusSpots, setCampusSpots] = useState<CampusSpot[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubs: Unsubscribe[] = [];
    unsubs.push(
      onSnapshot(doc(db, "siteSettings", "main"), (snap) => {
        if (snap.exists()) setSettings(mergeSiteSettings(snap.data() as Partial<SiteSettings>));
        else setSettings(DEFAULT_SETTINGS);
      })
    );
    unsubs.push(
      onSnapshot(
        collection(db, "homeSections"),
        (snap) => {
          const rows = snap.docs.map((d) => homeSectionFromDoc(d));
          setHomeSections(sortHomeSections(rows));
        },
        (err) => {
          console.error("homeSections", err);
          setMsg(`Could not load sections: ${err.message}`);
        }
      )
    );
    unsubs.push(
      onSnapshot(query(collection(db, "videoCategories"), orderBy("order", "asc")), (snap) => {
        setCategories(
          snap.docs.map((d) => {
            const x = d.data();
            return { id: d.id, name: String(x.name ?? ""), order: Number(x.order ?? 0) };
          })
        );
      })
    );
    unsubs.push(
      onSnapshot(query(collection(db, "videos"), orderBy("order", "asc")), (snap) => {
        setVideos(
          snap.docs.map((d) => {
            const x = d.data();
            return {
              id: d.id,
              categoryId: String(x.categoryId ?? ""),
              youtubeVideoId: String(x.youtubeVideoId ?? ""),
              title: String(x.title ?? ""),
              order: Number(x.order ?? 0),
            };
          })
        );
      })
    );
    unsubs.push(
      onSnapshot(query(collection(db, "management"), orderBy("order", "asc")), (snap) => {
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
      })
    );
    unsubs.push(
      onSnapshot(collection(db, "whyPillars"), (snap) => {
        setWhyPillars(
          [...snap.docs]
            .map((d) => {
              const x = d.data();
              return { id: d.id, title: String(x.title ?? ""), body: String(x.body ?? ""), order: Number(x.order ?? 0) };
            })
            .sort((a, b) => a.order - b.order)
        );
      })
    );
    unsubs.push(
      onSnapshot(collection(db, "programCards"), (snap) => {
        setProgramCards(
          [...snap.docs]
            .map((d) => {
              const x = d.data();
              return {
                id: d.id,
                title: String(x.title ?? ""),
                metaLine: String(x.metaLine ?? ""),
                description: String(x.description ?? ""),
                href: String(x.href ?? "#contact"),
                order: Number(x.order ?? 0),
              };
            })
            .sort((a, b) => a.order - b.order)
        );
      })
    );
    unsubs.push(
      onSnapshot(collection(db, "campusSpots"), (snap) => {
        setCampusSpots(
          [...snap.docs]
            .map((d) => {
              const x = d.data();
              return { id: d.id, title: String(x.title ?? ""), body: String(x.body ?? ""), order: Number(x.order ?? 0) };
            })
            .sort((a, b) => a.order - b.order)
        );
      })
    );
    unsubs.push(
      onSnapshot(collection(db, "faqItems"), (snap) => {
        setFaqItems(
          [...snap.docs]
            .map((d) => {
              const x = d.data();
              return { id: d.id, question: String(x.question ?? ""), answer: String(x.answer ?? ""), order: Number(x.order ?? 0) };
            })
            .sort((a, b) => a.order - b.order)
        );
      })
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  const flash = useCallback((text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 3200);
  }, []);

  const tabToggle = useMemo((): { key: MenuToggleKey; label: string } | null => {
    switch (tab) {
      case "settings":
        return null;
      case "sections":
        return { key: "menuShowGallery", label: "Show Gallery in website menu and section" };
      case "pillars":
        return { key: "menuShowWhy", label: "Show Why us in website menu and section" };
      case "programs":
        return { key: "menuShowPrograms", label: "Show Programs in website menu and section" };
      case "spaces":
        return { key: "menuShowCampus", label: "Show Campus in website menu and section" };
      case "faqs":
        return { key: "menuShowFaq", label: "Show FAQ in website menu and section" };
      case "videos":
        return { key: "menuShowVideos", label: "Show Videos in website menu and section" };
      case "management":
        return { key: "menuShowLeadership", label: "Show Leadership in website menu and section" };
      case "footer":
        return null;
      default:
        return null;
    }
  }, [tab]);

  async function setMenuVisibility(key: MenuToggleKey, value: boolean) {
    await setDoc(
      doc(db, "siteSettings", "main"),
      {
        [key]: value,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    flash(`Updated visibility: ${value ? "shown" : "hidden"}.`);
  }

  return (
    <div className="admin-shell">
      <div className="admin-bar">
        <h1>School admin</h1>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link to="/" className="btn btn-outlined" style={{ textDecoration: "none" }}>
            View site
          </Link>
          <button type="button" className="btn btn-text" onClick={() => signOut(auth)}>
            Sign out
          </button>
        </div>
      </div>
      {msg ? (
        <p className="admin-list-item" style={{ maxWidth: 960, margin: "0 auto 1rem" }}>
          {msg}
        </p>
      ) : null}
      <div className="admin-layout">
        <div className="admin-tabs" role="tablist">
          {(
            [
              ["settings", "School & copy"],
              ["sections", "Photo sections"],
              ["pillars", "Why us"],
              ["programs", "Programs"],
              ["spaces", "Campus"],
              ["faqs", "FAQ"],
              ["videos", "Videos"],
              ["management", "Leadership"],
              ["footer", "Footer"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`admin-tab${tab === id ? " active" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="surface-card admin-panel">
          {tabToggle ? (
            <label className="admin-toggle" style={{ marginBottom: "1rem" }}>
              <input
                type="checkbox"
                checked={settings[tabToggle.key] ?? true}
                onChange={(e) => void setMenuVisibility(tabToggle.key, e.target.checked)}
              />
              <span>{tabToggle.label}</span>
            </label>
          ) : null}
          {tab === "settings" ? <SettingsEditor settings={settings} notify={flash} /> : null}
          {tab === "sections" ? <HomeSectionsEditor settings={settings} sections={homeSections} notify={flash} /> : null}
          {tab === "pillars" ? <WhyPillarsEditor settings={settings} items={whyPillars} notify={flash} /> : null}
          {tab === "programs" ? <ProgramCardsEditor settings={settings} items={programCards} notify={flash} /> : null}
          {tab === "spaces" ? <CampusSpotsEditor settings={settings} items={campusSpots} notify={flash} /> : null}
          {tab === "faqs" ? <FaqItemsEditor settings={settings} items={faqItems} notify={flash} /> : null}
          {tab === "videos" ? (
            <VideosEditor settings={settings} categories={categories} videos={videos} onChange={() => flash("Videos updated.")} />
          ) : null}
          {tab === "management" ? (
            <ManagementEditor settings={settings} members={management} onChange={() => flash("Leadership updated.")} />
          ) : null}
          {tab === "footer" ? <FooterEditor settings={settings} notify={flash} /> : null}
        </div>
      </div>
    </div>
  );
}

function SettingsEditor({ settings, notify }: { settings: SiteSettings; notify: (msg: string) => void }) {
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);
  const [busy, setBusy] = useState(false);
  const [heroBusy, setHeroBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        heroImageUrl: form.heroImageUrl?.trim() || deleteField(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "siteSettings", "main"), payload, { merge: true });
      notify("School details saved.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadHeroImage(file: File) {
    setHeroBusy(true);
    const previousUrl = form.heroImageUrl?.trim() || "";
    try {
      if (previousUrl) {
        try {
          await deleteObject(refFromDownloadUrl(storage, previousUrl));
        } catch {
          /* ignore */
        }
      }
      const safe = file.name.replace(/[^\w.-]+/g, "_");
      const path = `site/hero-${crypto.randomUUID()}_${safe}`;
      const r = ref(storage, path);
      await uploadBytes(r, file);
      const heroImageUrl = await getDownloadURL(r);
      await setDoc(
        doc(db, "siteSettings", "main"),
        { heroImageUrl, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setForm((f) => ({ ...f, heroImageUrl }));
      notify("Hero image updated.");
    } finally {
      setHeroBusy(false);
    }
  }

  async function removeHeroImage() {
    if (!form.heroImageUrl) return;
    if (!confirm("Remove the hero background image from the public site?")) return;
    setHeroBusy(true);
    const url = form.heroImageUrl;
    try {
      try {
        await deleteObject(refFromDownloadUrl(storage, url));
      } catch {
        /* ignore */
      }
      await setDoc(
        doc(db, "siteSettings", "main"),
        { heroImageUrl: deleteField(), updatedAt: serverTimestamp() },
        { merge: true }
      );
      setForm((f) => ({ ...f, heroImageUrl: "" }));
      notify("Hero image removed.");
    } finally {
      setHeroBusy(false);
    }
  }

  return (
    <form onSubmit={save}>
      <h2>School details</h2>
      <p className="admin-muted">These appear in the header, hero, and footer on the public site.</p>
      <label className="admin-label" style={{ marginBottom: "1rem", display: "flex", flexDirection: "column" }}>
        Hero headline (main title on homepage)
        <input
          className="admin-input"
          value={form.heroHeadline ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, heroHeadline: e.target.value }))}
          placeholder="Welcome to our school"
        />
      </label>

      <div className="admin-section admin-section--flush">
        <h3 style={{ margin: "0 0 0.35rem" }}>Hero background</h3>
        <p className="admin-muted" style={{ marginBottom: "1rem" }}>
          One image shown full-width behind the school name on the homepage. Upload a wide photo (e.g. campus or assembly).
        </p>
        {form.heroImageUrl ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start", marginBottom: "1.25rem" }}>
            <img
              src={form.heroImageUrl}
              alt="Hero preview"
              style={{ width: "100%", maxWidth: 320, height: 160, objectFit: "cover", borderRadius: "var(--radius-md)" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label className="btn btn-tonal" style={{ cursor: heroBusy ? "wait" : "pointer", textAlign: "center" }}>
                Replace image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={heroBusy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void uploadHeroImage(f);
                  }}
                />
              </label>
              <button type="button" className="btn btn-text" disabled={heroBusy} onClick={() => void removeHeroImage()}>
                Remove image
              </button>
            </div>
          </div>
        ) : (
          <label className="btn btn-filled" style={{ cursor: heroBusy ? "wait" : "pointer", marginBottom: "1.25rem", width: "fit-content" }}>
            {heroBusy ? "Uploading…" : "Upload hero image"}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={heroBusy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void uploadHeroImage(f);
              }}
            />
          </label>
        )}
      </div>

      <div className="admin-section">
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>Hero text and buttons</h3>
        <div className="admin-row">
          <label className="admin-label">
            Eyebrow (small line above title)
            <input
              className="admin-input"
              value={form.heroEyebrow ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, heroEyebrow: e.target.value }))}
            />
          </label>
          <label className="admin-label">
            Headline
            <input
              className="admin-input"
              value={form.heroHeadline ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, heroHeadline: e.target.value }))}
              placeholder="Welcome to our school"
            />
          </label>
        </div>
        <label className="admin-label" style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column" }}>
          Subline
          <textarea
            className="admin-textarea"
            rows={2}
            value={form.heroSubline ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, heroSubline: e.target.value }))}
          />
        </label>
        <div className="admin-row">
          <label className="admin-label">
            Instagram URL
            <input
              className="admin-input"
              value={form.instagramUrl ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))}
              placeholder="https://instagram.com/your-school"
            />
          </label>
          <label className="admin-label">
            Facebook URL
            <input
              className="admin-input"
              value={form.facebookUrl ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))}
              placeholder="https://facebook.com/your-school"
            />
          </label>
        </div>
        <label className="admin-label" style={{ marginBottom: "0.5rem", display: "flex", flexDirection: "column" }}>
          YouTube URL
          <input
            className="admin-input"
            value={form.youtubeUrl ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
            placeholder="https://youtube.com/@your-school"
          />
        </label>
      </div>

      <div className="admin-row">
        <label className="admin-label">
          School name
          <input
            className="admin-input"
            value={form.schoolName}
            onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
            required
          />
        </label>
        <label className="admin-label">
          Affiliation / badge line
          <input
            className="admin-input"
            value={form.affiliationNote ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, affiliationNote: e.target.value }))}
          />
        </label>
      </div>
      <label className="admin-label" style={{ marginBottom: "1rem", display: "flex", flexDirection: "column" }}>
        Tagline (hero)
        <textarea
          className="admin-textarea"
          value={form.tagline}
          onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
          required
        />
      </label>
      <div className="admin-row">
        <label className="admin-label">
          Phone
          <input
            className="admin-input"
            value={form.contactPhone}
            onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
          />
        </label>
        <label className="admin-label">
          Email
          <input
            className="admin-input"
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
          />
        </label>
      </div>
      <label className="admin-label" style={{ marginBottom: "1rem", display: "flex", flexDirection: "column" }}>
        Address
        <textarea
          className="admin-textarea"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
        />
      </label>

      <button type="submit" className="btn btn-filled" disabled={busy}>
        {busy ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}

function formatFirestoreErr(err: unknown): string {
  if (err instanceof FirebaseError) return `${err.code}: ${err.message}`;
  if (err instanceof Error) return err.message;
  return String(err);
}

type DraftSectionImage = { id: string; file: File; url: string };

function HomeSectionSitePreview({
  section,
  index,
  deletingId,
  onDelete,
}: {
  section: HomeSection;
  index: number;
  deletingId: string | null;
  onDelete: (id: string) => void | Promise<void>;
}) {
  return (
    <div className={`admin-site-section${index % 2 ? " admin-site-section--alt" : ""}`}>
      <div className="admin-site-section__head">
        <span className="admin-site-section__badge">On your website</span>
        <button
          type="button"
          className="btn btn-text"
          disabled={deletingId === section.id}
          onClick={() => void onDelete(section.id)}
        >
          {deletingId === section.id ? "Deleting…" : "Delete section"}
        </button>
      </div>
      <div className="admin-site-section__inner">
        {section.title.trim() ? <h2 className="admin-site-section__title">{section.title}</h2> : null}
        {section.images.length > 0 ? (
          <div className="admin-site-section__scroll-wrap">
            <div className="admin-site-section__scroll">
              {section.images.map((url, j) => (
                <div key={`${url}-${j}`} className="admin-site-section__scroll-item">
                  <img src={url} alt="" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {section.description.trim() ? <p className="admin-site-section__body">{section.description}</p> : null}
      </div>
    </div>
  );
}

function HomeSectionsEditor({
  settings,
  sections,
  notify,
}: {
  settings: SiteSettings;
  sections: HomeSection[];
  notify: (msg: string) => void;
}) {
  const [galleryEyebrow, setGalleryEyebrow] = useState(settings.galleryEyebrow ?? "");
  const [galleryTitle, setGalleryTitle] = useState(settings.galleryTitle ?? "");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [draftImages, setDraftImages] = useState<DraftSectionImage[]>([]);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const draftRef = useRef(draftImages);
  draftRef.current = draftImages;

  useEffect(() => {
    return () => {
      draftRef.current.forEach((d) => URL.revokeObjectURL(d.url));
    };
  }, []);
  useEffect(() => {
    setGalleryEyebrow(settings.galleryEyebrow ?? "");
    setGalleryTitle(settings.galleryTitle ?? "");
  }, [settings.galleryEyebrow, settings.galleryTitle]);

  const nextOrder = useMemo(
    () => (sections.length ? Math.max(...sections.map((s) => s.order)) + 1 : 0),
    [sections]
  );

  function addDraftFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const list = input.files;
    if (!list?.length) return;
    // Snapshot files BEFORE clearing the input. In many browsers `FileList` is live — setting
    // `input.value = ""` empties the list, so reading length after clear wrongly shows 0.
    const raw = Array.from(list);
    input.value = "";
    const files = raw.filter((f) => f.type.startsWith("image/"));
    if (!files.length) {
      notify("Choose image files only (PNG, JPG, WebP, etc.).");
      return;
    }
    const newEntries = files.map((file) => {
      const id = crypto.randomUUID();
      const url = URL.createObjectURL(file);
      return { id, file, url };
    });
    setDraftImages((prev) => [...prev, ...newEntries]);
  }

  function removeDraftImage(id: string) {
    setDraftImages((prev) => {
      const hit = prev.find((x) => x.id === id);
      if (hit) URL.revokeObjectURL(hit.url);
      return prev.filter((x) => x.id !== id);
    });
  }

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) {
      notify("Enter a section title.");
      return;
    }
    setAdding(true);
    const uploadedUrls: string[] = [];
    let createdId: string | null = null;
    try {
      const docRef = await addDoc(collection(db, "homeSections"), {
        title: newTitle.trim(),
        description: newDesc.trim(),
        order: nextOrder,
        images: [],
        createdAt: serverTimestamp(),
      });
      createdId = docRef.id;

      for (const d of draftImages) {
        const base =
          (d.file.name || "photo").replace(/[^\w.-]+/g, "_").replace(/^[_]+|[_]+$/g, "") || "photo";
        const path = `homeSections/${docRef.id}/${crypto.randomUUID()}_${base}`;
        const r = ref(storage, path);
        await uploadBytes(r, d.file, { contentType: d.file.type || "image/jpeg" });
        const downloadUrl = await getDownloadURL(r);
        uploadedUrls.push(downloadUrl);
      }

      if (uploadedUrls.length > 0) {
        await updateDoc(doc(db, "homeSections", docRef.id), {
          images: uploadedUrls,
          updatedAt: serverTimestamp(),
        });
      }

      draftImages.forEach((d) => URL.revokeObjectURL(d.url));
      setDraftImages([]);
      setNewTitle("");
      setNewDesc("");
      notify("Section published.");
    } catch (err) {
      console.error("HomeSections publish failed", err);
      for (const url of uploadedUrls) {
        try {
          await deleteObject(refFromDownloadUrl(storage, url));
        } catch {
          /* ignore */
        }
      }
      if (createdId) {
        try {
          await deleteDoc(doc(db, "homeSections", createdId));
        } catch {
          /* ignore */
        }
      }
      notify(`Could not add section: ${formatFirestoreErr(err)}`);
    } finally {
      setAdding(false);
    }
  }

  async function deleteSectionById(id: string) {
    if (!confirm("Delete this section and all its photos from the website?")) return;
    setDeletingId(id);
    try {
      const sref = doc(db, "homeSections", id);
      const snap = await getDoc(sref);
      const imgs = parseImagesFromRaw(snap.data()?.images);
      for (const url of imgs) {
        try {
          await deleteObject(refFromDownloadUrl(storage, url));
        } catch {
          /* ignore */
        }
      }
      await deleteDoc(sref);
      notify("Section deleted.");
    } catch (err) {
      notify(formatFirestoreErr(err));
    } finally {
      setDeletingId(null);
    }
  }

  async function saveSectionCopy() {
    await setDoc(
      doc(db, "siteSettings", "main"),
      {
        galleryEyebrow: galleryEyebrow.trim(),
        galleryTitle: galleryTitle.trim(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    notify("Gallery heading copy saved.");
  }

  return (
    <div>
      <h2>Homepage sections</h2>
      <div className="admin-section admin-section--flush">
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>Section heading (for homepage)</h3>
        <div className="admin-row">
          <label className="admin-label">
            Eyebrow
            <input className="admin-input" value={galleryEyebrow} onChange={(e) => setGalleryEyebrow(e.target.value)} />
          </label>
          <label className="admin-label">
            Title
            <input className="admin-input" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} />
          </label>
        </div>
        <button type="button" className="btn btn-tonal" onClick={() => void saveSectionCopy()}>
          Save Gallery heading
        </button>
      </div>
      <p className="admin-muted">
        Build each section here: title, description, and photos together. The preview matches the public page (title → photos →
        description). To change a section, delete it below and add a new one.
      </p>

      <form onSubmit={addSection} className="surface-card" style={{ padding: "1.35rem", marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 1rem", fontSize: "1.05rem" }}>New section</h3>
        <div className="admin-row" style={{ alignItems: "stretch" }}>
          <label className="admin-label" style={{ flex: 1 }}>
            Title
            <input
              className="admin-input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Pongal celebrations"
              required
            />
          </label>
          <label className="admin-label" style={{ flex: 2 }}>
            Description
            <textarea
              className="admin-textarea"
              rows={4}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Short text shown under the photos on the website"
            />
          </label>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <p className="admin-label" style={{ margin: "0 0 0.35rem" }}>
            Photos
          </p>
          <label className="btn btn-tonal" style={{ display: "inline-flex", cursor: adding ? "wait" : "pointer" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }} aria-hidden>
              add_photo_alternate
            </span>
            Add pictures (you can select several)
            <input type="file" accept="image/*" multiple hidden disabled={adding} onChange={addDraftFiles} />
          </label>
          {draftImages.length > 0 ? (
            <div className="admin-draft-thumbs">
              {draftImages.map((d) => (
                <div key={d.id} className="admin-draft-thumb">
                  <img src={d.url} alt="" />
                  <button type="button" className="btn btn-text admin-draft-remove" onClick={() => removeDraftImage(d.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="admin-site-section admin-site-section--previewbox">
          <p className="admin-muted" style={{ margin: "0 0 0.75rem" }}>
            Preview (same order as the live site: title, then photos, then description)
          </p>
          <div className="admin-site-section__inner">
            <h2 className="admin-site-section__title">{newTitle.trim() || "Section title"}</h2>
            {draftImages.length > 0 ? (
              <div className="admin-site-section__scroll-wrap">
                <div className="admin-site-section__scroll">
                  {draftImages.map((d) => (
                    <div key={d.id} className="admin-site-section__scroll-item">
                      <img src={d.url} alt="" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="admin-muted" style={{ margin: "0 0 1rem" }}>
                No photos yet — use “Add pictures” above.
              </p>
            )}
            <p className="admin-site-section__body">{newDesc.trim() || "Description will appear here."}</p>
          </div>
        </div>

        <div style={{ marginTop: "1.25rem" }}>
          <button type="submit" className="btn btn-filled" disabled={adding}>
            {adding ? "Publishing…" : "Add section"}
          </button>
        </div>
      </form>

      {sections.length > 0 ? (
        <>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>Published on your site</h3>
          <p className="admin-muted" style={{ marginBottom: "1rem" }}>
            Same layout as the homepage. Only delete is available — to edit, delete and recreate.
          </p>
          {sections.map((s, i) => (
            <HomeSectionSitePreview key={s.id} section={s} index={i} deletingId={deletingId} onDelete={deleteSectionById} />
          ))}
        </>
      ) : (
        <p className="admin-muted">No published sections yet.</p>
      )}
    </div>
  );
}

function VideosEditor({
  settings,
  categories,
  videos,
  onChange,
}: {
  settings: SiteSettings;
  categories: VideoCategory[];
  videos: VideoItem[];
  onChange: () => void;
}) {
  const [eyebrow, setEyebrow] = useState(settings.videosEyebrow ?? "");
  const [heading, setHeading] = useState(settings.videosTitle ?? "");
  const [intro, setIntro] = useState(settings.videosIntro ?? "");
  const [catName, setCatName] = useState("");
  const [busyCat, setBusyCat] = useState(false);
  const nextCatOrder = useMemo(
    () => (categories.length ? Math.max(...categories.map((c) => c.order)) + 1 : 0),
    [categories]
  );
  useEffect(() => {
    setEyebrow(settings.videosEyebrow ?? "");
    setHeading(settings.videosTitle ?? "");
    setIntro(settings.videosIntro ?? "");
  }, [settings.videosEyebrow, settings.videosTitle, settings.videosIntro]);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim()) return;
    setBusyCat(true);
    try {
      await addDoc(collection(db, "videoCategories"), {
        name: catName.trim(),
        order: nextCatOrder,
        createdAt: serverTimestamp(),
      });
      setCatName("");
      onChange();
    } finally {
      setBusyCat(false);
    }
  }

  async function delCategory(c: VideoCategory) {
    const vs = videos.filter((v) => v.categoryId === c.id);
    if (!confirm(`Delete category "${c.name}" and ${vs.length} video(s)?`)) return;
    for (const v of vs) await deleteDoc(doc(db, "videos", v.id));
    await deleteDoc(doc(db, "videoCategories", c.id));
    onChange();
  }

  async function saveSectionCopy() {
    await setDoc(
      doc(db, "siteSettings", "main"),
      {
        videosEyebrow: eyebrow.trim(),
        videosTitle: heading.trim(),
        videosIntro: intro.trim(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    onChange();
  }

  return (
    <div>
      <h2>Video categories</h2>
      <div className="admin-section admin-section--flush">
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>Section heading (for homepage)</h3>
        <div className="admin-row">
          <label className="admin-label">
            Eyebrow
            <input className="admin-input" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
          </label>
          <label className="admin-label">
            Title
            <input className="admin-input" value={heading} onChange={(e) => setHeading(e.target.value)} />
          </label>
        </div>
        <label className="admin-label" style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column" }}>
          Intro
          <textarea className="admin-textarea" rows={2} value={intro} onChange={(e) => setIntro(e.target.value)} />
        </label>
        <button type="button" className="btn btn-tonal" onClick={() => void saveSectionCopy()}>
          Save Videos heading
        </button>
      </div>
      <p className="admin-muted">Create categories (e.g. Annual Day, Workshops), then paste YouTube links under each.</p>
      <form onSubmit={addCategory} className="admin-row">
        <label className="admin-label" style={{ flex: 2 }}>
          New category name
          <input className="admin-input" value={catName} onChange={(e) => setCatName(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-tonal" disabled={busyCat}>
          Add category
        </button>
      </form>
      {categories.map((c) => (
        <CategoryVideosBlock key={c.id} category={c} videos={videos} onChange={onChange} onDeleteCategory={() => delCategory(c)} />
      ))}
      {categories.length === 0 ? <p className="admin-muted">No categories yet.</p> : null}
    </div>
  );
}

function CategoryVideosBlock({
  category,
  videos,
  onChange,
  onDeleteCategory,
}: {
  category: VideoCategory;
  videos: VideoItem[];
  onChange: () => void;
  onDeleteCategory: () => void;
}) {
  const list = useMemo(
    () => videos.filter((v) => v.categoryId === category.id).sort((a, b) => a.order - b.order),
    [videos, category.id]
  );
  const nextVidOrder = useMemo(() => (list.length ? Math.max(...list.map((v) => v.order)) + 1 : 0), [list]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function addVideo(e: React.FormEvent) {
    e.preventDefault();
    const id = parseYoutubeVideoId(url);
    if (!id) {
      alert("Could not read a YouTube video ID from that link.");
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, "videos"), {
        categoryId: category.id,
        youtubeVideoId: id,
        title: title.trim() || "Video",
        order: nextVidOrder,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setUrl("");
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function delVideo(v: VideoItem) {
    await deleteDoc(doc(db, "videos", v.id));
    onChange();
  }

  return (
    <div className="admin-section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>{category.name}</h3>
        <button type="button" className="btn btn-text" onClick={onDeleteCategory}>
          Delete category
        </button>
      </div>
      <form onSubmit={addVideo} className="admin-row" style={{ marginTop: "0.75rem" }}>
        <label className="admin-label" style={{ flex: 2 }}>
          Video title
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Annual day 2025" />
        </label>
        <label className="admin-label" style={{ flex: 3 }}>
          YouTube URL or ID
          <input
            className="admin-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </label>
        <button type="submit" className="btn btn-filled" disabled={busy}>
          Add video
        </button>
      </form>
      <ul className="admin-list" style={{ marginTop: "0.75rem" }}>
        {list.length === 0 ? <li className="admin-muted">No videos in this category.</li> : null}
        {list.map((v) => (
          <li key={v.id} className="admin-list-item">
            <div>
              <strong>{v.title}</strong>
              <div className="admin-muted">{v.youtubeVideoId}</div>
            </div>
            <button type="button" className="btn btn-text" onClick={() => delVideo(v)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ManagementEditor({
  settings,
  members,
  onChange,
}: {
  settings: SiteSettings;
  members: ManagementMember[];
  onChange: () => void;
}) {
  const [eyebrow, setEyebrow] = useState(settings.parentsEyebrow ?? "");
  const [heading, setHeading] = useState(settings.parentsTitle ?? "");
  const [footnote, setFootnote] = useState(settings.parentsFootnote ?? "");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const nextOrder = useMemo(() => (members.length ? Math.max(...members.map((m) => m.order)) + 1 : 0), [members]);
  useEffect(() => {
    setEyebrow(settings.parentsEyebrow ?? "");
    setHeading(settings.parentsTitle ?? "");
    setFootnote(settings.parentsFootnote ?? "");
  }, [settings.parentsEyebrow, settings.parentsTitle, settings.parentsFootnote]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      let photoUrl = "";
      if (file) {
        const safe = file.name.replace(/[^\w.-]+/g, "_");
        const path = `management/${crypto.randomUUID()}_${safe}`;
        const r = ref(storage, path);
        await uploadBytes(r, file);
        photoUrl = await getDownloadURL(r);
      }
      await addDoc(collection(db, "management"), {
        name: name.trim(),
        role: role.trim(),
        testimonial: testimonial.trim(),
        photoUrl,
        order: nextOrder,
        createdAt: serverTimestamp(),
      });
      setName("");
      setRole("");
      setTestimonial("");
      setFile(null);
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function remove(m: ManagementMember) {
    if (!confirm(`Remove ${m.name || "this entry"}?`)) return;
    try {
      if (m.photoUrl) {
        try {
          await deleteObject(refFromDownloadUrl(storage, m.photoUrl));
        } catch {
          /* ignore */
        }
      }
      await deleteDoc(doc(db, "management", m.id));
      onChange();
    } catch {
      await deleteDoc(doc(db, "management", m.id));
      onChange();
    }
  }

  async function saveSectionCopy() {
    await setDoc(
      doc(db, "siteSettings", "main"),
      {
        parentsEyebrow: eyebrow.trim(),
        parentsTitle: heading.trim(),
        parentsFootnote: footnote.trim(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    onChange();
  }

  return (
    <div>
      <h2>Leadership &amp; testimonials</h2>
      <div className="admin-section admin-section--flush">
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>Section heading (for homepage)</h3>
        <div className="admin-row">
          <label className="admin-label">
            Eyebrow
            <input className="admin-input" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
          </label>
          <label className="admin-label">
            Title
            <input className="admin-input" value={heading} onChange={(e) => setHeading(e.target.value)} />
          </label>
        </div>
        <label className="admin-label" style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column" }}>
          Footnote
          <textarea className="admin-textarea" rows={2} value={footnote} onChange={(e) => setFootnote(e.target.value)} />
        </label>
        <button type="button" className="btn btn-tonal" onClick={() => void saveSectionCopy()}>
          Save Leadership heading
        </button>
      </div>
      <p className="admin-muted">Add a portrait and a short quote for each leader. Shown in the bottom section of the homepage.</p>
      <form onSubmit={addMember}>
        <div className="admin-row">
          <label className="admin-label">
            Name
            <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="admin-label">
            Role / title
            <input className="admin-input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Principal" />
          </label>
        </div>
        <label className="admin-label" style={{ marginBottom: "1rem", display: "flex", flexDirection: "column" }}>
          Testimonial
          <textarea
            className="admin-textarea"
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
            placeholder="A short message to parents and students…"
          />
        </label>
        <label className="admin-label" style={{ marginBottom: "1rem", display: "flex", flexDirection: "column" }}>
          Photo (optional)
          <input className="admin-input" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <button type="submit" className="btn btn-filled" disabled={busy}>
          {busy ? "Saving…" : "Add person"}
        </button>
      </form>
      <ul className="admin-list" style={{ marginTop: "1.5rem" }}>
        {members.length === 0 ? <li className="admin-muted">No entries yet.</li> : null}
        {members.map((m) => (
          <li key={m.id} className="admin-list-item">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {m.photoUrl ? <img className="admin-thumb" src={m.photoUrl} alt="" /> : <div className="admin-thumb" />}
              <div>
                <strong>{m.name}</strong>
                <div className="admin-muted">{m.role}</div>
              </div>
            </div>
            <button type="button" className="btn btn-text" onClick={() => remove(m)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterEditor({ settings, notify }: { settings: SiteSettings; notify: (msg: string) => void }) {
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm(settings), [settings]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await setDoc(
        doc(db, "siteSettings", "main"),
        {
          ctaBandTitle: form.ctaBandTitle ?? "",
          ctaBandBody: form.ctaBandBody ?? "",
          ctaBandBtn1: form.ctaBandBtn1 ?? "",
          ctaBandLink1: form.ctaBandLink1 ?? "",
          ctaBandBtn2: form.ctaBandBtn2 ?? "",
          ctaBandLink2: form.ctaBandLink2 ?? "",
          footerCol1Title: form.footerCol1Title ?? "",
          footerCol1Body: form.footerCol1Body ?? "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      notify("Footer content saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save}>
      <h2>Footer content</h2>
      <p className="admin-muted">Manage bottom CTA band and footer text shown on the homepage.</p>
      <h4 className="admin-subhead">Bottom call-to-action band</h4>
      <label className="admin-label" style={{ marginBottom: "0.5rem", display: "flex", flexDirection: "column" }}>
        Title
        <input className="admin-input" value={form.ctaBandTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaBandTitle: e.target.value }))} />
      </label>
      <label className="admin-label" style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column" }}>
        Body
        <textarea className="admin-textarea" rows={2} value={form.ctaBandBody ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaBandBody: e.target.value }))} />
      </label>
      <div className="admin-row">
        <label className="admin-label">
          Button 1 label
          <input className="admin-input" value={form.ctaBandBtn1 ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaBandBtn1: e.target.value }))} />
        </label>
        <label className="admin-label">
          Button 1 link
          <input className="admin-input" value={form.ctaBandLink1 ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaBandLink1: e.target.value }))} />
        </label>
      </div>
      <div className="admin-row">
        <label className="admin-label">
          Button 2 label
          <input className="admin-input" value={form.ctaBandBtn2 ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaBandBtn2: e.target.value }))} />
        </label>
        <label className="admin-label">
          Button 2 link
          <input className="admin-input" value={form.ctaBandLink2 ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaBandLink2: e.target.value }))} />
        </label>
      </div>

      <h4 className="admin-subhead">Footer column (left)</h4>
      <label className="admin-label" style={{ marginBottom: "0.5rem", display: "flex", flexDirection: "column" }}>
        Column title
        <input className="admin-input" value={form.footerCol1Title ?? ""} onChange={(e) => setForm((f) => ({ ...f, footerCol1Title: e.target.value }))} />
      </label>
      <label className="admin-label" style={{ marginBottom: "1rem", display: "flex", flexDirection: "column" }}>
        Column body
        <textarea className="admin-textarea" rows={3} value={form.footerCol1Body ?? ""} onChange={(e) => setForm((f) => ({ ...f, footerCol1Body: e.target.value }))} />
      </label>
      <button type="submit" className="btn btn-filled" disabled={busy}>
        {busy ? "Saving…" : "Save footer"}
      </button>
    </form>
  );
}
