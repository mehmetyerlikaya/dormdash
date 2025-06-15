"use client"

import { useState, useEffect } from "react"
import useSupabaseData from "@/src/hooks/useSupabaseData"
import { getUserDisplayName, isCurrentUserPost } from "@/src/utils/userIdentification"
import CardWrapper from "./ui/CardWrapper"

export default function NoiseCard() {
  const { noise, addNoiseWithDescription, deleteNoise } = useSupabaseData()
  const [canReport, setCanReport] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleReportNoise = async () => {
    if (!canReport || isSubmitting || !description.trim() || !isClient) return

    setIsSubmitting(true)
    const user = getUserDisplayName()

    const success = await addNoiseWithDescription(user, description.trim())

    if (success) {
      setDescription("")
      setShowForm(false)
      setCanReport(false)
      setTimeout(() => setCanReport(true), 2 * 60 * 1000)
    }

    setIsSubmitting(false)
  }

  const handleShowForm = () => {
    setShowForm(true)
    setDescription("")
  }

  const handleCancel = () => {
    setShowForm(false)
    setDescription("")
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this noise report?")) {
      await deleteNoise(id)
    }
  }

  return (
    <CardWrapper color="bgDark" className="border-l-4 border-warn h-full" count={noise.length}>
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 bg-warn rounded-full mr-3"></div>
        <h2 className="text-xl font-bold text-primary">🔊 Noise Reports</h2>
      </div>

      {!showForm ? (
        <button
          onClick={handleShowForm}
          disabled={!canReport || !isClient}
          className={`w-full p-3 rounded-lg mb-4 font-medium transition-all duration-200 ${
            !canReport || !isClient
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-warn hover:bg-red-600 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          }`}
        >
          {!isClient ? "Loading..." : canReport ? "📢 Report Noise Issue" : "Wait 2 minutes"}
        </button>
      ) : (
        <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-primary mb-2">Describe the noise issue:</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the noise issue (required)..."
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent h-20 resize-none"
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">{description.length}/500 characters</div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleReportNoise}
              disabled={isSubmitting || !description.trim() || !isClient}
              className={`flex-1 p-2 rounded-lg font-medium transition-colors ${
                isSubmitting || !description.trim() || !isClient
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-warn hover:bg-red-600 text-white"
              }`}
            >
              {isSubmitting ? "Reporting..." : "Submit Report"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {noise.map((entry) => {
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
                    className="text-warn text-xs hover:text-red-700 ml-2 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                    title="Delete your post"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {noise.length === 0 && <div className="text-center text-gray-600 py-4">No noise reports yet</div>}
      </div>
    </CardWrapper>
  )
}
