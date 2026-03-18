'use client'

import { getSubjectTheme } from '@/lib/subjectGradients'

interface SubjectVisualProps {
  subject: string
  className?: string
}

/* ── Inline SVG illustrations for each subject ── */

function MathSVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Grid lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`vg${i}`} x1={i * 36} y1="0" x2={i * 36} y2="200" stroke="rgba(99,102,241,0.06)" strokeWidth="1" />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={`hg${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="rgba(99,102,241,0.06)" strokeWidth="1" />
      ))}
      {/* Parabola */}
      <path d="M60 180 Q120 20 180 100 Q240 180 300 40 Q340 -20 380 30" stroke="rgba(99,102,241,0.35)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Sine wave */}
      <path d="M0 120 C40 60 80 60 120 120 C160 180 200 180 240 120 C280 60 320 60 360 120 C380 150 400 150 400 120" stroke="rgba(59,130,246,0.25)" strokeWidth="2" fill="none" />
      {/* Symbols */}
      <text x="30" y="50" fill="rgba(129,140,248,0.20)" fontSize="28" fontFamily="serif">∑</text>
      <text x="320" y="170" fill="rgba(129,140,248,0.18)" fontSize="24" fontFamily="serif">∫</text>
      <text x="200" y="45" fill="rgba(99,102,241,0.15)" fontSize="20" fontFamily="serif">π</text>
      <text x="140" y="175" fill="rgba(99,102,241,0.12)" fontSize="22" fontFamily="serif">√x</text>
      {/* Floating circles */}
      <circle cx="280" cy="60" r="20" fill="rgba(99,102,241,0.08)" />
      <circle cx="80" cy="140" r="14" fill="rgba(59,130,246,0.06)" />
      <circle cx="350" cy="100" r="8" fill="rgba(129,140,248,0.10)" />
    </svg>
  )
}

function PhysicsSVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Atom orbits */}
      <ellipse cx="200" cy="100" rx="120" ry="45" stroke="rgba(139,92,246,0.20)" strokeWidth="1.5" transform="rotate(-30 200 100)" />
      <ellipse cx="200" cy="100" rx="120" ry="45" stroke="rgba(139,92,246,0.15)" strokeWidth="1.5" transform="rotate(30 200 100)" />
      <ellipse cx="200" cy="100" rx="120" ry="45" stroke="rgba(167,139,250,0.18)" strokeWidth="1.5" />
      {/* Nucleus */}
      <circle cx="200" cy="100" r="12" fill="rgba(139,92,246,0.25)" />
      <circle cx="200" cy="100" r="6" fill="rgba(167,139,250,0.40)" />
      {/* Electrons */}
      <circle cx="85" cy="80" r="5" fill="rgba(167,139,250,0.50)" />
      <circle cx="315" cy="120" r="5" fill="rgba(167,139,250,0.50)" />
      <circle cx="200" cy="55" r="4" fill="rgba(139,92,246,0.45)" />
      {/* Force vectors */}
      <line x1="30" y1="170" x2="100" y2="170" stroke="rgba(139,92,246,0.25)" strokeWidth="2" markerEnd="url(#arrowP)" />
      <line x1="30" y1="170" x2="30" y2="120" stroke="rgba(167,139,250,0.20)" strokeWidth="2" markerEnd="url(#arrowP)" />
      <defs><marker id="arrowP" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0 0 L8 3 L0 6" fill="rgba(139,92,246,0.35)" /></marker></defs>
      {/* Labels */}
      <text x="330" y="40" fill="rgba(167,139,250,0.18)" fontSize="16" fontFamily="serif">F=ma</text>
      <text x="20" y="40" fill="rgba(139,92,246,0.12)" fontSize="14" fontFamily="serif">E=mc²</text>
    </svg>
  )
}

function ChemistrySVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Hexagonal benzene ring */}
      <polygon points="200,40 240,60 240,100 200,120 160,100 160,60" stroke="rgba(16,185,129,0.30)" strokeWidth="2" fill="rgba(16,185,129,0.04)" />
      <line x1="170" y1="65" x2="170" y2="95" stroke="rgba(16,185,129,0.20)" strokeWidth="1.5" />
      <line x1="195" y1="48" x2="230" y2="65" stroke="rgba(16,185,129,0.20)" strokeWidth="1.5" />
      <line x1="195" y1="113" x2="230" y2="96" stroke="rgba(16,185,129,0.20)" strokeWidth="1.5" />
      {/* Molecule bonds */}
      <circle cx="60" cy="80" r="18" stroke="rgba(20,184,166,0.25)" strokeWidth="1.5" fill="rgba(20,184,166,0.05)" />
      <circle cx="100" cy="60" r="12" stroke="rgba(16,185,129,0.20)" strokeWidth="1.5" fill="rgba(16,185,129,0.04)" />
      <line x1="75" y1="70" x2="90" y2="65" stroke="rgba(20,184,166,0.25)" strokeWidth="2" />
      {/* Flask */}
      <path d="M310 30 L310 100 L280 170 L340 170 Z" stroke="rgba(16,185,129,0.20)" strokeWidth="1.5" fill="rgba(16,185,129,0.03)" />
      <path d="M285 170 Q310 140 335 170" fill="rgba(16,185,129,0.10)" />
      {/* Bubbles */}
      <circle cx="305" cy="130" r="4" fill="rgba(20,184,166,0.20)" />
      <circle cx="315" cy="140" r="3" fill="rgba(16,185,129,0.15)" />
      <circle cx="320" cy="125" r="2.5" fill="rgba(20,184,166,0.18)" />
      {/* Labels */}
      <text x="50" y="120" fill="rgba(16,185,129,0.15)" fontSize="14" fontFamily="serif">H₂O</text>
      <text x="300" y="25" fill="rgba(20,184,166,0.12)" fontSize="12" fontFamily="serif">NaCl</text>
    </svg>
  )
}

function BiologySVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* DNA helix */}
      <path d="M60 10 C100 40 100 60 60 90 C20 120 20 140 60 170 C80 185 100 195 100 200" stroke="rgba(34,197,94,0.25)" strokeWidth="2" fill="none" />
      <path d="M100 10 C60 40 60 60 100 90 C140 120 140 140 100 170 C80 185 60 195 60 200" stroke="rgba(132,204,22,0.20)" strokeWidth="2" fill="none" />
      {/* Cross rungs */}
      {[30, 50, 70, 90, 110, 130, 150, 170].map((y, i) => (
        <line key={`rung${i}`} x1={60 + Math.sin(y * 0.06) * 20} y1={y} x2={100 - Math.sin(y * 0.06) * 20} y2={y} stroke="rgba(34,197,94,0.15)" strokeWidth="1.5" />
      ))}
      {/* Cell */}
      <ellipse cx="260" cy="100" rx="80" ry="60" stroke="rgba(34,197,94,0.20)" strokeWidth="2" fill="rgba(34,197,94,0.03)" />
      <ellipse cx="260" cy="100" rx="25" ry="20" stroke="rgba(132,204,22,0.25)" strokeWidth="1.5" fill="rgba(132,204,22,0.06)" />
      {/* Organelles */}
      <circle cx="220" cy="80" r="8" fill="rgba(34,197,94,0.08)" />
      <circle cx="290" cy="120" r="10" fill="rgba(132,204,22,0.06)" />
      <ellipse cx="240" cy="130" rx="12" ry="6" fill="rgba(34,197,94,0.06)" transform="rotate(-20 240 130)" />
      {/* Mitochondria shape */}
      <ellipse cx="300" cy="80" rx="18" ry="10" stroke="rgba(34,197,94,0.18)" strokeWidth="1.2" fill="rgba(34,197,94,0.04)" transform="rotate(25 300 80)" />
      <path d="M287 78 Q300 72 313 78" stroke="rgba(34,197,94,0.12)" strokeWidth="1" fill="none" />
    </svg>
  )
}

function EnglishSVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Open book */}
      <path d="M200 50 Q140 40 80 55 L80 160 Q140 145 200 155" stroke="rgba(245,158,11,0.25)" strokeWidth="2" fill="rgba(245,158,11,0.03)" />
      <path d="M200 50 Q260 40 320 55 L320 160 Q260 145 200 155" stroke="rgba(245,158,11,0.25)" strokeWidth="2" fill="rgba(245,158,11,0.03)" />
      <line x1="200" y1="50" x2="200" y2="155" stroke="rgba(245,158,11,0.15)" strokeWidth="1.5" />
      {/* Text lines on left page */}
      {[72, 84, 96, 108, 120, 132].map((y, i) => (
        <line key={`tl${i}`} x1="100" y1={y} x2={155 - i * 4} y2={y} stroke="rgba(245,158,11,0.10)" strokeWidth="1.5" strokeLinecap="round" />
      ))}
      {/* Text lines on right page */}
      {[72, 84, 96, 108, 120, 132].map((y, i) => (
        <line key={`tr${i}`} x1="220" y1={y} x2={290 - i * 3} y2={y} stroke="rgba(245,158,11,0.10)" strokeWidth="1.5" strokeLinecap="round" />
      ))}
      {/* Quill pen */}
      <path d="M340 30 L350 120 L345 125 L335 120 Z" stroke="rgba(251,191,36,0.20)" strokeWidth="1.5" fill="rgba(251,191,36,0.04)" />
      <line x1="347" y1="125" x2="360" y2="170" stroke="rgba(245,158,11,0.15)" strokeWidth="1" />
      {/* Quotation marks */}
      <text x="30" y="60" fill="rgba(251,191,36,0.15)" fontSize="36" fontFamily="serif">"</text>
      <text x="360" y="190" fill="rgba(251,191,36,0.12)" fontSize="36" fontFamily="serif">"</text>
      {/* Floating letters */}
      <text x="40" y="170" fill="rgba(245,158,11,0.08)" fontSize="40" fontFamily="serif">A</text>
      <text x="355" y="55" fill="rgba(245,158,11,0.06)" fontSize="30" fontFamily="serif">z</text>
    </svg>
  )
}

function CSSVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Terminal window */}
      <rect x="50" y="30" width="180" height="130" rx="8" stroke="rgba(6,182,212,0.25)" strokeWidth="1.5" fill="rgba(6,182,212,0.03)" />
      <line x1="50" y1="50" x2="230" y2="50" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />
      <circle cx="65" cy="40" r="3" fill="rgba(239,68,68,0.25)" />
      <circle cx="78" cy="40" r="3" fill="rgba(234,179,8,0.25)" />
      <circle cx="91" cy="40" r="3" fill="rgba(34,197,94,0.25)" />
      {/* Code lines */}
      <line x1="65" y1="68" x2="120" y2="68" stroke="rgba(6,182,212,0.20)" strokeWidth="2" strokeLinecap="round" />
      <line x1="75" y1="84" x2="150" y2="84" stroke="rgba(56,189,248,0.15)" strokeWidth="2" strokeLinecap="round" />
      <line x1="75" y1="100" x2="130" y2="100" stroke="rgba(6,182,212,0.12)" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="116" x2="100" y2="116" stroke="rgba(56,189,248,0.18)" strokeWidth="2" strokeLinecap="round" />
      <line x1="65" y1="132" x2="80" y2="132" stroke="rgba(6,182,212,0.15)" strokeWidth="2" strokeLinecap="round" />
      {/* Binary rain */}
      {['01', '10', '11', '00', '01'].map((b, i) => (
        <text key={`bin${i}`} x={280 + i * 22} y={30 + i * 35} fill="rgba(6,182,212,0.10)" fontSize="11" fontFamily="monospace">{b}</text>
      ))}
      {/* Brackets */}
      <text x="270" y="100" fill="rgba(56,189,248,0.20)" fontSize="50" fontFamily="monospace">{'{'}</text>
      <text x="350" y="150" fill="rgba(56,189,248,0.15)" fontSize="50" fontFamily="monospace">{'}'}</text>
      {/* Cursor blink */}
      <rect x="82" y="126" width="8" height="14" fill="rgba(6,182,212,0.25)" />
    </svg>
  )
}

function HistorySVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Classical columns */}
      <rect x="60" y="60" width="16" height="110" fill="rgba(244,63,94,0.08)" rx="2" />
      <rect x="100" y="60" width="16" height="110" fill="rgba(244,63,94,0.08)" rx="2" />
      <rect x="140" y="60" width="16" height="110" fill="rgba(244,63,94,0.08)" rx="2" />
      {/* Pediment */}
      <path d="M45 60 L108 25 L170 60" stroke="rgba(244,63,94,0.20)" strokeWidth="2" fill="rgba(244,63,94,0.03)" />
      <line x1="45" y1="60" x2="170" y2="60" stroke="rgba(244,63,94,0.15)" strokeWidth="2" />
      <line x1="45" y1="170" x2="170" y2="170" stroke="rgba(244,63,94,0.12)" strokeWidth="2" />
      {/* Timeline */}
      <line x1="220" y1="100" x2="380" y2="100" stroke="rgba(244,63,94,0.18)" strokeWidth="2" />
      {[240, 280, 320, 360].map((x, i) => (
        <g key={`tl${i}`}>
          <circle cx={x} cy={100} r="4" fill="rgba(244,63,94,0.20)" />
          <line x1={x} y1={95} x2={x} y2={i % 2 === 0 ? 75 : 125} stroke="rgba(244,63,94,0.12)" strokeWidth="1" />
        </g>
      ))}
      {/* Scroll */}
      <path d="M260 30 Q270 25 270 35 L270 55 Q270 65 260 60 L230 60 Q220 65 220 55 L220 35 Q220 25 230 30 Z" stroke="rgba(251,113,133,0.20)" strokeWidth="1.5" fill="rgba(244,63,94,0.04)" />
      {/* Year labels */}
      <text x="230" y="165" fill="rgba(244,63,94,0.12)" fontSize="11" fontFamily="serif">1776</text>
      <text x="310" y="165" fill="rgba(244,63,94,0.10)" fontSize="11" fontFamily="serif">1945</text>
    </svg>
  )
}

function GeographySVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Globe */}
      <circle cx="200" cy="100" r="75" stroke="rgba(20,184,166,0.25)" strokeWidth="2" fill="rgba(20,184,166,0.03)" />
      <ellipse cx="200" cy="100" rx="75" ry="30" stroke="rgba(20,184,166,0.12)" strokeWidth="1" />
      <ellipse cx="200" cy="100" rx="30" ry="75" stroke="rgba(20,184,166,0.12)" strokeWidth="1" />
      <line x1="125" y1="100" x2="275" y2="100" stroke="rgba(20,184,166,0.10)" strokeWidth="1" />
      <line x1="200" y1="25" x2="200" y2="175" stroke="rgba(20,184,166,0.10)" strokeWidth="1" />
      {/* Latitude lines */}
      <ellipse cx="200" cy="65" rx="65" ry="15" stroke="rgba(6,182,212,0.08)" strokeWidth="1" />
      <ellipse cx="200" cy="135" rx="65" ry="15" stroke="rgba(6,182,212,0.08)" strokeWidth="1" />
      {/* Continents rough shapes */}
      <path d="M170 70 Q180 60 195 65 Q200 75 190 85 Q175 80 170 70Z" fill="rgba(20,184,166,0.12)" />
      <path d="M210 90 Q225 80 235 90 Q230 105 220 110 Q210 105 210 90Z" fill="rgba(20,184,166,0.10)" />
      {/* Compass */}
      <circle cx="60" cy="150" r="20" stroke="rgba(20,184,166,0.18)" strokeWidth="1.5" fill="rgba(20,184,166,0.03)" />
      <line x1="60" y1="133" x2="60" y2="167" stroke="rgba(20,184,166,0.20)" strokeWidth="1.5" />
      <line x1="43" y1="150" x2="77" y2="150" stroke="rgba(20,184,166,0.20)" strokeWidth="1.5" />
      <text x="57" y="143" fill="rgba(20,184,166,0.25)" fontSize="8" fontFamily="sans-serif">N</text>
      {/* Mountain Range */}
      <path d="M300 170 L330 110 L345 140 L365 90 L390 170" stroke="rgba(6,182,212,0.15)" strokeWidth="1.5" fill="rgba(20,184,166,0.04)" />
    </svg>
  )
}

function EconomicsSVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Bar chart */}
      {[{ x: 60, h: 80 }, { x: 95, h: 110 }, { x: 130, h: 65 }, { x: 165, h: 130 }, { x: 200, h: 95 }].map((bar, i) => (
        <rect key={`bar${i}`} x={bar.x} y={170 - bar.h} width="25" height={bar.h} rx="3" fill={`rgba(234,179,8,${0.08 + i * 0.03})`} stroke="rgba(234,179,8,0.15)" strokeWidth="1" />
      ))}
      <line x1="50" y1="170" x2="240" y2="170" stroke="rgba(234,179,8,0.20)" strokeWidth="1.5" />
      <line x1="50" y1="30" x2="50" y2="170" stroke="rgba(234,179,8,0.20)" strokeWidth="1.5" />
      {/* Trend line */}
      <path d="M65 145 L100 120 L135 150 L170 90 L205 130" stroke="rgba(251,191,36,0.30)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Pie chart */}
      <circle cx="320" cy="90" r="50" fill="rgba(234,179,8,0.04)" stroke="rgba(234,179,8,0.15)" strokeWidth="1.5" />
      <path d="M320 90 L320 40 A50 50 0 0 1 363 65 Z" fill="rgba(234,179,8,0.12)" />
      <path d="M320 90 L363 65 A50 50 0 0 1 355 130 Z" fill="rgba(251,191,36,0.08)" />
      {/* Dollar sign */}
      <text x="305" y="175" fill="rgba(234,179,8,0.15)" fontSize="24" fontFamily="serif">$</text>
      <text x="350" y="175" fill="rgba(251,191,36,0.10)" fontSize="16" fontFamily="serif">%</text>
    </svg>
  )
}

function HindiSVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Devanagari-inspired decorative headline bar */}
      <line x1="60" y1="50" x2="340" y2="50" stroke="rgba(249,115,22,0.25)" strokeWidth="3" />
      {/* Letter-like shapes hanging from the bar */}
      {[80, 130, 180, 230, 280].map((x, i) => (
        <g key={`char${i}`}>
          <line x1={x} y1={50} x2={x} y2={90 + (i % 2) * 15} stroke="rgba(249,115,22,0.18)" strokeWidth="2" />
          <circle cx={x} cy={95 + (i % 2) * 15} r={6 + i} stroke="rgba(249,115,22,0.15)" strokeWidth="1.5" fill="rgba(249,115,22,0.04)" />
        </g>
      ))}
      {/* Decorative swirl */}
      <path d="M100 140 Q130 120 160 140 Q190 160 220 140 Q250 120 280 140" stroke="rgba(251,146,60,0.20)" strokeWidth="2" fill="none" />
      {/* Om-like symbol */}
      <text x="310" y="150" fill="rgba(249,115,22,0.12)" fontSize="40" fontFamily="serif">ॐ</text>
      {/* Scroll lines */}
      {[155, 167, 179].map((y, i) => (
        <line key={`tl${i}`} x1="60" y1={y} x2={160 - i * 15} y2={y} stroke="rgba(249,115,22,0.08)" strokeWidth="1.5" strokeLinecap="round" />
      ))}
    </svg>
  )
}

function EnvironmentalSVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Tree */}
      <rect x="95" y="120" width="10" height="50" fill="rgba(132,204,22,0.12)" rx="2" />
      <ellipse cx="100" cy="90" rx="35" ry="40" fill="rgba(132,204,22,0.08)" stroke="rgba(132,204,22,0.18)" strokeWidth="1.5" />
      <ellipse cx="85" cy="100" rx="20" ry="25" fill="rgba(34,197,94,0.06)" />
      <ellipse cx="115" cy="95" rx="22" ry="28" fill="rgba(34,197,94,0.05)" />
      {/* Sun */}
      <circle cx="320" cy="50" r="25" fill="rgba(250,204,21,0.08)" stroke="rgba(250,204,21,0.18)" strokeWidth="1.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return <line key={`ray${i}`} x1={320 + Math.cos(rad) * 30} y1={50 + Math.sin(rad) * 30} x2={320 + Math.cos(rad) * 40} y2={50 + Math.sin(rad) * 40} stroke="rgba(250,204,21,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      })}
      {/* Water wave */}
      <path d="M0 170 Q50 155 100 170 Q150 185 200 170 Q250 155 300 170 Q350 185 400 170" stroke="rgba(56,189,248,0.18)" strokeWidth="2" fill="none" />
      <path d="M0 182 Q50 167 100 182 Q150 197 200 182 Q250 167 300 182 Q350 197 400 182" stroke="rgba(56,189,248,0.12)" strokeWidth="1.5" fill="none" />
      {/* Leaf */}
      <path d="M220 120 Q250 90 280 120 Q250 130 220 120Z" stroke="rgba(132,204,22,0.22)" strokeWidth="1.5" fill="rgba(132,204,22,0.06)" />
      <line x1="220" y1="120" x2="280" y2="120" stroke="rgba(132,204,22,0.15)" strokeWidth="1" />
      {/* Recycling arrows hint */}
      <path d="M260 155 L275 145 L265 140" stroke="rgba(34,197,94,0.18)" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function ArtSVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Palette */}
      <ellipse cx="160" cy="110" rx="80" ry="60" stroke="rgba(232,121,249,0.22)" strokeWidth="2" fill="rgba(232,121,249,0.03)" transform="rotate(-10 160 110)" />
      <circle cx="120" cy="85" r="8" fill="rgba(239,68,68,0.15)" />
      <circle cx="145" cy="70" r="8" fill="rgba(234,179,8,0.15)" />
      <circle cx="175" cy="68" r="8" fill="rgba(34,197,94,0.15)" />
      <circle cx="200" cy="78" r="8" fill="rgba(59,130,246,0.15)" />
      <circle cx="210" cy="100" r="8" fill="rgba(168,85,247,0.15)" />
      {/* Brush */}
      <line x1="280" y1="40" x2="340" y2="140" stroke="rgba(232,121,249,0.20)" strokeWidth="3" strokeLinecap="round" />
      <path d="M335 130 Q350 145 340 160 Q330 170 325 155 Q320 145 335 130Z" fill="rgba(232,121,249,0.15)" />
      {/* Abstract shapes */}
      <circle cx="60" cy="40" r="18" stroke="rgba(168,85,247,0.15)" strokeWidth="1.5" fill="none" />
      <rect x="330" y="20" width="30" height="30" rx="4" stroke="rgba(244,114,182,0.18)" strokeWidth="1.5" fill="none" transform="rotate(15 345 35)" />
      <polygon points="370,160 390,130 350,130" stroke="rgba(232,121,249,0.15)" strokeWidth="1.5" fill="rgba(232,121,249,0.04)" />
      {/* Paint splatter */}
      <circle cx="50" cy="160" r="12" fill="rgba(244,114,182,0.08)" />
      <circle cx="40" cy="148" r="5" fill="rgba(232,121,249,0.10)" />
      <circle cx="65" cy="155" r="4" fill="rgba(168,85,247,0.08)" />
    </svg>
  )
}

function DefaultSVG() {
  return (
    <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 h-full w-full">
      {/* Stack of books */}
      <rect x="140" y="100" width="120" height="16" rx="2" fill="rgba(59,130,246,0.10)" stroke="rgba(59,130,246,0.20)" strokeWidth="1" />
      <rect x="135" y="120" width="130" height="16" rx="2" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.18)" strokeWidth="1" />
      <rect x="145" y="140" width="110" height="16" rx="2" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.15)" strokeWidth="1" />
      <rect x="138" y="160" width="125" height="16" rx="2" fill="rgba(59,130,246,0.06)" stroke="rgba(59,130,246,0.15)" strokeWidth="1" />
      {/* Graduation cap */}
      <path d="M200 30 L260 55 L200 80 L140 55 Z" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.20)" strokeWidth="1.5" />
      <line x1="200" y1="80" x2="200" y2="95" stroke="rgba(59,130,246,0.15)" strokeWidth="1.5" />
      <rect x="185" y="60" width="30" height="10" fill="rgba(59,130,246,0.06)" />
      {/* Stars */}
      {[{ x: 50, y: 40 }, { x: 350, y: 60 }, { x: 70, y: 150 }, { x: 340, y: 160 }].map((pos, i) => (
        <circle key={`star${i}`} cx={pos.x} cy={pos.y} r={2 + i} fill={`rgba(59,130,246,${0.10 + i * 0.03})`} />
      ))}
      {/* Light bulb */}
      <circle cx="330" cy="40" r="15" stroke="rgba(234,179,8,0.18)" strokeWidth="1.5" fill="rgba(234,179,8,0.04)" />
      <line x1="330" y1="55" x2="330" y2="65" stroke="rgba(234,179,8,0.15)" strokeWidth="2" />
      {[323, 330, 337].map((x, i) => (
        <line key={`bl${i}`} x1={x} y1={65 + i * 4} x2={x + 14 - i * 4} y2={65 + i * 4} stroke="rgba(234,179,8,0.12)" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

const svgMap: Record<string, () => JSX.Element> = {
  math: MathSVG,
  mathematics: MathSVG,
  physics: PhysicsSVG,
  chemistry: ChemistrySVG,
  biology: BiologySVG,
  english: EnglishSVG,
  cs: CSSVG,
  history: HistorySVG,
  geography: GeographySVG,
  economics: EconomicsSVG,
  hindi: HindiSVG,
  environmental: EnvironmentalSVG,
  art: ArtSVG,
  civics: DefaultSVG,
  pe: DefaultSVG,
}

export default function SubjectVisual({ subject, className = 'h-40' }: SubjectVisualProps) {
  const theme = getSubjectTheme(subject)
  const SvgIllustration = svgMap[subject.toLowerCase()] ?? DefaultSVG

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient} ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(59,130,246,0.06),transparent_70%)]" />
      <SvgIllustration />
    </div>
  )
}
