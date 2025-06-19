"use client"

import { useState, useEffect } from "react"
import useSupabaseData from "@/src/hooks/useSupabaseData"
import { getUserDisplayName, isCurrentUserPost } from "@/src/utils/userIdentification"
import CardWrapper from "./ui/CardWrapper"

export default function SubletCard() {
  const { announcements, addAnnouncement, deleteAnnouncement } = useSupabaseData()
  const [duration, setDuration] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handlePostSublet = async () => {
    if (!duration.trim() || isSubmitting || !isClient) return

    setIsSubmitting(true)
    const user = getUserDisplayName()

    const success = await addAnnouncement(
      user,
      "Sublet Available",
      duration.trim(),
      "sublet"
    )

    if (success) {
      setDuration("")
    }

    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sublet?")) {
      await deleteAnnouncement(id)
    }
  }

  // Filter announcements to only show sublets
  const sublets = announcements.filter(a => a.type === "sublet")

  return (
    <CardWrapper id="sublets" color="bgDark" className="border-l-4 border-accent h-[600px]" count={sublets.length}>
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 bg-accent rounded-full mr-3"></div>
        <h2 className="text-xl font-bold text-primary">🏠 Sublets</h2>
      </div>

      <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-sm font-medium text-primary mb-2">Duration:</div>
        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g., 2 months, Summer 2024, etc."
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
          disabled={isSubmitting}
          maxLength={100}
        />
        <div className="text-xs text-gray-500 mt-1">{duration.length}/100 characters</div>
        <button
          onClick={handlePostSublet}
          disabled={isSubmitting || !duration.trim() || !isClient}
          className={`w-full mt-3 p-2 rounded-lg font-medium transition-colors ${
            isSubmitting || !duration.trim() || !isClient
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-accent hover:bg-teal-600 text-white"
          }`}
        >
          {isSubmitting ? "Posting..." : "Post Sublet"}
        </button>
      </div>

      <div className="space-y-3">
        {sublets.map((entry) => {
          const canDelete = isClient && isCurrentUserPost(entry.user)

          return (
            <div
              key={entry.id}
              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-medium text-primary">{entry.user}</div>
                    {canDelete && (
                      <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">Your post</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{entry.description}</div>
                  <div className="text-xs text-gray-500 mt-1">{entry.timestamp.toLocaleString()}</div>
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-accent text-xs hover:text-teal-700 ml-2 px-2 py-1 hover:bg-teal-50 rounded transition-colors"
                    title="Delete your post"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {sublets.length === 0 && <div className="text-center text-gray-600 py-4">No sublets available</div>}
      </div>
    </CardWrapper>
  )
}
