"use client"

import { useEffect, useState } from "react"
import DashboardGrid from "@/src/components/DashboardGrid"
import LaundryCard from "@/src/components/LaundryCard"
import NoiseCard from "@/src/components/NoiseCard"
import AnnouncementsCard from "@/src/components/AnnouncementsCard"
import HelpMeCard from "@/src/components/HelpMeCard"
import ConnectionTest from "@/src/components/ConnectionTest"
import DebugPanel from "@/src/components/DebugPanel"
import useSupabaseData from "@/src/hooks/useSupabaseData"
import { getUserDisplayName } from "@/src/utils/userIdentification"
import UserSettings from "@/src/components/UserSettings"

export default function Page() {
  const { refreshData, isLoading, error } = useSupabaseData()
  const [userName, setUserName] = useState("User")
  const [isClient, setIsClient] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true)
    setUserName(getUserDisplayName())
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-bgLight flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md border border-gray-200">
          <div className="text-warn text-lg mb-4 font-semibold">Connection Error</div>
          <div className="text-gray-600 mb-4">Unable to connect to the database. Please try again later.</div>
          <button
            onClick={refreshData}
            className="bg-accent hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mb-8 px-4">
        <div className="flex justify-between items-center">
          <div>
            {isClient && (
              <p className="text-gray-600 text-lg">
                Welcome back, <span className="font-semibold text-accent">{userName}</span>!
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Updating...</span>
              </div>
            )}
            <button
              onClick={() => setShowUserSettings(true)}
              className="px-4 py-2 rounded-lg text-sm text-primary border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
            >
              ⚙️ Settings
            </button>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm text-white font-medium transition-all ${
                isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-accent hover:bg-teal-600 shadow-md hover:shadow-lg"
              }`}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status - only shows errors */}
      <ConnectionTest />

      <DashboardGrid>
        {/* Explicitly place LaundryCard first with a key */}
        <LaundryCard key="laundry-machines" />
        <HelpMeCard key="help-requests" />
        <AnnouncementsCard key="community-board" />
        <NoiseCard key="noise-reports" />
      </DashboardGrid>

      {/* User Settings Modal */}
      <UserSettings isOpen={showUserSettings} onClose={() => setShowUserSettings(false)} />

      {/* Debug Panel for development - hidden in production */}
      {process.env.NODE_ENV === "development" && <DebugPanel />}
    </div>
  )
}
