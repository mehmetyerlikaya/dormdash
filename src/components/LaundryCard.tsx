"use client"

import { QRCodeSVG } from "qrcode.react"
import useSupabaseData from "@/src/hooks/useSupabaseData"
import useCountdown from "@/src/hooks/useCountdown"
import IncidentBadge from "./IncidentBadge"
import CardWrapper from "./ui/CardWrapper"
import WasherSVG from "./ui/WasherSVG"
import DryerOutlineSVG from "./ui/DryerOutlineSVG"

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

    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border-2 border-blue-200">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          {hours}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")} left
        </span>
      </div>
    )
  }

  if (machine.status === "finishedGrace") {
    let graceTimeDisplay = "5:00"

    if (machine.graceEndAt) {
      const minutes = Math.floor(countdown.graceSecondsLeft / 60)
      const seconds = countdown.graceSecondsLeft % 60
      graceTimeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border-2 border-orange-200 animate-pulse-slow">
          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
          Collect items - {graceTimeDisplay}
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

function ActionButton({ machine }: { machine: any }) {
  const handleClick = () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/checkin?machine=${machine.id}`
    window.open(url, "_blank")
  }

  if (machine.status === "free") {
    return (
      <button
        onClick={handleClick}
        className="w-full bg-accent hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      >
        <span className="flex items-center justify-center gap-2">
          <span>▶️</span>
          <span>Start Using</span>
        </span>
      </button>
    )
  }

  if (machine.status === "finishedGrace") {
    return (
      <button
        onClick={handleClick}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] animate-pulse-slow focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        <span className="flex items-center justify-center gap-2">
          <span>✅</span>
          <span>I've Collected Items</span>
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-warn hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-warn focus:ring-offset-2"
    >
      <span className="flex items-center justify-center gap-2">
        <span>⏹️</span>
        <span>Stop Using</span>
      </span>
    </button>
  )
}

export default function LaundryCard() {
  const { laundry, incidents, deleteIncident } = useSupabaseData()

  // Count total incidents for the badge
  const totalIncidents = incidents.length

  // Custom display names for machines
  const getDisplayName = (machine: any) => {
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

  return (
    <CardWrapper color="white" className="border-l-4 border-accent shadow-lg" count={totalIncidents}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-accent rounded-full mr-4"></div>
          <h2 className="text-3xl font-bold text-primary">👕 Laundry Machines</h2>
        </div>
        <div className="text-sm text-gray-600 bg-bgLight px-3 py-1 rounded-full">
          {laundry.filter((m) => m.status === "free").length} of {laundry.length} available
        </div>
      </div>

      {/* Machines Grid - Better responsive layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {laundry.map((machine) => {
          const machineIncidents = incidents.filter((inc) => inc.machineId === machine.id)
          const isWasher = machine.name.toLowerCase().includes("washer")
          const displayName = getDisplayName(machine)

          return (
            <div
              key={machine.id}
              className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-accent/30 relative group"
            >
              {/* Machine incidents badge */}
              {machineIncidents.length > 0 && (
                <div className="absolute -top-3 -right-3 z-10">
                  <IncidentBadge incidents={machineIncidents} onDelete={deleteIncident} />
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
                <div className="text-sm text-gray-500 capitalize">{isWasher ? "Washing Machine" : "Dryer"}</div>
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
                    Cycle ends: {machine.endAt?.toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Action button */}
              <div className="mb-6">
                <ActionButton machine={machine} />
              </div>

              {/* QR Code section */}
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs text-gray-500 text-center mb-2 font-medium">Quick Check-in</div>
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-accent/50 transition-colors duration-200 group-hover:shadow-md">
                    <QRCodeSVG
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/checkin?machine=${machine.id}`}
                      size={64}
                      fgColor="#1A1F36"
                      bgColor="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer info */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>In Use</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span>Please Collect</span>
          </div>
        </div>
      </div>
    </CardWrapper>
  )
}
