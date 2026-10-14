import heroImage from "../assets/images/hero.jpg";
import type { Case } from "../types/Case";

export const cases: Case[] = [
  {
    id: "vice-beach-night-lights",
    title: "Night lights over Vice Beach",
    description:
      "Several community captures point to a repeating cluster of lights above the coastline during late-night trailer frames.",
    image: heroImage,
    status: "investigating",
    category: "sighting",
    location: "Vice Beach",
    evidenceCount: 12,
    updatedAt: "2026-07-01",
  },
  {
    id: "leonida-radio-loop",
    title: "Unusual loop on Frequency 99.1",
    description:
      "A short radio-like signal appears to repeat in community audio breakdowns, raising questions about a hidden broadcast clue.",
    image: heroImage,
    status: "community",
    category: "broadcast",
    location: "Greater Leonida",
    evidenceCount: 8,
    updatedAt: "2026-07-01",
  },
  {
    id: "downtown-mural-symbols",
    title: "Downtown mural symbol pattern",
    description:
      "Investigators noticed repeated symbols across a mural sequence that may connect to locations shown in separate promotional shots.",
    image: heroImage,
    status: "classified",
    category: "symbol",
    location: "Downtown Leonida",
    evidenceCount: 6,
    updatedAt: "2026-06-30",
  },
  {
    id: "everglades-bunker-rumor",
    title: "Hidden bunker near the wetlands",
    description:
      "A popular map theory suggests a concealed structure near the wetlands, but current visual evidence remains inconclusive.",
    image: heroImage,
    status: "debunked",
    category: "location",
    location: "Leonida Wetlands",
    evidenceCount: 4,
    updatedAt: "2026-06-29",
  },
  {
    id: "storm-horizon-flash",
    title: "Storm flash on the horizon",
    description:
      "A single-frame flash during a storm sequence has been cataloged as a possible environmental anomaly or editing artifact.",
    image: heroImage,
    status: "investigating",
    category: "phenomenon",
    location: "Coastal Leonida",
    evidenceCount: 9,
    updatedAt: "2026-06-28",
  },
  {
    id: "pawn-shop-sticker-code",
    title: "Pawn shop sticker code",
    description:
      "Community members decoded a sticker layout from a storefront shot and linked it to a recurring number sequence.",
    image: heroImage,
    status: "confirmed",
    category: "community-discovery",
    location: "Vice City",
    evidenceCount: 15,
    updatedAt: "2026-06-27",
  },
  {
    id: "airport-runway-markings",
    title: "Runway markings at dusk",
    description:
      "Repeated runway markings seen in dusk footage may indicate a hidden navigation reference or simply real-world-inspired detail.",
    image: heroImage,
    status: "community",
    category: "location",
    location: "Leonida International Airport",
    evidenceCount: 7,
    updatedAt: "2026-06-26",
  },
];
