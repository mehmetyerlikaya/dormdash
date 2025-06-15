"use client"

import { useState, useEffect } from "react"
import useSupabaseData from "@/src/hooks/useSupabaseData"
import { getUserDisplayName, isCurrentUserPost } from "@/src/utils/userIdentification"
import CardWrapper from "./ui/CardWrapper"

export default function HelpMeCard() {
  const { helpMe, addHelpRequest, deleteHelpRequest } = useSupabaseData()
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleRequestHelp = async () => {
    if (!description.trim() || isSubmitting || !isClient) return

    setIsSubmitting(true)
    const user = getUserDisplayName()

    const success = await addHelpRequest(user, description.trim())

    if (success) {
      setDescription("")
    }

    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this help request?")) {
      await deleteHelpRequest(id)
    }
  }

  return (
    <CardWrapper id="help-requests" color="bgDark" className="border-l-4 border-purple-500 h-full" count={helpMe.length}>
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
        <h2 className="text-xl font-bold text-primary">🆘 Help Requests</h2>
      </div>

      <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you need help with..."
          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-20 resize-none mb-3"
          disabled={isSubmitting || !isClient}
          maxLength={500}
        />
        <div className="text-xs text-gray-500 mb-3">{description.length}/500 characters</div>
        <button
          onClick={handleRequestHelp}
          disabled={isSubmitting || !description.trim() || !isClient}
          className={`w-full p-3 rounded-lg text-white font-medium transition-all duration-200 ${
            isSubmitting || !description.trim() || !isClient
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-500 hover:bg-purple-600 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          }`}
        >
          {!isClient ? "Loading..." : isSubmitting ? "Requesting..." : "🙋‍♂️ Request Help"}
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {helpMe.map((entry) => {
          const canDelete = isClient && isCurrentUserPost(entry.user)

          return (
            <div
              key={entry.id}
              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm text-gray-700 mb-2">{entry.description}</div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary">{entry.user}</span>
                      {canDelete && <span className="bg-accent/10 text-accent px-2 py-1 rounded-full">Your post</span>}
                    </div>
                    <span>{entry.timestamp.toLocaleString()}</span>
                  </div>
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
        {helpMe.length === 0 && <div className="text-center text-gray-600 py-4">No help requests yet</div>}
      </div>
    </CardWrapper>
  )
}
