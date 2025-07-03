"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/src/lib/supabase"
import type { Database } from "@/src/lib/supabase"
import SubscriptionManager from "@/src/lib/subscriptionManager"
import MachineStatusManager from "@/src/lib/machineStatusManager"
import parseDuration from "@/src/utils/parseDuration"
import { getDeviceUserId } from "@/src/utils/userIdentification"

// Type definitions
export interface Machine {
  id: string
  name: string
  status: "free" | "running" | "finishedGrace"
  startAt?: Date
  endAt?: Date
  graceEndAt?: Date
  updatedAt: Date
  startedByUserId?: string
  startedByDeviceFingerprint?: string
}

export interface NoiseEntry {
  id: string
  user: string
  description: string
  timestamp: Date
  lastReported: Date
}

export interface AnnouncementEntry {
  id: string
  user: string
  title: string
  description: string
  type: string
  timestamp: Date
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
  type: string
}

// Helper functions to convert between DB and app formats
const dbToMachine = (row: Database["public"]["Tables"]["machines"]["Row"]): Machine => {
  const graceEndAt = row.grace_end_at
    ? new Date(row.grace_end_at)
    : row.status === "finishedGrace" && row.end_at
      ? new Date(new Date(row.end_at).getTime() + 5 * 60 * 1000)
      : undefined

  return {
    id: row.id,
    name: row.name,
    status: row.status,
    startAt: row.start_at ? new Date(row.start_at) : undefined,
    endAt: row.end_at ? new Date(row.end_at) : undefined,
    graceEndAt: graceEndAt,
    updatedAt: new Date(row.updated_at),
    startedByUserId: (row as any).started_by_user_id || undefined,
    startedByDeviceFingerprint: (row as any).started_by_device_fingerprint || undefined,
  }
}

const dbToNoise = (row: any): NoiseEntry => ({
  id: row.id,
  user: row.user_name,
  description: row.description || "Noise reported",
  timestamp: new Date(row.timestamp),
  lastReported: new Date(row.last_reported),
})

const dbToAnnouncement = (row: any): AnnouncementEntry => ({
  id: row.id,
  user: row.user_name,
  title: row.title,
  description: row.description,
  type: row.announcement_type,
  timestamp: new Date(row.timestamp),
})

const dbToSublet = (row: Database["public"]["Tables"]["sublets"]["Row"]): SubletEntry => ({
  id: row.id,
  user: row.user_name,
  duration: row.duration,
  timestamp: new Date(row.timestamp),
})

const dbToHelpMe = (row: Database["public"]["Tables"]["help_requests"]["Row"]): HelpMeEntry => ({
  id: row.id,
  user: row.user_name,
  description: row.description,
  timestamp: new Date(row.timestamp),
})

const dbToIncident = (row: Database["public"]["Tables"]["incidents"]["Row"]): Incident => ({
  id: row.id,
  machineId: row.machine_id,
  timestamp: new Date(row.timestamp),
  type: row.incident_type,
})

