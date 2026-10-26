// A simple original F1-style car drawing (no real team logos), red and black livery.
export default function CarSvg({ width = 420 }) {
  return (
    <svg width={width} viewBox="0 0 420 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <path d="M20 78 L120 66 L190 58 L250 50 L330 56 L395 70 L398 82 L20 86 Z" fill="#0d0d10" stroke="#e10600" strokeWidth="2" />
      {/* red stripe */}
      <path d="M60 74 L360 68 L362 74 L60 80 Z" fill="#e10600" />
      {/* cockpit */}
      <path d="M215 52 L250 40 L275 52 Z" fill="#1c1c22" stroke="#e10600" strokeWidth="1.5" />
      {/* front wing */}
      <path d="M385 84 L412 86 L412 92 L370 92 Z" fill="#e10600" />
      {/* rear wing */}
      <rect x="14" y="44" width="30" height="6" fill="#e10600" />
      <rect x="22" y="44" width="4" height="34" fill="#0d0d10" stroke="#e10600" />
      {/* wheels */}
      <circle cx="95" cy="92" r="21" fill="#050506" stroke="#2a2a33" strokeWidth="3" />
      <circle cx="95" cy="92" r="8" fill="#e10600" />
      <circle cx="320" cy="92" r="19" fill="#050506" stroke="#2a2a33" strokeWidth="3" />
      <circle cx="320" cy="92" r="7" fill="#e10600" />
    </svg>
  )
}
