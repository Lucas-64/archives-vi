import { useState } from "react";
import {
  Search,
  ChevronRight,
  MapPin,
  Camera,
  Users,
  Eye,
  MessageSquare,
  TrendingUp,
  Star,
  Clock,
  Shield,
  Zap,
  Radio,
  Crosshair,
  FileText,
  ArrowUpRight,
  Circle,
  Play,
  Filter,
} from "lucide-react";
import heroPhoto from "@/imports/ChatGPT_Image_24_de_jun._de_2026__01_29_07.png";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

// ─── Palette ──────────────────────────────────────────────────────────────────
const PINK = "#ff2d6b";
const PURPLE = "#9b44ff";
const TEAL = "#00d4ff";

// ─── Data ─────────────────────────────────────────────────────────────────────
const navLinks = ["Home", "Cases", "Theories", "Map", "Gallery", "Forum"];

const investigators = [
  { name: "V1CE_Hunter", status: "Investigating Case #44", avatar: "V" },
  { name: "NeonGhost", status: "Uploading evidence", avatar: "N" },
  { name: "LeonidaX", status: "Reviewing the map", avatar: "L" },
  { name: "SignalLost", status: "Active in Forum", avatar: "S" },
  { name: "ArchivistZ", status: "Confirmed a theory", avatar: "A" },
];

const activeCases = [
  {
    id: "CASE-044",
    title: "UFO Sighting Over Vice Beach",
    category: "Paranormal",
    status: "Active",
    statusColor: PINK,
    investigators: 87,
    evidence: 34,
    lastUpdate: "2h ago",
    image: "https://images.unsplash.com/photo-1489493173507-6feea31f12ff?w=480&h=280&fit=crop&auto=format",
    description: "Multiple witnesses report strange lights forming geometric patterns above the coastline at 2:00 AM.",
    icon: Zap,
  },
  {
    id: "CASE-038",
    title: "Encrypted Radio Signal FREQ-88",
    category: "Cryptic",
    status: "Ongoing",
    statusColor: PURPLE,
    investigators: 53,
    evidence: 21,
    lastUpdate: "5h ago",
    image: "https://images.unsplash.com/photo-1612892483236-52d32a0e0ac1?w=480&h=280&fit=crop&auto=format",
    description: "A repeating signal only audible between 2–4 AM in-game time has been decoded into partial coordinates.",
    icon: Radio,
  },
  {
    id: "CASE-031",
    title: "The Sunken Structure at Mile 33",
    category: "Location",
    status: "Verified",
    statusColor: "#00d4ff",
    investigators: 124,
    evidence: 67,
    lastUpdate: "1d ago",
    image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=480&h=280&fit=crop&auto=format",
    description: "Divers mapped an underwater facility matching no official map data. Entry points still unknown.",
    icon: MapPin,
  },
];

const theories = [
  {
    id: "T-019",
    title: "The '33' Frequency is a Map Cipher",
    author: "LeonidaX",
    votes: 1204,
    confidence: 78,
    tags: ["Coordinates", "Cipher", "Radio"],
    excerpt:
      "Every instance of the number 33 found across Leonida — highway markers, NPC dialogue, graffiti — maps to a single location when converted via Base-33 encoding.",
  },
  {
    id: "T-017",
    title: "Developer Left a Hidden Timeline in Loading Screens",
    author: "ArchivistZ",
    votes: 891,
    confidence: 61,
    tags: ["Meta", "Developers", "Lore"],
    excerpt:
      "Frame-by-frame analysis of all 28 loading screen images reveals a chronological narrative when sorted by a hidden pixel checksum embedded in the alpha channel.",
  },
  {
    id: "T-022",
    title: "Leonida Hills Has a Second Entrance via Sewer Grid",
    author: "V1CE_Hunter",
    votes: 743,
    confidence: 55,
    tags: ["Location", "Exploration"],
    excerpt:
      "Dataminers found an inaccessible collision mesh beneath the hills. The sewer system seems to connect — no one has found the trigger.",
  },
  {
    id: "T-011",
    title: "The Abandoned Motel is a Repeating In-Game Timestamp",
    author: "NeonGhost",
    votes: 612,
    confidence: 44,
    tags: ["Time", "Location", "NPC"],
    excerpt:
      "The motel clock always shows 3:17. Combining this with NPC schedules and moon position, researchers believe it marks a unique in-game event window.",
  },
];

