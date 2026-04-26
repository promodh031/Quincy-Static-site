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

export default function Faq() {
  const { settings, faqItems } = usePublicContent();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      className="page-wrapper"
      id="faq"
    >
      <section className="section">
        <div className="container mm-narrow">
          <SectionHead eyebrow={settings.faqEyebrow} title={settings.faqTitle} intro={settings.faqIntro} />
          <div className="mm-faq-list">
            {faqItems
              .filter((f) => f.question.trim())
              .map((f) => (
                <motion.details key={f.id} variants={itemVariants} className="mm-faq-item surface-card">
                  <summary>{f.question.trim()}</summary>
                  <p>{f.answer.trim()}</p>
                </motion.details>
              ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
