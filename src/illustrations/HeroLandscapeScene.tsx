
/**
 * Hero landscape illustration inspired directly by Reference 3:
 * Golden yellow sky, rolling terraced green hills, large illustrated orange tree
 * with royal-blue branches, turquoise winding river, and colourful foreground botanicals.
 */
export function HeroLandscapeScene() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 820"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldenSky" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#FFE17D" />
            <stop offset="55%" stopColor="#FFF0C9" />
            <stop offset="100%" stopColor="#FCD364" />
          </linearGradient>
          <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F4C324" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="hillBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8EA5C" />
            <stop offset="100%" stopColor="#78C943" />
          </linearGradient>
          <linearGradient id="hillFront" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9BE52E" />
            <stop offset="100%" stopColor="#5BB431" />
          </linearGradient>
          <linearGradient id="treeCanopy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4C324" />
            <stop offset="55%" stopColor="#FF704F" />
            <stop offset="100%" stopColor="#FF8D9C" />
          </linearGradient>
          <linearGradient id="streamWater" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#70C9E8" />
            <stop offset="100%" stopColor="#22BFAE" />
          </linearGradient>
        </defs>

        {/* Golden painted sky */}
        <rect width="1440" height="820" fill="url(#goldenSky)" />

        {/* Soft glowing sun */}
        <circle cx="880" cy="240" r="190" fill="url(#sunGlow)" />

        {/* Distant warm mountain silhouettes */}
        <path
          d="M0 440 Q210 345 430 410 T920 380 T1440 340 L1440 820 L0 820 Z"
          fill="#F9DE96"
          opacity="0.7"
        />
        <path
          d="M0 495 Q280 415 560 475 T1120 445 T1440 420 L1440 820 L0 820 Z"
          fill="#F5C97B"
          opacity="0.45"
        />

        {/* Animated drifting clouds */}
        <g className="animate-cloud-drift" opacity="0.65">
          <path
            d="M140 165 Q175 135 225 148 Q265 125 310 155 Q340 165 320 185 L130 185 Q115 175 140 165 Z"
            fill="#FFF7DF"
          />
          <path
            d="M1110 120 Q1145 92 1195 106 Q1235 88 1275 114 Q1302 125 1280 142 L1100 142 Z"
            fill="#FFF7DF"
          />
        </g>

        {/* Terraced rolling green hills on left & center */}
        <path
          d="M-20 560 C180 470, 440 500, 700 580 C940 650, 1210 560, 1460 520 L1460 820 L-20 820 Z"
          fill="url(#hillBack)"
        />
        {/* Terraced lines like Reference 3 */}
        <path
          d="M-10 600 C170 530, 360 555, 520 620"
          stroke="#DFF89A"
          strokeWidth="4"
          fill="none"
          opacity="0.75"
        />
        <path
          d="M-10 638 C160 572, 330 595, 480 658"
          stroke="#DFF89A"
          strokeWidth="3.5"
          fill="none"
          opacity="0.65"
        />
        <path
          d="M-10 676 C140 618, 290 638, 430 695"
          stroke="#DFF89A"
          strokeWidth="3"
          fill="none"
          opacity="0.55"
        />

        {/* Right foreground hillside supporting the large orange tree */}
        <path
          d="M520 690 C780 570, 1140 540, 1460 610 L1460 820 L480 820 Z"
          fill="url(#hillFront)"
        />

        {/* Turquoise winding stream at bottom left */}
        <path
          d="M-20 745 C140 720, 260 710, 440 735 C620 760, 740 795, 920 820 L-20 820 Z"
          fill="url(#streamWater)"
        />
        <path
          d="M15 760 C160 738, 290 735, 445 758"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.55"
          fill="none"
        />

        {/* Large Illustrated Orange Tree with Royal Blue Trunk & Branches (Reference 3 centerpiece) */}
        <g className="animate-tree-sway">
          {/* Canopy back layer */}
          <path
            d="M840 330 C770 280, 810 185, 910 180 C950 105, 1085 88, 1170 135 C1265 95, 1385 155, 1375 255 C1430 300, 1390 405, 1295 400 C1230 430, 1090 415, 1030 385 C950 405, 855 385, 840 330 Z"
            fill="url(#treeCanopy)"
          />
          {/* Canopy bright golden highlight clouds */}
          <ellipse cx="970" cy="215" rx="95" ry="52" fill="#F4C324" opacity="0.85" />
          <ellipse cx="1165" cy="185" rx="110" ry="60" fill="#FFE066" opacity="0.7" />
          <ellipse cx="1295" cy="280" rx="75" ry="48" fill="#FF704F" opacity="0.75" />

          {/* Royal blue expressive trunk & sweeping branches */}
          <path
            d="M1175 635 C1160 540, 1150 465, 1105 390 C1050 315, 965 290, 905 255"
            stroke="#126EB2"
            strokeWidth="22"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M1155 520 C1120 440, 1165 340, 1255 275"
            stroke="#416FD2"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M1125 430 C1070 365, 1065 275, 1085 215"
            stroke="#416FD2"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M1045 345 C985 335, 945 345, 910 340"
            stroke="#126EB2"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          {/* Small floating warm leaves */}
          <circle cx="885" cy="220" r="8" fill="#FF704F" />
          <circle cx="1010" cy="145" r="10" fill="#FFF0C9" />
          <circle cx="1260" cy="175" r="7" fill="#FF8D9C" />
          <circle cx="1335" cy="245" r="9" fill="#F4C324" />
        </g>

        {/* Colourful foreground botanical leaves & flowers (Reference 3 bottom border) */}
        <g className="animate-gentle-bob">
          {/* Turquoise & emerald botanical leaves */}
          <path
            d="M570 820 C560 740, 610 680, 645 645 C655 705, 630 770, 600 820 Z"
            fill="#22BFAE"
          />
          <path
            d="M645 820 C655 755, 705 705, 755 680 C745 745, 705 790, 675 820 Z"
            fill="#416FD2"
          />
          <path
            d="M780 820 C770 735, 815 675, 845 630 C860 700, 840 770, 815 820 Z"
            fill="#126EB2"
          />
          <path
            d="M1190 820 C1185 735, 1235 660, 1280 615 C1295 695, 1270 770, 1235 820 Z"
            fill="#22BFAE"
          />
          <path
            d="M1310 820 C1315 745, 1365 685, 1425 655 C1415 730, 1375 785, 1345 820 Z"
            fill="#416FD2"
          />

          {/* Coral & orange blossoms */}
          <g transform="translate(715, 735)">
            <circle cx="0" cy="-14" r="11" fill="#FF8D9C" />
            <circle cx="13" cy="-4" r="11" fill="#FF8D9C" />
            <circle cx="8" cy="11" r="11" fill="#FF8D9C" />
            <circle cx="-8" cy="11" r="11" fill="#FF8D9C" />
            <circle cx="-13" cy="-4" r="11" fill="#FF8D9C" />
            <circle cx="0" cy="0" r="7" fill="#F4C324" />
          </g>
          <g transform="translate(960, 758)">
            <circle cx="0" cy="-12" r="10" fill="#FF704F" />
            <circle cx="11" cy="-3" r="10" fill="#FF704F" />
            <circle cx="7" cy="9" r="10" fill="#FF704F" />
            <circle cx="-7" cy="9" r="10" fill="#FF704F" />
            <circle cx="-11" cy="-3" r="10" fill="#FF704F" />
            <circle cx="0" cy="0" r="6" fill="#FFF0C9" />
          </g>
          <g transform="translate(1110, 725)">
            <circle cx="0" cy="-14" r="12" fill="#FF8D9C" />
            <circle cx="14" cy="-4" r="12" fill="#FF8D9C" />
            <circle cx="8" cy="12" r="12" fill="#FF8D9C" />
            <circle cx="-8" cy="12" r="12" fill="#FF8D9C" />
            <circle cx="-14" cy="-4" r="12" fill="#FF8D9C" />
            <circle cx="0" cy="0" r="7" fill="#F4C324" />
          </g>
        </g>
      </svg>
    </div>
  );
}
