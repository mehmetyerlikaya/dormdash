"use client"

import { useState } from "react"
import useSupabaseData from "@/src/hooks/useSupabaseData"

export default function SubletCard() {
  const { sublets, addSublet, deleteSublet } = useSupabaseData()
  const [duration, setDuration] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePostSublet = async () => {
    if (!duration.trim() || isSubmitting) return

    setIsSubmitting(true)
    const user = `User${Math.floor(Math.random() * 1000)}`

    const success = await addSublet(user, duration.trim())

    if (success) {
      setDuration("")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Sublets</h2>

      <div className="mb-4">
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (e.g., 2 months)"
          className="w-full p-2 border rounded mb-2"
          disabled={isSubmitting}
        />
        <button
          onClick={handlePostSublet}
          disabled={isSubmitting}
          className={`w-full p-2 rounded text-white ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isSubmitting ? "Posting..." : "Post Sublet"}
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sublets.map((entry) => (
          <div key={entry.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <div className="text-sm font-medium">{entry.duration}</div>
              <div className="text-xs text-gray-500">
                {entry.user} - {entry.timestamp.toLocaleString()}
              </div>
            </div>
            <button onClick={() => deleteSublet(entry.id)} className="text-red-500 text-xs hover:text-red-700">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
