import {
  rooms,
  recipes,
  resourceTypes,
  type Room,
  type Item,
} from "./game-data";

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  visitedRooms: Set<number> = new Set<number>();

  player = {
    x: 50,
    y: 300,
    size: 50,
    color: "lime",
    speed: 4,
    room: 0,
    hp: 100,
    hpMax: 100,
    keys: 0,
    radRes: 0,
    materials: { scrap: 0, circuits: 0, chemicals: 0 },
    inventory: {} as Record<string, boolean>,
  };

  itemImages: Record<string, HTMLImageElement> = {};

  gameOver = false;
  transitionAlpha = 0;
  backgroundOffset = 0;
  craftingMode = false;
  craftSelection = 0;
  lastSaveTime = 0;
  keys: Record<string, boolean> = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.W = canvas.width;
    this.H = canvas.height;

    // Load PNG images only on client
    if (typeof window !== "undefined") {
      this.loadImages();
    }
  }

  loadImages() {
    const types = [
      "medkit",
      "key",
      "scrap",
      "circuits",
      "chemicals",
      "bench",
      "player",
    ];
    types.forEach((type) => {
      const img = new Image();
      img.src = `/assets/${type}.png`;
      this.itemImages[type] = img;
    });
  }

  handleKeyDown(e: KeyboardEvent) {
    this.keys[e.key] = true;
    if (e.key.toLowerCase() === "c" && this.nearBench()) {
      this.toggleCrafting();
    }
    if (this.craftingMode) {
      if (e.key === "ArrowUp") {
        this.craftSelection =
          (this.craftSelection - 1 + recipes.length) % recipes.length;
      }
      if (e.key === "ArrowDown") {
        this.craftSelection = (this.craftSelection + 1) % recipes.length;
      }
      if (e.key === "Enter") {
        this.attemptCraft();
      }
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keys[e.key] = false;
  }

  update() {
    const room = this.getCurrentRoom();
    this.backgroundOffset += 0.2;

    const prev = { x: this.player.x, y: this.player.y };
    if (this.keys.ArrowUp) this.player.y -= this.player.speed;
    if (this.keys.ArrowDown) this.player.y += this.player.speed;
    if (this.keys.ArrowLeft) this.player.x -= this.player.speed;
    if (this.keys.ArrowRight) this.player.x += this.player.speed;

    this.player.x = this.clamp(this.player.x, 0, this.W - this.player.size);
    this.player.y = this.clamp(this.player.y, 0, this.H - this.player.size);

    room.walls.forEach((w) => {
      if (this.rectIntersect(this.player, w)) {
        this.player.x = prev.x;
        this.player.y = prev.y;
      }
    });

    room.doors.forEach((d) => {
      if (this.rectIntersect(this.player, d)) {
        if (d.lock === "key" && this.player.keys === 0) return;
        if (d.lock === "key") this.player.keys--;
        this.changeRoom(d.target, d.dest);
      }
    });

    room.hazards.forEach((h) => {
      if (this.rectIntersect(this.player, h)) {
        const dmg = h.dmg * (1 - this.player.radRes);
        this.player.hp -= dmg;
        if (this.player.hp <= 0) this.triggerGameOver();
      }
    });

    const remainingItems: Item[] = [];
    for (const it of room.items) {
      if (this.rectIntersect(this.player, it)) {
        switch (it.type) {
          case "medkit":
            this.player.hp = Math.min(this.player.hpMax, this.player.hp + 40);
            break;
          case "key":
            this.player.keys++;
            break;
          case "scrap":
          case "circuits":
          case "chemicals":
            this.player.materials[it.type]++;
            break;
          case "bench":
            remainingItems.push(it);
            continue;
        }
      } else {
        remainingItems.push(it);
      }
    }
    room.items = remainingItems;

    room.enemies.forEach((e) => {
      if (e.hp <= 0) return;

      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist < 300) {
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;
      }

      e.x = this.clamp(e.x, 0, this.W - e.size);
      e.y = this.clamp(e.y, 0, this.H - e.size);

      if (this.rectIntersect(this.player, e)) {
        this.player.hp -= e.damage;
        this.player.x -= Math.sign(dx) * 10;
        this.player.y -= Math.sign(dy) * 10;
        if (this.player.hp <= 0) this.triggerGameOver();
      }
    });

    if (this.transitionAlpha > 0) this.transitionAlpha -= 0.05;
  }

  render() {
    const room = this.getCurrentRoom();
    const ctx = this.ctx;

    this.drawBackground(room);

    room.hazards.forEach((h) => {
      ctx.fillStyle = "rgba(0,255,0,0.08)";
      ctx.fillRect(h.x, h.y, h.w, h.h);
    });

    room.doors.forEach((d) => {
      ctx.fillStyle = d.lock === "key" ? "purple" : "gold";
      ctx.fillRect(d.x, d.y, d.w, d.h);
    });

    room.walls.forEach((w) => {
      ctx.fillStyle = w.color;
      ctx.fillRect(w.x, w.y, w.w, w.h);
    });

    // Draw items
    room.items.forEach((it) => {
      const img = this.itemImages[it.type];
      if (img?.complete) {
        ctx.drawImage(img, it.x, it.y, it.w*2, it.h*2);
      } else {
        ctx.fillStyle = "#fff";
        ctx.fillRect(it.x, it.y, it.w, it.h);
      }
    });

    // Draw enemies
    room.enemies.forEach((e) => {
      if (e.hp <= 0) return;
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x, e.y, e.size, e.size);
      ctx.fillStyle = "black";
      ctx.fillRect(e.x, e.y - 6, e.size, 4);
      ctx.fillStyle = "red";
      ctx.fillRect(e.x, e.y - 6, e.size * (e.hp / e.hpMax), 4);
    });

    // Draw player
    const playerImg = this.itemImages["player"];
    if (playerImg?.complete) {
      ctx.drawImage(
        playerImg,
        this.player.x,
        this.player.y,
        this.player.size,
        this.player.size
      );
    } else {
      ctx.fillStyle = this.player.color;
      ctx.fillRect(
        this.player.x,
        this.player.y,
        this.player.size,
        this.player.size
      );
    }

    if (this.transitionAlpha > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.transitionAlpha})`;
      ctx.fillRect(0, 0, this.W, this.H);
    }
  }

  drawBackground(room: Room) {
    const ctx = this.ctx;
    const g = ctx.createLinearGradient(0, 0, 0, this.H);
    g.addColorStop(0, room.bgColor1);
    g.addColorStop(1, room.bgColor2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.W, this.H);

    if (room.bgType === "skyline") {
      ctx.fillStyle = room.skylineColor || "#0a0a0a";
      for (let i = 0; i < 20; i++) {
        const w = this.rand(20, 40);
        const h = this.rand(60, 140);
        const x = ((i * 60 - this.backgroundOffset * 0.3) % (this.W + 60)) - 30;
        ctx.fillRect(x, this.H - h, w, h);
      }
    }
  }

  rectIntersect(a: any, b: any) {
    return (
      a.x < b.x + (b.w ?? b.size) &&
      a.x + (a.w ?? a.size) > b.x &&
      a.y < b.y + (b.h ?? b.size) &&
      a.y + (a.h ?? a.size) > b.y
    );
  }

  rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }

  getCurrentRoom(): Room {
    return rooms[this.player.room];
  }

  nearBench() {
    const room = this.getCurrentRoom();
    return room.items.some(
      (it) => it.type === "bench" && this.rectIntersect(this.player, it)
    );
  }

  toggleCrafting() {
    this.craftingMode = !this.craftingMode;
    this.craftSelection = 0;
  }

  canAfford(recipeIndex: number) {
    const recipe = recipes[recipeIndex];
    for (const r of resourceTypes) {
      if ((recipe.cost[r] ?? 0) > this.player.materials[r]) return false;
    }
    return true;
  }

  attemptCraft() {
    const recipe = recipes[this.craftSelection];
    if (!this.canAfford(this.craftSelection)) return;

    for (const r of resourceTypes) {
      this.player.materials[r] -= recipe.cost[r] ?? 0;
    }

    switch (recipe.name) {
      case "Medkit+":
        this.player.hp = this.player.hpMax;
        break;
      case "Radiation Suit":
        this.player.radRes = Math.min(1, this.player.radRes + 0.5);
        break;
      case "Speed Boots":
        this.player.speed += 1;
        break;
      case "Keycard":
        this.player.keys += 1;
        break;
      case "Rail Gun":
        this.player.inventory.railgun = true;
        break;
    }
  }

  changeRoom(index: number, dest: { x: number; y: number }) {
    this.transitionAlpha = 1;
    setTimeout(() => {
      this.player.room = index;
      this.player.x = dest.x;
      this.player.y = dest.y;
      this.visitedRooms.add(index);
    }, 50);
  }

  triggerGameOver() {
    this.player.hp = 0;
    this.gameOver = true;
  }

  saveGame(force = false) {
    const now = performance.now();
    if (!force && now - this.lastSaveTime < 30000) return;
    this.lastSaveTime = now;

    const data = {
      hp: this.player.hp,
      hpMax: this.player.hpMax,
      keys: this.player.keys,
      radRes: this.player.radRes,
      materials: this.player.materials,
      room: this.player.room,
      x: this.player.x,
      y: this.player.y,
      speed: this.player.speed,
      inventory: this.player.inventory,
      visitedRooms: Array.from(this.visitedRooms),
    };

    localStorage.setItem("chernobylSave_v4", JSON.stringify(data));
  }

  loadGame() {
    const raw = localStorage.getItem("chernobylSave_v4");
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      Object.assign(this.player, data);
      if (data.visitedRooms) {
        this.visitedRooms = new Set<number>(data.visitedRooms);
      }
    } catch (e) {
      console.error("Failed to load saved game:", e);
    }
  }
}
