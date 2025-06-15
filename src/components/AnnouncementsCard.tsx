"use client"

import { useState, useEffect } from "react"
import useSupabaseData from "@/src/hooks/useSupabaseData"
import { getUserDisplayName, isCurrentUserPost } from "@/src/utils/userIdentification"
import CardWrapper from "./ui/CardWrapper"

const ANNOUNCEMENT_TYPES = [
  { value: "sublet", label: "🏠 Sublet", color: "bg-blue-100 text-blue-800" },
  { value: "selling", label: "💰 Selling", color: "bg-green-100 text-green-800" },
  { value: "free", label: "🎁 Free Stuff", color: "bg-purple-100 text-purple-800" },
  { value: "wanted", label: "🔍 Looking For", color: "bg-orange-100 text-orange-800" },
  { value: "event", label: "🎉 Event", color: "bg-pink-100 text-pink-800" },
  { value: "general", label: "📢 General", color: "bg-gray-100 text-gray-800" },
]

export default function AnnouncementsCard() {
  const { announcements, addAnnouncement, deleteAnnouncement } = useSupabaseData()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handlePostAnnouncement = async () => {
    if (!title.trim() || !description.trim() || isSubmitting || !isClient) return

    setIsSubmitting(true)
    const user = getUserDisplayName()

    const success = await addAnnouncement(user, title.trim(), description.trim(), type)

    if (success) {
      setTitle("")
      setDescription("")
      setType("general")
      setShowForm(false)
    }

    setIsSubmitting(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setTitle("")
    setDescription("")
    setType("general")
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      await deleteAnnouncement(id)
    }
  }

  const getTypeInfo = (typeValue: string) => {
    return ANNOUNCEMENT_TYPES.find((t) => t.value === typeValue) || ANNOUNCEMENT_TYPES[5]
  }

  return (
    <CardWrapper color="bgDark" className="border-l-4 border-accent h-full" count={announcements.length}>
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 bg-accent rounded-full mr-3"></div>
        <h2 className="text-xl font-bold text-primary">📋 Community Board</h2>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          disabled={!isClient}
          className={`w-full p-3 rounded-lg mb-4 font-medium transition-all duration-200 ${
            !isClient
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-accent hover:bg-teal-600 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          }`}
        >
          {!isClient ? "Loading..." : "➕ Post Announcement"}
        </button>
      ) : (
        <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-primary block mb-1">Category:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                disabled={isSubmitting}
              >
                {ANNOUNCEMENT_TYPES.map((typeOption) => (
                  <option key={typeOption.value} value={typeOption.value}>
                    {typeOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-primary block mb-1">Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent"
                disabled={isSubmitting}
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1">{title.length}/100 characters</div>
            </div>

            <div>
              <label className="text-sm font-medium text-primary block mb-1">Description:</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-accent focus:border-accent h-20 resize-none"
                disabled={isSubmitting}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">{description.length}/500 characters</div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handlePostAnnouncement}
              disabled={isSubmitting || !title.trim() || !description.trim() || !isClient}
              className={`flex-1 p-2 rounded-lg font-medium transition-colors ${
                isSubmitting || !title.trim() || !description.trim() || !isClient
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-accent hover:bg-teal-600 text-white"
              }`}
            >
              {isSubmitting ? "Posting..." : "Post"}
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
        {announcements.map((entry) => {
          const typeInfo = getTypeInfo(entry.type)
          const canDelete = isClient && isCurrentUserPost(entry.user)

          return (
            <div
              key={entry.id}
              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full ${typeInfo.color}`}>{typeInfo.label}</span>
                  {canDelete && (
                    <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">Your post</span>
                  )}
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-warn text-xs hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                    title="Delete your post"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="font-medium text-primary mb-1">{entry.title}</div>
              <div className="text-sm text-gray-700 mb-2">{entry.description}</div>

              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{entry.user}</span>
                <span>{entry.timestamp.toLocaleString()}</span>
              </div>
            </div>
          )
        })}
        {announcements.length === 0 && <div className="text-center text-gray-600 py-4">No announcements yet</div>}
      </div>
    </CardWrapper>
  )
}
