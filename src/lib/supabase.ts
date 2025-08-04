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
          started_by_user_id: string | null
          started_by_device_fingerprint: string | null
        }
        Insert: {
          id: string
          name: string
          status?: "free" | "running" | "finishedGrace"
          start_at?: string | null
          end_at?: string | null
          grace_end_at?: string | null
          started_by_user_id?: string | null
          started_by_device_fingerprint?: string | null
        }
        Update: {
          id?: string
          name?: string
          status?: "free" | "running" | "finishedGrace"
          start_at?: string | null
          end_at?: string | null
          grace_end_at?: string | null
          started_by_user_id?: string | null
          started_by_device_fingerprint?: string | null
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
      anonymous_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          parent_post_id: string | null
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          parent_post_id?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          parent_post_id?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      post_reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          reaction_emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          reaction_emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          reaction_emoji?: string
          created_at?: string
        }
      }
      user_analytics: {
        Row: {
          id: string
          device_user_id: string
          session_id: string
          first_visit_at: string
          last_visit_at: string
          total_visits: number
          total_session_time: number
          device_type: string | null
          browser_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          device_user_id: string
          session_id: string
          first_visit_at?: string
          last_visit_at?: string
          total_visits?: number
          total_session_time?: number
          device_type?: string | null
          browser_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          device_user_id?: string
          session_id?: string
          first_visit_at?: string
          last_visit_at?: string
          total_visits?: number
          total_session_time?: number
          device_type?: string | null
          browser_info?: string | null
          created_at?: string
          updated_at?: string
        }
      },
      feature_usage: {
        Row: {
          id: string
          device_user_id: string
          feature_name: string
          action_type: string
          machine_id: string | null
          post_id: string | null
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          device_user_id: string
          feature_name: string
          action_type: string
          machine_id?: string | null
          post_id?: string | null
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          device_user_id?: string
          feature_name?: string
          action_type?: string
          machine_id?: string | null
          post_id?: string | null
          metadata?: any | null
          created_at?: string
        }
      },
    }
  }
}
