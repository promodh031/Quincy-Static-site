import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { usePublicContent } from "../hooks/usePublicContent";
import "../pages/Home.css";

export default function Header() {
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
  } = usePublicContent();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("/");
  const location = useLocation();
  const isHomeRoute = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(!isHomeRoute || window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomeRoute]);

  const hasAnyVideos = categories.some((c) => videos.some((v) => v.categoryId === c.id));
  const hasWhy = whyPillars.length > 0 || settings.whyTitle;
  const hasPrograms = programCards.length > 0 || settings.programsTitle;

  const navItems: { href: string; label: string; isRoute?: boolean }[] = [{ href: "#top", label: "Home" }];
  if ((settings.menuShowWhy ?? true) && hasWhy) navItems.push({ href: "#why-us", label: "Why us" });
  if ((settings.menuShowPrograms ?? true) && hasPrograms) navItems.push({ href: "#programs", label: "Programs" });
  if ((settings.menuShowGallery ?? true) && homeSections.length > 0) {
    navItems.push({ href: "#gallery", label: settings.galleryTitle?.trim() || "Gallery" });
  }
  if ((settings.menuShowCampus ?? true) && campusSpots.length > 0) navItems.push({ href: "#campus", label: "Campus" });
  if ((settings.menuShowVideos ?? true) && hasAnyVideos) navItems.push({ href: "#videos", label: "Videos" });
  if ((settings.menuShowLeadership ?? true) && management.length > 0) navItems.push({ href: "#leadership", label: "Leadership" });
  if ((settings.menuShowFaq ?? true) && faqItems.length > 0) navItems.push({ href: "#faq", label: "FAQ" });

  const closeMenu = () => setMobileMenuOpen(false);
  const resolveAnchorHref = (href: string) => (isHomeRoute ? href : `/${href}`);
  const HEADER_OFFSET = 96;

  const scrollToAnchor = useCallback((href: string, smooth = true) => {
    const id = href.replace(/^#/, "");
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    if (!isHomeRoute || !location.hash) return;
    const h = location.hash;
    // Let route/layout settle before applying corrected sticky-header offset.
    const t = window.setTimeout(() => scrollToAnchor(h, false), 0);
    return () => window.clearTimeout(t);
  }, [isHomeRoute, location.hash, scrollToAnchor]);

  useEffect(() => {
    if (!isHomeRoute) {
      setActiveHref("");
      return;
    }

    const anchorItems = navItems.filter((n) => !n.isRoute && n.href.startsWith("#"));
    const ids = anchorItems.map((n) => n.href.slice(1));

    const updateActiveByScroll = () => {
      if (window.scrollY < 80) {
        setActiveHref("#top");
        return;
      }
      const marker = 170; // account for sticky header
      let current = "#top";
      for (const id of ids) {
        if (id === "top") continue;
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= marker) current = `#${id}`;
      }
      setActiveHref(current);
    };

    updateActiveByScroll();
    window.addEventListener("scroll", updateActiveByScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveByScroll);
  }, [isHomeRoute, navItems]);

  return (
    <header className={`home-header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container home-header-inner">
        <div className="brand-block">
          <span className="brand-name">{settings.schoolName || "School"}</span>
          {settings.affiliationNote?.trim() ? <span className="brand-tag">{settings.affiliationNote.trim()}</span> : null}
        </div>

        {/* Desktop Nav */}
        <nav className="nav-links desktop-nav" aria-label="Primary">
          {navItems.map((n) => (
            n.isRoute ? (
              <Link
                key={n.href}
                to={n.href}
                className={location.pathname === n.href ? "active" : undefined}
              >
                {n.label}
              </Link>
            ) : (
              <a
                key={n.href}
                href={resolveAnchorHref(n.href)}
                className={activeHref === n.href ? "active" : undefined}
                onClick={(e) => {
                  setActiveHref(n.href);
                  if (isHomeRoute) {
                    e.preventDefault();
                    history.replaceState(null, "", n.href);
                    scrollToAnchor(n.href, true);
                  }
                }}
              >
                {n.label}
              </a>
            )
          ))}
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="mobile-nav-toggle-wrap">
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-drawer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <nav className="mobile-drawer-nav">
              {navItems.map((n) => (
                n.isRoute ? (
                  <Link key={n.href} to={n.href} onClick={closeMenu} className={location.pathname === n.href ? "active" : undefined}>
                    {n.label}
                  </Link>
                ) : (
                  <a
                    key={n.href}
                    href={resolveAnchorHref(n.href)}
                    onClick={(e) => {
                      setActiveHref(n.href);
                      if (isHomeRoute) {
                        e.preventDefault();
                        history.replaceState(null, "", n.href);
                        scrollToAnchor(n.href, true);
                      }
                      closeMenu();
                    }}
                    className={activeHref === n.href ? "active" : undefined}
                  >
                    {n.label}
                  </a>
                )
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
