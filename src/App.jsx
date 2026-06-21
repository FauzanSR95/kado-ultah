import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// =====================================================
//  EASING
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
//  TYPEWRITER EFFECT (SUPER LIGHTWEIGHT ANTI-LAG)
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
      }, 35); // Kecepatan ketik 35ms per huruf
    };

    const initialDelay = setTimeout(startTyping, delay);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(timer);
    };
  }, [text, delay]);

  return <span className="whitespace-pre-line">{displayedText}</span>;
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

    // ---------- STEMS ----------
    const stemData = [
      { id: 'stem-m', len: 360, delay: 0 },
      { id: 'stem-l', len: 320, delay: 250 },
      { id: 'stem-r', len: 320, delay: 250 },
    ];
    stemData.forEach(({ id, len, delay }) => {
      const el = svg.getElementById(id);
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
      setTimeout(() => {
        animate((p) => { el.style.strokeDashoffset = len * (1 - easeOutQuint(p)); }, 2000);
      }, delay);
    });

    // ---------- GRASS + LEAVES ----------
    setTimeout(() => {
      animate((p) => { svg.getElementById('grass-g').setAttribute('opacity', (p * 0.88).toFixed(3)); }, 1200);
    }, 200);
    setTimeout(() => {
      animate((p) => { svg.getElementById('leaves-g').setAttribute('opacity', (p * 0.92).toFixed(3)); }, 1000);
    }, 1200);

    // ---------- BLOOM ----------
    const bloomOneFlower = (flId, delay) => {
      setTimeout(() => {
        const fl = svg.getElementById(flId);
        if (!fl) return;

        const outerPetals = fl.querySelectorAll('.petal-outer');
        const midPetals   = fl.querySelectorAll('.petal-mid');
        const innerPetals = fl.querySelectorAll('.petal-inner');
        const center      = fl.querySelector('.flower-center');

        [...outerPetals, ...midPetals, ...innerPetals].forEach((p) => {
          p.setAttribute('transform', p.getAttribute('data-rot') + ' scale(0)');
        });
        if (center) center.setAttribute('transform', 'scale(0)');

        outerPetals.forEach((petal, i) => {
          setTimeout(() => {
            const rot = petal.getAttribute('data-rot');
            animate((p) => {
              const s = easeOutElastic(p);
              petal.setAttribute('transform', `${rot} scale(${s.toFixed(4)})`);
            }, 700);
          }, i * 80);
        });

        midPetals.forEach((petal, i) => {
          setTimeout(() => {
            const rot = petal.getAttribute('data-rot');
            animate((p) => {
              const s = easeOutBack(p);
              petal.setAttribute('transform', `${rot} scale(${s.toFixed(4)})`);
            }, 600);
          }, outerPetals.length * 80 + i * 60 + 100);
        });

        innerPetals.forEach((petal, i) => {
          setTimeout(() => {
            const rot = petal.getAttribute('data-rot');
            animate((p) => {
              const s = easeOutBack(p);
              petal.setAttribute('transform', `${rot} scale(${s.toFixed(4)})`);
            }, 500);
          }, outerPetals.length * 80 + midPetals.length * 60 + i * 50 + 200);
        });

        const centerDelay = outerPetals.length * 80 + midPetals.length * 60 + innerPetals.length * 50 + 350;
        setTimeout(() => {
          if (!center) return;
          animate((p) => {
            const s = easeOutBack(p);
            center.setAttribute('transform', `scale(${s.toFixed(4)})`);
          }, 500);
        }, centerDelay);

      }, delay);
    };

    bloomOneFlower('flower-m', 2000);
    bloomOneFlower('flower-l', 2500);
    bloomOneFlower('flower-r', 2500);

    // ---------- FLOATING PETALS ----------
    const petalData = [
      [112,280,6,9,30],[418,260,5,8,-20],[198,178,5,7,15],
      [316,172,6,8,-35],[142,222,4,6,50],[390,228,5,7,-15],
    ];
    petalData.forEach(([cx, cy, rx, ry, rot], i) => {
      const el = svg.getElementById(`fp-${i}`);
      if (!el) return;
      const run = () => {
        const dur = 5000 + Math.random() * 2000;
        const endY = 55 + Math.random() * 35;
        animate((p) => {
          const op = p < 0.15 ? (p / 0.15) * 0.35 : p > 0.8 ? ((1 - p) / 0.2) * 0.18 : 0.28;
          el.setAttribute('opacity', op.toFixed(3));
          el.setAttribute('transform',
            `rotate(${rot + p * 30},${cx},${cy}) translate(${(p - 0.5) * 18},${p * endY})`
          );
        }, dur, () => setTimeout(run, 800 + Math.random() * 2500));
      };
      setTimeout(run, 4000 + i * 600);
    });

    // ---------- STARS ----------
    svg.querySelectorAll('.star-dot').forEach((s, i) => {
      const phase = Math.random() * Math.PI * 2;
      let t = 0;
      const tw = () => {
        t += 0.012;
        s.setAttribute('opacity', (0.3 + 0.35 * Math.sin(t * 1.8 + phase)).toFixed(3));
        raf(tw);
      };
      setTimeout(() => raf(tw), i * 60);
    });

    return () => { frameIds.current.forEach(cancelAnimationFrame); };
  }, [animate]);

  const makePetalPath = (length, width) => {
    const hw = width / 2;
    return `M0,0 C${-hw},${-length * 0.25} ${-hw},${-length * 0.65} 0,${-length} C${hw},${-length * 0.65} ${hw},${-length * 0.25} 0,0Z`;
  };

  const Flower = ({ id, cx, cy, size = 1, gradId, centerGradId }) => {
    const pLen = 68 * size;
    const pW   = 34 * size;
    const mLen = 50 * size;
    const mW   = 22 * size;
    const iLen = 34 * size;
    const iW   = 15 * size;
    const cr1  = 22 * size;
    const cr2  = 13 * size;
    const cr3  = 5  * size;

    const outerPath = makePetalPath(pLen, pW);
    const midPath   = makePetalPath(mLen, mW);
    const innerPath = makePetalPath(iLen, iW);

    const outerAngles = [0, 72, 144, 216, 288];
    const midAngles   = [36, 108, 180, 252, 324];
    const innerAngles = [18, 90, 162, 234, 306];

    return (
      <g id={id} data-cx={cx} data-cy={cy} transform={`translate(${cx},${cy})`}>
        {outerAngles.map((a) => (
          <g key={`o${a}`} className="petal-outer" data-rot={`rotate(${a})`} transform={`rotate(${a}) scale(0)`}>
            <path d={outerPath} fill={`url(#${gradId})`} opacity="0.94"/>
          </g>
        ))}
        {midAngles.map((a) => (
          <g key={`m${a}`} className="petal-mid" data-rot={`rotate(${a})`} transform={`rotate(${a}) scale(0)`}>
            <path d={midPath} fill="#ffeaf8" opacity="0.85"/>
          </g>
        ))}
        {innerAngles.map((a) => (
          <g key={`i${a}`} className="petal-inner" data-rot={`rotate(${a})`} transform={`rotate(${a}) scale(0)`}>
            <path d={innerPath} fill="#fff6fc" opacity="0.78"/>
          </g>
        ))}
        <g className="flower-center" transform="scale(0)">
          <circle r={cr1} fill={`url(#${centerGradId})`}/>
          <circle r={cr2} fill="#fff8fc"/>
          <circle r={cr3} fill="#ffffff"/>
          {outerAngles.map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <circle key={`st${a}`} cx={Math.sin(rad) * cr1 * 0.72} cy={-Math.cos(rad) * cr1 * 0.72} r={2.2 * size} fill="#ffd0e8"/>
            );
          })}
        </g>
      </g>
    );
  };

  const stars = [
    [45,30,1.2,0],[82,18,0.8,1],[130,42,1.5,2],[180,15,1,0],[240,28,0.8,1],
    [310,12,1.3,2],[370,38,1,0],[420,20,1.5,1],[468,45,0.9,2],[500,25,1.2,0],
    [60,80,0.7,1],[150,65,1,2],[110,160,1.5,0],[385,130,1.8,1],[70,240,1.2,2],
    [455,200,1.3,0],[140,110,2,1],[400,95,1.6,2],[30,150,1,0],[490,160,0.9,1],
    [200,50,1.1,2],[330,70,0.8,0],[22,320,0.7,1],[500,310,1,2],[260,40,1.3,0],
  ];
  const starColors = ['#ff99cc', '#ffb3d9', '#d8e8ff'];

  const leaves = [
    { d:"M258,422 C238,410 215,404 200,414 C188,422 192,442 210,448 C228,454 252,440 258,424Z", g:"lG1" },
    { d:"M262,387 C282,374 308,368 322,378 C334,386 330,406 312,412 C294,418 265,402 262,389Z", g:"lG2" },
    { d:"M259,333 C238,320 215,314 202,324 C192,332 196,350 212,354 C228,358 254,344 259,335Z", g:"lG1" },
    { d:"M261,302 C280,290 305,284 318,294 C328,302 322,320 306,324 C290,328 264,310 261,304Z", g:"lG2" },
    { d:"M162,422 C140,412 116,407 106,418 C98,427 104,444 120,448 C138,452 160,436 162,424Z", g:"lG1" },
    { d:"M165,382 C182,370 206,364 217,374 C226,382 220,400 204,404 C188,408 167,390 165,384Z", g:"lG2" },
    { d:"M350,422 C372,412 396,407 406,418 C414,427 408,444 392,448 C374,452 352,436 350,424Z", g:"lG2" },
    { d:"M347,382 C330,370 306,364 296,374 C288,382 294,400 310,404 C326,408 345,390 347,384Z", g:"lG1" },
    { d:"M227,507 C207,494 187,488 177,498 C168,506 174,522 190,526 C208,530 224,514 227,508Z", g:"lG1" },
    { d:"M297,507 C317,494 340,488 350,498 C358,506 352,522 336,526 C318,530 300,514 297,508Z", g:"lG2" },
  ];

  const grassPaths = [
    ["M68,548 C62,518 55,498 48,468 L48,548Z", 0], ["M80,548 C82,513 88,486 84,450 L80,548Z", 1],
    ["M94,548 C99,523 104,500 102,473 L94,548Z", 0], ["M452,548 C448,518 440,496 438,466 L452,548Z", 1],
    ["M466,548 C462,513 460,484 462,450 L466,548Z", 0], ["M480,548 C484,523 492,498 490,470 L480,548Z", 1],
    ["M155,549 C148,528 144,506 140,480 L155,549Z", 0], ["M168,549 C169,522 175,498 173,470 L168,549Z", 1],
    ["M357,549 C354,526 352,503 354,476 L357,549Z", 0], ["M372,549 C377,523 384,500 382,473 L372,549Z", 1],
    ["M110,548 C106,520 102,498 100,472 L110,548Z", 0], ["M420,548 C424,520 428,498 426,472 L420,548Z", 1],
  ];

  const floatingPetals = [
    [112,280,6,9,30],[418,260,5,8,-20],[198,178,5,7,15],
    [316,172,6,8,-35],[142,222,4,6,50],[390,228,5,7,-15],
  ];

  return (
    <svg ref={svgRef} viewBox="0 0 520 590" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="pg1" cx="50%" cy="100%" r="100%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="15%" stopColor="#ffd6f0"/>
          <stop offset="50%" stopColor="#ff55aa"/>
          <stop offset="100%" stopColor="#be0068" stopOpacity="0.85"/>
        </radialGradient>
        <radialGradient id="pg2" cx="50%" cy="100%" r="100%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="18%" stopColor="#ffc8e8"/>
          <stop offset="55%" stopColor="#ff4499"/>
          <stop offset="100%" stopColor="#aa005a" stopOpacity="0.82"/>
        </radialGradient>
        <radialGradient id="pg3" cx="50%" cy="100%" r="100%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#fff5fa"/>
          <stop offset="20%" stopColor="#ffbede"/>
          <stop offset="58%" stopColor="#ff3388"/>
          <stop offset="100%" stopColor="#990050" stopOpacity="0.78"/>
        </radialGradient>
        <radialGradient id="cg1" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff"/><stop offset="45%" stopColor="#ffe4f5"/><stop offset="100%" stopColor="#ffaad4"/>
        </radialGradient>
        <radialGradient id="cg2" cx="45%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#fff9fb"/><stop offset="48%" stopColor="#ffd8ee"/><stop offset="100%" stopColor="#ff99cc"/>
        </radialGradient>
        <linearGradient id="stG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0a3d1f"/><stop offset="48%" stopColor="#1faa4a"/><stop offset="100%" stopColor="#0d5028"/>
        </linearGradient>
        <linearGradient id="stG2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#092d17"/><stop offset="50%" stopColor="#166630"/><stop offset="100%" stopColor="#0a3d1f"/>
        </linearGradient>
        <linearGradient id="lG1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22b84e"/><stop offset="50%" stopColor="#2de864"/><stop offset="100%" stopColor="#0d6628"/>
        </linearGradient>
        <linearGradient id="lG2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a9040"/><stop offset="50%" stopColor="#22d055"/><stop offset="100%" stopColor="#0a5020"/>
        </linearGradient>
        <radialGradient id="groundG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d2e16"/><stop offset="100%" stopColor="#040a05" stopOpacity="0.85"/>
        </radialGradient>
        <filter id="glowF" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {stars.map(([x, y, r, c], i) => (
        <circle key={`s-${i}`} className="star-dot" cx={x} cy={y} r={r} fill={starColors[c]} opacity="0"/>
      ))}
      <ellipse cx="260" cy="566" rx="215" ry="21" fill="url(#groundG)"/>
      <g id="grass-g" opacity="0">
        {grassPaths.map(([d, v], i) => (
          <path key={i} d={d} fill={v === 0 ? 'url(#lG1)' : 'url(#lG2)'} opacity="0.88"/>
        ))}
      </g>
      <path id="stem-l" d="M168,555 C166,515 158,478 152,445 C147,412 145,380 155,350 C159,335 162,315 160,295" fill="none" stroke="url(#stG2)" strokeWidth="5" strokeLinecap="round"/>
      <path id="stem-m" d="M260,560 C258,518 255,470 255,428 C255,388 257,348 259,308 C260,272 260,246 260,212" fill="none" stroke="url(#stG)" strokeWidth="6.5" strokeLinecap="round"/>
      <path id="stem-r" d="M348,555 C350,513 354,476 357,444 C360,412 360,380 352,350 C348,334 344,314 348,296" fill="none" stroke="url(#stG2)" strokeWidth="5" strokeLinecap="round"/>
      <g id="leaves-g" opacity="0">
        {leaves.map((leaf, i) => (
          <path key={i} d={leaf.d} fill={`url(#${leaf.g})`}/>
        ))}
      </g>
      <g filter="url(#glowF)"><Flower id="flower-l" cx={160} cy={295} size={0.87} gradId="pg2" centerGradId="cg2"/></g>
      <g filter="url(#glowF)"><Flower id="flower-m" cx={260} cy={212} size={1.06} gradId="pg1" centerGradId="cg1"/></g>
      <g filter="url(#glowF)"><Flower id="flower-r" cx={348} cy={296} size={0.87} gradId="pg3" centerGradId="cg2"/></g>

      {floatingPetals.map(([cx, cy, rx, ry, rot], i) => (
        <ellipse key={i} id={`fp-${i}`} cx={cx} cy={cy} rx={rx} ry={ry} fill="#ff80b4" transform={`rotate(${rot},${cx},${cy})`} opacity="0"/>
      ))}
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
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) + 100,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{ y: [null, -200], rotate: [0, Math.random() * 360] }}
          transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: 'linear' }}
        >
          {i % 2 === 0 ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// =====================================================
//  FIREFLIES (DIOPTIMASI UNTUK MOBILE)
// =====================================================
const Fireflies = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    {[...Array(32)].map((_, i) => (
      <motion.div key={i} className="absolute rounded-full"
        style={{
          width: i % 3 === 0 ? 5 : 3, height: i % 3 === 0 ? 5 : 3,
          background: i % 4 === 0 ? '#ff99cc' : i % 4 === 1 ? '#ffb3d9' : '#ff66aa',
          filter: `drop-shadow(0 0 ${i % 3 === 0 ? 4 : 2}px #ff80b4)`,
        }}
        initial={{
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
          y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          opacity: 0,
        }}
        animate={{
          y: [null, -(Math.random() * 350 + 100)],
          x: [null, (Math.random() - 0.5) * 180],
          opacity: [0, Math.random() * 0.75 + 0.2, 0],
        }}
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

  const noTexts = [
    "Enggak", 
    "Eh, kepencet ya? 🤨", 
    "Loh, masih 'Enggak'?! 🧐", 
    "Mulai ngajak ribut nih... 😤", 
    "Yakin? Nanti nyesel lho 🫣", 
    "Tega banget... 💔"
  ];

  const CORRECT_PIN = '100705';

  const timelineData = [
    { id: 1, title: 'That Captivating Smile', desc: 'Melihat senyummu selalu menjadi bagian terbaik dalam hariku.', img: 'foto1.jpg' },
    { id: 2, title: 'Effortlessly Beautiful', desc: 'Tidak peduli dari sudut mana, kamu selalu berhasil membuatku kagum.', img: 'foto2.jpg' },
    { id: 3, title: 'My Favorite View', desc: 'Dan di antara semua hal indah di dunia, memandangi wajahmu adalah favoritku.', img: 'foto3.jpg' },
  ];

  const marqueePhotos = ['foto1.jpg', 'foto2.jpg', 'foto3.jpg'];
  const infinitePhotos = [...marqueePhotos, ...marqueePhotos, ...marqueePhotos, ...marqueePhotos, ...marqueePhotos];

  const letterText = "Hai, Beautiful.\n\nSelamat ulang tahun! Website ini sengaja kubuat khusus untukmu, karena kado biasa rasanya tidak cukup untuk mengekspresikan betapa berartinya dirimu bagiku.\n\nTerima kasih sudah terlahir ke dunia ini dan menjadi versi terbaik dari dirimu. Semoga di umur yang baru ini, semua harapan dan impianmu perlahan menjadi nyata. Aku akan selalu ada di sini untuk mendukungmu, dalam setiap langkahmu.\n\nI love you, now and always. ✨";

  const handleOpenGate = () => {
    setStep(1);
    if (audioRef.current) audioRef.current.play();
  };

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
    <div className="min-h-screen bg-gradient-to-b from-[#fff5f7] to-[#ffe4e8] relative overflow-x-hidden font-quicksand text-gray-800">
      <audio ref={audioRef} src="/stuck-with-u.mp3" loop preload="auto"/>
      {step < 2 && <FloatingParticles/>}

      <AnimatePresence mode="wait">

        {/* ===== STEP -1: HALAMAN PERTANYAAN AWAL (PRE-GATE) ===== */}
        {step === -1 && (
          <motion.div
            key="pre-gate"
            exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#fff5f7] px-4 text-center overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {!isYesClicked ? (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center w-full max-w-md"
                >
                  <img src="/images/cat-love.gif" alt="Cute Ask" className="w-40 md:w-56 mb-6 drop-shadow-md"
                    onError={(e) => e.target.style.display = 'none'} />
                  
                  <h2 className="font-pacifico text-3xl md:text-4xl text-pink-500 mb-8 px-4 leading-relaxed">
                    Hai, sebelum lanjut... Kamu sayang aku nggak? 🥺
                  </h2>

                  <div className="flex flex-row flex-wrap items-center justify-center gap-4 w-full min-h-[120px] relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsYesClicked(true)}
                      style={{ 
                        fontSize: `${16 + noCount * 6}px`, 
                        padding: `${12 + noCount * 6}px ${24 + noCount * 8}px` 
                      }}
                      className="bg-pink-500 text-white font-bold rounded-full shadow-lg transition-all duration-300 z-20"
                    >
                      Iyaa sayang 💕
                    </motion.button>

                    {noCount < noTexts.length ? (
                      <motion.button
                        onClick={() => setNoCount(noCount + 1)}
                        style={{ transform: `scale(${1 - noCount * 0.15})` }}
                        className="bg-white text-gray-600 font-bold py-3 px-8 rounded-full shadow-md hover:bg-gray-50 transition-all duration-300 border border-gray-100 shrink-0"
                      >
                        {noTexts[noCount]}
                      </motion.button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-pink-400 italic text-sm absolute -bottom-10 w-full"
                      >
                        *Tombol No telah disita oleh sistem* 🏃‍♂️💨
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="answered"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center w-full max-w-md"
                >
                  <img src="/images/cat-love-ketiga.gif" alt="Cute Happy" className="w-48 md:w-64 mb-6 drop-shadow-md"
                    onError={(e) => e.target.style.display = 'none'} />
                  
                  <h2 className="font-pacifico text-3xl md:text-4xl text-pink-500 mb-4">
                    Hehehe, I love you too! 💕
                  </h2>
                  <p className="text-gray-600 font-medium md:text-lg mb-8 px-4">
                    Makasih ya udah jujur. Nah, sekarang aku punya sesuatu yang spesial buat kamu...
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(0)}
                    className="bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold py-4 px-10 rounded-full shadow-lg text-lg"
                  >
                    Lanjut ✨
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ===== STEP 0 ===== */}
        {step === 0 && (
          <motion.div key="gate"
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(15px)' }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#fff5f7] cursor-pointer"
            onClick={handleOpenGate}
          >
            <motion.div animate={{ y: [0,-15,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <motion.img whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                src="/images/kado.png" className="h-48 md:h-64 w-auto object-contain drop-shadow-2xl mb-8" alt="Kado"/>
            </motion.div>
            <motion.div animate={{ opacity: [0.3,1,0.3] }} transition={{ repeat: Infinity, duration: 2 }}
              className="px-6 py-2 bg-pink-100/50 backdrop-blur-sm rounded-full text-pink-500 font-bold tracking-widest uppercase shadow-sm">
              Tap to Unlock
            </motion.div>
          </motion.div>
        )}

        {/* ===== STEP 1 ===== */}
        {step === 1 && (
          <motion.div key="main"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
            className="w-full flex flex-col items-center pb-32 relative z-10"
          >
            <div className="h-screen w-full flex flex-col items-center justify-center gap-10 md:gap-14 px-4">
              <motion.h1
                initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
                className="font-pacifico text-6xl md:text-8xl text-pink-500 text-center drop-shadow-sm leading-normal pb-4"
              >
                Happy Birthday!
              </motion.h1>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
                className="bg-white/40 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-white/50">
                <p className="text-pink-400 text-sm md:text-lg font-bold tracking-widest uppercase">Scroll to See My Favorite Person</p>
              </motion.div>
            </div>

            <div className="w-full max-w-4xl px-4 md:px-8 py-10 flex flex-col gap-24 md:gap-32">
              {timelineData.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div key={item.id}
                    initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ type: 'spring', bounce: 0.4, duration: 1 }}
                    className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}
                  >
                    <div className="bg-white p-3 pb-12 md:p-4 md:pb-16 rounded-lg shadow-xl relative w-64 md:w-72 rotate-2 hover:rotate-0 transition-transform duration-300 border border-gray-100">
                      <img src="/images/washi-tape.png" className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 opacity-90" alt="tape"/>
                      <div className="w-full aspect-square bg-pink-50 flex items-center justify-center overflow-hidden rounded-sm relative">
                        <img src={`/images/${item.img}`} alt={item.title} className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML=`<span class="text-pink-300 font-bold">FOTO ${item.id}</span>`; }}/>
                      </div>
                    </div>
                    <div className={`text-center ${isEven ? 'md:text-left' : 'md:text-right'} max-w-sm`}>
                      <h3 className="font-pacifico text-3xl md:text-4xl text-pink-500 mb-4 drop-shadow-sm">{item.title}</h3>
                      <p className="text-gray-600 md:text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="mt-32 flex flex-col items-center bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl border border-white/60"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner">🔒</div>
              <h2 className="font-pacifico text-3xl text-pink-500 mb-2">Secret Vault</h2>
              <p className="text-gray-500 mb-8 text-center text-sm md:text-base font-medium max-w-xs">Enter 6-digit code to unlock your special message. (DDMMYY)</p>
              <motion.div animate={pinError ? { x: [-10,10,-10,10,0] } : {}} transition={{ duration: 0.4 }} className="flex gap-3 mb-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-pink-500 border-pink-500 scale-110 shadow-md shadow-pink-300' : 'bg-pink-50 border-pink-200'}`}/>
                ))}
              </motion.div>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {[1,2,3,4,5,6,7,8,9].map((num) => (
                  <button key={num} onClick={() => handlePinInput(num.toString())}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/80 text-pink-500 text-2xl font-bold shadow-sm hover:shadow-md hover:bg-pink-100 hover:scale-105 active:scale-95 transition-all border border-pink-50">
                    {num}
                  </button>
                ))}
                <div/>
                <button onClick={() => handlePinInput('0')}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/80 text-pink-500 text-2xl font-bold shadow-sm hover:shadow-md hover:bg-pink-100 hover:scale-105 active:scale-95 transition-all border border-pink-50">0</button>
                <button onClick={handleDeletePin}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full text-pink-300 text-3xl hover:text-pink-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center">&larr;</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ===== STEP 2 (DENGAN TYPEWRITER EFEK YANG LANCAR JAYA) ===== */}
        {step === 2 && (
          <motion.div key="letter"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 1.5 }}
            className="w-full h-screen fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#fff5f7] to-[#ffe4e8] overflow-hidden z-40"
          >
            <div className="absolute top-2 md:top-6 left-0 w-[120%] -translate-x-[10%] -rotate-6 pointer-events-none opacity-60 md:opacity-75">
              <motion.div animate={{ x: ['0%','-50%'] }} transition={{ ease: 'linear', duration: 30, repeat: Infinity }} className="flex gap-4 md:gap-8 w-max">
                {infinitePhotos.map((img, idx) => (
                  <div key={`top-${idx}`} className="w-24 md:w-44 aspect-square bg-white p-1.5 pb-6 md:pb-12 shadow-xl rounded-sm shrink-0">
                    <img src={`/images/${img}`} className="w-full h-full object-cover" alt="Memory"
                      onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span class="text-[10px] text-pink-300 font-bold">FOTO</span>'; }}/>
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="absolute bottom-2 md:bottom-6 left-0 w-[120%] -translate-x-[10%] -rotate-6 pointer-events-none opacity-60 md:opacity-75">
              <motion.div animate={{ x: ['-50%','0%'] }} transition={{ ease: 'linear', duration: 25, repeat: Infinity }} className="flex gap-4 md:gap-8 w-max">
                {infinitePhotos.map((img, idx) => (
                  <div key={`bot-${idx}`} className="w-24 md:w-44 aspect-square bg-white p-1.5 pb-6 md:pb-12 shadow-xl rounded-sm shrink-0">
                    <img src={`/images/${img}`} className="w-full h-full object-cover" alt="Memory"
                      onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span class="text-[10px] text-pink-300 font-bold">FOTO</span>'; }}/>
                  </div>
                ))}
              </motion.div>
            </div>
            <motion.img animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              src="/images/sparkles.png" className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-20 z-10"
              onError={(e) => e.target.style.display='none'}/>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: [0,-8,0] }}
              transition={{ type: 'spring', bounce: 0.4, duration: 1, delay: 0.5, y: { repeat: Infinity, duration: 4, ease: 'easeInOut' } }}
              className="w-[88%] max-w-2xl bg-white/75 backdrop-blur-xl rounded-[2rem] p-5 md:p-12 shadow-[0_25px_50px_-12px_rgba(244,63,94,0.15)] border border-white text-center relative z-20 flex flex-col items-center"
            >
              <h2 className="font-pacifico text-3xl md:text-5xl text-pink-500 mb-4 md:mb-6 drop-shadow-sm">My Letter to You</h2>
              
              <div className="max-h-[35vh] md:max-h-[38vh] w-full overflow-y-auto pr-2 mb-6 md:mb-8 text-gray-700 leading-relaxed md:text-xl font-medium text-left [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-pink-50/50 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-pink-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                {/* Di sinilah Typewriter Murni dipanggil (Mulai ngetik di detik ke-1 setelah kartu muncul) */}
                <TypewriterText text={letterText} delay={1000} />
              </div>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setStep(3)}
                className="w-full md:w-auto bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3.5 px-10 rounded-full shadow-[0_10px_20px_rgba(236,72,153,0.3)] transition-all duration-300 cursor-pointer text-sm md:text-base">
                One Last Magic 🌸
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ===== STEP 3 (DIOPTIMASI UNTUK MOBILE) ===== */}
        {step === 3 && (
          <motion.div key="final"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 50% 30%, #2a0d1b 0%, #111827 55%, #050810 100%)' }}
          >
            <Fireflies/>
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <CinematicRose/>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5, duration: 2.5, ease: 'easeOut' }}
              className="relative z-20 text-center flex flex-col items-center mt-auto mb-12 md:mb-16 px-4"
            >
              <motion.h1
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="font-pacifico text-4xl sm:text-5xl md:text-7xl text-rose-300 mb-2 drop-shadow-[0_0_15px_rgba(251,113,133,0.8)]"
              >
                Happy Birthday.
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6.5, duration: 2 }}
                className="text-gray-400 font-medium tracking-[0.2em] md:tracking-[0.35em] uppercase text-xs md:text-sm mt-4">
                You are my favorite kind of magic.
              </motion.p>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}