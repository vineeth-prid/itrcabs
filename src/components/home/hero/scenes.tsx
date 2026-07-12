/**
 * The seven Kerala scenes of the journey hero.
 * Pure SVG vector art — zero image payload, crisp at any DPI.
 * Subtle SMIL loops (boats bob, fog drifts, rain falls, palms sway,
 * lighthouse sweeps) keep every frame alive while the strip scrolls.
 */

function Palm({ x, y, s = 1, flip = false, delay = 0 }: { x: number; y: number; s?: number; flip?: boolean; delay?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <path d="M0 0c4-40 2-80-6-118" stroke="#173226" strokeWidth="7" fill="none" strokeLinecap="round" />
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-2 -6 -118;2.5 -6 -118;-2 -6 -118"
          dur="5s"
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
        {[-70, -35, 0, 35, 70, 105].map((deg) => (
          <path
            key={deg}
            d="M-6 -118q40 -18 78 -4q-38 22 -78 14z"
            fill="#1d4432"
            transform={`rotate(${deg} -6 -118)`}
          />
        ))}
        <circle cx="-6" cy="-116" r="7" fill="#5a3a1a" />
      </g>
    </g>
  );
}

function Birds({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`} opacity="0.75">
      <animateTransform attributeName="transform" type="translate" values={`${x} ${y};${x + 160} ${y - 40}`} dur="16s" repeatCount="indefinite" additive="replace" />
      {[
        [0, 0], [34, -14], [70, -4], [104, -20], [56, 16],
      ].map(([bx, by], i) => (
        <path key={i} d={`M${bx} ${by}q7 -8 14 0q7 -8 14 0`} stroke="#20242c" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <animate attributeName="d" values={`M${bx} ${by}q7 -8 14 0q7 -8 14 0;M${bx} ${by}q7 -2 14 0q7 -2 14 0;M${bx} ${by}q7 -8 14 0q7 -8 14 0`} dur="0.9s" begin={`${i * 0.12}s`} repeatCount="indefinite" />
        </path>
      ))}
    </g>
  );
}

function Cloud({ x, y, s = 1, o = 0.8, dur = 60 }: { x: number; y: number; s?: number; o?: number; dur?: number }) {
  return (
    <g opacity={o}>
      <animateTransform attributeName="transform" type="translate" values={`0 0;120 0;0 0`} dur={`${dur}s`} repeatCount="indefinite" />
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <ellipse cx="0" cy="0" rx="70" ry="22" fill="white" />
        <ellipse cx="48" cy="-12" rx="46" ry="20" fill="white" />
        <ellipse cx="-52" cy="-8" rx="40" ry="16" fill="white" />
      </g>
    </g>
  );
}

const S = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <svg
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMidYMax slice"
    className="absolute inset-0 h-full w-full"
    role="img"
    aria-label={label}
  >
    {children}
  </svg>
);

/* ── Scene 1 · Kochi city ─────────────────────────────── */
export function SceneKochi() {
  return (
    <S label="Kochi city skyline with metro and Marine Drive at dawn">
      <defs>
        <linearGradient id="s1-bldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b3350" />
          <stop offset="1" stopColor="#161b30" />
        </linearGradient>
      </defs>
      <Cloud x={280} y={170} s={1.1} o={0.25} dur={70} />
      <Cloud x={980} y={110} s={0.8} o={0.2} dur={90} />
      {/* Far skyline */}
      <g fill="#232a45" opacity="0.7">
        <rect x="40" y="430" width="90" height="350" />
        <rect x="170" y="380" width="70" height="400" />
        <rect x="600" y="410" width="100" height="370" />
        <rect x="1000" y="390" width="80" height="390" />
        <rect x="1310" y="440" width="90" height="340" />
      </g>
      {/* Main towers with lit windows */}
      <g>
        {[
          { x: 240, w: 130, h: 460 },
          { x: 420, w: 110, h: 380 },
          { x: 730, w: 150, h: 500 },
          { x: 930, w: 120, h: 420 },
          { x: 1120, w: 140, h: 470 },
        ].map((b, bi) => (
          <g key={bi}>
            <rect x={b.x} y={780 - b.h} width={b.w} height={b.h} fill="url(#s1-bldg)" rx="4" />
            {Array.from({ length: Math.floor(b.h / 46) }).map((_, r) =>
              Array.from({ length: Math.floor(b.w / 34) }).map((_, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={b.x + 12 + c * 34}
                  y={790 - b.h + r * 46}
                  width="14"
                  height="18"
                  rx="1.5"
                  fill={(r * 7 + c * 3 + bi) % 3 === 0 ? "#ffd97a" : "#3a4262"}
                  opacity={(r * 7 + c * 3 + bi) % 3 === 0 ? 0.95 : 0.8}
                >
                  {(r * 5 + c + bi) % 11 === 0 && (
                    <animate attributeName="opacity" values="0.9;0.2;0.9" dur={`${3 + ((r + c) % 4)}s`} repeatCount="indefinite" />
                  )}
                </rect>
              ))
            )}
          </g>
        ))}
      </g>
      {/* Metro viaduct + train */}
      <g>
        <rect x="0" y="600" width="1440" height="14" fill="#0e1226" />
        {[80, 320, 560, 800, 1040, 1280].map((px) => (
          <rect key={px} x={px} y="614" width="18" height="120" fill="#0e1226" />
        ))}
        <g>
          <animateTransform attributeName="transform" type="translate" values="-500 0;1600 0" dur="14s" repeatCount="indefinite" />
          <rect x="0" y="566" width="360" height="34" rx="14" fill="#eef2f7" />
          <rect x="0" y="566" width="360" height="10" rx="5" fill="#1aa3c9" />
          {[24, 78, 132, 186, 240, 294].map((wx) => (
            <rect key={wx} x={wx} y="578" width="34" height="14" rx="3" fill="#27314f" />
          ))}
        </g>
      </g>
      {/* Marine Drive water strip */}
      <rect x="0" y="780" width="1440" height="120" fill="#101830" />
      <g stroke="#ffd97a" strokeWidth="2" opacity="0.5">
        {[140, 420, 700, 980, 1260].map((lx) => (
          <line key={lx} x1={lx} y1="792" x2={lx} y2="828">
            <animate attributeName="opacity" values="0.6;0.15;0.6" dur="2.6s" begin={`${lx % 5}s`} repeatCount="indefinite" />
          </line>
        ))}
      </g>
      <Birds x={860} y={250} scale={0.9} />
    </S>
  );
}

/* ── Scene 2 · Backwaters ─────────────────────────────── */
export function SceneBackwaters() {
  return (
    <S label="Alleppey backwaters with houseboat and coconut palms">
      <defs>
        <linearGradient id="s2-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d5e57" />
          <stop offset="1" stopColor="#0c3833" />
        </linearGradient>
      </defs>
      {/* Distant palm bank */}
      <g opacity="0.5">
        <rect x="0" y="600" width="1440" height="60" fill="#12332a" />
        {[60, 200, 340, 490, 660, 820, 980, 1140, 1300].map((px, i) => (
          <Palm key={px} x={px} y={615} s={0.55} flip={i % 2 === 0} delay={i * 0.4} />
        ))}
      </g>
      {/* Water */}
      <rect x="0" y="640" width="1440" height="260" fill="url(#s2-water)" />
      {/* Ripples */}
      <g stroke="#7fd4c5" strokeWidth="2.4" opacity="0.35" strokeLinecap="round">
        {[690, 730, 775, 820].map((ry, i) => (
          <line key={ry} x1={140 + i * 260} y1={ry} x2={280 + i * 260} y2={ry}>
            <animate attributeName="x1" values={`${140 + i * 260};${170 + i * 260};${140 + i * 260}`} dur={`${4 + i}s`} repeatCount="indefinite" />
            <animate attributeName="x2" values={`${280 + i * 260};${250 + i * 260};${280 + i * 260}`} dur={`${4 + i}s`} repeatCount="indefinite" />
          </line>
        ))}
      </g>
      {/* Houseboat */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -7;0 0" dur="5s" repeatCount="indefinite" />
        <path d="M480 700l40-14h360l44 14 -22 34H504z" fill="#3d2b1a" />
        <path d="M540 686c10-64 60-96 160-96s148 34 156 96z" fill="#c9a26a" />
        <path d="M560 682c8-50 50-76 140-76s130 28 136 76z" fill="#8a6a3e" opacity="0.55" />
        <rect x="596" y="640" width="48" height="42" rx="6" fill="#2c1f12" />
        <rect x="700" y="640" width="48" height="42" rx="6" fill="#2c1f12" />
        {/* Reflection */}
        <path d="M500 740h360l-30 46H540z" fill="#c9a26a" opacity="0.14" />
      </g>
      {/* Canoe */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;26 -4;0 0" dur="7s" repeatCount="indefinite" />
        <path d="M1120 760q60 18 130 0q-20 22 -65 22t-65-22z" fill="#241a10" />
        <line x1="1185" y1="742" x2="1206" y2="782" stroke="#241a10" strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* Near palms */}
      <Palm x={120} y={860} s={1.5} delay={0.2} />
      <Palm x={1350} y={880} s={1.7} flip delay={1} />
      <Birds x={300} y={220} />
    </S>
  );
}

/* ── Scene 3 · Munnar tea estates ─────────────────────── */
export function SceneMunnar() {
  return (
    <S label="Munnar tea estates wrapped in fog">
      <defs>
        <linearGradient id="s3-hill1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f6b46" />
          <stop offset="1" stopColor="#1c4a2f" />
        </linearGradient>
        <linearGradient id="s3-hill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f8657" />
          <stop offset="1" stopColor="#27593a" />
        </linearGradient>
      </defs>
      {/* Far mountains */}
      <path d="M0 480L240 300L520 460L800 260L1100 440L1440 320V900H0z" fill="#39597a" opacity="0.45" />
      <Cloud x={400} y={180} s={1.2} o={0.5} dur={50} />
      <Cloud x={1100} y={140} s={0.9} o={0.4} dur={65} />
      {/* Tea hills with terrace rows */}
      <g>
        <path d="M0 640Q360 460 720 600T1440 560V900H0z" fill="url(#s3-hill2)" />
        <g stroke="#1a3f28" strokeWidth="3" fill="none" opacity="0.6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M0 ${660 + i * 36}Q360 ${480 + i * 36} 720 ${620 + i * 36}T1440 ${580 + i * 36}`} />
          ))}
        </g>
      </g>
      <g>
        <path d="M0 760Q420 640 860 760T1440 720V900H0z" fill="url(#s3-hill1)" />
        <g stroke="#143521" strokeWidth="3.4" fill="none" opacity="0.65">
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M0 ${790 + i * 34}Q420 ${670 + i * 34} 860 ${790 + i * 34}T1440 ${750 + i * 34}`} />
          ))}
        </g>
      </g>
      {/* Tea pluckers' cottage */}
      <g transform="translate(1050 640)">
        <rect x="0" y="18" width="86" height="52" fill="#e8e2d2" />
        <path d="M-10 20L43 -16L96 20z" fill="#a04b32" />
        <rect x="34" y="40" width="20" height="30" fill="#5b422c" />
      </g>
      {/* Drifting fog bands */}
      {[
        { y: 560, o: 0.5, dur: 26 },
        { y: 680, o: 0.4, dur: 34 },
        { y: 460, o: 0.35, dur: 42 },
      ].map((f, i) => (
        <g key={i} opacity={f.o} filter="blur(2px)">
          <animateTransform attributeName="transform" type="translate" values="-300 0;300 0;-300 0" dur={`${f.dur}s`} repeatCount="indefinite" />
          <ellipse cx={400 + i * 320} cy={f.y} rx="420" ry="42" fill="white" opacity="0.8" />
          <ellipse cx={760 + i * 320} cy={f.y + 16} rx="300" ry="30" fill="white" opacity="0.6" />
        </g>
      ))}
    </S>
  );
}

/* ── Scene 4 · Athirappilly falls ─────────────────────── */
export function SceneAthirappilly() {
  return (
    <S label="Athirappilly waterfalls in the rain forest">
      <defs>
        <linearGradient id="s4-fall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eaf6fb" />
          <stop offset="1" stopColor="#9fc9dd" />
        </linearGradient>
      </defs>
      {/* Forested cliffs */}
      <path d="M0 900V300q140 -60 300 -30q60 10 90 60V900z" fill="#12332b" />
      <path d="M1440 900V280q-160 -50 -320 -10q-50 14 -70 60V900z" fill="#10302a" />
      {/* Canopy bumps */}
      <g fill="#174237">
        {[40, 130, 230, 320, 1160, 1260, 1350].map((cx, i) => (
          <circle key={i} cx={cx} cy={i < 4 ? 320 - (i % 2) * 40 : 300 + (i % 2) * 30} r={70 + (i % 3) * 24} />
        ))}
      </g>
      {/* Waterfall */}
      <g>
        <rect x="560" y="260" width="320" height="480" fill="url(#s4-fall)" rx="8" />
        {[590, 650, 710, 770, 830].map((fx, i) => (
          <line key={fx} x1={fx} y1="270" x2={fx} y2="730" stroke="white" strokeWidth="7" opacity="0.5" strokeLinecap="round">
            <animate attributeName="y1" values="260;340;260" dur={`${1.4 + i * 0.2}s`} repeatCount="indefinite" />
          </line>
        ))}
        {/* Mist at base */}
        <ellipse cx="720" cy="760" rx="260" ry="52" fill="white" opacity="0.65" filter="blur(4px)">
          <animate attributeName="rx" values="260;300;260" dur="4s" repeatCount="indefinite" />
        </ellipse>
      </g>
      {/* Plunge pool */}
      <rect x="0" y="780" width="1440" height="120" fill="#17434d" />
      {/* Rain */}
      <g stroke="#bfe3f2" strokeWidth="2" opacity="0.5" strokeLinecap="round">
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={i} x1={i * 68 + 20} y1="-20" x2={i * 68 + 6} y2="30">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 -60;0 960"
              dur={`${0.8 + (i % 5) * 0.14}s`}
              begin={`${(i % 7) * 0.2}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}
      </g>
    </S>
  );
}

