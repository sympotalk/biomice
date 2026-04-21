export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          advertiser_name: string | null
          click_count: number
          created_at: string
          end_date: string | null
          id: number
          image_url: string
          is_active: boolean
          link_url: string
          priority: number
          slot_name: string
          start_date: string | null
          title: string | null
          view_count: number
        }
        Insert: {
          advertiser_name?: string | null
          click_count?: number
          created_at?: string
          end_date?: string | null
          id?: number
          image_url: string
          is_active?: boolean
          link_url: string
          priority?: number
          slot_name: string
          start_date?: string | null
          title?: string | null
          view_count?: number
        }
        Update: {
          advertiser_name?: string | null
          click_count?: number
          created_at?: string
          end_date?: string | null
          id?: number
          image_url?: string
          is_active?: boolean
          link_url?: string
          priority?: number
          slot_name?: string
          start_date?: string | null
          title?: string | null
          view_count?: number
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          conference_id: number
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          conference_id: number
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          conference_id?: number
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_conference_id_fkey"
            columns: ["conference_id"]
            isOneToOne: false
            referencedRelation: "conferences"
            referencedColumns: ["id"]
          },
        ]
      }
      conferences: {
        Row: {
          category: string | null
          city: string | null
          created_at: string
          description: string | null
          detail_url: string | null
          end_date: string | null
          event_name: string
          id: number
          is_deleted: boolean
          is_featured: boolean
          kams_id: string | null
          registration_url: string | null
          society_name: string
          society_url: string | null
          sponsor_id: number | null
          start_date: string
          updated_at: string
          venue: string | null
          view_count: number
        }
        Insert: {
          category?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          detail_url?: string | null
          end_date?: string | null
          event_name: string
          id?: number
          is_deleted?: boolean
          is_featured?: boolean
          kams_id?: string | null
          registration_url?: string | null
          society_name: string
          society_url?: string | null
          sponsor_id?: number | null
          start_date: string
          updated_at?: string
          venue?: string | null
          view_count?: number
        }
        Update: {
          category?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          detail_url?: string | null
          end_date?: string | null
          event_name?: string
          id?: number
          is_deleted?: boolean
          is_featured?: boolean
          kams_id?: string | null
          registration_url?: string | null
          society_name?: string
          society_url?: string | null
          sponsor_id?: number | null
          start_date?: string
          updated_at?: string
          venue?: string | null
          view_count?: number
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          created_at: string
          id: string
          newsletter_opt_in: boolean
          organization: string | null
          specialty: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          id: string
          newsletter_opt_in?: boolean
          organization?: string | null
          specialty?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          newsletter_opt_in?: boolean
          organization?: string | null
          specialty?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Conference = Database["public"]["Tables"]["conferences"]["Row"]
export type ConferenceInsert = Database["public"]["Tables"]["conferences"]["Insert"]
export type Banner = Database["public"]["Tables"]["banners"]["Row"]
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"]
export type UsersProfile = Database["public"]["Tables"]["users_profile"]["Row"]
