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
        className="drop-shadow-[0_0_12px_rgba(16,185,129,0.45)]"
      >
        <defs>
          {/* Outer Gold Bevel Gradient */}
          <linearGradient id="goldRimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="35%" stopColor="#D97706" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Inner Dark Emerald Metallic Face */}
          <radialGradient id="emeraldFaceGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#065F46" />
            <stop offset="50%" stopColor="#022C22" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Golden Letter A Gradient */}
          <linearGradient id="goldEmblemGradient" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          {/* Specular Gloss Overlay */}
          <linearGradient id="glossOverlay" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </linearGradient>

          <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Gold Metallic Ring */}
        <circle cx="50" cy="50" r="48" fill="url(#goldRimGradient)" />
        <circle cx="50" cy="50" r="43" fill="#090D16" />

        {/* Inner Emerald Coin Face */}
        <circle cx="50" cy="50" r="41" fill="url(#emeraldFaceGradient)" />

        {/* Inner Gold Beaded Border Line */}
        <circle cx="50" cy="50" r="38" stroke="url(#goldRimGradient)" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.85" />

        {/* Stylized Futuristic Letter 'A' Emblem */}
        <g filter="url(#emeraldGlow)">
          {/* Main Peak Body of A */}
          <path
            d="M50 18 L22 75 H34 L42 58 H58 L66 75 H78 L50 18 Z M50 32 L54.5 48 H45.5 L50 32 Z"
            fill="url(#goldEmblemGradient)"
          />
          {/* Emerald Center Core Crystal Accent */}
          <polygon points="50,35 53,45 47,45" fill="#34D399" />
          {/* Futuristic Horizontal Bar Cut Accent */}
          <rect x="36" y="52" width="28" height="4" rx="2" fill="#10B981" opacity="0.9" />
        </g>

        {/* Gloss Curved Specular Light Reflection */}
        <path
          d="M12 40 C 20 20, 50 12, 80 20 C 65 14, 30 18, 12 40 Z"
          fill="url(#glossOverlay)"
        />
      </svg>
    </div>
  );
};

