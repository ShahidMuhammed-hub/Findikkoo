import { motion } from 'motion/react';
import type { WorldGrowthState } from '../shared/rules';
import type { WorldElementId } from '../shared/types';

interface MyWorldMapProps {
  worldGrowth: WorldGrowthState;
  selectedId: WorldElementId;
  onSelect: (id: WorldElementId) => void;
}

function TreeIllustration({
  stage,
  selected,
  onClick,
}: {
  stage: 1 | 2 | 3 | 4;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <g
      transform="translate(220, 290)"
      onClick={onClick}
      className="pointer-events-auto cursor-pointer"
    >
      {/* Invisible expanded hit area for comfortable tapping/clicking */}
      <rect x="-75" y="-120" width="150" height="180" fill="transparent" />

      {/* Ground shadow & subtle selection halo */}
      {selected && (
        <ellipse
          cx="0"
          cy="48"
          rx={38 + stage * 12}
          ry="15"
          fill="none"
          stroke="#1E4EB8"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          opacity="0.75"
        />
      )}
      <ellipse cx="0" cy="48" rx={24 + stage * 12} ry="10" fill="#5CA832" opacity="0.45" />

      <motion.g
        key={stage}
        initial={{ opacity: 0.72, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: '0px 46px' }}
      >
        {/* Trunk */}
        <path
          d={
            stage === 1
              ? 'M-4 46 Q-2 22 0 4 L4 4 Q2 22 4 46 Z'
              : stage === 2
              ? 'M-7 46 Q-4 14 0 -16 L5 -16 Q5 14 8 46 Z'
              : 'M-11 46 Q-6 8 -2 -34 L7 -34 Q8 8 13 46 Z'
          }
          fill="#126EB2"
        />

        {stage >= 3 && (
          <>
            <path d="M-2 6 Q-24 -8 -36 -20" stroke="#126EB2" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M3 -2 Q26 -14 38 -26" stroke="#126EB2" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* Stage 1: Young Sapling */}
        {stage === 1 && (
          <g>
            <path d="M0 8 C-18 4 -22 -14 -4 -12 C0 -11 0 0 0 8 Z" fill="#9BE52E" stroke="#0F2544" strokeWidth="1.8" />
            <path d="M2 2 C18 -2 22 -18 6 -16 C2 -15 2 -4 2 2 Z" fill="#78C943" stroke="#0F2544" strokeWidth="1.8" />
          </g>
        )}

        {/* Stage 2: Growing Canopy */}
        {stage === 2 && (
          <g>
            <circle cx="-16" cy="-16" r="24" fill="#78C943" />
            <circle cx="16" cy="-14" r="22" fill="#9BE52E" />
            <circle cx="0" cy="-32" r="26" fill="#9BE52E" />
            <circle cx="-8" cy="-24" r="14" fill="#B8F25A" opacity="0.7" />
          </g>
        )}

        {/* Stage 3: Blossoming Canopy */}
        {stage === 3 && (
          <g>
            <circle cx="-30" cy="-26" r="30" fill="#78C943" />
            <circle cx="28" cy="-28" r="29" fill="#78C943" />
            <circle cx="0" cy="-48" r="36" fill="#9BE52E" />
            <circle cx="-12" cy="-36" r="24" fill="#B8F25A" opacity="0.75" />
            <circle cx="-26" cy="-34" r="6" fill="#FF704F" />
            <circle cx="22" cy="-38" r="5.5" fill="#F4C324" />
            <circle cx="4" cy="-64" r="6" fill="#FF8D9C" />
            <circle cx="-6" cy="-18" r="5" fill="#FFF0C9" />
          </g>
        )}

        {/* Stage 4: Flourishing Grove Tree */}
        {stage === 4 && (
          <g>
            <circle cx="-42" cy="-32" r="34" fill="#5BB431" />
            <circle cx="42" cy="-32" r="33" fill="#5BB431" />
            <circle cx="-22" cy="-58" r="36" fill="#78C943" />
            <circle cx="22" cy="-56" r="35" fill="#78C943" />
            <circle cx="0" cy="-68" r="42" fill="#9BE52E" />
            <circle cx="-14" cy="-62" r="24" fill="#C7F76E" opacity="0.7" />
            <circle cx="-38" cy="-38" r="6.5" fill="#FF704F" />
            <circle cx="34" cy="-42" r="6.5" fill="#F4C324" />
            <circle cx="-8" cy="-84" r="6.5" fill="#FF8D9C" />
            <circle cx="14" cy="-52" r="6" fill="#FFF0C9" />
            <circle cx="-24" cy="-24" r="6" fill="#F4C324" />
            <circle cx="20" cy="-22" r="5.5" fill="#FF704F" />
          </g>
        )}
      </motion.g>
    </g>
  );
}

function HouseIllustration({
  stage,
  selected,
  onClick,
}: {
  stage: 1 | 2 | 3 | 4;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <g
      transform="translate(505, 272)"
      onClick={onClick}
      className="pointer-events-auto cursor-pointer"
    >
      <rect x="-85" y="-95" width="175" height="165" fill="transparent" />

      {selected && (
        <ellipse
          cx="0"
          cy="54"
          rx={62 + stage * 8}
          ry="15"
          fill="none"
          stroke="#1E4EB8"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          opacity="0.75"
        />
      )}
      <ellipse cx="0" cy="54" rx={48 + stage * 8} ry="11" fill="#5CA832" opacity="0.45" />

      <motion.g
        key={stage}
        initial={{ opacity: 0.72, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: '0px 50px' }}
      >
        {stage >= 4 && (
          <g>
            <path d="M-84 48 L-84 -4 Q-64 -24 -44 -4 L-44 48" stroke="#22BFAE" strokeWidth="5" fill="none" />
            <circle cx="-74" cy="-10" r="6" fill="#FF8D9C" />
            <circle cx="-54" cy="-10" r="6" fill="#F4C324" />
            <circle cx="-28" cy="56" r="3.5" fill="#F4C324" />
            <circle cx="28" cy="56" r="3.5" fill="#F4C324" />
          </g>
        )}

        {stage >= 3 && (
          <g>
            <rect x="30" y="2" width="44" height="44" rx="4" fill="#FFF8E6" stroke="#0F2544" strokeWidth="2.5" />
            <path d="M26 4 L52 -16 L78 4 Z" fill="#22BFAE" stroke="#0F2544" strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="44" y="16" width="16" height="16" rx="3" fill="#F4C324" stroke="#0F2544" strokeWidth="2" />
          </g>
        )}

        <rect x="-44" y="-8" width="82" height="54" rx="5" fill="#FFF0C9" stroke="#0F2544" strokeWidth="2.5" />

        {stage >= 2 && (
          <g>
            <rect x="14" y="-44" width="12" height="22" rx="2" fill="#416FD2" stroke="#0F2544" strokeWidth="2" />
            {stage >= 3 && (
              <path d="M20 -48 Q26 -58 20 -66 Q14 -74 22 -82" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.85" />
            )}
          </g>
        )}

        <path
          d="M-54 -6 L-3 -48 L48 -6 Z"
          fill="#FF704F"
          stroke="#0F2544"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        <rect x="-12" y="14" width="18" height="32" rx="3" fill="#416FD2" stroke="#0F2544" strokeWidth="2" />
        <circle cx="2" cy="30" r="2" fill="#F4C324" />

        <rect x="-34" y="8" width="15" height="15" rx="3" fill={stage >= 3 ? '#F4C324' : '#70C9E8'} stroke="#0F2544" strokeWidth="2" />
        <rect x="13" y="8" width="15" height="15" rx="3" fill={stage >= 3 ? '#F4C324' : '#70C9E8'} stroke="#0F2544" strokeWidth="2" />

        {stage >= 2 && (
          <g>
            <rect x="-48" y="42" width="90" height="7" rx="2" fill="#DDA66B" stroke="#0F2544" strokeWidth="2" />
            <circle cx="-36" cy="38" r="5.5" fill="#78C943" />
            <circle cx="-36" cy="34" r="3" fill="#FF8D9C" />
            <circle cx="28" cy="38" r="5.5" fill="#78C943" />
            <circle cx="28" cy="34" r="3" fill="#F4C324" />
          </g>
        )}
      </motion.g>
    </g>
  );
}

function CarIllustration({
  stage,
  selected,
  onClick,
}: {
  stage: 1 | 2 | 3 | 4;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <g
      transform="translate(795, 318)"
      onClick={onClick}
      className="pointer-events-auto cursor-pointer"
    >
      <rect x="-75" y="-55" width="150" height="105" fill="transparent" />

      {selected && (
        <ellipse
          cx="0"
          cy="32"
          rx={58 + stage * 4}
          ry="13"
          fill="none"
          stroke="#1E4EB8"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          opacity="0.75"
        />
      )}
      <ellipse cx="0" cy="32" rx={46 + stage * 4} ry="9" fill="#5CA832" opacity="0.45" />

      <motion.g
        key={stage}
        initial={{ opacity: 0.72, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: '0px 30px' }}
      >
        {stage === 1 && (
          <g>
            <rect x="-38" y="2" width="76" height="14" rx="4" fill="#DDA66B" stroke="#0F2544" strokeWidth="2.5" />
            <path d="M-20 2 L-8 -16 H18 L28 2" stroke="#0F2544" strokeWidth="2.5" fill="none" />
            <circle cx="-24" cy="20" r="10" fill="#FFF0C9" stroke="#0F2544" strokeWidth="2.5" />
            <circle cx="24" cy="20" r="10" fill="#FFF0C9" stroke="#0F2544" strokeWidth="2.5" />
          </g>
        )}

        {stage === 2 && (
          <g>
            <path
              d="M-44 16 L-40 -2 H-22 L-10 -20 H18 L32 -2 H44 L46 16 Z"
              fill="#416FD2"
              stroke="#0F2544"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M-16 -2 L-8 -15 H16 L24 -2 Z" fill="#70C9E8" stroke="#0F2544" strokeWidth="2" />
            <circle cx="-26" cy="18" r="11" fill="#0F2544" />
            <circle cx="-26" cy="18" r="5" fill="#FFF0C9" />
            <circle cx="26" cy="18" r="11" fill="#0F2544" />
            <circle cx="26" cy="18" r="5" fill="#FFF0C9" />
          </g>
        )}

        {stage === 3 && (
          <g>
            <rect x="-18" y="-29" width="38" height="6" rx="2" fill="#F4C324" stroke="#0F2544" strokeWidth="2" />
            <rect x="-12" y="-36" width="20" height="7" rx="2" fill="#FF704F" stroke="#0F2544" strokeWidth="2" />
            <path
              d="M-48 16 L-44 -2 H-24 L-12 -22 H22 L36 -2 H48 L50 16 Z"
              fill="#22BFAE"
              stroke="#0F2544"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M-18 -2 L-10 -17 H18 L28 -2 Z" fill="#FFF0C9" stroke="#0F2544" strokeWidth="2" />
            <line x1="-44" y1="6" x2="48" y2="6" stroke="#F4C324" strokeWidth="3.5" />
            <circle cx="-28" cy="18" r="11.5" fill="#0F2544" />
            <circle cx="-28" cy="18" r="5" fill="#FFF0C9" />
            <circle cx="28" cy="18" r="11.5" fill="#0F2544" />
            <circle cx="28" cy="18" r="5" fill="#FFF0C9" />
          </g>
        )}

        {stage === 4 && (
          <g>
            <path d="M-26 -24 H24 L30 -16 H-22 Z" fill="#FF704F" stroke="#0F2544" strokeWidth="2" />
            <path
              d="M-54 16 L-52 -20 Q-52 -28 -42 -28 H22 Q34 -28 42 -10 L52 -4 L54 16 Z"
              fill="#416FD2"
              stroke="#0F2544"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect x="-42" y="-18" width="24" height="15" rx="3" fill="#FFF0C9" stroke="#0F2544" strokeWidth="2" />
            <path d="M-10 -18 H22 L32 -4 H-10 Z" fill="#70C9E8" stroke="#0F2544" strokeWidth="2" />
            <path d="M-52 4 H53" stroke="#9BE52E" strokeWidth="4" />
            <circle cx="51" cy="6" r="4" fill="#F4C324" />
            <circle cx="-32" cy="18" r="12" fill="#0F2544" />
            <circle cx="-32" cy="18" r="5.5" fill="#FFF0C9" />
            <circle cx="30" cy="18" r="12" fill="#0F2544" />
            <circle cx="30" cy="18" r="5.5" fill="#FFF0C9" />
          </g>
        )}
      </motion.g>
    </g>
  );
}

export function MyWorldMap({ worldGrowth, selectedId, onSelect }: MyWorldMapProps) {
  const hotspots: {
    id: WorldElementId;
    title: string;
    shortTitle: string;
    stage: 1 | 2 | 3 | 4;
    stageTitle: string;
    posClass: string;
  }[] = [
    {
      id: 'tree',
      title: 'The Tree',
      shortTitle: 'Tree',
      stage: worldGrowth.tree.stage,
      stageTitle: worldGrowth.tree.stageTitle,
      posClass: 'left-[18%] sm:left-[22%] top-[78%]',
    },
    {
      id: 'house',
      title: 'The House',
      shortTitle: 'House',
      stage: worldGrowth.house.stage,
      stageTitle: worldGrowth.house.stageTitle,
      posClass: 'left-[50%] sm:left-[50.5%] top-[78%]',
    },
    {
      id: 'car',
      title: 'The Car',
      shortTitle: 'Car',
      stage: worldGrowth.car.stage,
      stageTitle: worldGrowth.car.stageTitle,
      posClass: 'left-[82%] sm:left-[79.5%] top-[78%]',
    },
  ];

  return (
    <div
      className="relative w-full h-[340px] sm:h-[440px] rounded-3xl overflow-hidden border border-[#0F2544]/15 shadow-sm bg-[#FFF0C9]"
      data-testid="my-world-canvas"
    >
      {/* Layered 2.5D Living World Illustration (NO bird) */}
      <svg
        viewBox="0 0 1000 440"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
        role="img"
        aria-label="Personal world illustration showing The Tree, The House, and The Car"
      >
        <defs>
          <linearGradient id="livingSky" x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#70C9E8" />
            <stop offset="55%" stopColor="#FFF0C9" />
            <stop offset="100%" stopColor="#FFE17D" />
          </linearGradient>
          <linearGradient id="meadowBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8EA5C" />
            <stop offset="100%" stopColor="#78C943" />
          </linearGradient>
          <linearGradient id="meadowFront" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9BE52E" />
            <stop offset="100%" stopColor="#65BC36" />
          </linearGradient>
        </defs>

        <rect width="1000" height="440" fill="url(#livingSky)" />

        {/* Warm Sun */}
        <circle cx="840" cy="86" r="54" fill="#FFF9E6" opacity="0.9" />

        {/* Soft Drifting Clouds */}
        <g className="animate-cloud-drift" opacity="0.82">
          <path d="M110 76 Q145 48 195 62 Q235 44 270 72 L100 78 Z" fill="#FFFFFF" />
          <path d="M560 64 Q600 38 655 52 Q690 38 725 64 L550 68 Z" fill="#FFFFFF" />
        </g>

        {/* Distant Hills */}
        <path d="M0 245 Q240 165 510 218 T1000 185 L1000 440 L0 440 Z" fill="url(#meadowBack)" opacity="0.65" />

        {/* Rolling Meadow */}
        <path
          d="M0 282 C220 232, 460 250, 720 278 C860 292, 950 264, 1000 252 L1000 440 L0 440 Z"
          fill="url(#meadowFront)"
        />
        <path
          d="M0 342 C300 315, 650 348, 1000 326 L1000 440 L0 440 Z"
          fill="#78C943"
        />

        {/* Winding Path connecting Tree -> House -> Car */}
        <path
          d="M90 368 C210 342, 340 342, 505 338 C650 335, 760 356, 930 352"
          stroke="#FFF0C9"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
          opacity="0.92"
        />

        {/* Foreground Turquoise Stream */}
        <path d="M0 402 C250 382, 480 412, 740 440 L0 440 Z" fill="#22BFAE" opacity="0.85" />

        {/* Interactive Central Evolving World Objects */}
        <TreeIllustration
          stage={worldGrowth.tree.stage}
          selected={selectedId === 'tree'}
          onClick={() => onSelect('tree')}
        />
        <HouseIllustration
          stage={worldGrowth.house.stage}
          selected={selectedId === 'house'}
          onClick={() => onSelect('house')}
        />
        <CarIllustration
          stage={worldGrowth.car.stage}
          selected={selectedId === 'car'}
          onClick={() => onSelect('car')}
        />
      </svg>

      {/* Accessible Interactive Object Selector Buttons */}
      {hotspots.map((spot) => {
        const isSelected = selectedId === spot.id;
        return (
          <motion.button
            key={spot.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(spot.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 min-h-[44px] px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-left transition-colors cursor-pointer border ${spot.posClass} ${
              isSelected
                ? 'bg-white text-[#0F2544] border-[#1E4EB8] ring-2 ring-[#1E4EB8] shadow-md'
                : 'bg-white/95 text-[#0F2544] border-[#0F2544]/15 hover:bg-white shadow-xs'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
              <span className="text-xs sm:text-sm font-extrabold sm:hidden">{spot.shortTitle}</span>
              <span className="text-xs sm:text-sm font-extrabold hidden sm:inline">{spot.title}</span>
              <span className="text-[11px] font-semibold text-[#126EB2] tabular-nums">
                {spot.stage}/4
              </span>
            </div>
            <div className="text-[11px] text-[#465873] whitespace-nowrap hidden sm:block">
              {spot.stageTitle}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
