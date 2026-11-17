
/**
 * Royal Blue illustrated sky scene inspired directly by Reference 2, 4 & 5:
 * Royal blue canvas (#416FD2), coral-pink clouds (#FF8D9C), warm orange hills (#FF704F),
 * glowing 4-point stars, and forward-moving cyclist silhouette.
 */
export function RoyalSkyScene({ showCyclist = true }: { showCyclist?: boolean }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 640"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="royalBg" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#416FD2" />
            <stop offset="100%" stopColor="#126EB2" />
          </linearGradient>
        </defs>

        <rect width="1440" height="640" fill="url(#royalBg)" />

        {/* Painted coral-pink clouds */}
        <g className="animate-cloud-drift">
          <path
            d="M420 75 C460 35, 550 38, 595 74 C630 62, 680 80, 675 110 L415 110 Z"
            fill="#FF8D9C"
            opacity="0.82"
          />
          <path
            d="M1040 85 C1085 42, 1185 48, 1225 90 C1268 78, 1320 100, 1315 132 L1035 132 Z"
            fill="#FF8D9C"
            opacity="0.85"
          />
          <path
            d="M740 185 C775 155, 850 160, 880 190 L730 190 Z"
            fill="#FF8D9C"
            opacity="0.55"
          />
        </g>

        {/* Four-point twinkling stars */}
        <g fill="#FFF0C9">
          <path d="M210 220 L215 235 L230 240 L215 245 L210 260 L205 245 L190 240 L205 235 Z" opacity="0.9" />
          <path d="M510 140 L514 151 L525 155 L514 159 L510 170 L506 159 L495 155 L506 151 Z" opacity="0.75" />
          <path d="M920 215 L924 226 L935 230 L924 234 L920 245 L916 234 L905 230 L916 226 Z" opacity="0.85" />
          <path d="M1260 250 L1264 261 L1275 265 L1264 269 L1260 280 L1256 269 L1245 265 L1256 261 Z" opacity="0.8" />
        </g>

        {/* Turquoise distant ridge & warm orange hill horizon */}
        <path
          d="M0 510 C280 430, 560 475, 860 515 C1120 550, 1280 465, 1440 485 L1440 640 L0 640 Z"
          fill="#22BFAE"
          opacity="0.55"
        />
        <path
          d="M0 555 C310 500, 620 545, 960 555 C1190 562, 1340 530, 1440 540 L1440 640 L0 640 Z"
          fill="#FF704F"
        />

        {/* Cyclist illustration inspired by Reference 5 */}
        {showCyclist && (
          <g transform="translate(1010, 415)">
            <g className="animate-gentle-bob">
              {/* Dynamic motion lines */}
              <line x1="-180" y1="35" x2="-45" y2="-15" stroke="#FFF0C9" strokeWidth="1.5" opacity="0.45" />
              <line x1="-210" y1="65" x2="-60" y2="10" stroke="#FFF0C9" strokeWidth="1.5" opacity="0.35" />
              {/* Wheels */}
              <circle cx="0" cy="95" r="34" stroke="#FF8D9C" strokeWidth="5" fill="none" />
              <circle cx="96" cy="95" r="34" stroke="#FF8D9C" strokeWidth="5" fill="none" />
              {/* Frame */}
              <path
                d="M0 95 L42 52 L88 52 L96 95 M42 52 L55 95 L0 95 M88 52 L82 32 L100 30"
                stroke="#FF8D9C"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Rider coat & trailing lime-green scarf */}
              <path
                d="M36 56 L58 18 L82 48 L56 76 Z"
                fill="#126EB2"
              />
              <circle cx="62" cy="10" r="10" fill="#FF704F" />
              <path
                d="M54 16 C28 10, 6 22, -28 18 C-6 28, 22 28, 52 24 Z"
                fill="#9BE52E"
              />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
