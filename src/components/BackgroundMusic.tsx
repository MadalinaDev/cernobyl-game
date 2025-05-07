// src/components/BackgroundMusic.tsx
"use client";
import { useEffect, useRef } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(undefined);

  useEffect(() => {
    const audio = new Audio("/assets/background-music.mp3");
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    const handleFirstInteraction = () => {
      audio.play().catch(console.error);
      document.removeEventListener("click", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });

    return () => {
      audio.pause();
      document.removeEventListener("click", handleFirstInteraction);
    };
  }, []);

  return null;
}
