import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl md:text-9xl font-black text-[#f5a623] mb-4">404</div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Page Not Found</h1>

        <p className="text-[#8a8a9a] text-lg mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved. This might be a pit stop
          issue!
        </p>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#f5a623] text-black px-8 py-4 rounded font-bold text-lg hover:bg-[#e6950f] transition"
          >
            <Home size={24} />
            Back to Home
          </Link>

          <div className="flex gap-4">
            <Link
              to="/standings"
              className="flex-1 bg-[#14141f] border border-[#2a2a3e] text-white px-6 py-3 rounded font-bold hover:border-[#f5a623] transition"
            >
              Standings
            </Link>
            <Link
              to="/schedule"
              className="flex-1 bg-[#14141f] border border-[#2a2a3e] text-white px-6 py-3 rounded font-bold hover:border-[#f5a623] transition"
            >
              Schedule
            </Link>
          </div>
        </div>

        {/* Decorative element */}
        <div className="mt-12 text-[#2a2a3e]">
          <div className="text-6xl">🏁</div>
        </div>
      </div>
    </div>
  );
}
