import { motion } from "framer-motion";
import { usePublicContent } from "../hooks/usePublicContent";
import "./Home.css";

function Eyebrow({ text }: { text?: string }) {
  const t = text?.trim();
  if (!t) return null;
  return <p className="mm-eyebrow">{t}</p>;
}

function SectionHead({ eyebrow, title, intro }: any) {
  if (!eyebrow?.trim() && !title?.trim() && !intro?.trim()) return null;
  return (
    <header className="mm-section-head">
      <Eyebrow text={eyebrow} />
      {title ? <h2 className="mm-section-title">{title}</h2> : null}
      {intro ? <p className="mm-section-intro">{intro}</p> : null}
    </header>
  );
}

export default function Campus() {
  const { settings, campusSpots } = usePublicContent();

  return (
    <motion.div
      initial={{ filter: "blur(10px)", opacity: 0 }}
      whileInView={{ filter: "blur(0px)", opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7 }}
      className="page-wrapper"
      id="campus"
    >
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow={settings.spaceEyebrow}
            title={settings.spaceTitle}
            intro={settings.spaceIntro}
          />
          {campusSpots.filter((s) => s.title.trim()).length > 0 ? (
            <div className="mm-spot-grid">
              {campusSpots
                .filter((s) => s.title.trim())
                .map((s) => (
                  <article key={s.id} className="mm-spot surface-card">
                    <h3 className="mm-spot-title">{s.title}</h3>
                    {s.body.trim() ? <p className="mm-spot-body">{s.body}</p> : null}
                  </article>
                ))}
            </div>
          ) : (
            <p className="empty-hint">Add campus spots in Admin → Campus.</p>
          )}
        </div>
      </section>
    </motion.div>
  );
}
