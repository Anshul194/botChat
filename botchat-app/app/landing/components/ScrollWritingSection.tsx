"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";

// ─── DATA ────────────────────────────────────────────────────────────────────

const MENTORS = [
  { id: 1, name: "Anatolii Amelin", role: "Co-founder & Director", img: "https://randomuser.me/api/portraits/men/32.jpg", gridCol: 1, gridRow: 1 },
  { id: 2, name: "Artur Lupashko", role: "Founder & CEO, Ribas Hotels", img: "https://randomuser.me/api/portraits/men/41.jpg", gridCol: 2, gridRow: 1 },
  { id: 3, name: "Inna Pecherytsia", role: "HRD at EVA retail chain", img: "https://randomuser.me/api/portraits/women/65.jpg", gridCol: 3, gridRow: 1 },
  { id: 4, name: "Dmytro Melnykovych", role: "Expert and mentor in personnel", img: "https://randomuser.me/api/portraits/men/44.jpg", gridCol: 4, gridRow: 1 },
  { id: 5, name: "Yevhen Shahov", role: "Owner of Age Management", img: "https://randomuser.me/api/portraits/men/55.jpg", gridCol: 5, gridRow: 1 },
  { id: 6, name: "Olha Tadai", role: "Head of Strategic Industry", img: "https://randomuser.me/api/portraits/women/23.jpg", gridCol: 1, gridRow: 2 },
  { id: 7, name: "Rostyslav Petchenko", role: "Co-founder & C-group", img: "https://randomuser.me/api/portraits/men/61.jpg", gridCol: 2, gridRow: 2 },
];

// Final positions on the map (as % of container width/height) after scatter
const SCATTER_POSITIONS = [
  { x: 18, y: 54, scale: 0.76 },
  { x: 28, y: 68, scale: 0.83 },
  { x: 43, y: 49, scale: 0.8 },
  { x: 58, y: 34, scale: 0.82 },
  { x: 74, y: 26, scale: 0.86 },
  { x: 12, y: 66, scale: 0.72 },
  { x: 35, y: 72, scale: 0.78 },
];

// Country pins on the map
const COUNTRY_PINS = [
  { label: "966", x: 53.5, y: 40 },
  { label: "89",  x: 49.5, y: 36 },
  { label: "57",  x: 47.5, y: 40 },
  { label: "67",  x: 44.5, y: 41 },
  { label: "15",  x: 27.5, y: 38 },
  { label: "15",  x: 28.5, y: 43 },
  { label: "7",   x: 30.5, y: 44 },
  { label: "9",   x: 52,   y: 47 },
  { label: "67",  x: 58,   y: 55 },
];

// ─── WORLD MAP SVG (simplified continent paths) ──────────────────────────────

function WorldMap({ highlightedRegions }: { highlightedRegions: boolean }) {
  return (
    <svg
      viewBox="0 0 1000 500"
      className="w-full h-full"
      style={{ display: "block" }}
    >
      {/* Base continents - subtle gray violet */}
      <g fill={highlightedRegions ? "#b7a7c0" : "#d8d2dc"} stroke="#fff" strokeWidth="0.5" opacity="0.82">
        {/* North America */}
        <path d="M85,60 L185,50 L210,65 L230,80 L220,120 L200,150 L185,180 L165,200 L140,220 L120,215 L100,200 L80,180 L70,150 L65,120 L70,90 Z" />
        {/* South America */}
        <path d="M160,230 L200,220 L215,240 L220,270 L215,310 L200,350 L180,380 L160,395 L145,385 L135,360 L130,320 L140,280 L145,250 Z" />
        {/* Europe */}
        <path d="M430,55 L490,45 L510,55 L520,70 L510,90 L490,100 L470,105 L450,100 L435,85 L428,70 Z" />
        {/* Africa */}
        <path d="M440,120 L500,110 L530,120 L545,150 L548,200 L540,250 L520,300 L490,340 L465,360 L445,350 L425,320 L415,280 L412,230 L418,180 L425,150 Z" />
        {/* Asia */}
        <path d="M520,40 L650,30 L750,35 L820,50 L860,70 L870,110 L850,140 L800,155 L750,160 L700,155 L650,145 L600,130 L560,115 L530,100 L515,80 Z" />
        {/* Oceania */}
        <path d="M730,280 L790,270 L830,280 L845,310 L835,340 L810,355 L780,350 L758,330 L748,305 Z" />
        {/* Scandinavia/UK */}
        <path d="M435,40 L460,32 L475,38 L472,52 L460,58 L445,55 Z" />
        {/* Greenland */}
        <path d="M235,18 L290,10 L315,20 L320,40 L305,55 L275,58 L250,50 L233,38 Z" />
      </g>

      {/* Highlighted regions (Eastern Europe / Ukraine area) */}
      {highlightedRegions && (
        <g fill="#8f789f" stroke="#fff" strokeWidth="0.5" opacity="0.9">
          {/* Eastern Europe highlight */}
          <path d="M490,45 L540,40 L555,55 L550,75 L535,90 L515,95 L498,88 L488,72 L487,58 Z" />
          {/* Central Europe */}
          <path d="M450,60 L488,55 L490,72 L480,85 L462,88 L448,78 Z" />
          {/* North America highlight */}
          <path d="M130,80 L180,72 L195,88 L190,115 L175,135 L155,140 L135,130 L122,110 L120,90 Z" />
        </g>
      )}
    </svg>
  );
}

