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

export default function Gallery() {
  const { settings, homeSections } = usePublicContent();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="page-wrapper"
      id="gallery"
    >
      <div className="mm-gallery-intro container">
        <SectionHead eyebrow={settings.galleryEyebrow} title={settings.galleryTitle} />
      </div>
      {homeSections.map((s, i) => (
        <section key={s.id} className={`section${i % 2 ? " alt" : ""}`}>
          <div className="container">
            {s.title.trim() ? <h2 className="section-title">{s.title}</h2> : null}
            {s.images.length > 0 ? (
              <div className="section-scroll-wrap">
                <div className="section-scroll" role="list">
                  {s.images.map((url, j) => (
                    <motion.div 
                      key={`${url}-${j}`} 
                      className="section-scroll-item" 
                      role="listitem"
                      whileHover={{ scale: 1.05 }}
                    >
                      <img src={url} alt="" loading="lazy" />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : null}
            {s.description.trim() ? <p className="section-body">{s.description}</p> : null}
          </div>
        </section>
      ))}
    </motion.div>
  );
}
