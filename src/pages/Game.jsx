import React from 'react';
import { Gamepad2 } from 'lucide-react';

export default function Game() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <div className="bg-[#131313] border-b border-[#e0e0e0] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-[#d00000]" />
          <h1 className="text-lg font-bold text-white">Lone Star Rubbin' League Arcade</h1>
          <span className="ml-auto text-gray-400 text-sm hidden sm:block">
            Race your way to the top
          </span>
        </div>
      </div>

      {/* Game iframe — fills remaining space */}
      <div className="flex-1 relative">
        <iframe
          src="https://lonestarrubbinleague.netlify.app/"
          title="Lone Star Rubbin' League Game"
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen"
          loading="lazy"
        />
      </div>
    </div>
  );
}
