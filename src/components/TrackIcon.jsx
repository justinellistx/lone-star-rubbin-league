import React from 'react';

/**
 * Retro pixel-art track layout icons.
 * Each track is a simple SVG that approximates the real layout shape
 * using blocky, pixelated paths on a 32×32 grid.
 *
 * Usage: <TrackIcon track="Bristol" size={64} />
 */

// Normalize track name for lookup — strips suffixes like "Motor Speedway", "- Dual Pit Roads", etc.
function normalizeTrackName(name) {
  if (!name) return '';
  return name
    .replace(/motor speedway/i, '')
    .replace(/raceway/i, '')
    .replace(/speedway/i, '')
    .replace(/international/i, '')
    .replace(/super ?speedway/i, '')
    .replace(/road course/i, '')
    .replace(/- dual pit roads/i, '')
    .replace(/circuit/i, '')
    .replace(/of the americas/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Each track: a viewBox="0 0 32 32" pixel path + a color accent
// Shapes approximate the real track layouts with blocky pixel aesthetics
const TRACKS = {
  // ── Ovals ──
  daytona: {
    // Tri-oval superspeedway
    color: '#f5a623',
    path: 'M8,6 L24,6 Q30,6 30,12 L30,20 Q30,26 24,26 L16,22 L8,26 Q2,26 2,20 L2,12 Q2,6 8,6 Z',
    type: 'superspeedway',
  },
  atlanta: {
    // Quad-oval
    color: '#e63946',
    path: 'M8,5 L24,5 Q31,5 31,12 L31,20 Q31,27 24,27 L18,24 L14,24 L8,27 Q1,27 1,20 L1,12 Q1,5 8,5 Z',
    type: 'speedway',
  },
  bristol: {
    // Tight bullring - steep banking
    color: '#ff6b35',
    path: 'M10,8 L22,8 Q28,8 28,14 L28,18 Q28,24 22,24 L10,24 Q4,24 4,18 L4,14 Q4,8 10,8 Z',
    type: 'short',
    inner: 'M13,12 L19,12 Q23,12 23,15 L23,17 Q23,20 19,20 L13,20 Q9,20 9,17 L9,15 Q9,12 13,12 Z',
  },
  martinsville: {
    // Paperclip shape
    color: '#2ec4b6',
    path: 'M10,4 L22,4 Q28,4 28,10 L28,12 Q28,18 22,18 L10,18 Q4,18 4,12 L4,10 Q4,4 10,4 Z M10,18 L22,18 Q28,18 28,22 L28,24 Q28,28 22,28 L10,28 Q4,28 4,24 L4,22 Q4,18 10,18 Z',
    type: 'short',
  },
  phoenix: {
    // D-oval / dogleg
    color: '#9b5de5',
    path: 'M8,6 L20,6 L24,10 Q30,10 30,16 L30,20 Q30,26 24,26 L8,26 Q2,26 2,20 L2,12 Q2,6 8,6 Z',
    type: 'short',
  },
  'las vegas': {
    // Wide tri-oval
    color: '#00f5d4',
    path: 'M7,6 L25,6 Q31,6 31,12 L31,20 Q31,26 25,26 L16,22 L7,26 Q1,26 1,20 L1,12 Q1,6 7,6 Z',
    type: 'speedway',
  },
  darlington: {
    // Egg-shaped — one end tighter
    color: '#fee440',
    path: 'M10,5 L22,5 Q30,5 30,13 L30,19 Q30,27 22,27 L10,27 Q4,27 4,21 L4,11 Q4,5 10,5 Z',
    type: 'speedway',
  },
  kansas: {
    // Tri-oval 1.5 miler
    color: '#4cc9f0',
    path: 'M8,7 L24,7 Q30,7 30,13 L30,19 Q30,25 24,25 L16,21 L8,25 Q2,25 2,19 L2,13 Q2,7 8,7 Z',
    type: 'speedway',
  },
  talladega: {
    // Big tri-oval superspeedway
    color: '#f72585',
    path: 'M6,7 L26,7 Q31,7 31,12 L31,20 Q31,25 26,25 L16,21 L6,25 Q1,25 1,20 L1,12 Q1,7 6,7 Z',
    type: 'superspeedway',
  },
  texas: {
    // Quad-oval
    color: '#3a86ff',
    path: 'M8,6 L24,6 Q30,6 30,12 L30,20 Q30,26 24,26 L18,23 L14,23 L8,26 Q2,26 2,20 L2,12 Q2,6 8,6 Z',
    type: 'speedway',
  },
  charlotte: {
    // Quad-oval / roval capable
    color: '#fb5607',
    path: 'M8,5 L24,5 Q31,5 31,12 L31,20 Q31,27 24,27 L18,24 L14,24 L8,27 Q1,27 1,20 L1,12 Q1,5 8,5 Z',
    type: 'speedway',
  },
  nashville: {
    // Concrete oval
    color: '#ffbe0b',
    path: 'M10,7 L22,7 Q28,7 28,13 L28,19 Q28,25 22,25 L10,25 Q4,25 4,19 L4,13 Q4,7 10,7 Z',
    type: 'speedway',
  },
  michigan: {
    // Wide D-oval
    color: '#8338ec',
    path: 'M8,8 L24,8 Q31,8 31,14 L31,18 Q31,24 24,24 L8,24 Q1,24 1,18 L1,14 Q1,8 8,8 Z',
    type: 'speedway',
  },
  pocono: {
    // Triangle / tricky triangle
    color: '#06d6a0',
    path: 'M16,4 L30,26 L2,26 Z',
    type: 'speedway',
  },
  chicagoland: {
    // Tri-oval
    color: '#118ab2',
    path: 'M8,7 L24,7 Q30,7 30,13 L30,19 Q30,25 24,25 L16,22 L8,25 Q2,25 2,19 L2,13 Q2,7 8,7 Z',
    type: 'speedway',
  },
  'north wilkesboro': {
    // Short oval — classic
    color: '#e9c46a',
    path: 'M11,9 L21,9 Q26,9 26,14 L26,18 Q26,23 21,23 L11,23 Q6,23 6,18 L6,14 Q6,9 11,9 Z',
    type: 'short',
  },
  indianapolis: {
    // Rectangle with rounded corners
    color: '#ef476f',
    path: 'M8,6 L24,6 Q28,6 28,10 L28,22 Q28,26 24,26 L8,26 Q4,26 4,22 L4,10 Q4,6 8,6 Z',
    type: 'speedway',
  },
  iowa: {
    // Short oval
    color: '#ffd166',
    path: 'M10,8 L22,8 Q27,8 27,14 L27,18 Q27,24 22,24 L10,24 Q5,24 5,18 L5,14 Q5,8 10,8 Z',
    type: 'short',
  },
  richmond: {
    // D-shaped short track
    color: '#06d6a0',
    path: 'M10,7 L22,7 Q28,7 28,13 L28,19 Q28,25 22,25 L10,25 Q4,25 4,19 L4,13 Q4,7 10,7 Z',
    type: 'short',
  },
  'new hampshire': {
    // "Magic Mile" — flat oval
    color: '#073b4c',
    path: 'M10,7 L22,7 Q29,7 29,14 L29,18 Q29,25 22,25 L10,25 Q3,25 3,18 L3,14 Q3,7 10,7 Z',
    type: 'short',
  },
  'wwt': {
    // WWT Raceway — egg shaped oval
    color: '#e76f51',
    path: 'M10,6 L22,6 Q29,6 29,13 L29,19 Q29,26 22,26 L10,26 Q5,26 5,20 L5,12 Q5,6 10,6 Z',
    type: 'speedway',
  },
  'homestead': {
    // Homestead-Miami — championship oval
    color: '#f5a623',
    path: 'M8,7 L24,7 Q30,7 30,13 L30,19 Q30,25 24,25 L16,22 L8,25 Q2,25 2,19 L2,13 Q2,7 8,7 Z',
    type: 'speedway',
    star: true,
  },

  // ── Road Courses ──
  cota: {
    // COTA — technical S-curves
    color: '#ff006e',
    path: 'M4,8 L12,4 L20,8 L28,4 L28,12 L24,16 L28,20 L24,28 L16,24 L8,28 L4,20 L8,16 Z',
    type: 'road',
  },
  'watkins glen': {
    // Boot shape
    color: '#7209b7',
    path: 'M6,6 L18,6 L22,10 L26,10 L26,18 L22,22 L18,18 L14,22 L10,26 L6,26 L6,18 L10,14 Z',
    type: 'road',
  },
  'san diego': {
    // Street circuit
    color: '#00bbf9',
    path: 'M6,6 L26,6 L26,12 L18,12 L18,18 L26,18 L26,26 L6,26 L6,18 L14,18 L14,12 L6,12 Z',
    type: 'street',
  },
  sonoma: {
    // Hilly road course — swoopy
    color: '#2d6a4f',
    path: 'M4,16 L8,8 L16,4 L24,8 L28,14 L24,20 L20,16 L16,20 L12,18 L8,24 L4,20 Z',
    type: 'road',
  },
};

// Match a track name to our icon library
function findTrack(name) {
  const n = normalizeTrackName(name);
  // Direct match
  for (const [key, data] of Object.entries(TRACKS)) {
    if (n.includes(key)) return data;
  }
  // Fallback — generic oval
  return null;
}

// Pixel grid overlay for retro effect
function PixelGrid({ opacity = 0.15 }) {
  const lines = [];
  for (let i = 0; i <= 32; i += 2) {
    lines.push(
      <line key={`h${i}`} x1="0" y1={i} x2="32" y2={i} stroke="currentColor" strokeWidth="0.15" opacity={opacity} />,
      <line key={`v${i}`} x1={i} y1="0" x2={i} y2="32" stroke="currentColor" strokeWidth="0.15" opacity={opacity} />
    );
  }
  return <g className="text-[#8a8a9a]">{lines}</g>;
}

// Type badge labels
const TYPE_LABELS = {
  superspeedway: 'SS',
  speedway: 'SP',
  short: 'ST',
  road: 'RC',
  street: 'SC',
};

export default function TrackIcon({ track, size = 48, showLabel = false, className = '' }) {
  const data = findTrack(track);

  if (!data) {
    // Unknown track — show a generic circle
    return (
      <div
        className={`flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 32 32" width={size} height={size}>
          <rect width="32" height="32" rx="4" fill="#1a1a2e" />
          <PixelGrid />
          <circle cx="16" cy="16" r="10" fill="none" stroke="#8a8a9a" strokeWidth="2" strokeDasharray="2,2" />
          <text x="16" y="18" textAnchor="middle" fill="#8a8a9a" fontSize="6" fontFamily="monospace">?</text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex-shrink-0 relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size}>
        {/* Dark background */}
        <rect width="32" height="32" rx="4" fill="#1a1a2e" />

        {/* Pixel grid overlay */}
        <PixelGrid />

        {/* Glow effect behind track */}
        <defs>
          <filter id={`glow-${normalizeTrackName(track).replace(/\s/g, '')}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track outline — glow */}
        <path
          d={data.path}
          fill="none"
          stroke={data.color}
          strokeWidth="0.8"
          opacity="0.3"
          filter={`url(#glow-${normalizeTrackName(track).replace(/\s/g, '')})`}
        />

        {/* Track surface */}
        <path
          d={data.path}
          fill={data.color}
          fillOpacity="0.12"
          stroke={data.color}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Inner oval (for tracks that have one) */}
        {data.inner && (
          <path
            d={data.inner}
            fill="#1a1a2e"
            stroke={data.color}
            strokeWidth="0.5"
            opacity="0.4"
          />
        )}

        {/* Start/finish line tick */}
        <line
          x1="16" y1={data.type === 'road' || data.type === 'street' ? 4 : 5}
          x2="16" y2={data.type === 'road' || data.type === 'street' ? 7 : 8}
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.7"
        />

        {/* Championship star for Homestead */}
        {data.star && (
          <polygon
            points="16,2 17.2,5 20.5,5 17.8,7.2 18.8,10.5 16,8.5 13.2,10.5 14.2,7.2 11.5,5 14.8,5"
            fill="#f5a623"
            opacity="0.6"
          />
        )}

        {/* Type label */}
        {showLabel && (
          <text
            x="28" y="30"
            textAnchor="end"
            fill={data.color}
            fontSize="4"
            fontFamily="monospace"
            fontWeight="bold"
            opacity="0.6"
          >
            {TYPE_LABELS[data.type] || ''}
          </text>
        )}
      </svg>
    </div>
  );
}
