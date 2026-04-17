import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl md:text-9xl font-black text-[#d00000] mb-4">404</div>

        <h1 className="text-3xl md:text-4xl font-bold text-[#131313] mb-4">Page Not Found</h1>

        <p className="text-[#6c6d6f] text-lg mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved. This might be a pit stop
          issue!
        </p>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#d00000] text-white px-8 py-4 rounded font-bold text-lg hover:bg-[#a30000] transition"
          >
            <Home size={24} />
            Back to Home
          </Link>

          <div className="flex gap-4">
            <Link
              to="/standings"
              className="flex-1 bg-white border border-[#e0e0e0] text-[#131313] px-6 py-3 rounded font-bold hover:border-[#d00000] transition"
            >
              Standings
            </Link>
            <Link
              to="/schedule"
              className="flex-1 bg-white border border-[#e0e0e0] text-[#131313] px-6 py-3 rounded font-bold hover:border-[#d00000] transition"
            >
              Schedule
            </Link>
          </div>
        </div>

        {/* Decorative element */}
        <div className="mt-12 text-[#e0e0e0]">
          <div className="text-6xl">🏁</div>
        </div>
      </div>
    </div>
  );
}
