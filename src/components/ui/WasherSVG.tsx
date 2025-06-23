export default function WasherSVG({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Washer body - filled */}
      <rect x="10" y="15" width="80" height="70" rx="8" fill="#10b981" stroke="#1A1F36" strokeWidth="2" />

      {/* Control panel */}
      <rect x="15" y="20" width="70" height="15" rx="4" fill="#1A1F36" />

      {/* Control buttons */}
      <circle cx="25" cy="27.5" r="3" fill="#10b981" />
      <circle cx="35" cy="27.5" r="3" fill="#10b981" />
      <circle cx="45" cy="27.5" r="3" fill="#10b981" />

      {/* Display */}
      <rect x="55" y="23" width="25" height="9" rx="2" fill="#10b981" />

      {/* Door/drum */}
      <circle cx="50" cy="60" r="20" fill="#F7FAFC" stroke="#1A1F36" strokeWidth="2" />
      <circle cx="50" cy="60" r="15" fill="none" stroke="#1A1F36" strokeWidth="1" />

      {/* Door handle */}
      <rect x="72" y="58" width="8" height="4" rx="2" fill="#1A1F36" />

      {/* Legs */}
      <rect x="15" y="85" width="4" height="8" fill="#1A1F36" />
      <rect x="81" y="85" width="4" height="8" fill="#1A1F36" />
    </svg>
  )
}
