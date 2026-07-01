import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// =========================================================================
//  RUANG KONTROL KLIEN (SILAKAN EDIT NAMA, PIN, & FOTO DI SINI SAJA)
// =========================================================================
const NAMA_PASANGAN = "Figia Venda Rahmadita";
const NAMA_PENGIRIM = "Billi Arya Prasantanu";
const TANGGAL_LAHIR = "10 Juli 2005"; 
const UMUR = 21; // 2026 - 2005 = 21 Tahun

// PIN UNTUK MEMBUKA WEB (10 Juni 2005)
const CORRECT_PIN = '100705'; 

// SURAT CINTA UTAMA
const SURAT_CINTA = `Hai, ${NAMA_PASANGAN} sayang.\n\nSelamat ulang tahun yang ke-${UMUR}! Website ini sengaja kubuat khusus untukmu, karena kado biasa rasanya tidak cukup untuk mengekspresikan betapa berartinya dirimu bagiku.\n\nTerima kasih sudah terlahir ke dunia ini pada ${TANGGAL_LAHIR} dan menjadi versi terbaik dari dirimu. Semoga di umur yang baru ini, semua harapan dan impianmu perlahan menjadi nyata. Aku akan selalu ada di sini untuk mendukungmu, dalam setiap langkahmu.\n\nI love you, now and always. ✨\n\nDari aku yang selalu menyayangimu,\n${NAMA_PENGIRIM}`;

// 3 FOTO UNTUK HALAMAN SCROLL (TIMELINE)
const TIMELINE_DATA = [
  { id: 1, title: 'That Captivating Smile', desc: 'Melihat senyummu selalu menjadi bagian terbaik dalam hariku.', img: 'kue.png' },
  { id: 2, title: 'Effortlessly Beautiful', desc: 'Tidak peduli dari sudut mana, kamu selalu berhasil membuatku kagum.', img: 'kue.png' },
  { id: 3, title: 'My Favorite View', desc: 'Dan di antara semua hal indah di dunia, memandangi wajahmu adalah favoritku.', img: 'kue.png' },
];

// FOTO-FOTO UNTUK MELAYANG DI LANGIT MALAM (Minimal 3-6 foto berbeda)
const MEMORY_PHOTOS = [
  'kue.png', 'kue.png', 'kue.png', 
  'kue.png', 'kue.png', 'kue.png'
];

// ISI KARTU HARAPAN PADA BINTANG YANG DIKLIK
const WISHES_DATA = [
  `Semoga di umur yang ke-${UMUR} ini, kamu semakin bahagia dan selalu dikelilingi orang yang tulus menyayangimu. ✨`,
  "Semoga semua cita-cita dan harapan yang kamu pendam bisa segera terwujud satu per satu tahun ini. 🌸",
  "Semoga selalu diberikan kesehatan, kurang-kurangin overthinking, dan jangan lupa bahagia hari ini! 💕",
  "Semoga hari-harimu ke depan penuh dengan kejutan manis yang tak terduga. 🎁",
  `Dan semoga... kita bisa terus merayakan momen-momen indah seperti ini bersama-sama di tahun-tahun berikutnya. 🥰\n- ${NAMA_PENGIRIM}`
];
// =========================================================================
//  AKHIR RUANG KONTROL
// =========================================================================


// =====================================================
//  EASING & ANIMATION VARIANTS
// =====================================================
const easeOutBack = (t) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeOutElastic = (t) => {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

// =====================================================
//  TYPEWRITER EFFECT 
// =====================================================
const TypewriterText = ({ text, delay }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    let timer;
    const startTyping = () => {
      timer = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 35);
    };
    const initialDelay = setTimeout(startTyping, delay);
    return () => { clearTimeout(initialDelay); clearInterval(timer); };
  }, [text, delay]);

  return <span className="whitespace-pre-line">{displayedText}</span>;
};

// =====================================================
//  AURORA ANIMATED BACKGROUND 
// =====================================================
const AuroraBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 60, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-rose-300/30 blur-[100px]" />
    <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -60, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[40%] -right-[10%] w-[400px] h-[400px] rounded-full bg-pink-400/20 blur-[100px]" />
    <motion.div animate={{ scale: [1, 1.5, 1], x: [0, 30, 0], y: [0, 50, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }} className="absolute -bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-fuchsia-300/20 blur-[120px]" />
  </div>
);

// =====================================================
//  FLOATING HEARTS 
// =====================================================
const FloatingHearts = () => {
  const hearts = Array.from({ length: 15 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((_, i) => (
        <motion.div key={i} className="absolute text-pink-400/40"
          initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), y: '110vh', scale: Math.random() * 1 + 0.5 }}
          animate={{ y: '-10vh', x: `+=${Math.random() * 100 - 50}px`, rotate: Math.random() * 360 }}
          transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: 'linear', delay: Math.random() * 10 }}
        >
          ❤
        </motion.div>
      ))}
    </div>
  );
};

