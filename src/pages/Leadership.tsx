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

export default function Leadership() {
  const { settings, management } = usePublicContent();
  const hasLeadership = management.some((m) => m.name.trim());

  return (
    <motion.div
      initial={{ rotateX: 90, opacity: 0 }}
      whileInView={{ rotateX: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: "backOut" }}
      className="page-wrapper"
      id="leadership"
    >
      <section className="section alt">
        <div className="container">
          <SectionHead
            eyebrow={settings.parentsEyebrow}
            title={settings.parentsTitle || "Leadership"}
            intro={undefined}
          />
          {!hasLeadership ? (
            <p className="empty-hint">Add people in Admin → Leadership.</p>
          ) : (
            <div className="mgmt-grid">
              {management
                .filter((m) => m.name.trim())
                .map((m) => (
                  <motion.article 
                    key={m.id} 
                    className="mgmt-card surface-card"
                    whileHover={{ y: -5, boxShadow: "var(--md-sys-elevation-2)" }}
                  >
                    {m.photoUrl ? <img className="mgmt-photo" src={m.photoUrl} alt="" /> : <div className="mgmt-photo" aria-hidden />}
                    <div className="mgmt-body">
                      {m.testimonial ? <blockquote className="mgmt-quote">&ldquo;{m.testimonial}&rdquo;</blockquote> : null}
                      <p className="mgmt-name">{m.name}</p>
                      <p className="mgmt-role">{m.role}</p>
                    </div>
                  </motion.article>
                ))}
            </div>
          )}
          {settings.parentsFootnote?.trim() ? <p className="mm-footnote">{settings.parentsFootnote.trim()}</p> : null}
        </div>
      </section>
    </motion.div>
  );
}
