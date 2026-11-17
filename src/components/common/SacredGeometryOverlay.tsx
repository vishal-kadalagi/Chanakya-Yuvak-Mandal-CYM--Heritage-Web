import React from 'react';

interface SacredGeometryProps {
  className?: string;
  size?: number;
  opacity?: number;
}

export const SacredGeometryOverlay: React.FC<SacredGeometryProps> = ({
  className = '',
  size = 600,
  opacity = 0.06,
}) => {
  return (
    <div
      className={`pointer-events-none select-none overflow-hidden flex items-center justify-center ${className}`}
      style={{ opacity }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        className="animate-spin-ultra-slow"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Ring */}
        <circle cx="200" cy="200" r="195" stroke="#E5A812" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="200" cy="200" r="185" stroke="#E5A812" strokeWidth="1.5" />
        
        {/* 12 Concentric Sun Rays */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 200 + 170 * Math.cos(angle);
          const y1 = 200 + 170 * Math.sin(angle);
          const x2 = 200 + 185 * Math.cos(angle);
          const y2 = 200 + 185 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#E5A812"
              strokeWidth="1.5"
            />
          );
        })}

        {/* 8 Lotus Petals */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const cx = 200 + 75 * Math.cos(angle);
          const cy = 200 + 75 * Math.sin(angle);
          return (
            <circle
              key={`petal-${i}`}
              cx={cx}
              cy={cy}
              r="45"
              stroke="#E5A812"
              strokeWidth="1"
              strokeOpacity="0.7"
            />
          );
        })}

        {/* Middle Circles */}
        <circle cx="200" cy="200" r="120" stroke="#E5A812" strokeWidth="1.2" />
        <circle cx="200" cy="200" r="85" stroke="#E5A812" strokeWidth="1" strokeDasharray="2 4" />
        
        {/* Sacred Square / Bhupura */}
        <rect
          x="140"
          y="140"
          width="120"
          height="120"
          stroke="#E5A812"
          strokeWidth="1.2"
          transform="rotate(45 200 200)"
        />
        <rect
          x="140"
          y="140"
          width="120"
          height="120"
          stroke="#E5A812"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Central Triangle & Bindu (Center of Consciousness) */}
        <polygon
          points="200,160 235,225 165,225"
          stroke="#E5A812"
          strokeWidth="1.5"
        />
        <polygon
          points="200,240 165,175 235,175"
          stroke="#E5A812"
          strokeWidth="1"
          strokeOpacity="0.8"
        />
        <circle cx="200" cy="200" r="4" fill="#E5A812" />
      </svg>
    </div>
  );
};