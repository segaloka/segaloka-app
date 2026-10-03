export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliate_org_links: {
        Row: {
          affiliate_id: string
          commission_type: string
          commission_value: number
          created_at: string
          id: string
          org_id: string
          status: string
        }
        Insert: {
          affiliate_id: string
          commission_type?: string
          commission_value?: number
          created_at?: string
          id?: string
          org_id: string
          status?: string
        }
        Update: {
          affiliate_id?: string
          commission_type?: string
          commission_value?: number
          created_at?: string
          id?: string
          org_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_org_links_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_org_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          booking_id: string | null
          commission_amount: number | null
          created_at: string
          id: string
          lead_id: string | null
          org_id: string
          status: string
        }
        Insert: {
          affiliate_id: string
          booking_id?: string | null
          commission_amount?: number | null
          created_at?: string
          id?: string
          lead_id?: string | null
          org_id: string
          status?: string
        }
        Update: {
          affiliate_id?: string
          booking_id?: string | null
          commission_amount?: number | null
          created_at?: string
          id?: string
          lead_id?: string | null
          org_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          code: string
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          after: Json | null
          before: Json | null
          branch_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          org_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after?: Json | null
          before?: Json | null
          branch_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          org_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after?: Json | null
          before?: Json | null
          branch_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_passengers: {
        Row: {
          booking_id: string
          created_at: string
          dob: string | null
          full_name: string
          gender: string | null
          id: string
          id_number: string | null
          passport_expiry: string | null
          passport_number: string | null
          relation: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          dob?: string | null
          full_name: string
          gender?: string | null
          id?: string
          id_number?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          relation?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          dob?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          id_number?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          relation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_passengers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          custom_departure_date: string | null
          custom_package_name: string | null
          departure_id: string | null
          id: string
          notes: string | null
          org_id: string
          pax_count: number
          segadeals_offer_id: string | null
          status: string
          total_amount: number
          traveler_user_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          custom_departure_date?: string | null
          custom_package_name?: string | null
          departure_id?: string | null
          id?: string
          notes?: string | null
          org_id: string
          pax_count?: number
          segadeals_offer_id?: string | null
          status?: string
          total_amount?: number
          traveler_user_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          custom_departure_date?: string | null
          custom_package_name?: string | null
          departure_id?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          pax_count?: number
          segadeals_offer_id?: string | null
          status?: string
          total_amount?: number
          traveler_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_departure_id_fkey"
            columns: ["departure_id"]
            isOneToOne: false
            referencedRelation: "departures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_segadeals_offer_id_fkey"
            columns: ["segadeals_offer_id"]
            isOneToOne: false
            referencedRelation: "segadeals_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          is_hq: boolean
          name: string
          org_id: string
          phone: string | null
          pic_name: string | null
          status: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_hq?: boolean
          name: string
          org_id: string
          phone?: string | null
          pic_name?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_hq?: boolean
          name?: string
          org_id?: string
          phone?: string | null
          pic_name?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departures: {
        Row: {
          created_at: string
          departure_date: string
          filled: number
          flight_info: Json
          hotel_info: Json
          id: string
          package_id: string
          quota: number
          return_date: string | null
          status: string
        }
        Insert: {
          created_at?: string
          departure_date: string
          filled?: number
          flight_info?: Json
          hotel_info?: Json
          id?: string
          package_id: string
          quota: number
          return_date?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          departure_date?: string
          filled?: number
          flight_info?: Json
          hotel_info?: Json
          id?: string
          package_id?: string
          quota?: number
          return_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "departures_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          expires_at: string | null
          file_name: string | null
          file_url: string
          id: string
          org_id: string | null
          owner_id: string
          owner_type: string
          status: string
          uploaded_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          expires_at?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          org_id?: string | null
          owner_id: string
          owner_type: string
          status?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          expires_at?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          org_id?: string | null
          owner_id?: string
          owner_type?: string
          status?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          due_date: string | null
          id: string
          number: string
          status: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          number: string
          status?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          number?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          due_at: string | null
          id: string
          lead_id: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          lead_id: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          interest_type: string | null
          name: string
          org_id: string
          phone: string | null
          source: string
          stage: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          interest_type?: string | null
          name: string
          org_id: string
          phone?: string | null
          source?: string
          stage?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          interest_type?: string | null
          name?: string
          org_id?: string
          phone?: string | null
          source?: string
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          account: string
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          direction: string
          id: string
          org_id: string
          ref_id: string | null
          ref_type: string
        }
        Insert: {
          account: string
          amount: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction: string
          id?: string
          org_id: string
          ref_id?: string | null
          ref_type: string
        }
        Update: {
          account?: string
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction?: string
          id?: string
          org_id?: string
          ref_id?: string | null
          ref_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      manifest_entries: {
        Row: {
          booking_passenger_id: string
          created_at: string
          data: Json
          id: string
          manifest_id: string
        }
        Insert: {
          booking_passenger_id: string
          created_at?: string
          data?: Json
          id?: string
          manifest_id: string
        }
        Update: {
          booking_passenger_id?: string
          created_at?: string
          data?: Json
          id?: string
          manifest_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manifest_entries_booking_passenger_id_fkey"
            columns: ["booking_passenger_id"]
            isOneToOne: false
            referencedRelation: "booking_passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manifest_entries_manifest_id_fkey"
            columns: ["manifest_id"]
            isOneToOne: false
            referencedRelation: "manifests"
            referencedColumns: ["id"]
          },
        ]
      }
      manifests: {
        Row: {
          departure_id: string
          fields_schema: Json
          generated_at: string
          generated_by: string | null
          id: string
          template_type: string
        }
        Insert: {
          departure_id: string
          fields_schema?: Json
          generated_at?: string
          generated_by?: string | null
          id?: string
          template_type?: string
        }
        Update: {
          departure_id?: string
          fields_schema?: Json
          generated_at?: string
          generated_by?: string | null
          id?: string
          template_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "manifests_departure_id_fkey"
            columns: ["departure_id"]
            isOneToOne: true
            referencedRelation: "departures"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          invited_email: string | null
          org_id: string | null
          role_slug: string
          status: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          invited_email?: string | null
          org_id?: string | null
          role_slug: string
          status?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          invited_email?: string | null
          org_id?: string | null
          role_slug?: string
          status?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_role_slug_fkey"
            columns: ["role_slug"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "memberships_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      mitra: {
        Row: {
          commission_type: string
          commission_value: number
          created_at: string
          id: string
          org_id: string
          status: string
          user_id: string
        }
        Insert: {
          commission_type?: string
          commission_value?: number
          created_at?: string
          id?: string
          org_id: string
          status?: string
          user_id: string
        }
        Update: {
          commission_type?: string
          commission_value?: number
          created_at?: string
          id?: string
          org_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mitra_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_ads: {
        Row: {
          active: boolean
          category: string
          created_at: string
          created_by: string | null
          detail: string
          ends_at: string | null
          href: string
          icon: string
          id: string
          image_url: string | null
          placement: string
          price_text: string
          sort_order: number
          starts_at: string | null
          title: string
          tone: string
          travel_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          created_by?: string | null
          detail: string
          ends_at?: string | null
          href: string
          icon?: string
          id?: string
          image_url?: string | null
          placement?: string
          price_text: string
          sort_order?: number
          starts_at?: string | null
          title: string
          tone?: string
          travel_name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          created_by?: string | null
          detail?: string
          ends_at?: string | null
          href?: string
          icon?: string
          id?: string
          image_url?: string | null
          placement?: string
          price_text?: string
          sort_order?: number
          starts_at?: string | null
          title?: string
          tone?: string
          travel_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          id: string
          org_id: string | null
          priority: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category: string
          created_at?: string
          id?: string
          org_id?: string | null
          priority?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          org_id?: string | null
          priority?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          bank_info: Json | null
          created_at: string
          created_by: string | null
          favicon_url: string | null
          id: string
          legal_name: string | null
          license_expiry: string | null
          license_number: string | null
          license_type: string
          logo_dark_url: string | null
          logo_light_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          settlement_model: string
          slug: string
          status: string
          support_email: string | null
          support_phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bank_info?: Json | null
          created_at?: string
          created_by?: string | null
          favicon_url?: string | null
          id?: string
          legal_name?: string | null
          license_expiry?: string | null
          license_number?: string | null
          license_type: string
          logo_dark_url?: string | null
          logo_light_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          settlement_model?: string
          slug: string
          status?: string
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bank_info?: Json | null
          created_at?: string
          created_by?: string | null
          favicon_url?: string | null
          id?: string
          legal_name?: string | null
          license_expiry?: string | null
          license_number?: string | null
          license_type?: string
          logo_dark_url?: string | null
          logo_light_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          settlement_model?: string
          slug?: string
          status?: string
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          base_price: number
          created_at: string
          created_by: string | null
          description: string | null
          duration_days: number
          exclusions: Json
          id: string
          inclusions: Json
          name: string
          org_id: string
          slug: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_days: number
          exclusions?: Json
          id?: string
          inclusions?: Json
          name: string
          org_id: string
          slug: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_days?: number
          exclusions?: Json
          id?: string
          inclusions?: Json
          name?: string
          org_id?: string
          slug?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          booking_id: string
          created_at: string
          external_ref: string | null
          fee_amount: number
          gross_amount: number
          id: string
          method: string | null
          net_amount: number
          paid_at: string | null
          provider: string
          status: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          external_ref?: string | null
          fee_amount?: number
          gross_amount: number
          id?: string
          method?: string | null
          net_amount: number
          paid_at?: string | null
          provider?: string
          status?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          external_ref?: string | null
          fee_amount?: number
          gross_amount?: number
          id?: string
          method?: string | null
          net_amount?: number
          paid_at?: string | null
          provider?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          group_name: string
          key: string
          label: string
        }
        Insert: {
          group_name: string
          key: string
          label: string
        }
        Update: {
          group_name?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          locale: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          locale?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          locale?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_key: string
          role_slug: string
        }
        Insert: {
          permission_key: string
          role_slug: string
        }
        Update: {
          permission_key?: string
          role_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "role_permissions_role_slug_fkey"
            columns: ["role_slug"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["slug"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          label: string
          scope: string
          slug: string
        }
        Insert: {
          description?: string | null
          label: string
          scope: string
          slug: string
        }
        Update: {
          description?: string | null
          label?: string
          scope?: string
          slug?: string
        }
        Relationships: []
      }
      room_occupants: {
        Row: {
          booking_passenger_id: string
          created_at: string
          id: string
          room_id: string
        }
        Insert: {
          booking_passenger_id: string
          created_at?: string
          id?: string
          room_id: string
        }
        Update: {
          booking_passenger_id?: string
          created_at?: string
          id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_occupants_booking_passenger_id_fkey"
            columns: ["booking_passenger_id"]
            isOneToOne: false
            referencedRelation: "booking_passengers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_occupants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          departure_id: string
          hotel_name: string | null
          id: string
          room_number: string | null
          room_type: string | null
        }
        Insert: {
          capacity?: number
          created_at?: string
          departure_id: string
          hotel_name?: string | null
          id?: string
          room_number?: string | null
          room_type?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string
          departure_id?: string
          hotel_name?: string | null
          id?: string
          room_number?: string | null
          room_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_departure_id_fkey"
            columns: ["departure_id"]
            isOneToOne: false
            referencedRelation: "departures"
            referencedColumns: ["id"]
          },
        ]
      }
      segadeals_deposits: {
        Row: {
          balance: number
          min_required: number
          org_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          min_required?: number
          org_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          min_required?: number
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "segadeals_deposits_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      segadeals_offers: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          notes: string | null
          org_id: string
          price: number
          request_id: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          org_id: string
          price: number
          request_id: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          price?: number
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "segadeals_offers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segadeals_offers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "segadeals_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      segadeals_requests: {
        Row: {
          additional_request: string | null
          airline_pref: string | null
          budget_max: number | null
          budget_min: number | null
          created_at: string
          date_from: string | null
          date_to: string | null
          destination: string | null
          flex_days: number
          hotel_pref: string | null
          id: string
          origin_city: string | null
          pax: number
          room_config: string | null
          status: string
          traveler_user_id: string
          type: string
        }
        Insert: {
          additional_request?: string | null
          airline_pref?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          destination?: string | null
          flex_days?: number
          hotel_pref?: string | null
          id?: string
          origin_city?: string | null
          pax?: number
          room_config?: string | null
          status?: string
          traveler_user_id: string
          type: string
        }
        Update: {
          additional_request?: string | null
          airline_pref?: string | null
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          date_from?: string | null
          date_to?: string | null
          destination?: string | null
          flex_days?: number
          hotel_pref?: string | null
          id?: string
          origin_city?: string | null
          pax?: number
          room_config?: string | null
          status?: string
          traveler_user_id?: string
          type?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          branch_limit: number
          code: string
          created_at: string
          id: string
          is_active: boolean
          modules: Json
          name: string
          price_monthly: number
          price_yearly: number
          storage_gb: number
          trial_days: number
          user_limit: number | null
        }
        Insert: {
          branch_limit?: number
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          modules?: Json
          name: string
          price_monthly?: number
          price_yearly?: number
          storage_gb?: number
          trial_days?: number
          user_limit?: number | null
        }
        Update: {
          branch_limit?: number
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          modules?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number
          storage_gb?: number
          trial_days?: number
          user_limit?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          additional_branch_price: number | null
          branch_limit_override: number | null
          created_at: string
          current_period_end: string | null
          current_period_start: string
          id: string
          org_id: string
          plan_id: string | null
          status: string
          trial_ends_at: string | null
        }
        Insert: {
          additional_branch_price?: number | null
          branch_limit_override?: number | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          org_id: string
          plan_id?: string | null
          status?: string
          trial_ends_at?: string | null
        }
        Update: {
          additional_branch_price?: number | null
          branch_limit_override?: number | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string
          id?: string
          org_id?: string
          plan_id?: string | null
          status?: string
          trial_ends_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_categories: {
        Row: {
          code: string
          label: string
        }
        Insert: {
          code: string
          label: string
        }
        Update: {
          code?: string
          label?: string
        }
        Relationships: []
      }
      vendor_orders: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          item: string
          org_id: string
          status: string
          vendor_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          item: string
          org_id: string
          status?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          item?: string
          org_id?: string
          status?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_orders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_org_links: {
        Row: {
          created_at: string
          fee_type: string
          fee_value: number
          id: string
          org_id: string
          status: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          fee_type?: string
          fee_value?: number
          id?: string
          org_id: string
          status?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          fee_type?: string
          fee_value?: number
          id?: string
          org_id?: string
          status?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_org_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_org_links_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          category_code: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          id: string
          legal_name: string | null
          name: string
          status: string
        }
        Insert: {
          category_code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          legal_name?: string | null
          name: string
          status?: string
        }
        Update: {
          category_code?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_category_code_fkey"
            columns: ["category_code"]
            isOneToOne: false
            referencedRelation: "vendor_categories"
            referencedColumns: ["code"]
          },
        ]
      }
      website_pages: {
        Row: {
          created_at: string
          id: string
          sections: Json
          slug: string
          status: string
          title: string
          website_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sections?: Json
          slug: string
          status?: string
          title: string
          website_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sections?: Json
          slug?: string
          status?: string
          title?: string
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_pages_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          package_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          package_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          package_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      websites: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          org_id: string
          published_at: string | null
          status: string
          theme: Json
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          org_id: string
          published_at?: string | null
          status?: string
          theme?: Json
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          org_id?: string
          published_at?: string | null
          status?: string
          theme?: Json
        }
        Relationships: [
          {
            foreignKeyName: "websites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_travel_rating: {
        Args: { p_org_id: string }
        Returns: {
          average_rating: number | null
          review_count: number
        }[]
      }
      create_marketplace_booking: {
        Args: {
          p_departure_id: string
          p_notes?: string
          p_passenger_names: string[]
        }
        Returns: string
      }
      create_organization: {
        Args: { p_legal_name: string; p_license_type: string; p_name: string }
        Returns: string
      }
      has_org_role: {
        Args: { p_org_id: string; p_role_slugs: string[] }
        Returns: boolean
      }
      has_permission: {
        Args: { p_org_id: string; p_permission_key: string }
        Returns: boolean
      }
      has_platform_permission: {
        Args: { p_permission_key: string }
        Returns: boolean
      }
      invite_mitra_by_email: {
        Args: {
          p_commission_type: string
          p_commission_value: number
          p_email: string
          p_org_id: string
        }
        Returns: Json
      }
      invite_staff_by_email: {
        Args: {
          p_branch_id?: string | null
          p_email: string
          p_org_id: string
          p_role_slug: string
        }
        Returns: Json
      }
      is_affiliate_self: { Args: { p_affiliate_id: string }; Returns: boolean }
      is_org_member: { Args: { p_org_id: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      is_vendor_member: { Args: { p_vendor_id: string }; Returns: boolean }
      link_affiliate_to_org: { Args: { p_org_slug: string }; Returns: Json }
      register_affiliate: { Args: never; Returns: string }
      register_vendor: {
        Args: {
          p_category_code: string
          p_contact_email: string | null
          p_contact_phone: string | null
          p_legal_name: string | null
          p_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
