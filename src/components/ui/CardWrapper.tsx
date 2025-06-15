import type React from "react"

interface CardWrapperProps {
  children: React.ReactNode
  color?: string
  className?: string
  count?: number
  title?: string
  id?: string
}

export default function CardWrapper({ children, color = "white", className = "", count, title, id }: CardWrapperProps) {
  const colorClasses = {
    white: "bg-white",
    bgDark: "bg-bgDark",
    primary: "bg-primary text-white",
    accent: "bg-accent text-white",
  }

  const bgClass = colorClasses[color as keyof typeof colorClasses] || `bg-${color}`

  return (
    <div
      id={id}
      className={`relative p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${bgClass} ${className}`}
    >
      {/* Number badge */}
      {count !== undefined && count > 0 && (
        <div className="absolute -top-2 -right-2 bg-warn text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse-slow">
          {count}
        </div>
      )}
      {children}
    </div>
  )
}
