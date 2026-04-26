import { usePublicContent } from "../hooks/usePublicContent";
import HomeHero from "./HomeHero";
import WhyUs from "./WhyUs";
import Programs from "./Programs";
import Gallery from "./Gallery";
import Campus from "./Campus";
import Videos from "./Videos";
import Leadership from "./Leadership";
import Faq from "./Faq";
import Header from "../components/Header";
import ScrollToTop from "../components/ScrollToTop";
import "./Home.css";

export default function Home() {
  const { settings, homeSections, campusSpots, categories, videos, management, faqItems, whyPillars, programCards, loading } = usePublicContent();
  if (loading) {
    return (
      <div className="page-loading">
        <span className="material-symbols-outlined spin">progress_activity</span>
      </div>
    );
  }
  const hasAnyVideos = categories.some((c) => videos.some((v) => v.categoryId === c.id));
  const hasWhy = whyPillars.length > 0 || Boolean(settings.whyTitle?.trim());
  const hasPrograms = programCards.length > 0 || Boolean(settings.programsTitle?.trim());
  const hasGallery = homeSections.length > 0;
  const hasCampus = campusSpots.length > 0 || Boolean(settings.spaceTitle?.trim() || settings.spaceEyebrow?.trim() || settings.spaceIntro?.trim());
  const hasLeadership = management.length > 0 || Boolean(settings.parentsTitle?.trim() || settings.parentsEyebrow?.trim());
  const hasFaq = faqItems.length > 0 || Boolean(settings.faqTitle?.trim() || settings.faqEyebrow?.trim() || settings.faqIntro?.trim());

  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <HomeHero />
        {(settings.menuShowWhy ?? true) && hasWhy ? <WhyUs /> : null}
        {(settings.menuShowPrograms ?? true) && hasPrograms ? <Programs /> : null}
        {(settings.menuShowGallery ?? true) && hasGallery ? <Gallery /> : null}
        {(settings.menuShowCampus ?? true) && hasCampus ? <Campus /> : null}
        {(settings.menuShowVideos ?? true) && hasAnyVideos ? <Videos /> : null}
        {(settings.menuShowLeadership ?? true) && hasLeadership ? <Leadership /> : null}
        {(settings.menuShowFaq ?? true) && hasFaq ? <Faq /> : null}
      </main>
      
      <footer className="home-footer">
        <div className="container footer-grid">
          {settings.footerCol1Title?.trim() || settings.footerCol1Body?.trim() ? (
            <div className="footer-col">
              {settings.footerCol1Title?.trim() ? <h3>{settings.footerCol1Title.trim()}</h3> : null}
              {settings.footerCol1Body?.trim() ? (
                <p className="mm-footer-prose">{settings.footerCol1Body.trim()}</p>
              ) : null}
            </div>
          ) : null}
          <div className="footer-col" id="contact">
            <h3>Contact</h3>
            <address>
              {settings.address}
              <br />
              <a href={`tel:${settings.contactPhone?.replace(/\s/g, "")}`}>{settings.contactPhone}</a>
              <br />
              <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
            </address>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </>
  );
}
