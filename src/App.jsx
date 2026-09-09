import { sanityClient } from "./sanityClient";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "@studio-freight/lenis";
import "./App.css";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState({
    type: "home",
    sub: "Home",
  });
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    message: "",
  });

  const [sanityGalleryData, setSanityGalleryData] = useState({});
  const [loadingSanity, setLoadingSanity] = useState(true);

  // Lightbox state for full-screen image preview
  const [lightboxImage, setLightboxImage] = useState(null);

  const lenisRef = useRef(null);

  // 1. Fetch Live Content from Sanity CMS with Strict Media Type Separation
  useEffect(() => {
    sanityClient
      .fetch(
        `*[_type == "galleryItem"]{
          _id,
          title,
          category,
          mediaType,
          "url": image.asset->url,
          embedUrl
        }`,
      )
      .then((data) => {
        const grouped = data.reduce((acc, item) => {
          const cat = item.category || "Home";
          if (!acc[cat]) acc[cat] = [];

          acc[cat].push({
            id: item._id,
            title: item.title,
            mediaType: item.mediaType,
            url: item.mediaType === "image" ? item.url : null,
            embedUrl: item.mediaType === "video" ? item.embedUrl : null,
          });
          return acc;
        }, {});

        setSanityGalleryData(grouped);
        setLoadingSanity(false);
      })
      .catch((err) => {
        console.error("Sanity fetch error:", err);
        setLoadingSanity(false);
      });
  }, []);

  // Formspree Submission Handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ submitting: true, message: "Sending..." });

    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mgaeyrny", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setFormStatus({
          submitting: false,
          message: "Thank you! Your message has been sent successfully.",
        });
        form.reset();
      } else {
        const errorData = await response.json();
        setFormStatus({
          submitting: false,
          message:
            errorData?.errors?.[0]?.message ||
            "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Formspree Submission Error:", error);
      setFormStatus({
        submitting: false,
        message:
          "Error submitting form. Please turn off browser ad-blockers and try again.",
      });
    }
  };

  // High-Speed Lenis Smooth Scroll Setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.2,
      touchMultiplier: 1.5,
      smoothWheel: true,
      smoothTouch: false,
    });

    lenisRef.current = lenis;
    let animationFrameId;

    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.resize();
    }
  }, [selectedCategory, sanityGalleryData]);

  const navigationData = {
    photography: [
      "Advertising",
      "Architecture",
      "Events",
      "F&B",
      "Fashion",
      "Industrial",
      "Travel and landscape",
    ],
    video: [
      "Advertising",
      "Architecture",
      "Events",
      "F&B",
      "Fashion",
      "Industrial",
    ],
  };

  const servicesData = [
    {
      title: "Commercial & Brand Cinematography",
      description:
        "High-concept brand films, commercial TVCs, and promotional cuts designed with intentional lighting, deliberate motion, and cinematic sound design.",
    },
    {
      title: "Architectural & Interior Stills",
      description:
        "Precise spatial photography focusing on light play, geometric symmetry, structural textures, and real estate ambiance.",
    },
    {
      title: "Fashion & Editorial Portraits",
      description:
        "Character-driven portraiture and fashion editorials crafted with rich color grading and authentic visual depth.",
    },
  ];

  const fallbackGalleryData = {
    Home: [],
    Photography: [],
    Advertising: [],
    Architecture: [],
    Events: [],
    "F&B": [],
    Fashion: [],
    Industrial: [],
    "Travel and landscape": [],
    "Video Production": [],
  };

  // Filter items dynamically based on whether current view is photography or video section
  const rawGalleryItems =
    sanityGalleryData[selectedCategory.sub] &&
    sanityGalleryData[selectedCategory.sub].length > 0
      ? sanityGalleryData[selectedCategory.sub]
      : fallbackGalleryData[selectedCategory.sub] || [];

  const currentGalleryItems = rawGalleryItems.filter((item) => {
    if (selectedCategory.type === "photography") {
      return item.mediaType === "image";
    }
    if (selectedCategory.type === "video") {
      return item.mediaType === "video";
    }
    return true; // For Home or other views
  });

  const handleCategorySelect = (type, sub) => {
    setSelectedCategory({ type, sub });
    setOpenDropdown(null);
    setMobileMenuOpen(false);

    const workSection = document.querySelector("#work");
    if (workSection) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(workSection);
      } else {
        workSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(id);
    if (element) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(element);
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const goHome = () => {
    setSelectedCategory({ type: "home", sub: "Home" });
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const fallbackImageDataUri =
    "data:image/svg+xml;charset=UTF-8,%3Csvg width='900' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%231a1714'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23a39585' font-family='sans-serif' font-size='18'%3EImage Unavailable%3C/text%3E%3C/svg%3E";

  const activeSubcategories =
    selectedCategory.type === "photography"
      ? [
          { label: "All Photography", sub: "Photography" },
          ...navigationData.photography.map((sub) => ({ label: sub, sub })),
        ]
      : selectedCategory.type === "video"
        ? [
            { label: "All Videos", sub: "Video Production" },
            ...navigationData.video.map((sub) => ({ label: sub, sub })),
          ]
        : [];

  return (
    <div className="container">
      {/* Navigation Header */}
      <nav className="navbar">
        <motion.button
          className="logo-btn"
          onClick={goHome}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          VANILLA PRODUCTIONS
        </motion.button>

        <button
          className="menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <li className="nav-item">
            <button
              className={`nav-link-btn ${
                selectedCategory.sub === "Home" ? "active-nav" : ""
              }`}
              onClick={goHome}
            >
              Home
            </button>
          </li>

          <li
            className="nav-item"
            onMouseEnter={() =>
              window.innerWidth > 900 && setOpenDropdown("photography")
            }
            onMouseLeave={() =>
              window.innerWidth > 900 && setOpenDropdown(null)
            }
          >
            <button
              type="button"
              className={`nav-link-btn ${
                selectedCategory.type === "photography" ? "active-nav" : ""
              }`}
              onClick={() => handleCategorySelect("photography", "Photography")}
            >
              Photography <span className="chevron desktop-only">▼</span>
            </button>

            {openDropdown === "photography" && (
              <motion.ul
                className="dropdown-menu desktop-only"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                {navigationData.photography.map((sub) => (
                  <li key={sub} className="dropdown-item">
                    <button
                      type="button"
                      className={selectedCategory.sub === sub ? "active" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategorySelect("photography", sub);
                      }}
                    >
                      {sub}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </li>

          <li
            className="nav-item"
            onMouseEnter={() =>
              window.innerWidth > 900 && setOpenDropdown("video")
            }
            onMouseLeave={() =>
              window.innerWidth > 900 && setOpenDropdown(null)
            }
          >
            <button
              type="button"
              className={`nav-link-btn ${
                selectedCategory.type === "video" ? "active-nav" : ""
              }`}
              onClick={() => handleCategorySelect("video", "Video Production")}
            >
              Video Production <span className="chevron desktop-only">▼</span>
            </button>

            {openDropdown === "video" && (
              <motion.ul
                className="dropdown-menu desktop-only"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                {navigationData.video.map((sub) => (
                  <li key={sub} className="dropdown-item">
                    <button
                      type="button"
                      className={selectedCategory.sub === sub ? "active" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategorySelect("video", sub);
                      }}
                    >
                      {sub}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </li>

          <li className="nav-item">
            <button
              className="nav-link-btn"
              onClick={() => scrollToSection("#contact")}
            >
              Contact
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div id="scroll-wrapper">
        <div id="scroll-content">
          {/* Hero Header */}
          <section className="hero">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span>Independent Creative Studio</span>
            </motion.div>

            <motion.h1
              key={selectedCategory.sub}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {selectedCategory.sub === "Home"
                ? "VISUALS THAT SPEAK IN SILENCE."
                : selectedCategory.sub}
            </motion.h1>

            <motion.p
              key={selectedCategory.type}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {selectedCategory.sub === "Home"
                ? "Cinematography, brand films, and architectural frames engineered for timeless resonance."
                : `${selectedCategory.type.toUpperCase()} COLLECTION`}
            </motion.p>
          </section>

          {/* Creative Ethos */}
          <section className="section about-section">
            <span className="sub-tag">Our Ethos</span>
            <motion.h2
              className="headline-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              We bypass temporary aesthetics to capture{" "}
              <em>light, shadow, & emotion</em>, turning raw concepts into
              lasting legacies.
            </motion.h2>

            <p className="body-text">
              Vanilla Productions is an independent studio specializing in
              high-concept commercial films, structural spatial work, and
              intimate portraits. Every frame is deliberate, crafted to make
              your audience pause and reflect.
            </p>

            <div className="category-pills">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  handleCategorySelect("photography", "Photography")
                }
              >
                Explore Photography
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  handleCategorySelect("video", "Video Production")
                }
              >
                Film & Cinematography
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollToSection("#contact")}
              >
                Inquire Project
              </motion.button>
            </div>
          </section>

          {/* Capabilities Accordion (Home Only) */}
          {selectedCategory.sub === "Home" && (
            <section className="section accordion-section">
              <span className="sub-tag">Capabilities</span>
              <h2 className="headline-text" style={{ fontSize: "1.8rem" }}>
                Disciplines designed for brands that refuse to blend in.
              </h2>

              <div className="accordion-wrapper">
                {servicesData.map((service, idx) => (
                  <div
                    key={idx}
                    className={`accordion-item ${
                      activeAccordion === idx ? "active" : ""
                    }`}
                    onClick={() =>
                      setActiveAccordion(activeAccordion === idx ? null : idx)
                    }
                  >
                    <div className="accordion-header">
                      <h3>{service.title}</h3>
                      <span className="accordion-icon">
                        {activeAccordion === idx ? "−" : "+"}
                      </span>
                    </div>

                    <AnimatePresence>
                      {activeAccordion === idx && (
                        <motion.div
                          className="accordion-content"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p>{service.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Portfolio Grid */}
          <section id="work" className="section">
            <div className="section-title-row">
              <h2>
                {selectedCategory.sub === "Home"
                  ? "Featured Selected Works"
                  : `${selectedCategory.sub} Gallery`}
              </h2>
            </div>

            {activeSubcategories.length > 0 && (
              <div className="mobile-subcategory-bar">
                {activeSubcategories.map((item) => (
                  <button
                    key={item.sub}
                    className={`sub-btn ${
                      selectedCategory.sub === item.sub ? "active-sub" : ""
                    }`}
                    onClick={() =>
                      handleCategorySelect(selectedCategory.type, item.sub)
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {loadingSanity ? (
              <div className="empty-category-state">
                <p>Loading curated works...</p>
              </div>
            ) : currentGalleryItems.length > 0 ? (
              <div className="film-strip-grid">
                {currentGalleryItems.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    className="film-frame"
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      if (item.url) setLightboxImage(item);
                    }}
                    style={{ cursor: item.url ? "pointer" : "default" }}
                  >
                    <div
                      className={`media-container ${
                        item.embedUrl ? "video-card" : ""
                      }`}
                    >
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={
                            item.title || "Vanilla Productions Gallery Image"
                          }
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImageDataUri;
                          }}
                        />
                      ) : item.embedUrl ? (
                        <iframe
                          src={item.embedUrl}
                          title={item.title || "Video Project"}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="media-placeholder">
                          No Media Available
                        </div>
                      )}

                      <div className="media-overlay-meta">
                        <span>{item.title || "Untitled Project"}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="empty-category-state">
                <p>No work published under "{selectedCategory.sub}" yet.</p>
              </div>
            )}
          </section>

          {/* Contact Section */}
          <section id="contact" className="section">
            <h2>Get In Touch</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Have a shoot, campaign, or collaboration in mind? Drop us a line
              below.
            </p>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <input type="text" name="name" placeholder="Your Name" required />
              <input
                type="email"
                name="email"
                placeholder="Your Email Address"
                required
              />
              <textarea
                name="message"
                placeholder="Tell us about your project or vision"
                rows="5"
                required
              ></textarea>

              <motion.button
                type="submit"
                disabled={formStatus.submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {formStatus.submitting ? "Sending..." : "Send Message"}
              </motion.button>

              {formStatus.message && (
                <p
                  style={{
                    marginTop: "1rem",
                    color: "var(--accent-gold)",
                    fontSize: "0.9rem",
                  }}
                >
                  {formStatus.message}
                </p>
              )}
            </form>
          </section>

          {/* Footer Section */}
          <footer className="site-footer">
            <div className="footer-content">
              <button className="logo-btn footer-logo" onClick={goHome}>
                VANILLA PRODUCTIONS
              </button>
              <p className="footer-copyright">
                © {new Date().getFullYear()} Vanilla Productions. All rights
                reserved.
              </p>
              <div className="social-links">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Lightbox Modal Overlay */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              className="lightbox-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="lightbox-close"
                onClick={() => setLightboxImage(null)}
                aria-label="Close Lightbox"
              >
                ✕
              </button>
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title || "Full View"}
              />
              <div className="lightbox-caption">
                <h3>{lightboxImage.title || "Untitled Project"}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
