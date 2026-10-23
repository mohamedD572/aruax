import React from 'react';

interface AurexTokenLogoProps {
  className?: string;
  size?: number;
}

export const AurexTokenLogo: React.FC<AurexTokenLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_14px_rgba(212,175,55,0.55)]"
      >
        <defs>
          {/* Metallic Gold Rim Gradient */}
          <linearGradient id="aurGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2A3" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>

          {/* Deep Obsidian Black Coin Face */}
          <radialGradient id="aurObsidianFace" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1A2130" />
            <stop offset="60%" stopColor="#0B0E14" />
            <stop offset="100%" stopColor="#05070B" />
          </radialGradient>

          {/* Golden Letter A Emblem 3D Gradient */}
          <linearGradient id="aurGoldEmblem" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="20%" stopColor="#FDE047" />
            <stop offset="55%" stopColor="#D4AF37" />
            <stop offset="85%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Gloss Specular Light Reflection */}
          <linearGradient id="aurGlossOverlay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>

          {/* Outer Coin Edge Serrations / Ridges */}
          <radialGradient id="aurEdgeRidge" cx="50%" cy="50%" r="50%">
            <stop offset="90%" stopColor="#F59E0B" />
            <stop offset="96%" stopColor="#FFF2A3" />
            <stop offset="100%" stopColor="#78350F" />
          </radialGradient>

          <filter id="aurGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Serrated Coin Rim */}
        <circle cx="50" cy="50" r="49" fill="url(#aurGoldRim)" />
        <circle cx="50" cy="50" r="46.5" fill="#05070B" />
        <circle cx="50" cy="50" r="44.5" fill="url(#aurGoldRim)" />

        {/* Deep Obsidian Coin Center Face */}
        <circle cx="50" cy="50" r="41.5" fill="url(#aurObsidianFace)" />

        {/* Inner Beaded Luxury Ring */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="url(#aurGoldRim)"
          strokeWidth="1.2"
          strokeDasharray="2.5 2"
          opacity="0.8"
        />

        {/* Golden AUREX "A" Monogram */}
        <g filter="url(#aurGoldGlow)">
          {/* Main Triangular Peak Body */}
          <path
            d="M50 17 L21 76 H33 L42 58 H58 L67 76 H79 L50 17 Z M50 31 L54.5 48 H45.5 L50 31 Z"
            fill="url(#aurGoldEmblem)"
          />

          {/* Diamond Core Gem in Center */}
          <polygon points="50,33 54,44 50,47 46,44" fill="#FFF9D2" />

          {/* Precision Horizontal High-Tech Bridge */}
          <rect x="36" y="52" width="28" height="3.5" rx="1.75" fill="#FDE047" />
        </g>

        {/* Diagonal Specular Reflection Sweep */}
        <path
          d="M12 40 C 20 18, 55 12, 85 22 C 68 15, 30 18, 12 40 Z"
          fill="url(#aurGlossOverlay)"
        />
      </svg>
    </div>
  );
};
