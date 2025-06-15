"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/src/lib/supabase"

export default function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "connected" | "error">("testing")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    let isMounted = true

    const testConnection = async () => {
      try {
        // Test basic connection by fetching machines
        const { data, error } = await supabase.from("machines").select("*").limit(10)

        if (error) {
          throw error
        }

        if (!isMounted) return
        setConnectionStatus("connected")
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : "Unknown error")
        setConnectionStatus("error")
      }
    }

    testConnection()

    return () => {
      isMounted = false
    }
  }, [])

  if (connectionStatus === "testing") {
    return (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-800">Connecting to database...</span>
        </div>
      </div>
    )
  }

  if (connectionStatus === "error") {
    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800">Unable to connect to database. Please try again later.</div>
      </div>
    )
  }

  // If connected, don't show anything to end users
  return null
}
