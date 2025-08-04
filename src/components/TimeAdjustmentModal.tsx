"use client"

import { useState, useEffect } from "react"
import { Machine } from "@/lib/supabase"

interface TimeAdjustmentModalProps {
  machine: Machine
  isOpen: boolean
  onClose: () => void
  onAdjust: (machineId: string, minutes: number) => Promise<{ success: boolean; error: string | null }>
}

export default function TimeAdjustmentModal({ machine, isOpen, onClose, onAdjust }: TimeAdjustmentModalProps) {
  const [minutes, setMinutes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState("")
  const [currentMinutesLeft, setCurrentMinutesLeft] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Ensure component only runs on client to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate current remaining time only on client
  useEffect(() => {
    if (isClient && machine.endAt) {
      const calculateTime = () => {
        const minutesLeft = Math.max(0, Math.ceil((machine.endAt.getTime() - Date.now()) / (1000 * 60)))
        setCurrentMinutesLeft(minutesLeft)
      }
      
      calculateTime()
      // Update every minute
      const interval = setInterval(calculateTime, 60000)
      return () => clearInterval(interval)
    }
  }, [isClient, machine.endAt])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const minutesNum = parseInt(minutes)
    if (isNaN(minutesNum) || minutesNum < 1 || minutesNum > 120) {
      setMessage("Please enter a number between 1-120 minutes")
      return
    }

    setIsProcessing(true)
    setMessage("")

    const result = await onAdjust(machine.id, minutesNum)
    
    if (result.success) {
      setMessage("Timer updated successfully")
      setTimeout(() => {
        onClose()
        setMessage("")
        setMinutes("")
      }, 1500)
    } else {
      setMessage(result.error || "Failed to update timer")
    }
    
    setIsProcessing(false)
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
      setMessage("")
      setMinutes("")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Set Remaining Time</h3>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>{machine.name}</strong>
          </p>
          <p className="text-sm text-blue-700 font-semibold mb-2">
            Current: <span className="font-bold">{isClient ? `${currentMinutesLeft} minutes left` : 'Calculating...'}</span>
          </p>
          <p className="text-sm text-gray-500">
            Set the total time left for this machine.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="minutes" className="block text-sm font-medium text-gray-700 mb-2">
              New time left (minutes):
            </label>
            <input
              type="number"
              id="minutes"
              min="1"
              max="120"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Enter minutes (1-120)"
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a number between 1 and 120 minutes.
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              message.includes("successfully") 
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isProcessing || !minutes}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isProcessing ? "Updating..." : "Update Timer"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
