"use client"

import { useState, useEffect } from "react"
import { getUserDisplayName, setUserDisplayName, getDeviceUserId } from "@/src/utils/userIdentification"

interface UserSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserSettings({ isOpen, onClose }: UserSettingsProps) {
  const [displayName, setDisplayName] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (isClient) {
      setDisplayName(getUserDisplayName())
      setDeviceId(getDeviceUserId())
    }
  }, [isClient])

  const handleSave = () => {
    if (displayName.trim()) {
      setUserDisplayName(displayName.trim())
      onClose()
      window.location.reload() // Refresh to update all components
    }
  }

  if (!isOpen || !isClient) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">User Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Default Username</label>
            <input
              type="text"
              value={deviceId}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-bgDark text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">Nickname (change it)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your nickname"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">This name will appear on your posts (max 20 characters)</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!displayName.trim()}
            className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
              !displayName.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-accent hover:bg-teal-600 text-white"
            }`}
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
