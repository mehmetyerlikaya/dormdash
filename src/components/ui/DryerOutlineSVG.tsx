export default function DryerOutlineSVG({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dryer body - outline only */}
      <rect x="10" y="15" width="80" height="70" rx="8" fill="none" stroke="#1A1F36" strokeWidth="2" />

      {/* Control panel */}
      <rect x="15" y="20" width="70" height="15" rx="4" fill="none" stroke="#1A1F36" strokeWidth="1" />

      {/* Control knobs - outline */}
      <circle cx="25" cy="27.5" r="3" fill="none" stroke="#1A1F36" strokeWidth="1" />
      <circle cx="35" cy="27.5" r="3" fill="none" stroke="#1A1F36" strokeWidth="1" />
      <circle cx="45" cy="27.5" r="3" fill="none" stroke="#1A1F36" strokeWidth="1" />

      {/* Display - outline */}
      <rect x="55" y="23" width="25" height="9" rx="2" fill="none" stroke="#1A1F36" strokeWidth="1" />

      {/* Door/drum - outline */}
      <circle cx="50" cy="60" r="20" fill="none" stroke="#1A1F36" strokeWidth="2" />
      <circle cx="50" cy="60" r="15" fill="none" stroke="#1A1F36" strokeWidth="1" />

      {/* Door handle - outline */}
      <rect x="72" y="58" width="8" height="4" rx="2" fill="none" stroke="#1A1F36" strokeWidth="1" />

      {/* Legs - outline */}
      <rect x="15" y="85" width="4" height="8" fill="none" stroke="#1A1F36" strokeWidth="1" />
      <rect x="81" y="85" width="4" height="8" fill="none" stroke="#1A1F36" strokeWidth="1" />

      {/* Vent lines for dryer */}
      <line x1="20" y1="45" x2="30" y2="45" stroke="#1A1F36" strokeWidth="1" />
      <line x1="20" y1="50" x2="30" y2="50" stroke="#1A1F36" strokeWidth="1" />
      <line x1="20" y1="55" x2="30" y2="55" stroke="#1A1F36" strokeWidth="1" />
    </svg>
  )
}
