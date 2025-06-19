"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import useSupabaseData from "@/src/hooks/useSupabaseData"
import useCountdown from "@/src/hooks/useCountdown"
import { canAdjustTime, getOwnershipDisplay, getTimeUntilAdjustmentAvailable, isCurrentUserOwner } from "@/src/utils/machineOwnership"
import { getDeviceUserId } from "@/src/utils/userIdentification"
import type { Machine } from "@/src/hooks/useSupabaseData"

export default function CheckInPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const machineId = searchParams.get("machine")
  const { laundry, toggleMachineStatus, reserveMachine, adjustMachineTime, isLoading, error } = useSupabaseData()
  const [actionResult, setActionResult] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [customTime, setCustomTime] = useState("60")
  const [adjustTime, setAdjustTime] = useState("")
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [adjustResult, setAdjustResult] = useState("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Find the machine we care about
  const machine = laundry.find((m) => m.id === machineId)
  const countdown = useCountdown(machine?.endAt, machine?.graceEndAt)

  const handleToggle = async () => {
    if (!machineId || isProcessing) return

    // Validate time input for free machines
    if (machine?.status === "free") {
      const timeNum = parseInt(customTime)
      if (isNaN(timeNum) || timeNum < 15 || timeNum > 180) {
        setActionResult("Please enter a valid time limit")
        return
      }
    }

    setIsProcessing(true)
    setActionResult("")

    let success = false

    if (machine?.status === "free") {
      // Always use custom time for starting machines
      success = await reserveMachine(machineId, `${customTime} minutes`)
    } else {
      // Use default toggle for stopping/collecting
      success = await toggleMachineStatus(machineId)
    }

    if (success) {
      setActionResult("Status updated successfully!")
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

    const currentUserId = getDeviceUserId()
    const isOwner = machine?.startedByUserId === currentUserId

    switch (machine?.status) {
      case "free":
        return `▶️ Start Using Machine (${customTime} min)`
      case "running":
        return isOwner ? "⏹️ Stop Using Machine" : "🚫 Machine in Use by Another User"
      case "finishedGrace":
        return isOwner ? "✅ I've Collected My Items" : "🚫 Another User's Items"
      default:
        return "Update Status"
    }
  }

  const getButtonColor = () => {
    if (isProcessing) return "bg-gray-400 cursor-not-allowed"

    const currentUserId = getDeviceUserId()
    const isOwner = machine?.startedByUserId === currentUserId

    switch (machine?.status) {
      case "free":
        return "bg-blue-500 hover:bg-blue-600"
      case "running":
        return isOwner ? "bg-red-500 hover:bg-red-600" : "bg-gray-400 cursor-not-allowed"
      case "finishedGrace":
        return isOwner ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
      default:
        return "bg-gray-500"
    }
  }

  const isButtonDisabled = () => {
    if (isProcessing) return true

    const currentUserId = getDeviceUserId()
    const isOwner = machine?.startedByUserId === currentUserId

    // Disable if machine is busy and user is not the owner
    if ((machine?.status === "running" || machine?.status === "finishedGrace") && !isOwner) {
      return true
    }

    return false
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  const handleAdjustTime = async () => {
    if (!machineId || isAdjusting) return

    const minutesNum = parseInt(adjustTime)
    if (isNaN(minutesNum) || minutesNum < 1 || minutesNum > 120) {
      setAdjustResult("Please enter a number between 1-120 minutes")
      return
    }

    setIsAdjusting(true)
    setAdjustResult("")

    const result = await adjustMachineTime(machineId, minutesNum)

    if (result.success) {
      setAdjustResult("Timer updated successfully")
      setAdjustTime("")
    } else {
      setAdjustResult(result.error || "Failed to update timer")
    }

    setIsAdjusting(false)
  }

  // Custom display names for machines (same logic as LaundryCard)
  const getDisplayName = (machine: Machine) => {
    if (!machine) return ""

    const isWasher = machine.name.toLowerCase().includes("washer")

    if (isWasher) {
      // Extract number from washer name (e.g., "Washer 1" -> "1")
      const numberMatch = machine.name.match(/\d+/)
      const number = numberMatch ? numberMatch[0] : ""
      return `Washer ${number}`
    } else {
      // For dryers, use "Dryer 5" through "Dryer 8" based on original number
      const numberMatch = machine.name.match(/\d+/)
      const originalNumber = numberMatch ? Number.parseInt(numberMatch[0]) : 0
      const newNumber = originalNumber + 4 // Map 1->5, 2->6, 3->7, 4->8
      return `Dryer ${newNumber}`
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg">Getting machine information...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  if (!machineId || !machine) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <div className="text-lg text-red-600">Machine not found</div>
          <button
            onClick={handleBackToHome}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBackToHome}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">Machine Check-in</h1>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>

        <div className="mb-6">
          <div className="text-lg font-medium">{getDisplayName(machine)}</div>
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

          {/* Ownership display */}
          {machine.startedByUserId && (
            <div className="text-xs text-gray-600 mt-2">
              {getOwnershipDisplay(machine)}
            </div>
          )}

          {/* Warning for busy machines */}
          {(machine.status === "running" || machine.status === "finishedGrace") && !isCurrentUserOwner(machine) && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm font-medium text-yellow-800 mb-1">⚠️ Machine Unavailable</div>
              <div className="text-xs text-yellow-700">
                This machine is currently being used by another user. Only they can stop it or collect their items.
              </div>
            </div>
          )}
        </div>

        {/* Time limit input - always show when machine is free */}
        {machine.status === "free" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              min="15"
              max="180"
              className="w-full border rounded p-2 text-center"
            />
            <div className="text-xs text-gray-500 mt-1">
              Enter 15-180 minutes
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleToggle}
          disabled={isButtonDisabled()}
          className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors ${getButtonColor()}`}
        >
          {getButtonText()}
        </button>

        {/* Action result message */}
        {actionResult && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">{actionResult}</div>
          </div>
        )}

        {/* Time adjustment section - only for running machines owned by current user */}
        {machine.status === "running" && isCurrentUserOwner(machine) && (
          <>
            {canAdjustTime(machine) ? (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">Adjust Timer</div>
                <div className="text-xs text-blue-600 mb-3">
                  Current: {machine.endAt ? Math.max(0, Math.ceil((machine.endAt.getTime() - Date.now()) / (1000 * 60))) : 0} minutes remaining
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    value={adjustTime}
                    onChange={(e) => setAdjustTime(e.target.value)}
                    placeholder="Minutes (1-120)"
                    min="1"
                    max="120"
                    disabled={isAdjusting}
                    className="flex-1 border rounded p-2 text-center text-sm"
                  />
                  <button
                    onClick={handleAdjustTime}
                    disabled={isAdjusting || !adjustTime}
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {isAdjusting && (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isAdjusting ? "Updating..." : "Update Timer"}
                  </button>
                </div>

                {adjustResult && (
                  <div className={`text-xs ${adjustResult.includes("success") ? "text-green-600" : "text-red-600"}`}>
                    {adjustResult}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm font-medium text-gray-800 mb-1">⏱️ Time Adjustment</div>
                <div className="text-xs text-gray-600">
                  Available in {getTimeUntilAdjustmentAvailable(machine)} minutes
                </div>
              </div>
            )}
          </>
        )}

        {/* QR Code for sharing */}
        <div className="mt-8 flex flex-col items-center">
          <div className="text-sm text-gray-600 mb-2">Share this machine</div>
          <div className="bg-white p-2 rounded-lg shadow">
            <QRCodeSVG
              value={`${typeof window !== "undefined" ? window.location.href : ""}`}
              size={128}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
