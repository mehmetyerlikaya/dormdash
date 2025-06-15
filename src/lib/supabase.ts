import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://aodjyjxsqfytythosrka.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZGp5anhzcWZ5dHl0aG9zcmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MDYzOTYsImV4cCI6MjA2NTA4MjM5Nn0.V0K-uTAl8FDkupkjYZn9R6P4qIMhJ0kX1iE4LQFr_tg"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 50,
    },
  },
  auth: {
    persistSession: false,
  },
})

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("machines").select("count").single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

// Database types
export interface Database {
  public: {
    Tables: {
      machines: {
        Row: {
          id: string
          name: string
          status: "free" | "running" | "finishedGrace"
          start_at: string | null
          end_at: string | null
          grace_end_at: string | null
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          status?: "free" | "running" | "finishedGrace"
          start_at?: string | null
          end_at?: string | null
          grace_end_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          status?: "free" | "running" | "finishedGrace"
          start_at?: string | null
          end_at?: string | null
          grace_end_at?: string | null
        }
      }
      noise_reports: {
        Row: {
          id: string
          user_name: string
          timestamp: string
          last_reported: string
        }
        Insert: {
          id: string
          user_name: string
          timestamp?: string
          last_reported?: string
        }
        Update: {
          id?: string
          user_name?: string
          timestamp?: string
          last_reported?: string
        }
      }
      sublets: {
        Row: {
          id: string
          user_name: string
          duration: string
          timestamp: string
        }
        Insert: {
          id: string
          user_name: string
          duration: string
          timestamp?: string
        }
        Update: {
          id?: string
          user_name?: string
          duration?: string
          timestamp?: string
        }
      }
      help_requests: {
        Row: {
          id: string
          user_name: string
          description: string
          timestamp: string
        }
        Insert: {
          id: string
          user_name: string
          description: string
          timestamp?: string
        }
        Update: {
          id?: string
          user_name?: string
          description?: string
          timestamp?: string
        }
      }
      incidents: {
        Row: {
          id: string
          machine_id: string
          incident_type: string
          timestamp: string
        }
        Insert: {
          id: string
          machine_id: string
          incident_type?: string
          timestamp?: string
        }
        Update: {
          id?: string
          machine_id?: string
          incident_type?: string
          timestamp?: string
        }
      }
    }
  }
}
