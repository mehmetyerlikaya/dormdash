"use client"

import { useState, useEffect } from "react"
import useSupabaseData from "@/src/hooks/useSupabaseData"
// import useLocalData from "@/src/hooks/useLocalData"
import useCountdown from "@/src/hooks/useCountdown"
import IncidentBadge from "./IncidentBadge"
import CardWrapper from "./ui/CardWrapper"
import WasherSVG from "./ui/WasherSVG"
import DryerOutlineSVG from "./ui/DryerOutlineSVG"
import { isRecentlyUpdated, formatTimeAgo, getRecentUpdateClasses } from "@/src/utils/timeUtils"
import { isCurrentUserOwner, hasOwner, getOwnershipDisplay, getOwnershipBadgeClasses, canAdjustTime, getTimeUntilAdjustmentAvailable } from "@/src/utils/machineOwnership"
import { getDeviceUserId } from "@/src/utils/userIdentification"
import TimeAdjustmentModal from "./TimeAdjustmentModal"
import Image from "next/image"

// Component for "Just Updated" badge
function JustUpdatedBadge({ machine }: { machine: any }) {
  const [showBadge, setShowBadge] = useState(false)

  useEffect(() => {
    if (isRecentlyUpdated(machine.updatedAt)) {
      setShowBadge(true)
      // Hide badge after 10 seconds
      const timer = setTimeout(() => setShowBadge(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [machine.updatedAt])

  if (!showBadge) return null

  return (
    <div className="absolute -top-2 -left-2 z-20">
      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse-slow">
        Just Updated
      </div>
    </div>
  )
}

// Component for time ago display
function TimeAgoDisplay({ machine }: { machine: any }) {
  const [timeAgo, setTimeAgo] = useState("")

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatTimeAgo(machine.updatedAt))
    }

    updateTimeAgo()
    // Update every 30 seconds
    const interval = setInterval(updateTimeAgo, 30000)
    return () => clearInterval(interval)
  }, [machine.updatedAt])

  return (
    <div className="text-xs text-gray-500 mt-1 text-center">
      {timeAgo}
    </div>
  )
}