const galleryItems = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1562884972-ea1e4ae7e848?w=600&h=380&fit=crop&auto=format",
    title: "Aerial Route 1 — Strange Patterns",
    author: "V1CE_Hunter",
    case: "CASE-044",
    wide: true,
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1582987144051-9031c6a85290?w=300&h=380&fit=crop&auto=format",
    title: "Vice Beach at 3AM",
    author: "NeonGhost",
    case: "CASE-044",
    wide: false,
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1568405336404-1fefdca58699?w=300&h=180&fit=crop&auto=format",
    title: "Leonida Hills Signal Tower",
    author: "SignalLost",
    case: "CASE-038",
    wide: false,
  },
  {
    id: 4,
    src: "https://images.unsplash.com/20/dusty-sky.JPG?w=300&h=180&fit=crop&auto=format",
    title: "Desert Coordinates — Confirmed",
    author: "ArchivistZ",
    case: "CASE-031",
    wide: false,
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1704134752504-f0d89ac25539?w=300&h=180&fit=crop&auto=format",
    title: "Overhead Map Anomaly",
    author: "LeonidaX",
    case: "CASE-038",
    wide: false,
  },
];

const trending = [
  { rank: 1, title: "Jetpack confirmed by dataminers — location pinpointed to CASE-031", hot: true, views: "48.2k", time: "1h ago" },
  { rank: 2, title: "New NPC dialogue discovered referencing 'Project Leonida' at Malibu Club", hot: true, views: "31.7k", time: "3h ago" },
  { rank: 3, title: "Moon phase triggers ghost car spawn — reproducible on all platforms", hot: false, views: "19.4k", time: "6h ago" },
  { rank: 4, title: "Forum megathread: All 33 instances mapped and cross-referenced", hot: false, views: "14.1k", time: "9h ago" },
  { rank: 5, title: "FREQ-88 decoded — partial audio file attached in Case update", hot: false, views: "11.8k", time: "12h ago" },
];

// ─── Components ───────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span
        className="block w-1 h-5 rounded-full"
        style={{ background: `linear-gradient(180deg, ${PINK} 0%, ${PURPLE} 100%)` }}
      />
      <span
        className="text-xs font-semibold tracking-[0.2em] uppercase"
        style={{ color: PINK, fontFamily: "Inter, sans-serif" }}
      >
        {children}
      </span>
    </div>
  );
}

