import { motion } from 'motion/react';

interface MakeItYourOwnProps {
  variant?: 'hero-light' | 'royal-lime' | 'royal-mustard';
  size?: 'lg' | 'md' | 'sm';
  className?: string;
}

/**
 * Signature Findikoo brush lettering:
 * Rough hand-painted strokes, organic irregular baseline, and high-contrast YOUR highlight.
 */
export function MakeItYourOwnBrush({
  variant = 'royal-lime',
  size = 'lg',
  className = '',
}: MakeItYourOwnProps) {
  const outerColor = variant === 'hero-light' ? '#124E96' : '#FFFFFF';
  const yourColor =
    variant === 'royal-lime'
      ? '#9BE52E'
      : variant === 'hero-light'
      ? '#C83E1B'
      : '#F4C324';

  const dimensions =
    size === 'lg'
      ? 'w-full max-w-[390px]'
      : size === 'md'
      ? 'w-full max-w-[300px]'
      : 'w-full max-w-[210px]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`${dimensions} select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 460 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible"
      >
        {/* Line 1: MAKE IT */}
        <g>
          <text
            x="22"
            y="84"
            transform="rotate(-3.2 140 70)"
            fill={outerColor}
            fontFamily="'Caveat Brush', cursive"
            fontSize="82"
            fontWeight="700"
            letterSpacing="3"
          >
            MAKE IT
          </text>
          <path
            d="M36 96 C125 89, 250 84, 385 78"
            stroke={outerColor}
            strokeOpacity="0.28"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* Line 2: YOUR */}
        <g>
          <text
            x="76"
            y="186"
            transform="rotate(-1.8 200 170)"
            fill={yourColor}
            fontFamily="'Caveat Brush', cursive"
            fontSize="112"
            fontWeight="700"
            letterSpacing="5"
          >
            YOUR
          </text>
        </g>

        {/* Line 3: OWN */}
        <g>
          <text
            x="92"
            y="286"
            transform="rotate(1.4 200 270)"
            fill={outerColor}
            fontFamily="'Caveat Brush', cursive"
            fontSize="102"
            fontWeight="700"
            letterSpacing="4"
          >
            OWN
          </text>
          <path
            d="M88 302 C175 292, 265 300, 325 291"
            stroke={yourColor}
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>
      </svg>
    </motion.div>
  );
}

export function BrushHeading({
  children,
  accentColor = '#F4C324',
  className = '',
}: {
  children: string;
  accentColor?: string;
  className?: string;
}) {
  return (
    <span className={`relative inline-block brush-font ${className}`}>
      <span className="relative z-10">{children}</span>
      <svg
        viewBox="0 0 240 16"
        className="absolute -bottom-1.5 left-0 w-full h-3 pointer-events-none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M4 10 C60 4, 165 13, 236 6"
          stroke={accentColor}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </svg>
    </span>
  );
}