/* ── Scene 5 · Beach sunset ───────────────────────────── */
export function SceneBeach() {
  return (
    <S label="Kerala beach at sunset with lighthouse">
      <defs>
        <radialGradient id="s5-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffdf8e" />
          <stop offset="0.7" stopColor="#f7a63c" />
          <stop offset="1" stopColor="#f7a63c" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Sun */}
      <circle cx="980" cy="560" r="150" fill="url(#s5-sun)">
        <animate attributeName="r" values="150;158;150" dur="6s" repeatCount="indefinite" />
      </circle>
      <circle cx="980" cy="560" r="86" fill="#ffce6b" />
      {/* Sea */}
      <rect x="0" y="620" width="1440" height="180" fill="#b25b3e" />
      <rect x="0" y="620" width="1440" height="180" fill="#2c4a63" opacity="0.72" />
      {/* Sun path on water */}
      <g fill="#ffce6b" opacity="0.6">
        {[634, 660, 690, 724, 760].map((wy, i) => (
          <ellipse key={wy} cx={980} cy={wy} rx={60 - i * 8} ry="5">
            <animate attributeName="rx" values={`${60 - i * 8};${76 - i * 8};${60 - i * 8}`} dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
      </g>
      {/* Beach */}
      <path d="M0 900V760q300 -40 720 -10t720 -20V900z" fill="#e8cf9e" />
      {/* Lighthouse */}
      <g transform="translate(220 420)">
        <path d="M28 340L20 90h64l-8 250z" fill="#f3ede0" />
        <g fill="#c8442e">
          <path d="M22 130h60l-2 46H24z" />
          <path d="M26 218h52l-2 46H28z" />
        </g>
        <rect x="14" y="56" width="76" height="36" rx="8" fill="#2b2b30" />
        <circle cx="52" cy="74" r="13" fill="#ffe28a">
          <animate attributeName="opacity" values="1;0.35;1" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Sweeping beam */}
        <g opacity="0.5">
          <animateTransform attributeName="transform" type="rotate" values="-24 52 74;24 52 74;-24 52 74" dur="6s" repeatCount="indefinite" additive="sum" />
          <polygon points="52,74 400,34 400,114" fill="#ffe28a" opacity="0.35" />
        </g>
      </g>
      <Palm x={1290} y={880} s={1.6} flip delay={0.6} />
      <Palm x={1180} y={870} s={1.2} delay={0} />
      <Birds x={560} y={300} scale={1.1} />
    </S>
  );
}

/* ── Scene 6 · Hairpin hill road ──────────────────────── */
export function SceneHairpins() {
  return (
    <S label="Hairpin bends climbing a dusk mountain road">
      <defs>
        <linearGradient id="s6-mtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3c3358" />
          <stop offset="1" stopColor="#221d38" />
        </linearGradient>
      </defs>
      {/* Stars */}
      <g fill="white">
        {Array.from({ length: 26 }).map((_, i) => (
          <circle key={i} cx={(i * 173) % 1440} cy={(i * 97) % 300 + 20} r={(i % 3) * 0.7 + 0.8} opacity="0.8">
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur={`${2 + (i % 5) * 0.8}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
      <Cloud x={300} y={200} s={1} o={0.14} dur={80} />
      {/* Mountain */}
      <path d="M0 900V560L360 300q120 -70 260 -40l340 120q240 60 480 40V900z" fill="url(#s6-mtn)" />
      {/* Hairpin ribbon */}
      <g fill="none" stroke="#4e4470" strokeWidth="34" strokeLinecap="round">
        <path d="M120 860q400 -30 760 -80q220 -40 40 -90q-360 -30 -560 -80q-200 -60 60 -110q300 -40 480 -80" />
      </g>
      <g fill="none" stroke="#ffd97a" strokeWidth="3" strokeDasharray="18 16" opacity="0.85">
        <path d="M120 860q400 -30 760 -80q220 -40 40 -90q-360 -30 -560 -80q-200 -60 60 -110q300 -40 480 -80">
          <animate attributeName="stroke-dashoffset" values="0;-136" dur="3s" repeatCount="indefinite" />
        </path>
      </g>
      {/* Tiny climbing car headlights */}
      <g>
        <circle cx="0" cy="0" r="5" fill="#ffe9a8">
          <animateMotion dur="9s" repeatCount="indefinite" path="M120 860q400 -30 760 -80q220 -40 40 -90q-360 -30 -560 -80q-200 -60 60 -110q300 -40 480 -80" />
        </circle>
      </g>
      {/* Pines */}
      <g fill="#191530">
        {[200, 420, 980, 1180, 1330].map((px, i) => (
          <g key={px} transform={`translate(${px} ${640 + (i % 3) * 60})`}>
            <path d="M0 0L-26 60h52z" />
            <path d="M0 26L-32 96h64z" />
            <rect x="-5" y="96" width="10" height="22" />
          </g>
        ))}
      </g>
    </S>
  );
}

/* ── Scene 7 · Arrival ────────────────────────────────── */
export function SceneArrival() {
  return (
    <S label="Night arrival at a lamplit Kerala resort gate">
      {/* Stars */}
      <g fill="white">
        {Array.from({ length: 34 }).map((_, i) => (
          <circle key={i} cx={(i * 211) % 1440} cy={(i * 131) % 420 + 16} r={(i % 3) * 0.8 + 0.7} opacity="0.85">
            <animate attributeName="opacity" values="0.9;0.25;0.9" dur={`${1.8 + (i % 6) * 0.7}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
      {/* Moon */}
      <circle cx="1180" cy="150" r="52" fill="#f4ecd7" opacity="0.95" />
      <circle cx="1160" cy="140" r="52" fill="#0d0d14" opacity="0.55" />
      {/* Resort silhouette */}
      <g transform="translate(430 460)">
        {/* Gate posts */}
        <rect x="0" y="140" width="44" height="300" fill="#1c1710" />
        <rect x="536" y="140" width="44" height="300" fill="#1c1710" />
        {/* Kerala gabled roof gate */}
        <path d="M-40 150L290 20L620 150l-30 26L290 62L-10 176z" fill="#2b2013" />
        <path d="M-16 162L290 42L596 162" stroke="#f7b524" strokeWidth="4" fill="none" opacity="0.7" />
        {/* Lamps */}
        {[22, 558].map((lx) => (
          <g key={lx}>
            <circle cx={lx} cy="200" r="14" fill="#ffd97a">
              <animate attributeName="opacity" values="1;0.55;1" dur="3.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={lx} cy="200" r="34" fill="#ffd97a" opacity="0.18">
              <animate attributeName="r" values="34;44;34" dur="3.4s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}
        {/* Villa behind */}
        <g transform="translate(120 210)">
          <rect x="0" y="60" width="340" height="170" fill="#241c11" />
          <path d="M-30 66L170 -30L370 66z" fill="#3a2b17" />
          {[30, 105, 250].map((wx) => (
            <rect key={wx} x={wx} y="110" width="52" height="70" rx="4" fill="#ffd97a" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.7;0.9" dur="5s" repeatCount="indefinite" />
            </rect>
          ))}
          <rect x="180" y="120" width="46" height="110" fill="#120d06" />
        </g>
      </g>
      {/* Ground */}
      <rect x="0" y="820" width="1440" height="80" fill="#131007" />
      <Palm x={180} y={850} s={1.4} delay={0.4} />
      <Palm x={1300} y={860} s={1.55} flip delay={1.2} />
      {/* Fireflies */}
      <g fill="#ffe9a8">
        {[
          [240, 700], [340, 640], [1080, 680], [1180, 620], [760, 700],
        ].map(([fx, fy], i) => (
          <circle key={i} cx={fx} cy={fy} r="3">
            <animate attributeName="opacity" values="0;1;0" dur={`${2.4 + i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="cy" values={`${fy};${fy - 26};${fy}`} dur={`${5 + i}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </g>
    </S>
  );
}

export type Atmosphere = "rain" | "fog" | "birds" | "stars" | null;

/** Living overlay effects rendered above photographic scene backdrops. */
export function AtmosphereLayer({ type }: { type: Atmosphere }) {
  if (!type) return null;
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {type === "rain" && (
        <g stroke="#dceef8" strokeWidth="2" opacity="0.45" strokeLinecap="round">
          {Array.from({ length: 22 }).map((_, i) => (
            <line key={i} x1={i * 68 + 20} y1="-20" x2={i * 68 + 6} y2="30">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 -60;0 960"
                dur={`${0.8 + (i % 5) * 0.14}s`}
                begin={`${(i % 7) * 0.2}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}
        </g>
      )}
      {type === "fog" && (
        <>
          {[
            { y: 560, o: 0.4, dur: 26 },
            { y: 700, o: 0.32, dur: 36 },
          ].map((f, i) => (
            <g key={i} opacity={f.o} filter="blur(3px)">
              <animateTransform attributeName="transform" type="translate" values="-300 0;300 0;-300 0" dur={`${f.dur}s`} repeatCount="indefinite" />
              <ellipse cx={420 + i * 340} cy={f.y} rx="430" ry="44" fill="white" opacity="0.85" />
              <ellipse cx={820 + i * 340} cy={f.y + 20} rx="300" ry="30" fill="white" opacity="0.6" />
            </g>
          ))}
        </>
      )}
      {type === "birds" && <Birds x={520} y={210} scale={1.05} />}
      {type === "stars" && (
        <g fill="white">
          {Array.from({ length: 24 }).map((_, i) => (
            <circle key={i} cx={(i * 197) % 1440} cy={(i * 113) % 320 + 20} r={(i % 3) * 0.7 + 0.8} opacity="0.85">
              <animate attributeName="opacity" values="0.9;0.2;0.9" dur={`${2 + (i % 5) * 0.7}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      )}
    </svg>
  );
}

export const SCENES = [
  { component: SceneKochi, slug: "kochi", name: "Kochi", caption: "Where every journey begins", sky: ["#1b2242", "#3d4a7a"], atmosphere: "birds" as Atmosphere },
  { component: SceneBackwaters, slug: "backwaters", name: "Backwaters", caption: "Drift past Alleppey's houseboats", sky: ["#155e52", "#7fc7a8"], atmosphere: "birds" as Atmosphere },
  { component: SceneMunnar, slug: "munnar", name: "Munnar", caption: "Climb into the clouds of tea country", sky: ["#4b7a8c", "#c7dbd2"], atmosphere: "fog" as Atmosphere },
  { component: SceneAthirappilly, slug: "athirappilly", name: "Athirappilly", caption: "Feel the thunder of the falls", sky: ["#33505c", "#8fb3b8"], atmosphere: "rain" as Atmosphere },
  { component: SceneBeach, slug: "beach", name: "The Coast", caption: "Chase the sunset down the shore", sky: ["#8c3a52", "#f7a63c"], atmosphere: "birds" as Atmosphere },
  { component: SceneHairpins, slug: "hairpins", name: "Hill Roads", caption: "Nine hairpins to the summit", sky: ["#191634", "#4b3f6b"], atmosphere: "stars" as Atmosphere },
  { component: SceneArrival, slug: "arrival", name: "Arrival", caption: "Your destination, delivered", sky: ["#0a0a12", "#1d1a2e"], atmosphere: null },
] as const;
