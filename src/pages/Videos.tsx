import { useMemo } from "react";
import { motion } from "framer-motion";
import { usePublicContent } from "../hooks/usePublicContent";
import { youtubeEmbedUrl } from "../lib/youtube";
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

export default function Videos() {
  const { settings, categories, videos } = usePublicContent();

  const videosByCategory = useMemo(() => {
    const map = new Map<string, typeof videos>();
    for (const c of categories) {
      map.set(
        c.id,
        videos.filter((v) => v.categoryId === c.id && v.youtubeVideoId).sort((a, b) => a.order - b.order)
      );
    }
    return map;
  }, [categories, videos]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="page-wrapper"
      id="videos"
    >
      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow={settings.videosEyebrow}
            title={settings.videosTitle}
            intro={settings.videosIntro}
          />
          {categories.map((cat) => {
            const list = videosByCategory.get(cat.id) ?? [];
            if (list.length === 0) return null;
            return (
              <div key={cat.id} className="video-category-block">
                <h3 className="category-heading">
                  <span className="material-symbols-outlined" aria-hidden>folder_special</span>
                  {cat.name}
                </h3>
                <div className="video-grid">
                  {list.map((v) => (
                    <motion.div key={v.id} whileHover={{ scale: 1.02 }}>
                      <div className="video-card">
                        <iframe
                          title={v.title}
                          src={youtubeEmbedUrl(v.youtubeVideoId)}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <p className="video-caption">{v.title}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
