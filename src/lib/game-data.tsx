// Game constants and data

export const resourceTypes = ["scrap", "circuits", "chemicals"] as const;

export type ResourceType = (typeof resourceTypes)[number];

export type Recipe = {
  name: string;
  cost: {
    [key in ResourceType]?: number;
  };
  description: string;
};

export const recipes: Recipe[] = [
  {
    name: "Medkit+",
    description: "Restores full health",
    cost: { scrap: 1, chemicals: 1 },
  },
  {
    name: "Radiation Suit",
    description: "+50% rad resistance",
    cost: { scrap: 2, circuits: 2, chemicals: 2 },
  },
  {
    name: "Ammo Pack",
    description: "(placeholder for future combat update)",
    cost: { scrap: 2, circuits: 1 },
  },
  {
    name: "Speed Boots",
    description: "+1 player speed",
    cost: { scrap: 2, chemicals: 1 },
  },
  {
    name: "Keycard",
    description: "Unlocks any key door once",
    cost: { circuits: 3 },
  },
  {
    name: "Rail Gun",
    description: "Cosmetic for now",
    cost: { scrap: 4, circuits: 3, chemicals: 2 },
  },
];

export type Room = {
  name: string;
  doors: Door[];
  walls: Wall[];
  hazards: Hazard[];
  items: Item[];
  enemies: Enemy[];
  spawn: { x: number; y: number };
  bgColor1: string;
  bgColor2: string;
  bgType: "gradient" | "skyline";
  skylineColor?: string;
};

export type Door = {
  x: number;
  y: number;
  w: number;
  h: number;
  target: number;
  dest: { x: number; y: number };
  lock: false | "key";
};

export type Wall = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};

export type Hazard = {
  x: number;
  y: number;
  w: number;
  h: number;
  dmg: number;
};

export type Item = {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "medkit" | "key" | "scrap" | "circuits" | "chemicals" | "bench";
};

export type Enemy = {
  x: number;
  y: number;
  size: number;
  speed: number;
  damage: number;
  color: string;
  hp: number;
  hpMax: number;
};

