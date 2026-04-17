import React from 'react';
import { Gamepad2 } from 'lucide-react';

export default function Game() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <div className="bg-[#14141f] border-b border-[#2a2a3e] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Gamepad2 className="w-6 h-6 text-[#f5a623]" />
          <h1 className="text-xl font-bold text-white">Lone Star Rubbin' League Arcade</h1>
          <span className="ml-auto text-[#8a8a9a] text-sm hidden sm:block">
            Race your way to the top — right from your browser
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
