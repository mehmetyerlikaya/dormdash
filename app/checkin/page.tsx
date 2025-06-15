"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import useSupabaseData from "@/src/hooks/useSupabaseData"
import useCountdown from "@/src/hooks/useCountdown"

export default function CheckInPage() {
  const searchParams = useSearchParams()
  const machineId = searchParams.get("machine")
  const { laundry, toggleMachineStatus, reserveMachine, isLoading, refreshData } = useSupabaseData()
  const [machine, setMachine] = useState<any>(null)
  const [actionResult, setActionResult] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [customTime, setCustomTime] = useState("60")
  const [useCustomTime, setUseCustomTime] = useState(false)

  const countdown = useCountdown(machine?.endAt, machine?.graceEndAt)

  useEffect(() => {
    if (!machineId) return

    const foundMachine = laundry.find((m) => m.id === machineId)
    setMachine(foundMachine || null)
  }, [machineId, laundry])

  // Reduced auto-refresh to every 10 seconds to prevent conflicts
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 10000)

    return () => clearInterval(interval)
  }, [refreshData])

  const handleToggle = async () => {
    if (!machineId || isProcessing) return

    setIsProcessing(true)
    setActionResult("")

    let success = false

    if (machine?.status === "free" && useCustomTime) {
      // Use custom time
      success = await reserveMachine(machineId, `${customTime} minutes`)
    } else {
      // Use default toggle
      success = await toggleMachineStatus(machineId)
    }

    if (success) {
      setActionResult("Status updated successfully!")

      // Single refresh after 2 seconds to confirm the change
      setTimeout(() => refreshData(), 2000)
    } else {
      setActionResult("Error updating machine status")
    }

    setIsProcessing(false)
  }

  const getStatusDisplay = () => {
    if (!machine) return ""

    switch (machine.status) {
      case "free":
        return "🟢 Available"
      case "running":
        const hours = Math.floor(countdown.secondsLeft / 3600)
        const minutes = Math.floor((countdown.secondsLeft % 3600) / 60)
        const seconds = countdown.secondsLeft % 60
        return `🔵 In Use - ${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} left`
      case "finishedGrace":
        // Calculate grace period time remaining
        let graceTimeDisplay = "5:00"

        if (machine.graceEndAt) {
          const graceMinutes = Math.floor(countdown.graceSecondsLeft / 60)
          const graceSeconds = countdown.graceSecondsLeft % 60
          graceTimeDisplay = `${graceMinutes}:${graceSeconds.toString().padStart(2, "0")}`
        }

        return `⚠️ Please collect items - ${graceTimeDisplay} left`
      default:
        return "Unknown"
    }
  }

  const getButtonText = () => {
    if (isProcessing) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </div>
      )
    }

    switch (machine?.status) {
      case "free":
        return useCustomTime ? `▶️ Start Using Machine (${customTime} min)` : "▶️ Start Using Machine"
      case "running":
        return "⏹️ Stop Using Machine"
      case "finishedGrace":
        return "✅ I've Collected My Items"
      default:
        return "Update Status"
    }
  }

  const getButtonColor = () => {
    if (isProcessing) return "bg-gray-400 cursor-not-allowed"

    switch (machine?.status) {
      case "free":
        return "bg-blue-500 hover:bg-blue-600"
      case "running":
        return "bg-red-500 hover:bg-red-600"
      case "finishedGrace":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading && !machine) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg">Loading machine data...</div>
        </div>
      </div>
    )
  }

  if (!machineId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="text-red-600 text-lg mb-4">Error</div>
          <div className="text-gray-600">No machine ID provided.</div>
        </div>
      </div>
    )
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="text-red-600 text-lg mb-4">Machine Not Found</div>
          <div className="text-gray-600 mb-4">The requested machine could not be found.</div>
          <button onClick={refreshData} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow text-center max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold mb-4">Machine Check-In</h1>

        <div className="mb-6">
          <div className="text-lg font-medium">{machine.name}</div>
          <div
            className={`text-sm mt-1 font-semibold ${
              machine.status === "free"
                ? "text-green-600"
                : machine.status === "running"
                  ? "text-blue-600"
                  : machine.status === "finishedGrace"
                    ? "text-orange-600"
                    : "text-red-600"
            } ${machine.status === "finishedGrace" ? "animate-pulse" : ""}`}
          >
            Status: {getStatusDisplay()}
          </div>

          {machine.status === "running" && machine.endAt && (
            <div className="text-xs text-gray-500 mt-1">Ends at: {machine.endAt.toLocaleTimeString()}</div>
          )}

          {machine.status === "finishedGrace" && machine.graceEndAt && (
            <div className="text-xs text-orange-500 mt-1">
              Grace period ends at: {machine.graceEndAt.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Custom time input - only show when machine is free */}
        {machine.status === "free" && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="useCustomTime"
                checked={useCustomTime}
                onChange={(e) => setUseCustomTime(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="useCustomTime" className="text-sm">
                Set custom time
              </label>
            </div>

            {useCustomTime && (
              <div className="flex items-center justify-center">
                <input
                  type="number"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  min="1"
                  max="120"
                  className="border rounded p-2 w-20 text-center mr-2"
                />
                <span className="text-sm text-gray-600">minutes</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleToggle}
          disabled={isProcessing}
          className={`w-full p-3 rounded text-white font-medium mb-4 ${getButtonColor()}`}
        >
          {getButtonText()}
        </button>

        <button
          onClick={refreshData}
          disabled={isLoading}
          className="w-full p-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 mb-4"
        >
          Refresh Status
        </button>

        {actionResult && (
          <div
            className={`text-sm mb-4 p-2 rounded ${
              actionResult.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {actionResult}
          </div>
        )}

        {machine.status === "finishedGrace" && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-800">
            <div className="font-medium mb-1">⚠️ Grace Period Active</div>
            <div>
              Please collect your items within the time limit. The machine will become available automatically when the
              grace period ends.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