// =====================================================
//  CINEMATIC ROSE 
// =====================================================
const CinematicRose = () => {
  const svgRef = useRef(null);
  const frameIds = useRef([]);

  const raf = (fn) => {
    const id = requestAnimationFrame(fn);
    frameIds.current.push(id);
    return id;
  };

  const animate = useCallback((fn, duration, onDone) => {
    const start = performance.now();
    const tick = () => {
      const p = Math.min((performance.now() - start) / duration, 1);
      fn(p);
      if (p < 1) raf(tick);
      else onDone && onDone();
    };
    raf(tick);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const stemData = [
      { id: 'stem-m', len: 360, delay: 0 },
      { id: 'stem-l', len: 320, delay: 250 },
      { id: 'stem-r', len: 320, delay: 250 },
    ];
    stemData.forEach(({ id, len, delay }) => {
      const el = svg.getElementById(id);
      if(!el) return;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
      setTimeout(() => {
        animate((p) => { el.style.strokeDashoffset = len * (1 - easeOutQuint(p)); }, 2000);
      }, delay);
    });

    setTimeout(() => { animate((p) => { svg.getElementById('grass-g')?.setAttribute('opacity', (p * 0.88).toFixed(3)); }, 1200); }, 200);
    setTimeout(() => { animate((p) => { svg.getElementById('leaves-g')?.setAttribute('opacity', (p * 0.92).toFixed(3)); }, 1000); }, 1200);

    const bloomOneFlower = (flId, delay) => {
      setTimeout(() => {
        const fl = svg.getElementById(flId);
        if (!fl) return;

        const outerPetals = fl.querySelectorAll('.petal-outer');
        const midPetals   = fl.querySelectorAll('.petal-mid');
        const innerPetals = fl.querySelectorAll('.petal-inner');
        const center      = fl.querySelector('.flower-center');

        [...outerPetals, ...midPetals, ...innerPetals].forEach((p) => { p.setAttribute('transform', p.getAttribute('data-rot') + ' scale(0)'); });
        if (center) center.setAttribute('transform', 'scale(0)');

        outerPetals.forEach((petal, i) => {
          setTimeout(() => {
            const rot = petal.getAttribute('data-rot');
            animate((p) => { petal.setAttribute('transform', `${rot} scale(${easeOutElastic(p).toFixed(4)})`); }, 700);
          }, i * 80);
        });

        midPetals.forEach((petal, i) => {
          setTimeout(() => {
            const rot = petal.getAttribute('data-rot');
            animate((p) => { petal.setAttribute('transform', `${rot} scale(${easeOutBack(p).toFixed(4)})`); }, 600);
          }, outerPetals.length * 80 + i * 60 + 100);
        });

        innerPetals.forEach((petal, i) => {
          setTimeout(() => {
            const rot = petal.getAttribute('data-rot');
            animate((p) => { petal.setAttribute('transform', `${rot} scale(${easeOutBack(p).toFixed(4)})`); }, 500);
          }, outerPetals.length * 80 + midPetals.length * 60 + i * 50 + 200);
        });

        const centerDelay = outerPetals.length * 80 + midPetals.length * 60 + innerPetals.length * 50 + 350;
        setTimeout(() => {
          if (!center) return;
          animate((p) => { center.setAttribute('transform', `scale(${easeOutBack(p).toFixed(4)})`); }, 500);
        }, centerDelay);

      }, delay);
    };

    bloomOneFlower('flower-m', 2000);
    bloomOneFlower('flower-l', 2500);
    bloomOneFlower('flower-r', 2500);

    return () => { frameIds.current.forEach(cancelAnimationFrame); };
  }, [animate]);

  const makePetalPath = (length, width) => {
    const hw = width / 2;
    return `M0,0 C${-hw},${-length * 0.25} ${-hw},${-length * 0.65} 0,${-length} C${hw},${-length * 0.65} ${hw},${-length * 0.25} 0,0Z`;
  };

  const Flower = ({ id, cx, cy, size = 1, gradId, centerGradId }) => {
    const pLen = 68 * size, pW = 34 * size, mLen = 50 * size, mW = 22 * size, iLen = 34 * size, iW = 15 * size, cr1 = 22 * size, cr2 = 13 * size, cr3 = 5 * size;
    const outerPath = makePetalPath(pLen, pW), midPath = makePetalPath(mLen, mW), innerPath = makePetalPath(iLen, iW);
    const outerAngles = [0, 72, 144, 216, 288], midAngles = [36, 108, 180, 252, 324], innerAngles = [18, 90, 162, 234, 306];

    return (
      <g id={id} data-cx={cx} data-cy={cy} transform={`translate(${cx},${cy})`}>
        {outerAngles.map((a) => (<g key={`o${a}`} className="petal-outer" data-rot={`rotate(${a})`} transform={`rotate(${a}) scale(0)`}><path d={outerPath} fill={`url(#${gradId})`} opacity="0.94"/></g>))}
        {midAngles.map((a) => (<g key={`m${a}`} className="petal-mid" data-rot={`rotate(${a})`} transform={`rotate(${a}) scale(0)`}><path d={midPath} fill="#ffeaf8" opacity="0.85"/></g>))}
        {innerAngles.map((a) => (<g key={`i${a}`} className="petal-inner" data-rot={`rotate(${a})`} transform={`rotate(${a}) scale(0)`}><path d={innerPath} fill="#fff6fc" opacity="0.78"/></g>))}
        <g className="flower-center" transform="scale(0)">
          <circle r={cr1} fill={`url(#${centerGradId})`}/>
          <circle r={cr2} fill="#fff8fc"/>
          <circle r={cr3} fill="#ffffff"/>
          {outerAngles.map((a) => {
            const rad = (a * Math.PI) / 180;
            return <circle key={`st${a}`} cx={Math.sin(rad) * cr1 * 0.72} cy={-Math.cos(rad) * cr1 * 0.72} r={2.2 * size} fill="#ffd0e8"/>;
          })}
        </g>
      </g>
    );
  };

  const stars = [[45,30,1.2,0],[82,18,0.8,1],[130,42,1.5,2],[180,15,1,0],[240,28,0.8,1],[310,12,1.3,2],[370,38,1,0],[420,20,1.5,1],[468,45,0.9,2],[500,25,1.2,0],[60,80,0.7,1],[150,65,1,2],[110,160,1.5,0],[385,130,1.8,1],[70,240,1.2,2],[455,200,1.3,0],[140,110,2,1],[400,95,1.6,2],[30,150,1,0],[490,160,0.9,1],[200,50,1.1,2],[330,70,0.8,0],[22,320,0.7,1],[500,310,1,2],[260,40,1.3,0]];
  const starColors = ['#ff99cc', '#ffb3d9', '#d8e8ff'];

  // KOORDINAT DAUN SUDAH DIGESER PRESISI MENGIKUTI KELENGKUNGAN BATANG
  const leaves = [
    { d:"M256,422 C236,410 213,404 198,414 C186,422 190,442 208,448 C226,454 250,440 256,424Z", g:"lG1" }, 
    { d:"M257,387 C277,374 303,368 317,378 C329,386 325,406 307,412 C289,418 260,402 257,389Z", g:"lG2" },
    { d:"M258,333 C237,320 214,314 201,324 C191,332 195,350 211,354 C227,358 253,344 258,335Z", g:"lG1" }, 
    { d:"M259,302 C278,290 303,284 316,294 C326,302 320,320 304,324 C288,328 262,310 259,304Z", g:"lG2" },
    { d:"M150,422 C128,412 104,407 94,418 C86,427 92,444 108,448 C126,452 148,436 150,424Z", g:"lG1" }, 
    { d:"M147,382 C164,370 188,364 199,374 C208,382 202,400 186,404 C170,408 149,390 147,384Z", g:"lG2" },
    { d:"M358,422 C380,412 404,407 414,418 C422,427 416,444 400,448 C382,452 360,436 358,424Z", g:"lG2" }, 
    { d:"M358,382 C341,370 317,364 307,374 C299,382 305,400 321,404 C337,408 356,390 358,384Z", g:"lG1" },
    { d:"M227,507 C207,494 187,488 177,498 C168,506 174,522 190,526 C208,530 224,514 227,508Z", g:"lG1" }, 
    { d:"M297,507 C317,494 340,488 350,498 C358,506 352,522 336,526 C318,530 300,514 297,508Z", g:"lG2" },
  ];

  const grassPaths = [
    ["M68,548 C62,518 55,498 48,468 L48,548Z", 0], ["M80,548 C82,513 88,486 84,450 L80,548Z", 1], ["M94,548 C99,523 104,500 102,473 L94,548Z", 0], ["M452,548 C448,518 440,496 438,466 L452,548Z", 1],
    ["M466,548 C462,513 460,484 462,450 L466,548Z", 0], ["M480,548 C484,523 492,498 490,470 L480,548Z", 1], ["M155,549 C148,528 144,506 140,480 L155,549Z", 0], ["M168,549 C169,522 175,498 173,470 L168,549Z", 1],
    ["M357,549 C354,526 352,503 354,476 L357,549Z", 0], ["M372,549 C377,523 384,500 382,473 L372,549Z", 1], ["M110,548 C106,520 102,498 100,472 L110,548Z", 0], ["M420,548 C424,520 428,498 426,472 L420,548Z", 1],
  ];

  return (
    <svg ref={svgRef} viewBox="0 0 520 590" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="pg1" cx="50%" cy="100%" r="100%" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#ffffff"/><stop offset="15%" stopColor="#ffd6f0"/><stop offset="50%" stopColor="#ff55aa"/><stop offset="100%" stopColor="#be0068" stopOpacity="0.85"/></radialGradient>
        <radialGradient id="pg2" cx="50%" cy="100%" r="100%" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#ffffff"/><stop offset="18%" stopColor="#ffc8e8"/><stop offset="55%" stopColor="#ff4499"/><stop offset="100%" stopColor="#aa005a" stopOpacity="0.82"/></radialGradient>
        <radialGradient id="pg3" cx="50%" cy="100%" r="100%" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="#fff5fa"/><stop offset="20%" stopColor="#ffbede"/><stop offset="58%" stopColor="#ff3388"/><stop offset="100%" stopColor="#990050" stopOpacity="0.78"/></radialGradient>
        <radialGradient id="cg1" cx="40%" cy="35%" r="65%"><stop offset="0%" stopColor="#ffffff"/><stop offset="45%" stopColor="#ffe4f5"/><stop offset="100%" stopColor="#ffaad4"/></radialGradient>
        <radialGradient id="cg2" cx="45%" cy="38%" r="60%"><stop offset="0%" stopColor="#fff9fb"/><stop offset="48%" stopColor="#ffd8ee"/><stop offset="100%" stopColor="#ff99cc"/></radialGradient>
        <linearGradient id="stG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0a3d1f"/><stop offset="48%" stopColor="#1faa4a"/><stop offset="100%" stopColor="#0d5028"/></linearGradient>
        <linearGradient id="stG2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#092d17"/><stop offset="50%" stopColor="#166630"/><stop offset="100%" stopColor="#0a3d1f"/></linearGradient>
        <linearGradient id="lG1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#22b84e"/><stop offset="50%" stopColor="#2de864"/><stop offset="100%" stopColor="#0d6628"/></linearGradient>
        <linearGradient id="lG2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a9040"/><stop offset="50%" stopColor="#22d055"/><stop offset="100%" stopColor="#0a5020"/></linearGradient>
        <radialGradient id="groundG" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#0d2e16"/><stop offset="100%" stopColor="#040a05" stopOpacity="0.85"/></radialGradient>
        <filter id="glowF" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {stars.map(([x, y, r, c], i) => (<circle key={`s-${i}`} className="star-dot" cx={x} cy={y} r={r} fill={starColors[c]} opacity="0"/>))}
      <ellipse cx="260" cy="566" rx="215" ry="21" fill="url(#groundG)"/>
      
      {/* DAUN DITANGKAP DI SINI, DI BELAKANG BATANG BUNGA AGAR RAPI */}
      <g id="leaves-g" opacity="0">{leaves.map((leaf, i) => (<path key={i} d={leaf.d} fill={`url(#${leaf.g})`}/>))}</g>
      
      <g id="grass-g" opacity="0">{grassPaths.map(([d, v], i) => (<path key={i} d={d} fill={v === 0 ? 'url(#lG1)' : 'url(#lG2)'} opacity="0.88"/>))}</g>
      <path id="stem-l" d="M168,555 C166,515 158,478 152,445 C147,412 145,380 155,350 C159,335 162,315 160,295" fill="none" stroke="url(#stG2)" strokeWidth="5" strokeLinecap="round"/>
      <path id="stem-m" d="M260,560 C258,518 255,470 255,428 C255,388 257,348 259,308 C260,272 260,246 260,212" fill="none" stroke="url(#stG)" strokeWidth="6.5" strokeLinecap="round"/>
      <path id="stem-r" d="M348,555 C350,513 354,476 357,444 C360,412 360,380 352,350 C348,334 344,314 348,296" fill="none" stroke="url(#stG2)" strokeWidth="5" strokeLinecap="round"/>
      
      <g filter="url(#glowF)"><Flower id="flower-l" cx={160} cy={295} size={0.87} gradId="pg2" centerGradId="cg2"/></g>
      <g filter="url(#glowF)"><Flower id="flower-m" cx={260} cy={212} size={1.06} gradId="pg1" centerGradId="cg1"/></g>
      <g filter="url(#glowF)"><Flower id="flower-r" cx={348} cy={296} size={0.87} gradId="pg3" centerGradId="cg2"/></g>
    </svg>
  );
};

