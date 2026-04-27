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
      cme_credit_sources: {
        Row: {
          approved_at: string | null
          authority: string
          category: string | null
          conference_id: number | null
          created_at: string | null
          credits: number | null
          id: number
          source_url: string | null
        }
        Insert: {
          approved_at?: string | null
          authority?: string
          category?: string | null
          conference_id?: number | null
          created_at?: string | null
          credits?: number | null
          id?: number
          source_url?: string | null
        }
        Update: {
          approved_at?: string | null
          authority?: string
          category?: string | null
          conference_id?: number | null
          created_at?: string | null
          credits?: number | null
          id?: number
          source_url?: string | null
        }
        Relationships: []
      }
      conferences: {
        Row: {
          abstract_deadline: string | null
          acronym: string | null
          category: string | null
          city: string | null
          cme_credits: number | null
          cme_credits_kr: number | null
          conference_type: string
          country_code: string
          country_name: string | null
          created_at: string
          description: string | null
          detail_url: string | null
          early_bird_deadline: string | null
          edition_year: number | null
          end_date: string | null
          event_name: string
          id: number
          is_deleted: boolean
          is_featured: boolean
          is_kams_certified: boolean
          kams_id: string | null
          kams_notice_no: string | null
          kams_notice_url: string | null
          lat: number | null
          lng: number | null
          mode: string
          registration_deadline: string | null
          registration_url: string | null
          related_korean_society: string | null
          related_kr_societies: number[] | null
          series_id: number | null
          society_id: number | null
          society_name: string
          society_url: string | null
          source_id: string | null
          source_type: string
          sponsor_id: number | null
          start_date: string
          updated_at: string
          venue: string | null
          view_count: number
        }
        Insert: {
          abstract_deadline?: string | null
          acronym?: string | null
          category?: string | null
          city?: string | null
          cme_credits?: number | null
          cme_credits_kr?: number | null
          conference_type?: string
          country_code?: string
          country_name?: string | null
          created_at?: string
          description?: string | null
          detail_url?: string | null
          early_bird_deadline?: string | null
          edition_year?: number | null
          end_date?: string | null
          event_name: string
          id?: number
          is_deleted?: boolean
          is_featured?: boolean
          is_kams_certified?: boolean
          kams_id?: string | null
          kams_notice_no?: string | null
          kams_notice_url?: string | null
          lat?: number | null
          lng?: number | null
          mode?: string
          registration_deadline?: string | null
          registration_url?: string | null
          related_korean_society?: string | null
          related_kr_societies?: number[] | null
          series_id?: number | null
          society_id?: number | null
          society_name: string
          society_url?: string | null
          source_id?: string | null
          source_type?: string
          sponsor_id?: number | null
          start_date: string
          updated_at?: string
          venue?: string | null
          view_count?: number
        }
        Update: {
          abstract_deadline?: string | null
          acronym?: string | null
          category?: string | null
          city?: string | null
          cme_credits?: number | null
          cme_credits_kr?: number | null
          conference_type?: string
          country_code?: string
          country_name?: string | null
          created_at?: string
          description?: string | null
          detail_url?: string | null
          early_bird_deadline?: string | null
          edition_year?: number | null
          end_date?: string | null
          event_name?: string
          id?: number
          is_deleted?: boolean
          is_featured?: boolean
          is_kams_certified?: boolean
          kams_id?: string | null
          kams_notice_no?: string | null
          kams_notice_url?: string | null
          lat?: number | null
          lng?: number | null
          mode?: string
          registration_deadline?: string | null
          registration_url?: string | null
          related_korean_society?: string | null
          related_kr_societies?: number[] | null
          series_id?: number | null
          society_id?: number | null
          society_name?: string
          society_url?: string | null
          source_id?: string | null
          source_type?: string
          sponsor_id?: number | null
          start_date?: string
          updated_at?: string
          venue?: string | null
          view_count?: number
        }
        Relationships: []
      }
      event_series: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name_en: string | null
          name_ko: string | null
          organizer: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name_en?: string | null
          name_ko?: string | null
          organizer?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name_en?: string | null
          name_ko?: string | null
          organizer?: string | null
          slug?: string
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          conference_id: number
          days_before: number
          id: number
          sent_at: string
          user_id: string
        }
        Insert: {
          conference_id: number
          days_before: number
          id?: number
          sent_at?: string
          user_id: string
        }
        Update: {
          conference_id?: number
          days_before?: number
          id?: number
          sent_at?: string
          user_id?: string
        }
        Relationships: []
      }
      societies: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_verified: boolean
          logo_url: string | null
          name: string
          slug: string
          specialty: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_verified?: boolean
          logo_url?: string | null
          name: string
          slug: string
          specialty?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_verified?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          specialty?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          company_name: string
          contact_email: string
          created_at: string
          id: number
          is_active: boolean
          logo_url: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          company_name: string
          contact_email: string
          created_at?: string
          id?: number
          is_active?: boolean
          logo_url?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string
          created_at?: string
          id?: number
          is_active?: boolean
          logo_url?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      users_profile: {
        Row: {
          created_at: string
          id: string
          newsletter_opt_in: boolean
          notify_days: number[]
          notify_enabled: boolean
          organization: string | null
          specialty: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          id: string
          newsletter_opt_in?: boolean
          notify_days?: number[]
          notify_enabled?: boolean
          organization?: string | null
          specialty?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          newsletter_opt_in?: boolean
          notify_days?: number[]
          notify_enabled?: boolean
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
export type NotificationLog = Database["public"]["Tables"]["notification_log"]["Row"]
export type Society = Database["public"]["Tables"]["societies"]["Row"]
export type Sponsor = Database["public"]["Tables"]["sponsors"]["Row"]
export type EventSeries = Database["public"]["Tables"]["event_series"]["Row"]
export type CmeCreditSource = Database["public"]["Tables"]["cme_credit_sources"]["Row"]
