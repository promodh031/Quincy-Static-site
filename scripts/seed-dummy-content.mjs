/**
 * Seeds Firestore with demo content: ≥4 items per list section, placeholder images
 * (Picsum + pravatar-style URLs), and full siteSettings copy. Uses fixed document IDs
 * so you can re-run safely (merge writes).
 *
 * Requires: Auth Email/Password enabled, an admin user (see npm run seed:admin).
 *
 * Run (from repo root):
 *   npm run seed:dummy
 *
 * Optional env:
 *   ADMIN_EMAIL   (default admin@quincy.school)
 *   ADMIN_PASSWORD (default Quincy@2026)
 */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBNttUs2fdhivQqtODC-_Dgq6_M3LmJJD8",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "quincy-8267a.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "quincy-8267a",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "quincy-8267a.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "830374300842",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:830374300842:web:eadec7fe04f946233454d3",
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@quincy.school";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Quincy@2026";

/** Stable placeholder photos (Picsum — fixed ids). */
const pic = (id, w = 1200, h = 800) => `https://picsum.photos/id/${id}/${w}/${h}`;

/** Portrait-style placeholders (RandomUser static portraits). */
const face = (seed) => `https://randomuser.me/api/portraits/${seed}`;

/** 16 embed-friendly YouTube video IDs (4 categories × 4 clips). */
const YOUTUBE_IDS = [
  "M7lc1UVf-VE",
  "jNQXAC9IVRw",
  "L_jWHffAQ5c",
  "9bZkp7q19f0",
  "kJQP7kiw5Fk",
  "RgKAFK5djSk",
  "OPf0YbXqDm0",
  "YQHsXMglC9A",
  "C0DPdy98e4c",
  "ScMzIvxBSi4",
  "eVTXPUF4OzI",
  "aqz-KE-bpKQ",
  "hY7m5jjJ9mM",
  "QH2-TGUlwu4",
  "fLexgOxsxu8",
  "y8Yv4pnOqc9",
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  console.log("Signing in as", ADMIN_EMAIL, "…");
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log("Auth OK. Writing Firestore…");

  const ts = () => ({ updatedAt: serverTimestamp(), createdAt: serverTimestamp() });

  await setDoc(
    doc(db, "siteSettings", "main"),
    {
      schoolName: "Quincy International Preschool",
      tagline:
        "A warm, child-first campus where early learners build confidence, curiosity, and strong foundations for life.",
      contactPhone: "+91 891 555 0142",
      contactEmail: "admissions@quincy.demo.school",
      address: "Beach Road, Visakhapatnam, Andhra Pradesh 530017, India",
      affiliationNote: "Demo content — replace in Admin",

      heroImageUrl: pic(180, 1920, 960),
      heroEyebrow: "Admissions open · limited seats",
      heroHeadline: "Where little minds grow with joy and purpose",
      heroSubline:
        "Play-based learning, caring educators, and a safe campus designed for preschoolers — inspired by leading early-years schools in India.",
      heroCta1Label: "Watch campus life",
      heroCta1Href: "#videos",
      heroCta2Label: "Plan a visit",
      heroCta2Href: "#contact",

      trustPill1: "CCTV & secure entry",
      trustPill2: "Trained early-years faculty",
      trustPill3: "Nutritious meals",
      trustPill4: "Age-appropriate learning zones",

      recognitionEyebrow: "Recognition",
      recognitionTitle: "Trusted by families across the city",
      recognitionQuote:
        "Parents tell us they chose us for the warmth of our teachers, the clarity of our programs, and how happy their children are at drop-off and pick-up.",

      narrativeTitle: "Our approach to early education",
      narrativeBody:
        "We blend structured routines with free exploration so children feel safe while they learn. Our classrooms are language-rich, our outdoor time is generous, and we partner closely with families on milestones and habits.\n\nThis demo site is fully editable from the admin portal — replace every paragraph, image, and video with your own content before going live.",

      whyEyebrow: "Why families choose us",
      whyTitle: "More than a preschool — a second home",
      whyIntro:
        "From the first phone call to graduation day, we focus on transparency, care, and steady progress you can see.",

      programsEyebrow: "Programs",
      programsTitle: "Age-wise pathways",
      spaceEyebrow: "Campus",
      spaceTitle: "Spaces that spark imagination",
      spaceIntro:
        "Every corner is designed for small hands and big ideas: reading nooks, sensory corners, and shaded outdoor play.",

      galleryEyebrow: "Life at school",
      galleryTitle: "Moments from our week",

      facilitiesEyebrow: "Facilities",
      facilitiesTitle: "Everything under one roof",
      facilityChips: [
        "Smart classrooms",
        "Indoor play arena",
        "Splash pool (seasonal)",
        "Music & movement studio",
        "Safe school transport",
        "Parent app & updates",
      ],

      videosEyebrow: "On camera",
      videosTitle: "Assemblies, celebrations & learning in action",
      videosIntro: "Browse short clips by category — swap these for your own YouTube uploads in Admin.",

      parentsEyebrow: "Leadership",
      parentsTitle: "Voices guiding our school",
      parentsFootnote: "Replace demo quotes with real testimonials from your leadership team.",

      faqEyebrow: "FAQ",
      faqTitle: "Questions parents ask first",
      faqIntro: "Edit these answers anytime in Admin → FAQ.",

      ctaBandTitle: "Ready to see the campus?",
      ctaBandBody: "Book a school tour, meet the coordinators, and understand fees and timings in one visit.",
      ctaBandBtn1: "Call us today",
      ctaBandLink1: "tel:+918915550142",
      ctaBandBtn2: "Email admissions",
      ctaBandLink2: "mailto:admissions@quincy.demo.school",

      footerCol1Title: "Visit & admissions",
      footerCol1Body:
        "Weekday tours 9:30 a.m. – 4:00 p.m. by appointment. Please carry a valid photo ID for campus entry. Replace this copy with your official process, fee policy, and transport routes.",

      ...ts(),
    },
    { merge: true }
  );

  const pillars = [
    { title: "Safety first", body: "Controlled access, CCTV coverage, and staff trained in first aid and child protection protocols." },
    { title: "Small class sizes", body: "Every child gets attention. We cap groups so teachers truly know each learner." },
    { title: "Holistic growth", body: "Language, motor skills, social confidence, and creativity — developed together, not in silos." },
    { title: "Parent partnership", body: "Regular updates, open doors for concerns, and workshops so home and school stay aligned." },
  ];
  for (let i = 0; i < 4; i++) {
    await setDoc(doc(db, "whyPillars", `seed-why-${i}`), { ...pillars[i], order: i, ...ts() }, { merge: true });
  }

  const programs = [
    {
      title: "Playgroup",
      metaLine: "1½ – 2½ years",
      description: "Sensory play, routines, and language immersion in a gentle, nurturing setting.",
      href: "#contact",
    },
    {
      title: "Nursery",
      metaLine: "2½ – 3½ years",
      description: "Pre-math and pre-literacy through games, stories, and collaborative activities.",
      href: "#contact",
    },
    {
      title: "Junior KG",
      metaLine: "3½ – 4½ years",
      description: "Structured inquiry, phonics readiness, and confidence on stage and in the classroom.",
      href: "#videos",
    },
    {
      title: "Senior KG",
      metaLine: "4½ – 5½ years",
      description: "School readiness: focus, independence, and early STEM and literacy projects.",
      href: "#contact",
    },
  ];
  for (let i = 0; i < 4; i++) {
    await setDoc(doc(db, "programCards", `seed-prog-${i}`), { ...programs[i], order: i, ...ts() }, { merge: true });
  }

  const spots = [
    { title: "Discovery library", body: "Picture books, quiet corners, and weekly read-alouds with guest storytellers." },
    { title: "Outdoor learning deck", body: "Shade sails, climbing frames, and water play on scheduled days." },
    { title: "Art & craft atelier", body: "Messy art, clay, and collage stations sized for preschoolers." },
    { title: "Music & movement room", body: "Rhythm, instruments, and dance for gross-motor development and joy." },
  ];
  for (let i = 0; i < 4; i++) {
    await setDoc(doc(db, "campusSpots", `seed-spot-${i}`), { ...spots[i], order: i, ...ts() }, { merge: true });
  }

  const faqs = [
    {
      question: "What are your school timings?",
      answer: "Demo answer: typically 8:30 a.m. to 12:30 p.m. for half-day and extended care until 5:00 p.m. — replace with your real schedule.",
    },
    {
      question: "Do you provide meals?",
      answer: "Demo answer: yes, a vegetarian menu planned with a nutritionist. Share allergy information at admission.",
    },
    {
      question: "How do you handle separation anxiety?",
      answer: "Demo answer: gradual settling-in weeks, buddy teachers, and photo updates so parents feel connected.",
    },
    {
      question: "When does admission open?",
      answer: "Demo answer: rolling admissions subject to seat availability. Replace with your academic year dates.",
    },
  ];
  for (let i = 0; i < 4; i++) {
    await setDoc(doc(db, "faqItems", `seed-faq-${i}`), { ...faqs[i], order: i, ...ts() }, { merge: true });
  }

  const catNames = ["Annual day & culture", "Sports & yoga", "Expert talks", "Classroom moments"];
  for (let c = 0; c < 4; c++) {
    await setDoc(
      doc(db, "videoCategories", `seed-cat-${c}`),
      { name: catNames[c], order: c, ...ts() },
      { merge: true }
    );
  }

  let y = 0;
  for (let c = 0; c < 4; c++) {
    for (let v = 0; v < 4; v++) {
      await setDoc(
        doc(db, "videos", `seed-vid-${c}-${v}`),
        {
          categoryId: `seed-cat-${c}`,
          youtubeVideoId: YOUTUBE_IDS[y++],
          title: `${catNames[c]} — clip ${v + 1}`,
          order: v,
          ...ts(),
        },
        { merge: true }
      );
    }
  }

  const mgmt = [
    {
      name: "Dr. Ananya Rao",
      role: "Founder & Academic Director",
      photoUrl: face("women/65.jpg"),
      testimonial:
        "We built this school so every child feels seen. Our teachers celebrate small wins every day — because that is how lifelong learners are made.",
    },
    {
      name: "Karthik Menon",
      role: "Principal",
      photoUrl: face("men/32.jpg"),
      testimonial:
        "Discipline with warmth is our mantra. Parents should always know what their child learned and how they felt at school.",
    },
    {
      name: "Priya Nair",
      role: "Head of Early Years",
      photoUrl: face("women/68.jpg"),
      testimonial:
        "Play is serious work for preschoolers. Our spaces and schedules are designed around how children actually develop.",
    },
    {
      name: "Rahul Verma",
      role: "Operations & Parent Relations",
      photoUrl: face("men/45.jpg"),
      testimonial:
        "Smooth admissions, safe transport, and clear communication — so families can focus on their child, not paperwork.",
    },
  ];
  for (let i = 0; i < 4; i++) {
    await setDoc(doc(db, "management", `seed-mgmt-${i}`), { ...mgmt[i], order: i, ...ts() }, { merge: true });
  }

  const sectionDefs = [
    {
      title: "Pongal & harvest week",
      description:
        "Children decorated the courtyard, learned about gratitude to farmers, and shared sweet pongal with friends — a colourful start to the term.",
      imageIds: [101, 102, 103, 104],
    },
    {
      title: "Science discovery morning",
      description:
        "Simple experiments with water, magnets, and seeds — little scientists making predictions and recording drawings.",
      imageIds: [29, 30, 31, 237],
    },
    {
      title: "Sports day highlights",
      description:
        "Obstacle races, parachute games, and medals for teamwork. Parents cheered from the stands as every child crossed the finish line.",
      imageIds: [42, 152, 193, 219],
    },
    {
      title: "Grandparents’ coffee morning",
      description:
        "Stories from another generation, songs in regional languages, and handmade cards — bridging home and school traditions.",
      imageIds: [28, 39, 57, 60],
    },
  ];
  for (let i = 0; i < 4; i++) {
    const images = sectionDefs[i].imageIds.map((id) => pic(id, 1000, 700));
    await setDoc(
      doc(db, "homeSections", `seed-home-${i}`),
      {
        title: sectionDefs[i].title,
        description: sectionDefs[i].description,
        order: i,
        images,
        ...ts(),
      },
      { merge: true }
    );
  }

  console.log("Done. Open the public site and Admin to review or edit demo content.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
    console.error("Hint: create the admin user with npm run seed:admin or set ADMIN_EMAIL / ADMIN_PASSWORD.");
  }
  process.exit(1);
});