// Component for ownership badge
function OwnershipBadge({ machine }: { machine: any }) {
  if (!hasOwner(machine)) return null

  const ownershipText = getOwnershipDisplay(machine)
  const badgeClasses = getOwnershipBadgeClasses(machine)
  
  // If it's the current user's machine, we'll handle it differently
  if (isCurrentUserOwner(machine)) {
    return null // We'll render this in the parent component for better positioning
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeClasses}`}>
      {ownershipText}
    </div>
  )
}

// Component for time adjustment button
function TimeAdjustButton({ machine, onAdjust }: { machine: any; onAdjust: () => void }) {
  const canAdjust = canAdjustTime(machine)

  // Only show for running machines
  if (machine.status !== "running") {
    return null
  }

  if (canAdjust) {
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={onAdjust}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
          title="Change how much time is left on this machine"
        >
          ⏱️ Change Time
        </button>
        <span className="text-[11px] text-gray-500 mt-1">
          Timer not correct? Change it.
        </span>
      </div>
    )
  }

  // Do not show anything before the change time limit hits
  return null
}

function MachineStatus({ machine }: { machine: any }) {
  const countdown = useCountdown(machine.endAt, machine.graceEndAt)

  if (machine.status === "free") {
    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border-2 border-green-200">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Available
        </span>
      </div>
    )
  }

  if (machine.status === "running" && machine.endAt) {
    const hours = Math.floor(countdown.secondsLeft / 3600)
    const minutes = Math.floor((countdown.secondsLeft % 3600) / 60)
    const seconds = countdown.secondsLeft % 60
    const isOwner = machine.startedByUserId === getDeviceUserId()

    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border-2 border-blue-200">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          {isOwner ? "In Use" : "Busy"} - {hours}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")} left
        </span>
      </div>
    )
  }

  if (machine.status === "finishedGrace") {
    let graceTimeDisplay = "5:00"
    const isOwner = machine.startedByUserId === getDeviceUserId()

    if (machine.graceEndAt) {
      const minutes = Math.floor(countdown.graceSecondsLeft / 60)
      const seconds = countdown.graceSecondsLeft % 60
      graceTimeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border-2 border-orange-200 animate-pulse-slow">
          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
          {isOwner ? "Collect items" : "Busy"} - {graceTimeDisplay}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 border-2 border-gray-200">
        <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
        Unknown
      </span>
    </div>
  )
}

export default function LaundryCard() {
  const { laundry, incidents, deleteIncident, adjustMachineTime } = useSupabaseData()
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<any>(null)

  // Count total incidents for the badge
  const totalIncidents = incidents.length

  // Washer/Dryer metrics
  const washers = laundry.filter(m => m.name.toLowerCase().includes('washer'));
  const dryers = laundry.filter(m => m.name.toLowerCase().includes('dryer'));

  const availableWashers = washers.filter(m => m.status === 'free').length;
  const totalWashers = washers.length;
  const inUseWashers = washers.filter(m => m.status === 'running').length;

  const availableDryers = dryers.filter(m => m.status === 'free').length;
  const totalDryers = dryers.length;
  const inUseDryers = dryers.filter(m => m.status === 'running').length;

  // Handle time adjustment
  const handleAdjustTime = (machine: any) => {
    setSelectedMachine(machine)
    setAdjustModalOpen(true)
  }

  const handleCloseModal = () => {
    setAdjustModalOpen(false)
    setSelectedMachine(null)
  }

  // Custom display names for machines
  const getDisplayName = (machine: any) => {
    const isWasher = machine.name.toLowerCase().includes("washer")
    const numberMatch = machine.name.match(/\d+/)
    const originalNumber = numberMatch ? Number.parseInt(numberMatch[0]) : 0
    if (isWasher) {
      // Map Washer 1-4 to Washer #5-8
      const washerMap: { [key: string]: number } = { '1': 5, '2': 6, '3': 7, '4': 8 }
      const newNumber = washerMap[String(originalNumber)] || originalNumber
      return `Washer #${newNumber}`
    } else {
      // Map Dryer 5-8 to Dryer #1-4
      const dryerMap: { [key: string]: number } = { '5': 1, '6': 2, '7': 3, '8': 4 }
      const newNumber = dryerMap[String(originalNumber)] || originalNumber
      return `Dryer #${newNumber}`
    }
  }

  return (
    <CardWrapper id="laundry-machines" color="white" className="border-l-4 border-accent shadow-lg" count={totalIncidents}>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-accent rounded-full mr-4"></div>
            <h2 className="text-3xl font-bold text-primary">👕 Laundry Machines</h2>
          </div>
        </div>
        {/* Status tags: stacked on mobile, inline on desktop */}
        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-end sm:items-center sm:gap-3">
          {/* Washers available */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-2 rounded-xl shadow-sm w-full sm:w-auto">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-bold text-green-800">{availableWashers}</span>
              <span className="text-sm text-gray-600">of</span>
              <span className="text-lg font-semibold text-gray-800">{totalWashers}</span>
              <span className="text-sm font-medium text-green-700">washers available</span>
            </div>
          </div>
          {/* Dryers available */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 px-4 py-2 rounded-xl shadow-sm w-full sm:w-auto">
            <div className="flex items-center gap-2 justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-bold text-green-800">{availableDryers}</span>
              <span className="text-sm text-gray-600">of</span>
              <span className="text-lg font-semibold text-gray-800">{totalDryers}</span>
              <span className="text-sm font-medium text-green-700">dryers available</span>
            </div>
          </div>
          {/* Washers in use */}
          {inUseWashers > 0 && (
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 w-full sm:w-auto justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-700">{inUseWashers} washers in use</span>
            </div>
          )}
          {/* Dryers in use */}
          {inUseDryers > 0 && (
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 w-full sm:w-auto justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-700">{inUseDryers} dryers in use</span>
            </div>
          )}
          {/* Machines ready (grace period) */}
          {laundry.filter((m) => m.status === "finishedGrace").length > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200 w-full sm:w-auto justify-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-orange-700">
                {laundry.filter((m) => m.status === "finishedGrace").length} ready
              </span>
            </div>
          )}
        </div>
      </div>
      {/* Machines Grid - Better responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {laundry.map((machine) => {
          const machineIncidents = incidents.filter((inc) => inc.machineId === machine.id)
          const isWasher = machine.name.toLowerCase().includes("washer")
          const displayName = getDisplayName(machine)
          const recentUpdateClasses = getRecentUpdateClasses(machine.updatedAt)

          return (
            <div
              key={machine.id}
              className={`bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-accent/30 relative group ${recentUpdateClasses}`}
            >
              {/* Just Updated badge */}
              <JustUpdatedBadge machine={machine} />

              {/* Machine incidents badge */}
              {machineIncidents.length > 0 && (
                <div className="absolute -top-3 -right-3 z-10">
                  <IncidentBadge incidents={machineIncidents} onDelete={deleteIncident} />
                </div>
              )}
              
              {/* "Your Machine" badge in top right corner when active */}
              {isCurrentUserOwner(machine) && (machine.status === "running" || machine.status === "finishedGrace") && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                    Your Machine
                  </div>
                </div>
              )}

              {/* Machine illustration */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-bgLight rounded-xl group-hover:bg-accent/10 transition-colors duration-300">
                  {isWasher ? <WasherSVG className="w-20 h-20" /> : <DryerOutlineSVG className="w-20 h-20" />}
                </div>
              </div>

              {/* Machine name */}
              <div className="text-center mb-4">
                <h3 className="font-bold text-primary text-xl mb-1">{displayName}</h3>
                {/* <TimeAgoDisplay machine={machine} /> */}
                {/* Ownership badge */}
                <div className="mt-2">
                  <OwnershipBadge machine={machine} />
                </div>
              </div>

              {/* Status section */}
              <div className="mb-6">
                <MachineStatus machine={machine} />

                {/* Grace period additional info */}
                {machine.status === "finishedGrace" && machine.graceEndAt && (
                  <div className="text-xs text-orange-600 text-center mt-2 bg-orange-50 py-2 px-3 rounded-lg">
                    Grace ends: {machine.graceEndAt?.toLocaleTimeString()}
                  </div>
                )}

                {/* Running machine end time */}
                {machine.status === "running" && machine.endAt && (
                  <div className="text-xs text-blue-600 text-center mt-2 bg-blue-50 py-2 px-3 rounded-lg">
                    Will end: {machine.endAt?.toLocaleTimeString()}
                  </div>
                )}

                {/* Time adjustment button */}
                <div className="text-center mt-3">
                  <TimeAdjustButton
                    machine={machine}
                    onAdjust={() => handleAdjustTime(machine)}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Time Adjustment Modal */}
      {selectedMachine && (
        <TimeAdjustmentModal
          machine={selectedMachine}
          isOpen={adjustModalOpen}
          onClose={handleCloseModal}
          onAdjust={adjustMachineTime}
        />
      )}
    </CardWrapper>
  )
}