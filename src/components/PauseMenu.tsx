"use client";

interface PauseMenuProps {
  onResume: () => void;
  onSave: () => void;
  onQuit: () => void;
}

export default function PauseMenu({ onResume, onSave, onQuit }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white w-64 flex flex-col gap-4 text-center">
        <h2 className="text-xl font-bold">Paused</h2>
        <button
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          onClick={onResume}
        >
          Resume
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          onClick={onSave}
        >
          Save Game
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          onClick={onQuit}
        >
          Quit Game
        </button>
      </div>
    </div>
  );
}
