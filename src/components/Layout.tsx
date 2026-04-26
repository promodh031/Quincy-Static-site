import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePublicContent } from "../hooks/usePublicContent";
import "../pages/Home.css"; // We'll keep Home.css or move to global later

export default function Layout({ children }: { children: React.ReactNode }) {
  const {
    settings,
    categories,
    homeSections,
    videos,
    management,
    whyPillars,
    programCards,
    campusSpots,
    faqItems,
    error,
  } = usePublicContent();

  const location = useLocation();

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

  const hasAnyVideos = useMemo(
    () => categories.some((c) => (videosByCategory.get(c.id) ?? []).length > 0),
    [categories, videosByCategory]
  );

  const hasWhy =
    Boolean(settings.whyIntro?.trim() || settings.whyTitle?.trim() || settings.whyEyebrow?.trim()) ||
    whyPillars.some((p) => p.title.trim());
  const hasPrograms =
    Boolean(settings.programsTitle?.trim() || settings.programsEyebrow?.trim()) || programCards.some((p) => p.title.trim());
  const hasGallery = homeSections.length > 0;
  const hasSpaces =
    Boolean(settings.spaceIntro?.trim() || settings.spaceTitle?.trim() || settings.spaceEyebrow?.trim()) ||
    campusSpots.some((s) => s.title.trim());
  const hasLeadership = management.some((m) => m.name.trim());
  const hasLeadershipSection =
    hasLeadership ||
    Boolean(settings.parentsEyebrow?.trim() || settings.parentsTitle?.trim() || settings.parentsFootnote?.trim());
  const hasFaq = faqItems.some((f) => f.question.trim());
  const showWhy = hasWhy && (settings.menuShowWhy ?? true);
  const showPrograms = hasPrograms && (settings.menuShowPrograms ?? true);
  const showGallery = hasGallery && (settings.menuShowGallery ?? true);
  const showSpaces = hasSpaces && (settings.menuShowCampus ?? true);
  const showVideos = hasAnyVideos && (settings.menuShowVideos ?? true);
  const showLeadership = hasLeadershipSection && (settings.menuShowLeadership ?? true);
  const showFaq = hasFaq && (settings.menuShowFaq ?? true);

  const navItems = useMemo(() => {
    const items: { href: string; label: string }[] = [{ href: "/", label: "Home" }];
    if (showWhy) items.push({ href: "/why-us", label: "Why us" });
    if (showPrograms) items.push({ href: "/programs", label: "Programs" });
    if (showGallery) items.push({ href: "/gallery", label: settings.galleryTitle?.trim() || "Gallery" });
    if (showSpaces) items.push({ href: "/campus", label: "Campus" });
    if (showVideos) items.push({ href: "/videos", label: "Videos" });
    if (showLeadership) items.push({ href: "/leadership", label: "Leadership" });
    if (showFaq) items.push({ href: "/faq", label: "FAQ" });
    return items;
  }, [
    settings.galleryTitle,
    showWhy,
    showPrograms,
    showGallery,
    showSpaces,
    showVideos,
    showLeadership,
    showFaq,
  ]);

  return (
    <>
      <header className="home-header">
        <div className="container home-header-inner">
          <Link to="/" className="brand-block" style={{ textDecoration: 'none' }}>
            <span className="brand-name">{settings.schoolName || "Quincy School"}</span>
            {settings.affiliationNote ? <span className="brand-tag">{settings.affiliationNote}</span> : null}
          </Link>
          <nav className="nav-links" aria-label="Primary">
            {navItems.map((n) => (
              <Link 
                key={n.href} 
                to={n.href}
                style={location.pathname === n.href ? { background: "var(--md-sys-color-primary)", color: "#fff" } : {}}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      
      {error && (
        <div className="container" style={{ paddingTop: "1rem" }}>
          <p className="empty-hint" style={{ color: "red" }}>Could not load content: {error}</p>
        </div>
      )}

      {/* Main content slot where animated pages will render */}
      <main style={{ flex: 1, position: "relative" }}>
        {children}
      </main>

      <footer className="home-footer" id="contact">
        <div className="container footer-grid">
          {settings.footerCol1Title?.trim() || settings.footerCol1Body?.trim() ? (
            <div className="footer-col">
              {settings.footerCol1Title?.trim() ? <h3>{settings.footerCol1Title.trim()}</h3> : null}
              {settings.footerCol1Body?.trim() ? (
                <p className="mm-footer-prose">{settings.footerCol1Body.trim()}</p>
              ) : null}
            </div>
          ) : null}
          <div className="footer-col">
            <h3>Contact</h3>
            <address>
              {settings.address}
              <br />
              <a href={`tel:${settings.contactPhone?.replace(/\s/g, "")}`}>{settings.contactPhone}</a>
              <br />
              <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
            </address>
          </div>
          <div className="footer-col">
            <h3>Directory</h3>
            <p style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navItems
                .filter((n) => n.href !== "/")
                .map((n) => (
                  <Link key={n.href} to={n.href}>{n.label}</Link>
                ))}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
