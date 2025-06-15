import { supabase } from "../src/lib/supabase"

async function initializeMachines() {
  const machines = [
    { id: "washer-1", name: "Washer 1", status: "free" },
    { id: "washer-2", name: "Washer 2", status: "free" },
    { id: "washer-3", name: "Washer 3", status: "free" },
    { id: "washer-4", name: "Washer 4", status: "free" },
    { id: "dryer-1", name: "Dryer 1", status: "free" },
    { id: "dryer-2", name: "Dryer 2", status: "free" },
    { id: "dryer-3", name: "Dryer 3", status: "free" },
    { id: "dryer-4", name: "Dryer 4", status: "free" }
  ]

  try {
    // First, clear existing machines
    const { error: deleteError } = await supabase.from("machines").delete().neq("id", "dummy")
    if (deleteError) throw deleteError

    // Then insert new machines
    const { error: insertError } = await supabase.from("machines").insert(machines)
    if (insertError) throw insertError

    console.log("✅ Machines initialized successfully!")
  } catch (error) {
    console.error("❌ Error initializing machines:", error)
  }
}

initializeMachines() 