"use client"

import { useState } from "react"
import SubscriptionManager from "@/src/lib/subscriptionManager"

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)

  const handleForceCleanup = () => {
    console.log("🧹 Force cleaning up subscriptions...")
    const manager = SubscriptionManager.getInstance()
    manager.forceCleanup()
    alert("Subscriptions cleaned up! Refresh the page to restart.")
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded text-xs"
      >
        Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-sm">Debug Panel</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <button
          onClick={handleForceCleanup}
          className="w-full bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        >
          Force Cleanup Subscriptions
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Reload Page
        </button>

        <div className="text-gray-600">Check console (F12) for detailed logs</div>
      </div>
    </div>
  )
}