function StatusDot({ color }: { color: string }) {
  return (
    <span className="relative flex items-center justify-center w-2 h-2">
      <span
        className="absolute inline-block w-2 h-2 rounded-full animate-ping opacity-40"
        style={{ background: color }}
      />
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
      style={{
        background: "rgba(155, 68, 255, 0.12)",
        border: "1px solid rgba(155, 68, 255, 0.25)",
        color: "#c084fc",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {children}
    </span>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeNav, setActiveNav] = useState("Home");
  const [activeFilter, setActiveFilter] = useState("All");
  const onlineCount = 312;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
    >
      {/* ── Noise texture overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(8, 8, 15, 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${PINK} 0%, ${PURPLE} 100%)` }}
            >
              <Crosshair size={16} className="text-white" />
            </div>
            <div>
              <span
                className="font-bold tracking-wider text-white"
                style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "18px", letterSpacing: "0.12em" }}
              >
                ARCHIVES <span style={{ color: PINK }}>VI</span>
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => setActiveNav(link)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: activeNav === link ? "white" : "#6b6b8a",
                  background: activeNav === link ? "rgba(255,45,107,0.12)" : "transparent",
                  border: activeNav === link ? `1px solid rgba(255,45,107,0.3)` : "1px solid transparent",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {link}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: "#6b6b8a" }}
            >
              <Search size={16} />
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${PINK} 0%, ${PURPLE} 100%)`,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Join Now
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16">
        {/* ── Hero ── */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
          <div className="grid grid-cols-[1fr_320px] gap-5 items-start">

            {/* Main hero card */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: `0 0 80px rgba(255,45,107,0.08), 0 40px 80px rgba(0,0,0,0.6)`,
              }}
            >
              {/* Hero image */}
              <div className="relative h-[480px] bg-[#0f0f1c]">
                <ImageWithFallback
                  src={heroPhoto}
                  alt="Vice Files community portal — the precursor to Archives VI, featuring the UFO case investigation"
                  className="w-full h-full object-cover opacity-60"
                />
                {/* Gradient overlays */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(8,8,15,0.95) 0%, rgba(8,8,15,0.6) 50%, rgba(8,8,15,0.2) 100%)",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(8,8,15,0.9) 0%, transparent 60%)",
                  }}
                />

                {/* Case tag */}
                <div className="absolute top-6 left-6">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(255,45,107,0.15)",
                      border: `1px solid rgba(255,45,107,0.4)`,
                      color: "#ff8fab",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <StatusDot color={PINK} />
                    ACTIVE INVESTIGATION
                  </div>
                </div>

                {/* Case number */}
                <div className="absolute top-6 right-6">
                  <span
                    className="text-xs font-mono font-medium px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(8,8,15,0.7)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#6b6b8a",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    CASE-044
                  </span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <SectionLabel>Featured Case</SectionLabel>
                  <h1
                    className="text-white mb-3 leading-none"
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontSize: "clamp(36px, 5vw, 56px)",
                      fontWeight: 800,
                      letterSpacing: "0.01em",
                    }}
                  >
                    UFO Spotted Over{" "}
                    <span
                      style={{
                        background: `linear-gradient(90deg, ${PINK} 0%, ${PURPLE} 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Leonida?
                    </span>
                  </h1>
                  <p className="text-[#8888aa] text-sm leading-relaxed mb-6 max-w-xl">
                    Reports indicate strange lights forming geometric patterns over Vice Beach. Multiple players across
                    platforms have documented the phenomenon. The community is currently investigating.
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                      style={{ background: `linear-gradient(135deg, ${PINK} 0%, ${PURPLE} 100%)` }}
                    >
                      <Play size={14} fill="white" />
                      Open Case
                    </button>
                    <button
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/[0.06]"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#aaaacc",
                      }}
                    >
                      <Camera size={14} />
                      View Evidence
                    </button>
                    <div className="flex items-center gap-4 ml-2 text-xs text-[#6b6b8a]">
                      <span className="flex items-center gap-1.5"><Eye size={12} /> 48.2k views</span>
                      <span className="flex items-center gap-1.5"><Users size={12} /> 87 investigators</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Investigators sidebar */}
            <div className="flex flex-col gap-4">
              {/* Online counter */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(15,15,28,0.8)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <SectionLabel>Online Now</SectionLabel>
                  <div
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                    {onlineCount}
                  </div>
                </div>
                <div className="space-y-3">
                  {investigators.map((inv) => (
                    <div key={inv.name} className="flex items-center gap-3 group cursor-pointer">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{
                          background: `linear-gradient(135deg, rgba(255,45,107,0.3) 0%, rgba(155,68,255,0.3) 100%)`,
                          border: "1px solid rgba(255,45,107,0.2)",
                        }}
                      >
                        {inv.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate group-hover:text-[#ff8fab] transition-colors">
                          {inv.name}
                        </div>
                        <div className="text-[11px] text-[#6b6b8a] truncate">{inv.status}</div>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shrink-0 ml-auto" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <a
                    className="flex items-center justify-between text-xs text-[#6b6b8a] hover:text-[#ff2d6b] transition-colors cursor-pointer"
                  >
                    <span>View all {onlineCount} investigators</span>
                    <ChevronRight size={12} />
                  </a>
                </div>
              </div>

              {/* Quick stats */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(15,15,28,0.8)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <SectionLabel>Community Stats</SectionLabel>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {[
                    { label: "Open Cases", value: "44", icon: FileText, color: PINK },
                    { label: "Theories", value: "218", icon: Zap, color: PURPLE },
                    { label: "Confirmed", value: "31", icon: Shield, color: TEAL },
                    { label: "Members", value: "12.4k", icon: Users, color: "#ffd700" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div
                      key={label}
                      className="rounded-xl p-3 flex flex-col gap-1"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <Icon size={13} style={{ color }} />
                      <div className="text-xl font-bold text-white" style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.02em" }}>
                        {value}
                      </div>
                      <div className="text-[10px] text-[#6b6b8a]">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Truth tagline */}
              <div
                className="rounded-2xl p-5 text-center"
                style={{
                  background: `linear-gradient(135deg, rgba(255,45,107,0.08) 0%, rgba(155,68,255,0.08) 100%)`,
                  border: `1px solid rgba(255,45,107,0.15)`,
                }}
              >
                <div
                  className="text-[11px] tracking-[0.3em] uppercase mb-1"
                  style={{ color: PINK, fontFamily: "Inter, sans-serif" }}
                >
                  Archives VI
                </div>
                <div
                  className="text-white font-light italic text-sm leading-relaxed"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  "Truth is hidden in Leonida"
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Active Cases ── */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <SectionLabel>Open Files</SectionLabel>
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.03em" }}
              >
                Active Cases
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {["All", "Paranormal", "Cryptic", "Location"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    color: activeFilter === f ? "white" : "#6b6b8a",
                    background: activeFilter === f ? "rgba(255,45,107,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${activeFilter === f ? "rgba(255,45,107,0.3)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  {f}
                </button>
              ))}
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#6b6b8a" }}
              >
                <Filter size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {activeCases.map((c) => (
              <div
                key={c.id}
                className="group rounded-2xl overflow-hidden cursor-pointer transition-all hover:translate-y-[-2px]"
                style={{
                  background: "rgba(15,15,28,0.8)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                }}
              >
                {/* Card image */}
                <div className="relative h-44 overflow-hidden bg-[#0f0f1c]">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(15,15,28,1) 0%, transparent 60%)" }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                      style={{
                        background: `rgba(${c.statusColor === PINK ? "255,45,107" : c.statusColor === PURPLE ? "155,68,255" : "0,212,255"},0.15)`,
                        border: `1px solid rgba(${c.statusColor === PINK ? "255,45,107" : c.statusColor === PURPLE ? "155,68,255" : "0,212,255"},0.35)`,
                        color: c.statusColor,
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <StatusDot color={c.statusColor} />
                      {c.status}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className="text-[10px] font-mono px-2 py-1 rounded-full"
                      style={{ background: "rgba(8,8,15,0.75)", color: "#6b6b8a", backdropFilter: "blur(6px)" }}
                    >
                      {c.id}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <div className="flex items-start gap-2 mb-2">
                    <c.icon size={14} className="mt-0.5 shrink-0" style={{ color: c.statusColor }} />
                    <span
                      className="text-[11px] font-medium uppercase tracking-widest"
                      style={{ color: c.statusColor }}
                    >
                      {c.category}
                    </span>
                  </div>
                  <h3
                    className="text-white font-bold mb-2 leading-tight group-hover:text-[#ffafc5] transition-colors"
                    style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "18px", letterSpacing: "0.02em" }}
                  >
                    {c.title}
                  </h3>
                  <p className="text-[#6b6b8a] text-xs leading-relaxed mb-4 line-clamp-2">
                    {c.description}
                  </p>
                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-3 text-[11px] text-[#6b6b8a]">
                      <span className="flex items-center gap-1"><Users size={10} /> {c.investigators}</span>
                      <span className="flex items-center gap-1"><Camera size={10} /> {c.evidence}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {c.lastUpdate}</span>
                    </div>
                    <ArrowUpRight
                      size={15}
                      className="text-[#6b6b8a] group-hover:text-[#ff2d6b] transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/[0.05]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#aaaacc",
              }}
            >
              Browse all 44 cases <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* ── Community Theories ── */}
        <section
          className="py-20"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(155,68,255,0.04) 50%, transparent 100%)" }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <SectionLabel>Community Intelligence</SectionLabel>
                <h2
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.03em" }}
                >
                  Top Theories
                </h2>
              </div>
              <a className="flex items-center gap-1 text-xs text-[#6b6b8a] hover:text-[#9b44ff] transition-colors cursor-pointer">
                Submit a theory <ChevronRight size={12} />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {theories.map((t, i) => (
                <div
                  key={t.id}
                  className="group rounded-2xl p-6 cursor-pointer transition-all hover:translate-y-[-1px]"
                  style={{
                    background: "rgba(15,15,28,0.7)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="flex items-start gap-5">
                    {/* Big number */}
                    <span
                      className="font-black leading-none shrink-0 select-none"
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontSize: "48px",
                        color: i < 2 ? "rgba(155,68,255,0.25)" : "rgba(255,255,255,0.07)",
                        lineHeight: 1,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {t.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                      </div>
                      <h3
                        className="text-white font-bold mb-2 leading-tight group-hover:text-[#c084fc] transition-colors"
                        style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "17px", letterSpacing: "0.02em" }}
                      >
                        {t.title}
                      </h3>
                      <p className="text-[#6b6b8a] text-xs leading-relaxed mb-4 line-clamp-2">
                        {t.excerpt}
                      </p>

                      {/* Confidence bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[#6b6b8a] font-medium">Confidence</span>
                          <span className="text-[10px] font-bold" style={{ color: PURPLE }}>{t.confidence}%</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${t.confidence}%`,
                              background: `linear-gradient(90deg, ${PURPLE} 0%, ${PINK} 100%)`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px] text-[#6b6b8a]">
                          <span>by <span className="text-[#c084fc]">{t.author}</span></span>
                          <span className="flex items-center gap-1"><Star size={10} /> {t.votes.toLocaleString()} votes</span>
                        </div>
                        <span className="text-[10px] text-[#6b6b8a] font-mono">{t.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Interactive Map ── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <SectionLabel>Leonida Grid</SectionLabel>
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.03em" }}
              >
                Interactive Map
              </h2>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${PINK}22 0%, ${PURPLE}22 100%)`,
                border: `1px solid rgba(255,45,107,0.2)`,
                color: "#ff8fab",
              }}
            >
              <MapPin size={13} />
              Open Full Map
            </button>
          </div>

          <div
            className="relative rounded-2xl overflow-hidden h-[380px] flex items-center justify-center"
            style={{
              background: "rgba(15,15,28,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `linear-gradient(rgba(155,68,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(155,68,255,0.5) 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }}
            />
            {/* Radial glow */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% 50%, rgba(255,45,107,0.06) 0%, transparent 70%)`,
              }}
            />

            {/* Map pins */}
            {[
              { top: "30%", left: "25%", label: "Vice Beach", active: true },
              { top: "55%", left: "60%", label: "Route 1 S", active: false },
              { top: "20%", left: "70%", label: "Leonida Hills", active: false },
              { top: "72%", left: "38%", label: "Vice Docks", active: true },
              { top: "45%", left: "82%", label: "Desert Outpost", active: false },
            ].map((pin) => (
              <div
                key={pin.label}
                className="absolute group cursor-pointer"
                style={{ top: pin.top, left: pin.left }}
              >
                <div className="relative flex items-center justify-center">
                  {pin.active && (
                    <span
                      className="absolute w-8 h-8 rounded-full animate-ping opacity-25"
                      style={{ background: PINK }}
                    />
                  )}
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      background: pin.active ? PINK : "rgba(155,68,255,0.6)",
                      border: `2px solid ${pin.active ? "rgba(255,45,107,0.5)" : "rgba(155,68,255,0.3)"}`,
                      boxShadow: pin.active ? `0 0 12px ${PINK}88` : "none",
                    }}
                  >
                    <Circle size={6} className="text-white fill-white" />
                  </div>
                  <span
                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: "rgba(15,15,28,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                  >
                    {pin.label}
                  </span>
                </div>
              </div>
            ))}

            {/* Placeholder text */}
            <div className="text-center relative z-10 pointer-events-none">
              <MapPin size={28} className="mx-auto mb-3" style={{ color: PURPLE, opacity: 0.4 }} />
              <p className="text-[#6b6b8a] text-sm">Interactive map — hover pins for case details</p>
              <p className="text-[#4a4a6a] text-xs mt-1">5 known anomaly locations · 2 active investigations</p>
            </div>

            {/* Legend */}
            <div
              className="absolute bottom-4 left-4 flex items-center gap-4 px-3 py-2 rounded-lg text-[10px]"
              style={{ background: "rgba(8,8,15,0.8)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}
            >
              <span className="flex items-center gap-1.5 text-[#6b6b8a]">
                <span className="w-2 h-2 rounded-full" style={{ background: PINK }} /> Active
              </span>
              <span className="flex items-center gap-1.5 text-[#6b6b8a]">
                <span className="w-2 h-2 rounded-full" style={{ background: PURPLE }} /> Logged
              </span>
            </div>
          </div>
        </section>

        {/* ── Evidence Gallery ── */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <SectionLabel>Visual Evidence</SectionLabel>
              <h2
                className="text-3xl font-bold text-white"
                style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.03em" }}
              >
                Evidence Gallery
              </h2>
            </div>
            <a className="flex items-center gap-1 text-xs text-[#6b6b8a] hover:text-[#ff2d6b] transition-colors cursor-pointer">
              Submit evidence <ChevronRight size={12} />
            </a>
          </div>

          {/* Gallery grid — bento-style */}
          <div className="grid grid-cols-3 grid-rows-2 gap-4 h-[460px]">
            {/* Wide item */}
            <div
              className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group cursor-pointer bg-[#0f0f1c]"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <img
                src={galleryItems[0].src}
                alt={galleryItems[0].title}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.03] transition-all duration-500"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,15,0.9) 0%, transparent 60%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] font-medium mb-1" style={{ color: PINK }}>{galleryItems[0].case}</div>
                <div className="text-white text-sm font-semibold" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  {galleryItems[0].title}
                </div>
                <div className="text-[11px] text-[#6b6b8a]">by {galleryItems[0].author}</div>
              </div>
            </div>

            {/* Tall item */}
            <div
              className="col-span-1 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer bg-[#0f0f1c]"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <img
                src={galleryItems[1].src}
                alt={galleryItems[1].title}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.03] transition-all duration-500"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,15,0.9) 0%, transparent 50%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] font-medium mb-1" style={{ color: PURPLE }}>{galleryItems[1].case}</div>
                <div className="text-white text-sm font-semibold" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  {galleryItems[1].title}
                </div>
                <div className="text-[11px] text-[#6b6b8a]">by {galleryItems[1].author}</div>
              </div>
            </div>

            {/* Small items */}
            {galleryItems.slice(2).map((item) => (
              <div
                key={item.id}
                className="relative rounded-2xl overflow-hidden group cursor-pointer bg-[#0f0f1c]"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-[1.03] transition-all duration-500"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,15,0.9) 0%, transparent 60%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="text-white text-xs font-semibold leading-tight" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                    {item.title}
                  </div>
                  <div className="text-[10px] text-[#6b6b8a]">by {item.author}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Trending ── */}
        <section
          className="py-20"
          style={{ background: "linear-gradient(180deg, transparent 0%, rgba(255,45,107,0.03) 50%, transparent 100%)" }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <SectionLabel>Right Now</SectionLabel>
                <h2
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.03em" }}
                >
                  Trending Investigations
                </h2>
              </div>
              <TrendingUp size={20} style={{ color: PINK }} />
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(15,15,28,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {trending.map((item, i) => (
                <div
                  key={item.rank}
                  className="flex items-center gap-5 px-6 py-4 cursor-pointer group transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: i < trending.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  {/* Rank */}
                  <span
                    className="font-black text-2xl leading-none w-8 text-center shrink-0"
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      color: i === 0 ? PINK : i === 1 ? PURPLE : "rgba(255,255,255,0.12)",
                    }}
                  >
                    {item.rank}
                  </span>

                  {/* Hot badge */}
                  {item.hot ? (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                      style={{ background: "rgba(255,45,107,0.15)", color: PINK, border: "1px solid rgba(255,45,107,0.3)" }}
                    >
                      Hot
                    </span>
                  ) : (
                    <span className="w-10 shrink-0" />
                  )}

                  {/* Title */}
                  <span
                    className="flex-1 text-sm font-medium text-[#aaaacc] group-hover:text-white transition-colors line-clamp-1"
                  >
                    {item.title}
                  </span>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-[11px] text-[#6b6b8a] shrink-0">
                    <span className="flex items-center gap-1"><Eye size={11} /> {item.views}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {item.time}</span>
                    <ChevronRight size={13} className="text-[#3a3a5a] group-hover:text-[#ff2d6b] transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/[0.05]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#aaaacc",
                }}
              >
                <MessageSquare size={14} />
                Go to Forum
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className="mt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-4 gap-10 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${PINK} 0%, ${PURPLE} 100%)` }}
                  >
                    <Crosshair size={13} className="text-white" />
                  </div>
                  <span
                    className="font-bold text-white tracking-wider"
                    style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "16px" }}
                  >
                    ARCHIVES <span style={{ color: PINK }}>VI</span>
                  </span>
                </div>
                <p className="text-[#6b6b8a] text-xs leading-relaxed italic mb-4">
                  "Truth is hidden in Leonida"
                </p>
                <p className="text-[#4a4a6a] text-xs leading-relaxed">
                  The premier community for GTA VI mysteries, easter eggs, and investigations. Est. 2026.
                </p>
              </div>

              {[
                {
                  heading: "Investigate",
                  links: ["Active Cases", "Evidence Gallery", "Interactive Map", "Case Archive"],
                },
                {
                  heading: "Community",
                  links: ["Theories", "Forum", "Members", "Discord"],
                },
                {
                  heading: "Platform",
                  links: ["About", "Submit Evidence", "Contact", "Privacy Policy"],
                },
              ].map(({ heading, links }) => (
                <div key={heading}>
                  <h4
                    className="font-semibold text-white text-xs uppercase tracking-widest mb-4"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {heading}
                  </h4>
                  <ul className="space-y-2">
                    {links.map((l) => (
                      <li key={l}>
                        <a className="text-[#6b6b8a] text-xs hover:text-[#ff2d6b] transition-colors cursor-pointer">
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              className="flex items-center justify-between pt-6"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-[#4a4a6a] text-xs">
                © 2026 Archives VI. Not affiliated with Rockstar Games or Take-Two Interactive.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                <span className="text-[#6b6b8a] text-xs">{onlineCount} investigators online</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