// =====================================================
//  FLOATING PARTICLES
// =====================================================
const FloatingParticles = () => {
  const particles = Array.from({ length: 22 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
      {particles.map((_, i) => (
        <motion.div key={i} className="absolute text-pink-300"
          initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100, scale: Math.random() * 0.5 + 0.5 }}
          animate={{ y: [null, -200], rotate: [0, Math.random() * 360] }}
          transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: 'linear' }}
        >
          {i % 2 === 0 ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// =====================================================
//  FIREFLIES
// =====================================================
const Fireflies = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    {[...Array(32)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full"
        style={{ width: i % 3 === 0 ? 5 : 3, height: i % 3 === 0 ? 5 : 3, background: i % 4 === 0 ? '#ff99cc' : i % 4 === 1 ? '#ffb3d9' : '#ff66aa', filter: `drop-shadow(0 0 ${i % 3 === 0 ? 4 : 2}px #ff80b4)` }}
        initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000), opacity: 0 }}
        animate={{ y: [null, -(Math.random() * 350 + 100)], x: [null, (Math.random() - 0.5) * 180], opacity: [0, Math.random() * 0.75 + 0.2, 0] }}
        transition={{ duration: Math.random() * 6 + 5, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 3 }}
      />
    ))}
  </div>
);

// =====================================================
//  MAIN APP
// =====================================================
export default function App() {
  const [step, setStep] = useState(-1); 
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const audioRef = useRef(null);

  const [noCount, setNoCount] = useState(0);
  const [isYesClicked, setIsYesClicked] = useState(false);

  const [selectedWish, setSelectedWish] = useState(null);

  // Setiap bintang ditempatkan di "zona" grid sendiri (bukan posisi acak murni)
  // agar tidak saling tumpang tindih, lalu hanya bergoyang pelan (drift kecil)
  // di sekitar titik itu -- bukan lagi mengembara jauh melintasi layar.
  // Ini yang memperbaiki bug "bintang menghindar" saat diklik/ditap.
  const starPaths = useMemo(() => {
    const n = WISHES_DATA.length;
    const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
    const rows = Math.max(1, Math.ceil(n / cols));
    const cellW = 76 / cols; // area 12vw - 88vw
    const cellH = 52 / rows; // area 22vh - 74vh (aman dari judul & tepi bawah)

    return WISHES_DATA.map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const baseX = 12 + col * cellW + cellW * 0.2 + Math.random() * cellW * 0.6;
      const baseY = 22 + row * cellH + cellH * 0.2 + Math.random() * cellH * 0.6;
      const driftX = 2.5 + Math.random() * 2.5;
      const driftY = 2.5 + Math.random() * 2.5;
      return {
        x: [`${baseX}vw`, `${(baseX + driftX).toFixed(1)}vw`, `${(baseX - driftX * 0.7).toFixed(1)}vw`, `${baseX}vw`],
        y: [`${baseY}vh`, `${(baseY - driftY).toFixed(1)}vh`, `${(baseY + driftY * 0.8).toFixed(1)}vh`, `${baseY}vh`],
      };
    });
  }, []);

  const floatingPhotosConfig = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      img: MEMORY_PHOTOS[i % MEMORY_PHOTOS.length],
      x: Math.random() * 85 + 5,
      duration: 18 + Math.random() * 8, 
      delay: Math.random() * 8, 
      startRot: Math.random() * 40 - 20,
      endRot: Math.random() * 60 - 30,
      scale: Math.random() * 0.5 + 0.7 
    }));
  }, []);

  const noTexts = ["Enggak", "Eh, kepencet ya? 🤨", "Loh, masih 'Enggak'?! 🧐", "Mulai ngajak ribut nih... 😤", "Yakin? Nanti nyesel lho 🫣", "Tega banget... 💔"];
  // Satu "unit" strip diulang cukup banyak (12x) supaya lebih panjang dari lebar layar manapun,
  // lalu unit itu digandakan 2x agar animasi loop-nya mulus tanpa terlihat "meloncat" atau kosong di ujung.
  const stripUnit = Array.from({ length: 12 }, (_, i) => TIMELINE_DATA[i % TIMELINE_DATA.length].img);
  const infinitePhotos = [...stripUnit, ...stripUnit];

  const handleOpenGate = () => { setStep(1); if (audioRef.current) audioRef.current.play(); };

  const handlePinInput = (num) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 6) {
        if (newPin === CORRECT_PIN) {
          setTimeout(() => {
            setStep(2);
            confetti({ particleCount: 300, spread: 150, origin: { y: 0.6 }, colors: ['#ffc0cb','#ffb6c1','#ff69b4','#ffd700','#ffffff'] });
          }, 400);
        } else {
          setPinError(true);
          setTimeout(() => { setPin(''); setPinError(false); }, 500);
        }
      }
    }
  };

  const handleDeletePin = () => setPin(pin.slice(0, -1));

  return (
    <div className="min-h-screen bg-[#fff5f7] relative overflow-x-hidden font-quicksand text-gray-800 selection:bg-pink-300 selection:text-white">
      <audio ref={audioRef} src="/stuck-with-u.mp3" loop preload="auto"/>
      
      {step < 3 && <AuroraBackground />}

      <AnimatePresence mode="wait">

        {/* ===== STEP -1: HALAMAN PERTANYAAN AWAL ===== */}
        {step === -1 && (
          <motion.div key="pre-gate" exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50 px-4 text-center overflow-hidden"
          >
            <FloatingHearts />
            
            <AnimatePresence mode="wait">
              {!isYesClicked ? (
                <motion.div key="question" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex flex-col items-center w-full max-w-md relative z-10">
                  <img src="/images/bubu-dudu-ask.gif" alt="Cute Ask" className="w-40 md:w-56 mb-6 drop-shadow-2xl" onError={(e) => e.target.style.display = 'none'} />
                  
                  <h2 className="font-pacifico text-3xl md:text-4xl text-pink-500 mb-8 px-4 leading-relaxed drop-shadow-sm">Hai, sebelum lanjut... Kamu sayang aku nggak?</h2>
                  <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 w-full min-h-[140px] relative px-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} 
                      onClick={() => {
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ffc0cb','#ff69b4','#ffffff'] });
                        setIsYesClicked(true);
                      }}
                      style={{ fontSize: `${16 + noCount * 3}px`, padding: `${12 + noCount * 2}px ${24 + noCount * 3}px` }}
                      className="bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-full shadow-[0_10px_20px_rgba(236,72,153,0.4)] transition-all duration-300 z-20 shrink-0 whitespace-nowrap border-2 border-white/20"
                    >
                      Iyaa sayang 💕
                    </motion.button>
                    {noCount < noTexts.length ? (
                      <motion.button onClick={() => setNoCount(noCount + 1)} whileTap={{ scale: 0.8 }}
                        style={{ fontSize: `${Math.max(14 - noCount, 10)}px`, padding: `${Math.max(12 - noCount, 8)}px ${Math.max(24 - noCount * 2, 12)}px`, opacity: 1 - noCount * 0.1 }}
                        className="bg-white/80 backdrop-blur-sm text-gray-600 font-bold rounded-2xl sm:rounded-full shadow-md transition-all duration-300 border border-gray-100/50 whitespace-normal break-words max-w-[110px] sm:max-w-[150px] leading-snug shrink-0"
                      >
                        {noTexts[noCount]}
                      </motion.button>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-pink-400 font-medium italic text-sm absolute -bottom-8 w-full bg-white/50 py-1 rounded-full backdrop-blur-sm">
                        *Tombol No telah disita oleh sistem* 🏃‍♂️💨
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="answered" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center w-full max-w-md relative z-10">
                  <img src="/images/bubu-dudu-happy.gif" alt="Cute Happy" className="w-48 md:w-64 mb-6 drop-shadow-2xl" onError={(e) => e.target.style.display = 'none'} />
                  
                  <h2 className="font-pacifico text-3xl md:text-4xl text-pink-500 mb-4 drop-shadow-sm">Hehehe, I love you too! 💕</h2>
                  <p className="text-gray-600 font-medium md:text-lg mb-8 px-4 bg-white/40 p-4 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm">Makasih ya udah jujur. Nah, sekarang aku punya sesuatu yang spesial buat kamu...</p>
                  <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 15px 25px rgba(236,72,153,0.5)" }} whileTap={{ scale: 0.95 }} onClick={() => setStep(0)} 
                    className="bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold py-4 px-12 rounded-full shadow-lg text-lg border border-pink-300/50 relative overflow-hidden group">
                    <span className="relative z-10">Lanjut ✨</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ===== STEP 0: TAP TO UNLOCK ===== */}
        {step === 0 && (
          <motion.div key="gate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50 cursor-pointer" onClick={handleOpenGate}
          >
            <motion.div animate={{ y: [0,-15,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="relative">
              <div className="absolute inset-0 bg-pink-400/40 blur-[50px] rounded-full scale-150 animate-pulse" />
              <motion.img whileHover={{ scale: 1.08, rotate: 2 }} whileTap={{ scale: 0.9 }} src="/images/kado.png" className="h-48 md:h-64 w-auto object-contain drop-shadow-2xl mb-8 relative z-10" alt="Kado"/>
            </motion.div>
            <motion.div animate={{ opacity: [0.4, 1, 0.4], scale: [0.98, 1.02, 0.98] }} transition={{ repeat: Infinity, duration: 2 }} className="px-8 py-3 bg-white/70 backdrop-blur-md border border-white/60 rounded-full text-pink-500 font-bold tracking-[0.2em] uppercase shadow-[0_8px_30px_rgba(244,63,94,0.2)]">
              Tap to Unlock
            </motion.div>
          </motion.div>
        )}

        {/* ===== STEP 1: TIMELINE & PIN ===== */}
        {step === 1 && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.8 }} className="w-full flex flex-col items-center pb-32 relative z-10">
            <FloatingParticles/>

            <div className="h-screen w-full flex flex-col items-center justify-center gap-10 md:gap-14 px-4">
              <motion.h1 initial={{ scale: 0.5, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.6, duration: 1.2 }}
                className="font-pacifico text-6xl md:text-8xl text-pink-500 text-center drop-shadow-md leading-normal pb-4"
              >Happy Birthday!</motion.h1>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 1 }} className="bg-white/60 backdrop-blur-xl px-8 py-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60">
                <p className="text-pink-400 text-sm md:text-lg font-bold tracking-widest uppercase flex items-center gap-2">
                  <span className="animate-bounce">↓</span> Scroll to See My Favorite Person <span className="animate-bounce">↓</span>
                </p>
              </motion.div>
            </div>

            <div className="w-full max-w-4xl px-4 md:px-8 py-10 flex flex-col gap-24 md:gap-32">
              {TIMELINE_DATA.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, x: isEven ? -50 : 50, y: 50 }} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ type: 'spring', bounce: 0.4, duration: 1.2 }}
                    className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}
                  >
                    <motion.div whileHover={{ scale: 1.05, rotate: isEven ? -2 : 2 }} className={`bg-white/90 backdrop-blur-sm p-3 pb-12 md:p-4 md:pb-16 rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative w-64 md:w-72 ${isEven ? 'rotate-2' : '-rotate-2'} transition-all duration-300 border border-white`}>
                      <img src="/images/washi-tape.png" className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 opacity-90 drop-shadow-sm" alt="tape"/>
                      <div className="w-full aspect-square bg-pink-50 flex items-center justify-center overflow-hidden rounded-md relative shadow-inner">
                        <img src={`/images/${item.img}`} alt={item.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML=`<span class="text-pink-300 font-bold">FOTO ${item.id}</span>`; }}/>
                      </div>
                    </motion.div>
                    <div className={`text-center ${isEven ? 'md:text-left' : 'md:text-right'} max-w-sm bg-white/40 p-6 rounded-3xl backdrop-blur-sm border border-white/50 shadow-sm`}>
                      <h3 className="font-pacifico text-3xl md:text-4xl text-pink-500 mb-4 drop-shadow-sm">{item.title}</h3>
                      <p className="text-gray-700 md:text-lg leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ type: 'spring', bounce: 0.5 }} className="mt-32 flex flex-col items-center bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(244,63,94,0.15)] border-2 border-white">
              
              <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner border border-white/60">
                🔒
              </div>
              
              <h2 className="font-pacifico text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400 mb-2 leading-[1.4] py-2">Secret Vault</h2>
              <p className="text-gray-500 mb-10 text-center text-sm md:text-base font-bold max-w-xs bg-pink-50/50 py-2 px-4 rounded-full">Masukkan 6 digit tanggal lahirmu (DDMMYY)</p>
              
              <motion.div animate={pinError ? { x: [-10,10,-10,10,0] } : {}} transition={{ duration: 0.4 }} className="flex gap-4 mb-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-pink-500 border-pink-500 scale-125 shadow-[0_0_15px_rgba(236,72,153,0.6)]' : 'bg-pink-50 border-pink-200'}`}/>
                ))}
              </motion.div>
              
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {[1,2,3,4,5,6,7,8,9].map((num) => (
                  <motion.button key={num} whileHover={{ scale: 1.1, backgroundColor: "#fce7f3" }} whileTap={{ scale: 0.9 }} onClick={() => handlePinInput(num.toString())} 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-pink-500 text-2xl font-bold shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-pink-50 flex items-center justify-center">
                    {num}
                  </motion.button>
                ))}
                <div/>
                <motion.button whileHover={{ scale: 1.1, backgroundColor: "#fce7f3" }} whileTap={{ scale: 0.9 }} onClick={() => handlePinInput('0')} 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-pink-500 text-2xl font-bold shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-pink-50 flex items-center justify-center">
                  0
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleDeletePin} 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full text-pink-300 text-3xl bg-white/50 hover:bg-white hover:text-pink-500 shadow-sm border border-transparent flex items-center justify-center">
                  &larr;
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ===== STEP 2: SURAT SURPRISE ===== */}
        {step === 2 && (
          <motion.div key="letter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            className="w-full h-screen fixed inset-0 flex items-center justify-center overflow-hidden z-40"
          >
            <div className="absolute top-2 md:top-6 left-0 w-[200%] -translate-x-1/4 -rotate-6 pointer-events-none opacity-60 md:opacity-75">
              <motion.div animate={{ x: ['0%','-50%'] }} transition={{ ease: 'linear', duration: 45, repeat: Infinity }} className="flex w-max">
                {infinitePhotos.map((img, idx) => (<div key={`top-${idx}`} className="w-24 md:w-44 aspect-square shrink-0 overflow-hidden border-2 border-white"><img src={`/images/${img}`} className="w-full h-full object-cover" alt="Memory" onError={(e) => { e.target.style.display='none'; }}/></div>))}
              </motion.div>
            </div>
            <div className="absolute bottom-2 md:bottom-6 left-0 w-[200%] -translate-x-1/4 -rotate-6 pointer-events-none opacity-60 md:opacity-75">
              <motion.div animate={{ x: ['-50%','0%'] }} transition={{ ease: 'linear', duration: 38, repeat: Infinity }} className="flex w-max">
                {infinitePhotos.map((img, idx) => (<div key={`bot-${idx}`} className="w-24 md:w-44 aspect-square shrink-0 overflow-hidden border-2 border-white"><img src={`/images/${img}`} className="w-full h-full object-cover" alt="Memory" onError={(e) => { e.target.style.display='none'; }}/></div>))}
              </motion.div>
            </div>
            <motion.img animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} src="/images/sparkles.png" className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-20 z-10" onError={(e) => e.target.style.display='none'}/>
            
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={{ opacity: 1, scale: 1, y: [0,-10,0] }} transition={{ type: 'spring', bounce: 0.4, duration: 1.5, delay: 0.5, y: { repeat: Infinity, duration: 5, ease: 'easeInOut' } }}
              className="w-[88%] max-w-2xl bg-white/85 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-14 shadow-[0_30px_60px_-15px_rgba(244,63,94,0.3)] border-2 border-white text-center relative z-20 flex flex-col items-center"
            >
              <h2 className="font-pacifico text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400 mb-6 drop-shadow-sm leading-[1.4] py-2">My Letter to You</h2>
              <div className="max-h-[35vh] md:max-h-[38vh] w-full overflow-y-auto pr-3 mb-8 text-gray-700 leading-relaxed md:text-xl font-medium text-left [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-pink-50/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-pink-300 [&::-webkit-scrollbar-thumb]:rounded-full shadow-inner bg-white/40 p-4 rounded-2xl border border-white">
                <TypewriterText text={SURAT_CINTA} delay={1000} />
              </div>
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(236,72,153,0.4)" }} whileTap={{ scale: 0.95 }} onClick={() => setStep(3)}
                className="w-full md:w-auto bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-4 px-12 rounded-full transition-all duration-300 cursor-pointer text-sm md:text-lg border border-pink-300/50">
                One Last Magic 🌸
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ===== STEP 3: BUNGA ===== */}
        {step === 3 && (
          <motion.div key="flower" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 50% 30%, #2a0d1b 0%, #111827 55%, #050810 100%)' }}
          >
            <Fireflies/>
            <div className="absolute inset-0 z-10 flex items-center justify-center"><CinematicRose/></div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 5, duration: 2.5, ease: 'easeOut' }}
              className="relative z-20 text-center flex flex-col items-center mt-auto mb-10 md:mb-12 px-4 pointer-events-auto"
            >
              <motion.h1 animate={{ opacity: [0.7, 1, 0.7], textShadow: ["0px 0px 10px rgba(251,113,133,0.5)", "0px 0px 20px rgba(251,113,133,1)", "0px 0px 10px rgba(251,113,133,0.5)"] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="font-pacifico text-4xl sm:text-5xl md:text-7xl text-rose-200 mb-2"
              >Happy Birthday.</motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6.5, duration: 2 }} className="text-gray-400 font-medium tracking-[0.2em] md:tracking-[0.35em] uppercase text-xs md:text-sm mt-4">
                You are my favorite kind of magic.
              </motion.p>
              
              <motion.button 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 8.5, duration: 1.5 }}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(251, 113, 133, 0.15)" }} whileTap={{ scale: 0.95 }}
                onClick={() => setStep(4)}
                className="mt-10 bg-transparent border border-rose-400/50 text-rose-300 px-10 py-3 rounded-full font-bold transition-all duration-300 text-xs tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(251,113,133,0.1)] cursor-pointer backdrop-blur-sm"
              >
                One More Thing...
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ===== STEP 4: NIGHT OF WISHES ===== */}
        {step === 4 && (
          <motion.div key="wishes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 50% 15%, #2a0d24 0%, #170b23 30%, #0a0a18 62%, #050810 100%)' }}
          >
            <div className="fixed inset-0 opacity-40 z-0 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 130px 80px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 160px 120px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 200px 50px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 240px 150px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 280px 90px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 320px 140px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 360px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 400px 110px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 440px 60px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 480px 180px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 520px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 560px 150px, #ffffff, rgba(0,0,0,0))', backgroundSize: '200px 200px' }} />

            <div className="absolute inset-0 z-0 pointer-events-none">
              {floatingPhotosConfig.map((config) => (
                <motion.div key={`fl-img-${config.id}`} 
                  className="absolute rounded-xl p-2 bg-white/10 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex items-center justify-center w-28 h-28 md:w-40 md:h-40 border border-white/20"
                  initial={{ y: '120vh', x: `${config.x}vw`, rotate: config.startRot, opacity: 0, scale: config.scale }}
                  animate={{ y: '-30vh', opacity: [0, 0.8, 0.8, 0], rotate: config.endRot }}
                  transition={{ duration: config.duration, repeat: Infinity, delay: config.delay, ease: 'linear' }}
                >
                  <div className="w-full h-full bg-black/20 rounded-lg overflow-hidden flex items-center justify-center relative shadow-inner">
                    <img src={`/images/${config.img}`} className="w-full h-full object-cover opacity-90" alt="Memory" 
                      onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span class="text-white/30 font-medium text-xs text-center px-2">FOTO BELUM ADA</span>'; }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="absolute top-16 md:top-20 z-10 text-center px-4 w-full pointer-events-none">
              <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1.5 }} className="font-pacifico text-3xl md:text-5xl text-rose-300 mb-3 drop-shadow-[0_0_15px_rgba(251,113,133,0.6)]">
                Night of Wishes
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1.5 }} className="text-rose-100/80 text-sm md:text-lg font-medium tracking-widest uppercase">
                Tap the glowing stars
              </motion.p>
            </div>

            {/* PENGUNCI BINTANG LAIN SAAT KARTU DIBUKA (MENCEGAH BUG SPAM) */}
            <div className={`absolute inset-0 z-20 ${selectedWish ? 'pointer-events-none' : ''}`}>
              {WISHES_DATA.map((wish, i) => {
                // Trigger dengan onPointerDown: kartu terbuka SEKETIKA saat jari/kursor
                // menyentuh bintang di posisinya SAAT ITU JUGA, tidak menunggu jari
                // diangkat -- jadi walau bintang terus bergoyang pelan, tap tidak akan
                // pernah "meleset" hanya karena bintang sudah bergeser sedikit.
                const openWish = (e) => {
                  if (e) { e.preventDefault(); e.stopPropagation(); }
                  if (!selectedWish) {
                    setSelectedWish(wish);
                    confetti({ particleCount: 70, spread: 80, origin: { y: 0.8 }, colors: ['#ffc0cb','#ffd700','#ffffff', '#ff69b4'] });
                  }
                };
                return (
                  <motion.button key={`wish-btn-${i}`}
                    onPointerDown={openWish}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    initial={{ scale: 0, opacity: 0, x: starPaths[i].x[0], y: starPaths[i].y[0] }}
                    animate={{
                      x: starPaths[i].x,
                      y: starPaths[i].y,
                      scale: [1, 1.25, 1],
                      opacity: [0.65, 1, 0.65]
                    }}
                    transition={{
                      x: { duration: 9 + i * 1.4, repeat: Infinity, ease: 'easeInOut' },
                      y: { duration: 11 + i * 1.4, repeat: Infinity, ease: 'easeInOut' },
                      scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 },
                      opacity: { duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 },
                    }}
                    whileTap={{ scale: 0.8 }}
                    className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full text-3xl md:text-4xl border border-rose-300/40 pointer-events-auto cursor-pointer select-none relative before:absolute before:inset-[-24px] before:content-[''] before:rounded-full"
                    style={{
                      position: 'absolute',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                      background: 'radial-gradient(circle at 35% 30%, rgba(255,220,230,0.55), rgba(251,113,133,0.28) 45%, rgba(251,113,133,0.05) 75%)',
                      filter: 'drop-shadow(0 0 18px rgba(251,113,133,0.85))',
                    }}
                  >
                    ✨
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedWish && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md pointer-events-auto"
                  onClick={() => setSelectedWish(null)}
                >
                  <motion.div initial={{ scale: 0.5, y: 100, rotateX: 45 }} animate={{ scale: 1, y: 0, rotateX: 0 }} exit={{ scale: 0.8, y: 50, opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white/95 p-8 md:p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] max-w-sm w-full text-center border-4 border-pink-100 relative bg-[url('/images/washi-tape.png')] bg-no-repeat bg-[length:60px] bg-[top_10px_center]"
                  >
                    <div className="text-5xl drop-shadow-lg mb-6 mt-4">💌</div>
                    <p className="text-gray-700 font-bold leading-relaxed mb-8 md:text-lg whitespace-pre-line">{selectedWish}</p>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedWish(null)} 
                      className="bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 px-10 rounded-full shadow-[0_10px_20px_rgba(236,72,153,0.3)] transition-all cursor-pointer w-full text-lg border border-pink-300/50">
                      Aamiin ✨
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}