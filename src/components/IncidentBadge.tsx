"use client"

import { useState } from "react"
import type { Incident } from "@/src/hooks/useLocalData"

interface IncidentBadgeProps {
  incidents: Incident[]
  onDelete: (id: string) => void
}

export default function IncidentBadge({ incidents, onDelete }: IncidentBadgeProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  if (incidents.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`bg-warn text-white text-xs px-2 py-1 rounded-full font-medium hover:bg-red-600 transition-colors ${
          incidents.length > 0 ? "animate-pulse-slow" : ""
        }`}
      >
        {incidents.length}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48 z-10">
          <div className="text-sm font-medium mb-2 text-primary">Incidents</div>
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
            >
              <div className="text-xs text-gray-600">
                {incident.type} - {incident.timestamp.toLocaleTimeString()}
              </div>
              <button
                onClick={() => {
                  onDelete(incident.id)
                  setShowDropdown(false)
                }}
                className="text-warn text-xs hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
