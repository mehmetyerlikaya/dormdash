"use client"

import { useState, useEffect, useCallback } from "react"
import parseDuration from "@/src/utils/parseDuration"
import useSharedState from "./useSharedState"

export interface Machine {
  id: string
  name: string
  status: "free" | "running" | "finishedGrace"
  startAt?: Date
  endAt?: Date
}

export interface NoiseEntry {
  id: string
  user: string
  timestamp: Date
  lastReported?: Date
}

export interface SubletEntry {
  id: string
  user: string
  duration: string
  timestamp: Date
}

export interface HelpMeEntry {
  id: string
  user: string
  description: string
  timestamp: Date
}

export interface Incident {
  id: string
  machineId: string
  timestamp: Date
  type: "overtime"
}

const HARDCODED_MACHINES: Machine[] = [
  { id: "washer1", name: "Washer 1", status: "free" },
  { id: "washer2", name: "Washer 2", status: "free" },
  { id: "washer3", name: "Washer 3", status: "free" },
  { id: "washer4", name: "Washer 4", status: "free" },
  { id: "dryer1", name: "Dryer 1", status: "free" },
  { id: "dryer2", name: "Dryer 2", status: "free" },
  { id: "dryer3", name: "Dryer 3", status: "free" },
  { id: "dryer4", name: "Dryer 4", status: "free" },
]

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    const result = item
      ? JSON.parse(item, (key, value) => {
          if (key.endsWith("At") || key === "timestamp" || key === "lastReported") {
            return value ? new Date(value) : value
          }
          return value
        })
      : defaultValue
    console.log(`Loaded from localStorage [${key}]:`, result)
    return result
  } catch (error) {
    console.error(`Error loading from localStorage [${key}]:`, error)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
    console.log(`✅ Saved to localStorage [${key}]:`, value)
  } catch (error) {
    console.error(`❌ Error saving to localStorage [${key}]:`, error)
  }
}

function pruneExpired<T extends { timestamp: Date }>(items: T[], maxAgeMs: number): T[] {
  const now = new Date()
  return items.filter((item) => now.getTime() - item.timestamp.getTime() < maxAgeMs)
}

