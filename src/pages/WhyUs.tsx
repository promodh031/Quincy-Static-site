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

export default function WhyUs() {
  const { settings, whyPillars } = usePublicContent();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="page-wrapper"
      id="why-us"
    >
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow={settings.whyEyebrow}
            title={settings.whyTitle}
            intro={settings.whyIntro}
          />
          {whyPillars.filter((p) => p.title.trim()).length > 0 ? (
            <div className="mm-pillar-grid">
              {whyPillars
                .filter((p) => p.title.trim())
                .map((p) => (
                  <article key={p.id} className="mm-pillar surface-card">
                    <h3 className="mm-pillar-title">{p.title}</h3>
                    {p.body.trim() ? <p className="mm-pillar-body">{p.body}</p> : null}
                  </article>
                ))}
            </div>
          ) : (
            <p className="empty-hint">Add pillars in Admin → Why us.</p>
          )}
        </div>
      </section>
    </motion.div>
  );
}
