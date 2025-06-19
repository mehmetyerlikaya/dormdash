import { supabase } from "./supabase"

class MachineStatusManager {
  private static instance: MachineStatusManager
  private statusCheckInterval: NodeJS.Timeout | null = null
  private isChecking = false
  private hasGraceEndColumn = true
  private isDestroyed = false

  static getInstance(): MachineStatusManager {
    if (!MachineStatusManager.instance) {
      MachineStatusManager.instance = new MachineStatusManager()
    }
    return MachineStatusManager.instance
  }

  startStatusMonitoring() {
    if (this.statusCheckInterval || this.isDestroyed) {
      return
    }

    console.log("🔄 Starting machine status monitoring...")

    // Check every 15 seconds
    this.statusCheckInterval = setInterval(() => {
      if (!this.isDestroyed) {
        this.checkMachineStatuses()
      }
    }, 15000)

    // Also check immediately
    this.checkMachineStatuses()
  }

  stopStatusMonitoring() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval)
      this.statusCheckInterval = null
      console.log("⏹️ Stopped machine status monitoring")
    }
  }

  destroy() {
    this.isDestroyed = true
    this.stopStatusMonitoring()
  }

  private async checkMachineStatuses() {
    if (this.isChecking || this.isDestroyed) {
      return
    }

    this.isChecking = true

    try {
      const now = new Date()

      const { data: machines, error } = await supabase
        .from("machines")
        .select("*")
        .in("status", ["running", "finishedGrace"])

      if (error) {
        console.error("❌ Error fetching machines for status check:", error)
        return
      }

      if (!machines || machines.length === 0) {
        return
      }

      const updates: Array<{ id: string; updates: any }> = []

      for (const machine of machines) {
        if (this.isDestroyed) break

        const endAt = machine.end_at ? new Date(machine.end_at) : null
        let graceEndAt = null
        if (this.hasGraceEndColumn && machine.grace_end_at) {
          graceEndAt = new Date(machine.grace_end_at)
        }

        if (machine.status === "running" && endAt && now >= endAt) {
          const graceEnd = new Date(now.getTime() + 5 * 60 * 1000)

          const updateObj: any = {
            status: "finishedGrace",
          }

          if (this.hasGraceEndColumn) {
            updateObj.grace_end_at = graceEnd.toISOString()
          }

          updates.push({
            id: machine.id,
            updates: updateObj,
          })

          console.log(`⚠️ Machine ${machine.name} transitioning to grace period`)
        } else if (machine.status === "finishedGrace") {
          const defaultGraceEnd = endAt ? new Date(endAt.getTime() + 5 * 60 * 1000) : null
          const effectiveGraceEnd = graceEndAt || defaultGraceEnd

          if (effectiveGraceEnd && now >= effectiveGraceEnd) {
            updates.push({
              id: machine.id,
              updates: {
                status: "free",
                start_at: null,
                end_at: null,
                started_by_user_id: null,
                started_by_device_fingerprint: null,
                ...(this.hasGraceEndColumn ? { grace_end_at: null } : {}),
              },
            })

            console.log(`✅ Machine ${machine.name} grace period ended, now available`)
          }
        }
      }

      // Apply updates sequentially to avoid conflicts
      for (const update of updates) {
        if (this.isDestroyed) break

        try {
          const { error: updateError } = await supabase.from("machines").update(update.updates).eq("id", update.id)

          if (updateError) {
            if (updateError.message && updateError.message.includes("grace_end_at")) {
              console.log("⚠️ grace_end_at column not found, disabling this feature")
              this.hasGraceEndColumn = false
            }
            console.error(`❌ Error updating machine ${update.id}:`, updateError)
          }
        } catch (err) {
          console.error(`❌ Error updating machine ${update.id}:`, err)
        }

        // Small delay between updates to prevent overwhelming the database
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      if (updates.length > 0) {
        console.log(`🔄 Updated ${updates.length} machine statuses`)
      }
    } catch (error) {
      console.error("❌ Error in machine status check:", error)
    } finally {
      this.isChecking = false
    }
  }

  async triggerStatusCheck() {
    if (!this.isDestroyed) {
      await this.checkMachineStatuses()
    }
  }
}

export default MachineStatusManager