export default function useSupabaseData() {
  const [laundry, setLaundry] = useState<Machine[]>([])
  const [noise, setNoise] = useState<NoiseEntry[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementEntry[]>([])
  const [helpMe, setHelpMe] = useState<HelpMeEntry[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasGraceEndColumn, setHasGraceEndColumn] = useState(true)

  // Refs to prevent recursive calls and multiple setups
  const isLoadingDataRef = useRef(false)
  const lastLoadTimeRef = useRef<number>(0)
  const subscriptionSetupRef = useRef(false)
  const statusManagerSetupRef = useRef(false)
  const isMountedRef = useRef(true)

  // Debounced data loading function with selective loading
  const loadAllData = useCallback(async (specificTable?: string, forceRefresh = false) => {
    const now = Date.now()
    // Skip debounce for manual refresh (forceRefresh = true)
    if (!forceRefresh && (isLoadingDataRef.current || now - lastLoadTimeRef.current < 1000)) {
      console.log("⏭️ Skipping data load (too recent or in progress)")
      return
    }

    if (!isMountedRef.current) {
      console.log("⏭️ Skipping data load (component unmounted)")
      return
    }

    isLoadingDataRef.current = true
    lastLoadTimeRef.current = now

    try {
      console.log(`🔄 Loading data from Supabase${specificTable ? ` (${specificTable})` : ""}...`)
      setError(null)

      // If specific table is provided, only load that table
      if (specificTable) {
        await loadSpecificTable(specificTable)
      } else {
        // Load all data
        setIsLoading(true)
        await loadAllTables()
      }

      console.log("✅ Data loaded successfully")
    } catch (err) {
      console.error("❌ Error loading data:", err)
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      }
    } finally {
      if (isMountedRef.current && !specificTable) {
        setIsLoading(false)
      }
      isLoadingDataRef.current = false
    }
  }, [])

  // Helper function to load specific table
  const loadSpecificTable = async (table: string) => {
    switch (table) {
      case "machines":
        const machinesResult = await supabase.from("machines").select("*").order("name")
        if (machinesResult.error) throw machinesResult.error
        setLaundry(machinesResult.data?.map(dbToMachine) || [])
        break

      case "noise_reports":
        const noiseResult = await supabase
          .from("noise_reports")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(50)
        if (noiseResult.error) throw noiseResult.error
        setNoise(noiseResult.data?.map(dbToNoise) || [])
        break

      case "announcements":
        const announcementsResult = await supabase
          .from("announcements")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(50)
        if (announcementsResult.error) throw announcementsResult.error
        setAnnouncements(announcementsResult.data?.map(dbToAnnouncement) || [])
        break

      case "help_requests":
        const helpResult = await supabase
          .from("help_requests")
          .select("*")
          .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("timestamp", { ascending: false })
          .limit(50)
        if (helpResult.error) throw helpResult.error
        setHelpMe(helpResult.data?.map(dbToHelpMe) || [])
        break

      case "incidents":
        const incidentsResult = await supabase
          .from("incidents")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(50)
        if (incidentsResult.error) throw incidentsResult.error
        setIncidents(incidentsResult.data?.map(dbToIncident) || [])
        break
    }
  }

  // Helper function to load all tables
  const loadAllTables = async () => {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 15000))

    const dataPromise = Promise.all([
      supabase.from("machines").select("*").order("name"),
      supabase.from("noise_reports").select("*").order("timestamp", { ascending: false }).limit(50),
      supabase.from("announcements").select("*").order("timestamp", { ascending: false }).limit(50),
      supabase
        .from("help_requests")
        .select("*")
        .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("timestamp", { ascending: false })
        .limit(50),
      supabase.from("incidents").select("*").order("timestamp", { ascending: false }).limit(50),
    ])

    const [machinesResult, noiseResult, announcementsResult, helpResult, incidentsResult] = (await Promise.race([
      dataPromise,
      timeoutPromise,
    ])) as any[]

    if (!isMountedRef.current) return

    if (machinesResult.error) throw new Error(`Failed to load machines: ${machinesResult.error.message}`)
    if (noiseResult.error) throw new Error(`Failed to load noise reports: ${noiseResult.error.message}`)
    if (announcementsResult.error) throw new Error(`Failed to load announcements: ${announcementsResult.error.message}`)
    if (helpResult.error) throw new Error(`Failed to load help requests: ${helpResult.error.message}`)
    if (incidentsResult.error) throw new Error(`Failed to load incidents: ${incidentsResult.error.message}`)

    setLaundry(machinesResult.data?.map(dbToMachine) || [])
    setNoise(noiseResult.data?.map(dbToNoise) || [])
    setAnnouncements(announcementsResult.data?.map(dbToAnnouncement) || [])
    setHelpMe(helpResult.data?.map(dbToHelpMe) || [])
    setIncidents(incidentsResult.data?.map(dbToIncident) || [])
  }

  // Setup real-time subscriptions
  useEffect(() => {
    if (subscriptionSetupRef.current) return
    subscriptionSetupRef.current = true

    console.log("🔄 Setting up subscription manager...")

    const subscriptionManager = SubscriptionManager.getInstance()

    // Enhanced callback that handles specific table updates
    const handleRealtimeUpdate = (table?: string, event?: string) => {
      if (table && table !== "polling") {
        // Load only the specific table that changed for faster updates
        loadAllData(table)
      } else {
        // Fallback to loading all data
        loadAllData()
      }
    }

    subscriptionManager.addCallback(handleRealtimeUpdate)

    return () => {
      console.log("🧹 Cleaning up subscription manager...")
      subscriptionManager.removeCallback(handleRealtimeUpdate)
      subscriptionSetupRef.current = false
    }
  }, [loadAllData])

  // Set up machine status monitoring (only once)
  useEffect(() => {
    if (statusManagerSetupRef.current) return

    statusManagerSetupRef.current = true
    console.log("🔄 Setting up machine status manager...")

    const statusManager = MachineStatusManager.getInstance()
    statusManager.startStatusMonitoring()

    return () => {
      console.log("🧹 Cleaning up machine status manager...")
      statusManager.stopStatusMonitoring()
      statusManagerSetupRef.current = false
    }
  }, [])

  // Initial data load and cleanup
  useEffect(() => {
    isMountedRef.current = true
    loadAllData()

    return () => {
      isMountedRef.current = false
    }
  }, []) // Only run once on mount

  // Machine operations with optimistic updates
  const toggleMachineStatus = useCallback(
    async (id: string) => {
      try {
        const machine = laundry.find((m) => m.id === id)
        if (!machine) {
          return false
        }

        let optimisticUpdate: Machine
        let updateData: any

        if (machine.status === "free") {
          const startAt = new Date()
          const endAt = new Date(startAt.getTime() + 60 * 60 * 1000)
          const currentUserId = getDeviceUserId()

          optimisticUpdate = {
            ...machine,
            status: "running",
            startAt,
            endAt,
            graceEndAt: undefined,
            updatedAt: new Date(),
            startedByUserId: currentUserId,
            startedByDeviceFingerprint: currentUserId, // Using same value for now
          }

          updateData = {
            status: "running",
            start_at: startAt.toISOString(),
            end_at: endAt.toISOString(),
            started_by_user_id: currentUserId,
            started_by_device_fingerprint: currentUserId,
          }

          if (hasGraceEndColumn) {
            updateData.grace_end_at = null
          }
        } else if (machine.status === "running") {
          // Running machine - only owner can stop it
          const currentUserId = getDeviceUserId()
          if (machine.startedByUserId !== currentUserId) {
            setError("This machine is currently in use by another user")
            return false
          }

          // Owner stopping their running machine
          optimisticUpdate = {
            ...machine,
            status: "free",
            startAt: undefined,
            endAt: undefined,
            graceEndAt: undefined,
            updatedAt: new Date(),
            startedByUserId: undefined,
            startedByDeviceFingerprint: undefined,
          }

          updateData = {
            status: "free",
            start_at: null,
            end_at: null,
            started_by_user_id: null,
            started_by_device_fingerprint: null,
          }

          if (hasGraceEndColumn) {
            updateData.grace_end_at = null
          }
        } else if (machine.status === "finishedGrace") {
          // Grace period - only owner can collect items
          const currentUserId = getDeviceUserId()
          if (machine.startedByUserId !== currentUserId) {
            setError("Only the machine owner can collect their items")
            return false
          }

          // Owner collecting their items
          optimisticUpdate = {
            ...machine,
            status: "free",
            startAt: undefined,
            endAt: undefined,
            graceEndAt: undefined,
            updatedAt: new Date(),
            startedByUserId: undefined,
            startedByDeviceFingerprint: undefined,
          }

          updateData = {
            status: "free",
            start_at: null,
            end_at: null,
            started_by_user_id: null,
            started_by_device_fingerprint: null,
          }

          if (hasGraceEndColumn) {
            updateData.grace_end_at = null
          }
        } else {
          // This shouldn't happen with proper UI controls
          setError("Invalid machine status for this operation")
          return false
        }

        // Apply optimistic update
        setLaundry((prev) => prev.map((m) => (m.id === id ? optimisticUpdate : m)))

        // Send update to database
        const { error } = await supabase.from("machines").update(updateData).eq("id", id)

        if (error) {
          if (error.message && error.message.includes("grace_end_at")) {
            setHasGraceEndColumn(false)
            delete updateData.grace_end_at
            const { error: retryError } = await supabase.from("machines").update(updateData).eq("id", id)
            if (retryError) {
              setLaundry((prev) => prev.map((m) => (m.id === id ? machine : m)))
              throw retryError
            }
          } else {
            setLaundry((prev) => prev.map((m) => (m.id === id ? machine : m)))
            throw error
          }
        }

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update machine")
        return false
      }
    },
    [laundry, hasGraceEndColumn],
  )

  const reserveMachine = useCallback(
    async (id: string, durationStr: string) => {
      try {
        const machine = laundry.find((m) => m.id === id)
        if (!machine) {
          return false
        }

        // Check if machine is available
        if (machine.status !== "free") {
          setError("This machine is currently in use")
          return false
        }

        const durationSeconds = parseDuration(durationStr)
        const startAt = new Date()
        const endAt = new Date(startAt.getTime() + durationSeconds * 1000)
        const currentUserId = getDeviceUserId()

        const optimisticUpdate = {
          ...machine,
          status: "running" as const,
          startAt,
          endAt,
          graceEndAt: undefined,
          updatedAt: new Date(),
          startedByUserId: currentUserId,
          startedByDeviceFingerprint: currentUserId,
        }

        setLaundry((prev) => prev.map((m) => (m.id === id ? optimisticUpdate : m)))

        const updateData: any = {
          status: "running",
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
          started_by_user_id: currentUserId,
          started_by_device_fingerprint: currentUserId,
        }

        if (hasGraceEndColumn) {
          updateData.grace_end_at = null
        }

        const { error } = await supabase.from("machines").update(updateData).eq("id", id)

        if (error) {
          if (error.message && error.message.includes("grace_end_at")) {
            setHasGraceEndColumn(false)
            delete updateData.grace_end_at
            const { error: retryError } = await supabase.from("machines").update(updateData).eq("id", id)
            if (retryError) {
              setLaundry((prev) => prev.map((m) => (m.id === id ? machine : m)))
              throw retryError
            }
          } else {
            setLaundry((prev) => prev.map((m) => (m.id === id ? machine : m)))
            throw error
          }
        }

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reserve machine")
        return false
      }
    },
    [laundry, hasGraceEndColumn],
  )

  // New function to adjust machine time (only for machines you started)
  const adjustMachineTime = useCallback(
    async (id: string, newMinutes: number) => {
      try {
        const machine = laundry.find((m) => m.id === id)
        if (!machine) {
          return { success: false, error: "Machine not found" }
        }

        // Only allow adjusting time for running machines
        if (machine.status !== "running") {
          return { success: false, error: "Can only adjust time for running machines" }
        }

        // Validate time range (1-120 minutes for adjustment)
        if (newMinutes < 1 || newMinutes > 120) {
          return { success: false, error: "Please enter a number between 1-120 minutes" }
        }

        // Calculate new end time based on the new total duration from start time
        const now = new Date()
        let newEndAt = new Date(machine.startAt.getTime() + newMinutes * 60 * 1000)
        if (newEndAt < now) {
          // If the new end time would be in the past, set it to now + newMinutes
          newEndAt = new Date(now.getTime() + newMinutes * 60 * 1000)
        }

        const optimisticUpdate = {
          ...machine,
          endAt: newEndAt,
          updatedAt: new Date(),
        }

        // Apply optimistic update
        setLaundry((prev) => prev.map((m) => (m.id === id ? optimisticUpdate : m)))

        // Send update to database
        const { error } = await supabase
          .from("machines")
          .update({ end_at: newEndAt.toISOString() })
          .eq("id", id)

        if (error) {
          // Revert optimistic update on error
          setLaundry((prev) => prev.map((m) => (m.id === id ? machine : m)))
          return { success: false, error: "Unable to update timer. Please try again." }
        }

        // Always refresh data after update
        await loadAllData("machines", true)

        return { success: true, error: null }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Unable to update timer. Please try again."
        }
      }
    },
    [laundry],
  )

  // Simplified CRUD operations
  const addNoiseWithDescription = useCallback(async (user: string, description: string) => {
    try {
      const { error } = await supabase.from("noise_reports").insert({
        id: Date.now().toString(),
        user_name: user,
        description: description,
      })

      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add noise report")
      return false
    }
  }, [])

  const deleteNoise = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("noise_reports").delete().eq("id", id)
      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete noise report")
      return false
    }
  }, [])

  const addAnnouncement = useCallback(async (user: string, title: string, description: string, type: string) => {
    try {
      const { error } = await supabase.from("announcements").insert({
        id: Date.now().toString(),
        user_name: user,
        title: title,
        description: description,
        announcement_type: type,
      })

      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add announcement")
      return false
    }
  }, [])

  const deleteAnnouncement = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", id)
      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete announcement")
      return false
    }
  }, [])

  const addHelpRequest = useCallback(async (user: string, description: string) => {
    try {
      const { error } = await supabase.from("help_requests").insert({
        id: Date.now().toString(),
        user_name: user,
        description,
      })

      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add help request")
      return false
    }
  }, [])

  const deleteHelpRequest = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("help_requests").delete().eq("id", id)
      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete help request")
      return false
    }
  }, [])

  const deleteIncident = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("incidents").delete().eq("id", id)
      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete incident")
      return false
    }
  }, [])

  return {
    // Data
    laundry,
    noise,
    announcements,
    helpMe,
    incidents,

    // State
    isLoading,
    error,

    // Operations
    toggleMachineStatus,
    reserveMachine,
    adjustMachineTime,
    addNoiseWithDescription,
    deleteNoise,
    addAnnouncement,
    deleteAnnouncement,
    addHelpRequest,
    deleteHelpRequest,
    deleteIncident,
    refreshData: () => loadAllData(undefined, true),
  }
}
