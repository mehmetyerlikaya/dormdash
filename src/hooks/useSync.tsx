"use client"

import { useEffect, useCallback } from "react"

export default function useSync(onSync: () => void) {
  const handleSync = useCallback(() => {
    onSync()
  }, [onSync])

  useEffect(() => {
    // Try BroadcastChannel first
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("dorm-dashboard-sync")

      const handleMessage = (event: MessageEvent) => {
        console.log("BroadcastChannel message received:", event.data)
        handleSync()
      }

      channel.addEventListener("message", handleMessage)

      return () => {
        channel.removeEventListener("message", handleMessage)
        channel.close()
      }
    }
  }, [handleSync])

  useEffect(() => {
    // Always add storage event listener as backup
    if (typeof window !== "undefined") {
      const handleStorageChange = (event: StorageEvent) => {
        console.log("Storage event received:", event.key)
        if (event.key && event.key.startsWith("dorm-")) {
          handleSync()
        }
      }

      window.addEventListener("storage", handleStorageChange)

      return () => {
        window.removeEventListener("storage", handleStorageChange)
      }
    }
  }, [handleSync])

  const broadcast = useCallback(() => {
    console.log("Broadcasting sync event")

    // Try BroadcastChannel
    if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
      try {
        const channel = new BroadcastChannel("dorm-dashboard-sync")
        channel.postMessage({ type: "sync", timestamp: Date.now() })
        channel.close()
      } catch (error) {
        console.error("BroadcastChannel error:", error)
      }
    }

    // Also trigger a custom storage event as backup
    if (typeof window !== "undefined") {
      try {
        // Trigger storage event by updating a sync key
        localStorage.setItem("dorm-sync-trigger", Date.now().toString())
      } catch (error) {
        console.error("Storage sync error:", error)
      }
    }
  }, [])

  return { broadcast }
}
