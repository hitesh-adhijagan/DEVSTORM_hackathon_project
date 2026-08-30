import React from 'react';

interface DUMonogramLogoProps {
  size?: number;
  className?: string;
  isAnimated?: boolean;
}

export const DUMonogramLogo: React.FC<DUMonogramLogoProps> = ({
  size = 32,
  className = '',
  isAnimated = false,
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <rect width="100" height="100" rx="22" fill="#0C2340" />

        {/* Ribbon 'D' Path */}
        <path
          d="M22 25 H50 C65 25 75 35 75 50 C75 65 65 75 50 75 H35 V82 H22 Z"
          fill="none"
          stroke="#4A90E2"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isAnimated ? 'animate-draw-d' : ''}
        />

        {/* Interlocking Ribbon 'U' Path */}
        <path
          d="M45 42 V65 C45 78 55 82 68 82 C80 82 86 75 86 62 V25"
          fill="none"
          stroke="#74C69D"
          strokeWidth="10"
          strokeLinecap="round"
          className={isAnimated ? 'animate-draw-u' : ''}
        />
      </svg>
    </div>
  );
};
