"use client";

import { useEffect, useRef, useState } from "react";
import { GameEngine } from "@/lib/game-engine";
import CraftingUI from "./crafting-ui";
import GameHUD from "./game-hud";
import MiniMap from "./MiniMap";
import PauseMenu from "./PauseMenu";


export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameState, setGameState] = useState({
    player: {
      hp: 100,
      hpMax: 100,
      keys: 0,
      radRes: 0,
      materials: { scrap: 0, circuits: 0, chemicals: 0 },
      room: 0,
      x: 50,
      y: 300,
      inventory: {},
    },
    roomName: "Pripyat Street",
    nearBench: false,
    gameOver: false,
    craftingMode: false,
  });

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    setGameEngine(engine);

    // Load saved game if available
    engine.loadGame();

    // Game loop
    let animationFrameId: number;
    const gameLoop = () => {
      if (!engine.craftingMode && !engine.gameOver) {
        engine.update();
      }
      engine.render();

      // ✅ Sync pause state with React
     setIsPaused(engine.paused);

      // Update React state with game state
      setGameState({
        player: { ...engine.player },
        roomName: engine.getCurrentRoom().name,
        nearBench: engine.nearBench(),
        gameOver: engine.gameOver,
        craftingMode: engine.craftingMode,
      });

      // Auto-save
      engine.saveGame();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    // Set up keyboard listeners
    const handleKeyDown = (e: KeyboardEvent) => engine.handleKeyDown(e);
    const handleKeyUp = (e: KeyboardEvent) => engine.handleKeyUp(e);
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const toggleCrafting = () => {
    if (gameEngine) {
      gameEngine.toggleCrafting();
    }
  };

  const attemptCraft = (recipeIndex: number) => {
    if (gameEngine) {
      gameEngine.craftSelection = recipeIndex;
      gameEngine.attemptCraft();
    }
  };
  const handleResume = () => {
    if (gameEngine) gameEngine.paused = false;
  };
  
  const handleSave = () => {
    if (gameEngine) gameEngine.saveGame(true);
  };
  
  const handleQuit = () => {
    if (gameEngine) {
      gameEngine.paused = false;
      window.location.reload(); // Or route to main menu if you have one
    }
  };

  return (
    <div className="relative">
      {/* MiniMap */}
      {gameEngine && gameEngine.visitedRooms && (
        <MiniMap
          currentRoom={gameState.player.room}
          visitedRooms={gameEngine.visitedRooms}
          totalRooms={6}
        />
      )}


      {/* Game Canvas */}
       {/* className="relative"> */}
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border-2 border-gray-700 bg-black"
      />

      {/* Game HUD */}
      <GameHUD
        player={gameState.player}
        roomName={gameState.roomName}
        nearBench={gameState.nearBench}
      />

      {/* Crafting UI */}
      {gameState.craftingMode && (
        <CraftingUI
          materials={gameState.player.materials}
          onClose={toggleCrafting}
          onCraft={attemptCraft}
        />
      )}

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <h2 className="text-5xl font-bold text-red-600">GAME OVER</h2>
        </div>
      )}
      {isPaused && (
       <PauseMenu onResume={handleResume} onSave={handleSave} onQuit={handleQuit} />
      )}

    </div>
  );
}