// ─── MENTOR CARD ─────────────────────────────────────────────────────────────

function MentorCard({
  mentor,
  progress,
  index,
}: {
  mentor: (typeof MENTORS)[0];
  progress: number;
  index: number;
}) {
  const scatter = SCATTER_POSITIONS[index];

  // Grid position (0 = start, scatter = end)
  // Grid: 5 columns top row, 2 bottom row
  const isBottom = mentor.gridRow === 2;
  const col = mentor.gridCol - 1;

  // Grid coords as percent (card size ~18% wide, 28% tall)
  const gridX = col * 19 + 1;
  const gridY = isBottom ? 52 : 5;

  const scatterProgress = Math.max(0, Math.min(1, (progress - 0.15) / 0.35));
  const eased = scatterProgress < 0.5
    ? 2 * scatterProgress * scatterProgress
    : 1 - Math.pow(-2 * scatterProgress + 2, 2) / 2;

  const x = gridX + (scatter.x - gridX) * eased;
  const y = gridY + (scatter.y - gridY) * eased;
  const scale = 1 + (scatter.scale - 1) * eased;
  const cardOpacity =
    progress < 0.08
      ? progress / 0.08
      : progress > 0.3
      ? Math.max(0, 1 - (progress - 0.3) / 0.16)
      : 1;
  const rotate = (index % 2 === 0 ? -1.8 : 1.8) * (1 - eased);
  const flipIn = progress < 0.12 ? (1 - progress / 0.12) * 78 : 0;
  const flipOut = progress > 0.3 ? Math.min(78, ((progress - 0.3) / 0.15) * 78) : 0;
  const flipY = Math.max(0, flipIn + flipOut);

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `perspective(900px) rotateY(${flipY}deg) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: "top left",
        opacity: cardOpacity,
        transition: "none",
        zIndex: mentor.gridRow === 1 ? 10 : 9,
        backfaceVisibility: "hidden",
      }}
    >
      <div
        style={{
          width: 192,
          borderRadius: 16,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 10px 26px rgba(17, 24, 39, 0.18)",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.65)",
        }}
      >
        <img
          src={mentor.img}
          alt={mentor.name}
          style={{ width: "100%", height: 208, objectFit: "cover", display: "block" }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
          }}
        />
        {/* Mentor badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "#E1306C",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: 20,
          }}
        >
          Mentor
        </div>
        {/* Name & role */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
            {mentor.name}
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>
            {mentor.role.length > 28 ? mentor.role.slice(0, 28) + "…" : mentor.role}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOCATION PIN ─────────────────────────────────────────────────────────────

function LocationPin({ pin, delay, visible }: { pin: (typeof COUNTRY_PINS)[0]; delay: number; visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 10 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0, y: 10 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        left: `${pin.x}%`,
        top: `${pin.y}%`,
        transform: "translate(-50%, -100%)",
        zIndex: 20,
      }}
    >
      {/* Pin shape */}
      <div
        style={{
          background: "#E1306C",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          padding: "6px 12px",
          borderRadius: 20,
          whiteSpace: "nowrap",
          position: "relative",
          boxShadow: "0 2px 12px rgba(225,48,108,0.35)",
        }}
      >
        {pin.label}
        {/* Triangle pointer */}
        <div
          style={{
            position: "absolute",
            bottom: -7,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "8px solid #E1306C",
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── MAIN SECTION ─────────────────────────────────────────────────────────────

export default function BoardScrollSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setProgress(Math.max(0, Math.min(1, v)));
  });

  // Phase detection
  const showMap = progress > 0.38;
  const showCountriesHeading = progress > 0.54;
  const showPins = progress > 0.84;
  const showMission = progress > 0.9;
  const showValuesStage = progress > 0.975;
  const headingOpacity = Math.max(0, Math.min(1, (progress - 0.54) / 0.08));
  const mapScale = 0.98 + Math.max(0, Math.min(0.04, (progress - 0.38) * 0.1));
  const showCitiesStage = progress > 0.72;
  const citiesCount = 10 + Math.round(Math.max(0, Math.min(23, ((progress - 0.72) / 0.15) * 23)));

  const headlineText = showCitiesStage ? `${citiesCount} cities` : "10 countries";

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "500vh",
        background: "radial-gradient(circle at 12% 18%, rgba(225,48,108,0.08), transparent 38%), radial-gradient(circle at 88% 82%, rgba(245,158,11,0.10), transparent 42%), #fdf8f5",
      }}
    >
      {/* Sticky container */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "transparent",
        }}
      >
        {/* ── World Map (after cards are gone) ── */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          animate={{ opacity: showMap ? 1 : 0, scale: mapScale, y: showMap ? 0 : 24 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              padding: "150px 42px 28px",
              background: "#ece9ef",
              overflow: "hidden",
            }}
          >
            <WorldMap highlightedRegions={showCountriesHeading} />

            {/* Country pins */}
            {COUNTRY_PINS.map((pin, i) => (
              <LocationPin
                key={i}
                pin={pin}
                delay={i * 0.07}
                visible={showPins}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Mentor Cards ── */}
        <div style={{ position: "absolute", inset: 0 }}>
          {MENTORS.map((mentor, i) => (
            <MentorCard key={mentor.id} mentor={mentor} progress={progress} index={i} />
          ))}
        </div>

        {/* ── "10 countries" heading ── */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            textAlign: "center",
            padding: "76px 24px 0",
            pointerEvents: "none",
            zIndex: 30,
          }}
          animate={{ opacity: headingOpacity }}
        >
          <h2
            style={{
              fontSize: "clamp(3rem, 9vw, 7rem)",
              fontWeight: 800,
              color: "#111827",
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            {headlineText}
          </h2>
        </motion.div>

        {/* ── Mission section (slides up from bottom) ── */}
        <motion.div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "26px 34px",
            background: "linear-gradient(to top, rgba(253,248,245,0.98) 58%, rgba(253,248,245,0.25))",
            zIndex: 30,
          }}
          animate={{
            opacity: showMission ? 1 : 0,
            y: showMission ? 0 : 40,
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 38,
              maxWidth: 1220,
              margin: "0 auto",
              borderRadius: 20,
              border: "1px solid rgba(225,48,108,0.18)",
              background: "rgba(255,255,255,0.92)",
              boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
              padding: "22px 30px",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(2.3rem, 5.6vw, 4.6rem)",
                fontWeight: 800,
                color: "#111827",
                margin: 0,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                flexShrink: 0,
              }}
            >
              {showValuesStage ? "Values" : "Mission"}
            </h2>
            <div style={{ paddingTop: 8 }}>
              <div style={{ display: "inline-flex", borderRadius: 999, border: "1px solid rgba(225,48,108,0.22)", overflow: "hidden", marginBottom: 10 }}>
                <span
                  style={{
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    background: showValuesStage ? "#fff" : "#ffe4ef",
                    color: showValuesStage ? "#64748b" : "#9f1239",
                  }}
                >
                  Mission
                </span>
                <span
                  style={{
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    background: showValuesStage ? "#ffe4ef" : "#fff",
                    color: showValuesStage ? "#9f1239" : "#64748b",
                  }}
                >
                  Values
                </span>
              </div>
              <motion.p
                key={showValuesStage ? "values" : "mission"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.35rem)",
                  color: "#6b6b6b",
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {showValuesStage
                  ? "Board is built on honesty, openness, trust, mutual respect, support, and win-win partnerships across every chapter."
                  : "To foster modern business culture and elevate the global competitiveness of entrepreneurs united by shared values, trust, and equality."}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}