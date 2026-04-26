import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { CampusSpot, FaqItem, ProgramCard, SiteSettings, WhyPillar } from "../../types";

function useNextOrder<T extends { order: number }>(items: T[]) {
  return useMemo(() => (items.length ? Math.max(...items.map((x) => x.order)) + 1 : 0), [items]);
}

export function WhyPillarsEditor({
  items,
  settings,
  notify,
}: {
  items: WhyPillar[];
  settings: SiteSettings;
  notify: (s: string) => void;
}) {
  const nextOrder = useNextOrder(items);
  const [eyebrow, setEyebrow] = useState(settings.whyEyebrow ?? "");
  const [heading, setHeading] = useState(settings.whyTitle ?? "");
  const [intro, setIntro] = useState(settings.whyIntro ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEyebrow(settings.whyEyebrow ?? "");
    setHeading(settings.whyTitle ?? "");
    setIntro(settings.whyIntro ?? "");
  }, [settings.whyEyebrow, settings.whyTitle, settings.whyIntro]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      notify("Enter a pillar title.");
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, "whyPillars"), {
        title: title.trim(),
        body: body.trim(),
        order: nextOrder,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setBody("");
      notify("Pillar added.");
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: WhyPillar) {
    if (!confirm(`Remove "${p.title || "this pillar"}"?`)) return;
    await deleteDoc(doc(db, "whyPillars", p.id));
    notify("Pillar removed.");
  }

  async function saveSectionCopy() {
    await setDoc(
      doc(db, "siteSettings", "main"),
      {
        whyEyebrow: eyebrow.trim(),
        whyTitle: heading.trim(),
        whyIntro: intro.trim(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    notify("Why us heading copy saved.");
  }

  return (
    <div>
      <h2>Why us — pillars</h2>
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
          Save Why us heading
        </button>
      </div>
      <p className="admin-muted">Short cards (title + text) shown in the “Why choose us” block on the homepage.</p>
      <form onSubmit={add} className="admin-row" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
        <label className="admin-label" style={{ flex: 1, minWidth: 160 }}>
          Title
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Safe campus" />
        </label>
        <label className="admin-label" style={{ flex: 2, minWidth: 220 }}>
          Body
          <textarea className="admin-textarea" rows={2} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-filled" disabled={busy}>
          Add pillar
        </button>
      </form>
      <ul className="admin-list" style={{ marginTop: "1rem" }}>
        {items.length === 0 ? <li className="admin-muted">No pillars yet.</li> : null}
        {items.map((p) => (
          <li key={p.id} className="admin-list-item">
            <div>
              <strong>{p.title || "(untitled)"}</strong>
              <div className="admin-muted">{p.body}</div>
            </div>
            <button type="button" className="btn btn-text" onClick={() => void remove(p)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgramCardsEditor({
  items,
  settings,
  notify,
}: {
  items: ProgramCard[];
  settings: SiteSettings;
  notify: (s: string) => void;
}) {
  const nextOrder = useNextOrder(items);
  const [eyebrow, setEyebrow] = useState(settings.programsEyebrow ?? "");
  const [heading, setHeading] = useState(settings.programsTitle ?? "");
  const [title, setTitle] = useState("");
  const [metaLine, setMetaLine] = useState("");
  const [description, setDescription] = useState("");
  const [href, setHref] = useState("#contact");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEyebrow(settings.programsEyebrow ?? "");
    setHeading(settings.programsTitle ?? "");
  }, [settings.programsEyebrow, settings.programsTitle]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      notify("Enter a program title.");
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, "programCards"), {
        title: title.trim(),
        metaLine: metaLine.trim(),
        description: description.trim(),
        href: href.trim() || "#contact",
        order: nextOrder,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setMetaLine("");
      setDescription("");
      setHref("#contact");
      notify("Program card added.");
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: ProgramCard) {
    if (!confirm(`Remove "${p.title || "this card"}"?`)) return;
    await deleteDoc(doc(db, "programCards", p.id));
    notify("Program removed.");
  }

  async function saveSectionCopy() {
    await setDoc(
      doc(db, "siteSettings", "main"),
      {
        programsEyebrow: eyebrow.trim(),
        programsTitle: heading.trim(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    notify("Programs heading copy saved.");
  }

  return (
    <div>
      <h2>Programs</h2>
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
        <button type="button" className="btn btn-tonal" onClick={() => void saveSectionCopy()}>
          Save Programs heading
        </button>
      </div>
      <p className="admin-muted">Cards for Playgroup, Nursery, etc. Link can be #videos, #contact, or a full URL.</p>
      <form onSubmit={add}>
        <div className="admin-row">
          <label className="admin-label" style={{ flex: 1 }}>
            Title
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nursery" />
          </label>
          <label className="admin-label" style={{ flex: 1 }}>
            Meta line (age band)
            <input className="admin-input" value={metaLine} onChange={(e) => setMetaLine(e.target.value)} placeholder="2½ – 3½ years" />
          </label>
        </div>
        <label className="admin-label" style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column" }}>
          Description
          <textarea className="admin-textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="admin-label" style={{ marginBottom: "1rem", display: "flex", flexDirection: "column" }}>
          Button / card link
          <input className="admin-input" value={href} onChange={(e) => setHref(e.target.value)} placeholder="#contact" />
        </label>
        <button type="submit" className="btn btn-filled" disabled={busy}>
          Add program
        </button>
      </form>
      <ul className="admin-list" style={{ marginTop: "1rem" }}>
        {items.length === 0 ? <li className="admin-muted">No programs yet.</li> : null}
        {items.map((p) => (
          <li key={p.id} className="admin-list-item">
            <div>
              <strong>{p.title || "(untitled)"}</strong>
              <div className="admin-muted">{p.metaLine}</div>
              <div className="admin-muted">{p.description}</div>
              <div className="admin-muted">→ {p.href}</div>
            </div>
            <button type="button" className="btn btn-text" onClick={() => void remove(p)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CampusSpotsEditor({
  items,
  settings,
  notify,
}: {
  items: CampusSpot[];
  settings: SiteSettings;
  notify: (s: string) => void;
}) {
  const nextOrder = useNextOrder(items);
  const [eyebrow, setEyebrow] = useState(settings.spaceEyebrow ?? "");
  const [heading, setHeading] = useState(settings.spaceTitle ?? "");
  const [intro, setIntro] = useState(settings.spaceIntro ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEyebrow(settings.spaceEyebrow ?? "");
    setHeading(settings.spaceTitle ?? "");
    setIntro(settings.spaceIntro ?? "");
  }, [settings.spaceEyebrow, settings.spaceTitle, settings.spaceIntro]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      notify("Enter a space title.");
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, "campusSpots"), {
        title: title.trim(),
        body: body.trim(),
        order: nextOrder,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setBody("");
      notify("Campus spot added.");
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: CampusSpot) {
    if (!confirm(`Remove "${p.title || "this spot"}"?`)) return;
    await deleteDoc(doc(db, "campusSpots", p.id));
    notify("Spot removed.");
  }

  async function saveSectionCopy() {
    await setDoc(
      doc(db, "siteSettings", "main"),
      {
        spaceEyebrow: eyebrow.trim(),
        spaceTitle: heading.trim(),
        spaceIntro: intro.trim(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    notify("Campus heading copy saved.");
  }

  return (
    <div>
      <h2>Campus &amp; spaces</h2>
      <div className="admin-section admin-section--flush">
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.95rem" }}>Campus heading (for homepage)</h3>
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
          Save Campus heading
        </button>
      </div>
      <p className="admin-muted">Highlights (library, play zones, etc.) shown as a grid under the photo gallery.</p>
      <form onSubmit={add} className="admin-row" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
        <label className="admin-label" style={{ flex: 1, minWidth: 160 }}>
          Title
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="admin-label" style={{ flex: 2, minWidth: 220 }}>
          Description
          <textarea className="admin-textarea" rows={2} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-filled" disabled={busy}>
          Add spot
        </button>
      </form>
      <ul className="admin-list" style={{ marginTop: "1rem" }}>
        {items.length === 0 ? <li className="admin-muted">No spots yet.</li> : null}
        {items.map((p) => (
          <li key={p.id} className="admin-list-item">
            <div>
              <strong>{p.title || "(untitled)"}</strong>
              <div className="admin-muted">{p.body}</div>
            </div>
            <button type="button" className="btn btn-text" onClick={() => void remove(p)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FaqItemsEditor({
  items,
  settings,
  notify,
}: {
  items: FaqItem[];
  settings: SiteSettings;
  notify: (s: string) => void;
}) {
  const nextOrder = useNextOrder(items);
  const [eyebrow, setEyebrow] = useState(settings.faqEyebrow ?? "");
  const [heading, setHeading] = useState(settings.faqTitle ?? "");
  const [intro, setIntro] = useState(settings.faqIntro ?? "");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEyebrow(settings.faqEyebrow ?? "");
    setHeading(settings.faqTitle ?? "");
    setIntro(settings.faqIntro ?? "");
  }, [settings.faqEyebrow, settings.faqTitle, settings.faqIntro]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      notify("Enter both question and answer.");
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, "faqItems"), {
        question: question.trim(),
        answer: answer.trim(),
        order: nextOrder,
        createdAt: serverTimestamp(),
      });
      setQuestion("");
      setAnswer("");
      notify("FAQ item added.");
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(p: FaqItem) {
    if (!confirm("Remove this FAQ?")) return;
    await deleteDoc(doc(db, "faqItems", p.id));
    notify("FAQ removed.");
  }

  async function saveSectionCopy() {
    await setDoc(
      doc(db, "siteSettings", "main"),
      {
        faqEyebrow: eyebrow.trim(),
        faqTitle: heading.trim(),
        faqIntro: intro.trim(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    notify("FAQ heading copy saved.");
  }

  return (
    <div>
      <h2>FAQ</h2>
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
          Save FAQ heading
        </button>
      </div>
      <p className="admin-muted">Questions parents often ask — shown as an accordion before the bottom call-to-action.</p>
      <form onSubmit={add}>
        <label className="admin-label" style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column" }}>
          Question
          <input className="admin-input" value={question} onChange={(e) => setQuestion(e.target.value)} />
        </label>
        <label className="admin-label" style={{ marginBottom: "1rem", display: "flex", flexDirection: "column" }}>
          Answer
          <textarea className="admin-textarea" rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-filled" disabled={busy}>
          Add FAQ
        </button>
      </form>
      <ul className="admin-list" style={{ marginTop: "1rem" }}>
        {items.length === 0 ? <li className="admin-muted">No FAQs yet.</li> : null}
        {items.map((p) => (
          <li key={p.id} className="admin-list-item">
            <div>
              <strong>{p.question || "(untitled)"}</strong>
              <div className="admin-muted">{p.answer}</div>
            </div>
            <button type="button" className="btn btn-text" onClick={() => void remove(p)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