export default function useLocalData() {
  const [laundry, setLaundryState] = useState<Machine[]>(HARDCODED_MACHINES)
  const [noise, setNoiseState] = useState<NoiseEntry[]>([])
  const [sublets, setSubletsState] = useState<SubletEntry[]>([])
  const [helpMe, setHelpMeState] = useState<HelpMeEntry[]>([])
  const [incidents, setIncidentsState] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { triggerSync, addSyncListener, lastSync } = useSharedState()

  // Aggressive data loading function
  const loadAllData = useCallback(() => {
    console.log("🔄 Loading all data from localStorage...")
    setIsLoading(true)

    const loadedLaundry = loadFromStorage("dorm-laundry", HARDCODED_MACHINES)
    const loadedNoise = loadFromStorage("dorm-noise", [])
    const loadedSublets = loadFromStorage("dorm-sublets", [])
    const loadedHelpMe = loadFromStorage("dorm-helpme", [])
    const loadedIncidents = loadFromStorage("dorm-incidents", [])

    // Prune expired entries
    const prunedHelpMe = pruneExpired(loadedHelpMe, 24 * 60 * 60 * 1000)
    const prunedSublets = pruneExpired(loadedSublets, 7 * 24 * 60 * 60 * 1000)

    setLaundryState(loadedLaundry)
    setNoiseState(loadedNoise)
    setSubletsState(prunedSublets)
    setHelpMeState(prunedHelpMe)
    setIncidentsState(loadedIncidents)

    // Save pruned data back
    if (prunedHelpMe.length !== loadedHelpMe.length) {
      saveToStorage("dorm-helpme", prunedHelpMe)
    }
    if (prunedSublets.length !== loadedSublets.length) {
      saveToStorage("dorm-sublets", prunedSublets)
    }

    setIsLoading(false)
    console.log("✅ Data loading complete")
  }, [])

  // Set up sync listener
  useEffect(() => {
    const cleanup = addSyncListener(loadAllData)
    return cleanup
  }, [addSyncListener, loadAllData])

  // Initial data load
  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Aggressive polling every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Polling for changes...")
      loadAllData()
    }, 3000)

    return () => clearInterval(interval)
  }, [loadAllData])

  // Enhanced setters with immediate sync
  const setLaundry = useCallback(
    (machines: Machine[]) => {
      console.log("🔧 Updating laundry machines:", machines)
      setLaundryState(machines)
      saveToStorage("dorm-laundry", machines)
      triggerSync()
    },
    [triggerSync],
  )

  const setNoise = useCallback(
    (entries: NoiseEntry[]) => {
      setNoiseState(entries)
      saveToStorage("dorm-noise", entries)
      triggerSync()
    },
    [triggerSync],
  )

  const setSublets = useCallback(
    (entries: SubletEntry[]) => {
      setSubletsState(entries)
      saveToStorage("dorm-sublets", entries)
      triggerSync()
    },
    [triggerSync],
  )

  const setHelpMe = useCallback(
    (entries: HelpMeEntry[]) => {
      setHelpMeState(entries)
      saveToStorage("dorm-helpme", entries)
      triggerSync()
    },
    [triggerSync],
  )

  const setIncidents = useCallback(
    (entries: Incident[]) => {
      setIncidentsState(entries)
      saveToStorage("dorm-incidents", entries)
      triggerSync()
    },
    [triggerSync],
  )

  // Enhanced toggle with immediate feedback
  const toggleMachineStatus = useCallback(
    (id: string) => {
      console.log("🔄 Toggling machine status for:", id)
      const machine = laundry.find((m) => m.id === id)
      if (!machine) {
        console.error("❌ Machine not found:", id)
        return false
      }

      const updatedMachines = laundry.map((m) => {
        if (m.id === id) {
          if (m.status === "free") {
            const startAt = new Date()
            const endAt = new Date(startAt.getTime() + 60 * 60 * 1000) // 1 hour
            console.log("▶️ Starting machine:", id, "until:", endAt.toLocaleTimeString())
            return { ...m, status: "running" as const, startAt, endAt }
          } else {
            console.log("⏹️ Stopping machine:", id)
            return { ...m, status: "free" as const, startAt: undefined, endAt: undefined }
          }
        }
        return m
      })

      setLaundry(updatedMachines)
      return true
    },
    [laundry, setLaundry],
  )

  const reserveMachine = useCallback(
    (id: string, durationStr: string) => {
      try {
        const durationSeconds = parseDuration(durationStr)
        const startAt = new Date()
        const endAt = new Date(startAt.getTime() + durationSeconds * 1000)

        const updatedMachines = laundry.map((machine) =>
          machine.id === id ? { ...machine, status: "running" as const, startAt, endAt } : machine,
        )

        setLaundry(updatedMachines)
        return true
      } catch (error) {
        console.error("Failed to reserve machine:", error)
        return false
      }
    },
    [laundry, setLaundry],
  )

  // Delete functions
  const deleteNoise = useCallback(
    (id: string) => {
      const updated = noise.filter((entry) => entry.id !== id)
      setNoise(updated)
    },
    [noise, setNoise],
  )

  const deleteSublet = useCallback(
    (id: string) => {
      const updated = sublets.filter((entry) => entry.id !== id)
      setSublets(updated)
    },
    [sublets, setSublets],
  )

  const deleteHelpMe = useCallback(
    (id: string) => {
      const updated = helpMe.filter((entry) => entry.id !== id)
      setHelpMe(updated)
    },
    [helpMe, setHelpMe],
  )

  const deleteIncident = useCallback(
    (id: string) => {
      const updated = incidents.filter((entry) => entry.id !== id)
      setIncidents(updated)
    },
    [incidents, setIncidents],
  )

  return {
    laundry,
    noise,
    sublets,
    helpMe,
    incidents,
    lastSync,
    isLoading,
    setLaundry,
    setNoise,
    setSublets,
    setHelpMe,
    setIncidents,
    reserveMachine,
    toggleMachineStatus,
    deleteNoise,
    deleteSublet,
    deleteHelpMe,
    deleteIncident,
    refreshData: loadAllData,
  }
}