export const rooms: Room[] = [
  /* 0 — Pripyat Street */
  {
    name: "Pripyat Street",
    bgType: "skyline",
    bgColor1: "#06131b",
    bgColor2: "#1b2631",
    skylineColor: "#0a0a0a",
    doors: [
      {
        x: 550,
        y: 170,
        w: 40,
        h: 60,
        target: 1,
        dest: { x: 30, y: 200 },
        lock: false,
      },
    ],
    walls: [{ x: 230, y: 260, w: 180, h: 24, color: "#444" }],
    hazards: [{ x: 120, y: 120, w: 90, h: 90, dmg: 0.05 }],
    items: [
      { x: 300, y: 320, w: 30, h: 30, type: "medkit" },
      { x: 450, y: 420, w: 56, h: 56, type: "scrap" },
    ],
    enemies: [
      {
        x: 420,
        y: 100,
        size: 28,
        speed: 1.5,
        damage: 10,
        color: "red",
        hp: 60,
        hpMax: 60,
      },
    ],
    spawn: { x: 50, y: 200 },
  },
  /* 1 — Amusement Park */
  {
    name: "Pripyat Park",
    bgType: "gradient",
    bgColor1: "#152425",
    bgColor2: "#204040",
    doors: [
      {
        x: -10,
        y: 170,
        w: 40,
        h: 60,
        target: 0,
        dest: { x: 530, y: 200 },
        lock: false,
      },
      {
        x: 550,
        y: 40,
        w: 40,
        h: 60,
        target: 2,
        dest: { x: 50, y: 50 },
        lock: "key",
      },
      {
        x: 10,
        y: 320,
        w: 40,
        h: 60,
        target: 4,
        dest: { x: 520, y: 300 },
        lock: false,
      },
    ],
    walls: [{ x: 200, y: 180, w: 100, h: 20, color: "#555" }],
    hazards: [],
    items: [
      { x: 260, y: 80, w: 38, h: 38, type: "key" },
      { x: 320, y: 300, w: 36, h: 36, type: "chemicals" },
    ],
    enemies: [
      {
        x: 380,
        y: 260,
        size: 26,
        speed: 1.7,
        damage: 12,
        color: "red",
        hp: 70,
        hpMax: 70,
      },
      {
        x: 140,
        y: 60,
        size: 26,
        speed: 1.3,
        damage: 12,
        color: "red",
        hp: 70,
        hpMax: 70,
      },
    ],
    spawn: { x: 70, y: 200 },
  },
  /* 2 — Reactor Exterior */
  {
    name: "Reactor Exterior",
    bgType: "gradient",
    bgColor1: "#461010",
    bgColor2: "#220000",
    doors: [
      {
        x: -10,
        y: 40,
        w: 60,
        h: 80,
        target: 1,
        dest: { x: 530, y: 40 },
        lock: false,
      },
      {
        x: 280,
        y: 350,
        w: 60,
        h: 70,
        target: 3,
        dest: { x: 280, y: 40 },
        lock: false,
      },
      {
        x: 550,
        y: 310,
        w: 60,
        h: 80,
        target: 5,
        dest: { x: 30, y: 300 },
        lock: "key",
      },
    ],
    walls: [{ x: 260, y: 0, w: 80, h: 140, color: "#333" }],
    hazards: [{ x: 150, y: 210, w: 160, h: 100, dmg: 0.08 }],
    items: [{ x: 120, y: 60, w: 36, h: 36, type: "circuits" }],
    enemies: [
      {
        x: 100,
        y: 260,
        size: 56,
        speed: 2,
        damage: 14,
        color: "crimson",
        hp: 90,
        hpMax: 90,
      },
    ],
    spawn: { x: 60, y: 60 },
  },
  /* 3 — Reactor Core */
  {
    name: "Reactor Core",
    bgType: "gradient",
    bgColor1: "#320303",
    bgColor2: "#460000",
    doors: [
      {
        x: 280,
        y: -10,
        w: 40,
        h: 40,
        target: 2,
        dest: { x: 280, y: 340 },
        lock: false,
      },
    ],
    walls: [
      { x: 200, y: 0, w: 20, h: 200, color: "#555" },
      { x: 380, y: 200, w: 20, h: 200, color: "#555" },
    ],
    hazards: [{ x: 0, y: 0, w: 600, h: 400, dmg: 0.12 }],
    items: [{ x: 290, y: 190, w: 20, h: 20, type: "medkit" }],
    enemies: [
      {
        x: 270,
        y: 180,
        size: 34,
        speed: 2.2,
        damage: 18,
        color: "crimson",
        hp: 140,
        hpMax: 140,
      },
    ],
    spawn: { x: 300, y: 320 },
  },
  /* 4 — Workshop (safe) */
  {
    name: "Workshop",
    bgType: "gradient",
    bgColor1: "#202024",
    bgColor2: "#3a3a40",
    doors: [
      {
        x: 560,
        y: 320,
        w: 40,
        h: 60,
        target: 1,
        dest: { x: 30, y: 300 },
        lock: false,
      },
    ],
    walls: [{ x: 300, y: 200, w: 120, h: 20, color: "#666" }],
    hazards: [],
    items: [
      { x: 282, y: 152, w: 36, h: 36, type: "bench" },
      { x: 180, y: 300, w: 16, h: 16, type: "scrap" },
      { x: 500, y: 120, w: 16, h: 16, type: "chemicals" },
    ],
    enemies: [],
    spawn: { x: 480, y: 280 },
  },
  /* 5 — Bunker Lab (safe advanced) */
  {
    name: "Bunker Lab",
    bgType: "gradient",
    bgColor1: "#090909",
    bgColor2: "#1c1c1c",
    doors: [
      {
        x: -10,
        y: 320,
        w: 40,
        h: 60,
        target: 2,
        dest: { x: 520, y: 300 },
        lock: false,
      },
    ],
    walls: [{ x: 240, y: 240, w: 200, h: 20, color: "#444" }],
    hazards: [],
    items: [
      { x: 282, y: 182, w: 56, h: 56, type: "bench" },
      { x: 140, y: 200, w: 36, h: 36, type: "circuits" },
      { x: 520, y: 380, w: 36, h: 36, type: "scrap" },
      { x: 300, y: 60, w: 36, h: 36, type: "chemicals" },
    ],
    enemies: [],
    spawn: { x: 60, y: 280 },
  },
];
