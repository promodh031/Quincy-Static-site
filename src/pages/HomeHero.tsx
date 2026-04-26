import { motion } from "framer-motion";
import { usePublicContent } from "../hooks/usePublicContent";
import "./Home.css";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm8.2 1.8H8A4.2 4.2 0 0 0 3.8 8v8a4.2 4.2 0 0 0 4.2 4.2h8a4.2 4.2 0 0 0 4.2-4.2V8A4.2 4.2 0 0 0 16 3.8Zm-4 2.7A5.5 5.5 0 1 1 6.5 12 5.5 5.5 0 0 1 12 6.5Zm0 1.8A3.7 3.7 0 1 0 15.7 12 3.7 3.7 0 0 0 12 8.3Zm5.8-2.7a1.3 1.3 0 1 1-1.3 1.3 1.3 1.3 0 0 1 1.3-1.3Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M13.7 21v-7h2.3l.5-2.8h-2.8V9.7c0-.8.3-1.5 1.6-1.5H16V5.7c-.2 0-.9-.1-1.8-.1-2.6 0-4.3 1.6-4.3 4.5v1.1H7.5V14h2.4v7h3.8Z"
      />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M22 12c0 1.9-.2 3.8-.5 4.7a2.8 2.8 0 0 1-2 2c-1.8.5-7.5.5-7.5.5s-5.7 0-7.5-.5a2.8 2.8 0 0 1-2-2C2.2 15.8 2 13.9 2 12s.2-3.8.5-4.7a2.8 2.8 0 0 1 2-2C6.3 4.8 12 4.8 12 4.8s5.7 0 7.5.5a2.8 2.8 0 0 1 2 2c.3.9.5 2.8.5 4.7Zm-12.2 3.3 6-3.3-6-3.3v6.6Z"
      />
    </svg>
  );
}

function CtaLink({ href, className, style, children }: any) {
  const h = (href ?? "").trim();
  if (!h) return null;
  const normalizedHref = /^https?:\/\//i.test(h) ? h : `https://${h.replace(/^\/+/, "")}`;
  return (
    <a
      href={normalizedHref}
      className={className}
      style={style}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

function Eyebrow({ text }: { text?: string }) {
  const t = text?.trim();
  if (!t) return null;
  return <p className="mm-eyebrow">{t}</p>;
}

export default function HomeHero() {
  const { settings, error } = usePublicContent();

  const heroHeadline = settings.heroHeadline?.trim() || "Welcome";
  const heroSub = settings.heroSubline?.trim() || settings.tagline;

  const socialLinks = [
    { label: "Instagram", href: settings.instagramUrl, icon: <InstagramIcon />, iconColor: "#E4405F" },
    { label: "Facebook", href: settings.facebookUrl, icon: <FacebookIcon />, iconColor: "#1877F2" },
    { label: "YouTube", href: settings.youtubeUrl, icon: <YouTubeIcon />, iconColor: "#FF0000" },
  ].filter((x) => x.href?.trim());

  return (
    <>
      <section className="hero" id="top" aria-label="Welcome" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {settings.heroImageUrl ? (
          <div
            className="hero-bg"
            style={{ backgroundImage: `url(${settings.heroImageUrl})` }}
            role="img"
            aria-hidden
          />
        ) : null}
        <div className="hero-overlay" aria-hidden />
        <motion.div 
          className="container hero-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ justifyContent: "center", minHeight: "100vh", paddingTop: "80px" }}
        >
          <div className="hero-brand-block" style={{ marginBottom: "2rem" }}>
             <h1 className="hero-school-name" style={{ margin: 0, color: "#fff" }}>
               {settings.schoolName || "Quincy School"}
             </h1>
             {settings.affiliationNote && (
               <span style={{ fontSize: "1rem", opacity: 0.9 }}>{settings.affiliationNote}</span>
             )}
          </div>
          
          <Eyebrow text={settings.heroEyebrow} />
          <h2 className="hero-title">{heroHeadline}</h2>
          <p className="hero-desc">{heroSub}</p>
          {socialLinks.length > 0 ? (
            <div className="hero-ctas">
              {socialLinks.map((item) => (
                <CtaLink key={item.label} href={item.href} className="btn btn-outlined mm-hero-btn mm-hero-btn--ghost">
                  <span style={{ color: item.iconColor, display: "inline-flex", alignItems: "center" }}>{item.icon}</span>
                  {item.label}
                </CtaLink>
              ))}
            </div>
          ) : null}
        </motion.div>
      </section>

      {error ? (
        <div className="container" style={{ paddingTop: "1rem" }}>
          <p className="empty-hint">Could not load content: {error}</p>
        </div>
      ) : null}
    </>
  );
}
