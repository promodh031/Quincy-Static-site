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

export default function Programs() {
  const { settings, programCards } = usePublicContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="page-wrapper"
      id="programs"
    >
      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow={settings.programsEyebrow} title={settings.programsTitle} />
          {programCards.filter((p) => p.title.trim()).length > 0 ? (
            <div className="mm-program-grid">
              {programCards
                .filter((p) => p.title.trim())
                .map((p) => (
                  <motion.article 
                    key={p.id} 
                    className="mm-program surface-card"
                    whileHover={{ y: -8 }}
                  >
                    <h3 className="mm-program-title">{p.title}</h3>
                    {p.metaLine.trim() ? <p className="mm-program-meta">{p.metaLine}</p> : null}
                    {p.description.trim() ? <p className="mm-program-desc">{p.description}</p> : null}
                    <a href={p.href} className="btn btn-tonal mm-program-link">
                      Learn more
                    </a>
                  </motion.article>
                ))}
            </div>
          ) : (
            <p className="empty-hint">Add program cards in Admin → Programs.</p>
          )}
        </div>
      </section>
    </motion.div>
  );
}
