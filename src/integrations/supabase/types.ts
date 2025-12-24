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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          content: string | null
          created_at: string
          id: string
          name: string
          status: string
          tags: string[] | null
          type: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          name: string
          status?: string
          tags?: string[] | null
          type: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          name?: string
          status?: string
          tags?: string[] | null
          type?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          channel: string
          created_at: string
          delay_hours: number | null
          id: string
          name: string
          sequence_order: number | null
          status: string
          template: string | null
          trigger_event: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          delay_hours?: number | null
          id?: string
          name: string
          sequence_order?: number | null
          status?: string
          template?: string | null
          trigger_event: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          delay_hours?: number | null
          id?: string
          name?: string
          sequence_order?: number | null
          status?: string
          template?: string | null
          trigger_event?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_plans: {
        Row: {
          budget_rules: Json | null
          created_at: string
          id: string
          name: string
          platform: string
          status: string
          structure: Json | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          budget_rules?: Json | null
          created_at?: string
          id?: string
          name: string
          platform: string
          status?: string
          structure?: Json | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          budget_rules?: Json | null
          created_at?: string
          id?: string
          name?: string
          platform?: string
          status?: string
          structure?: Json | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_plans_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          url: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          url?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitors_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string
          hypothesis: string
          id: string
          metric: string | null
          result: Json | null
          status: string
          updated_at: string
          variants: string[] | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          hypothesis: string
          id?: string
          metric?: string | null
          result?: Json | null
          status?: string
          updated_at?: string
          variants?: string[] | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          hypothesis?: string
          id?: string
          metric?: string | null
          result?: Json | null
          status?: string
          updated_at?: string
          variants?: string[] | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_accounts: {
        Row: {
          created_at: string
          currency_code: string | null
          customer_id: string
          id: string
          is_manager: boolean | null
          name: string
          time_zone: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          currency_code?: string | null
          customer_id: string
          id?: string
          is_manager?: boolean | null
          name: string
          time_zone?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          currency_code?: string | null
          customer_id?: string
          id?: string
          is_manager?: boolean | null
          name?: string
          time_zone?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_ads_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_campaigns: {
        Row: {
          campaign_id: string
          channel_type: string | null
          created_at: string
          customer_id: string
          id: string
          name: string
          status: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          campaign_id: string
          channel_type?: string | null
          created_at?: string
          customer_id: string
          id?: string
          name: string
          status?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          campaign_id?: string
          channel_type?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_ads_campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_connections: {
        Row: {
          access_token: string | null
          created_at: string
          customer_ids: string[] | null
          email: string | null
          google_user_id: string
          id: string
          refresh_token: string | null
          status: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          customer_ids?: string[] | null
          email?: string | null
          google_user_id: string
          id?: string
          refresh_token?: string | null
          status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          customer_ids?: string[] | null
          email?: string | null
          google_user_id?: string
          id?: string
          refresh_token?: string | null
          status?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_ads_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      google_ads_metrics_daily: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversion_value: number | null
          conversions: number | null
          cost_micros: number | null
          cpc_micros: number | null
          created_at: string
          ctr: number | null
          customer_id: string
          date: string
          id: string
          impressions: number | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost_micros?: number | null
          cpc_micros?: number | null
          created_at?: string
          ctr?: number | null
          customer_id: string
          date: string
          id?: string
          impressions?: number | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversion_value?: number | null
          conversions?: number | null
          cost_micros?: number | null
          cpc_micros?: number | null
          created_at?: string
          ctr?: number | null
          customer_id?: string
          date?: string
          id?: string
          impressions?: number | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "google_ads_metrics_daily_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          created_at: string
          id: string
          published_url: string | null
          sections: Json | null
          slug: string
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          published_url?: string | null
          sections?: Json | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          published_url?: string | null
          sections?: Json | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_type: string | null
          created_at: string
          email: string | null
          fbclid: string | null
          gclid: string | null
          goal: string | null
          id: string
          landing_page_id: string | null
          name: string
          notes: string | null
          phone: string | null
          referrer: string | null
          revenue_range: string | null
          score: number | null
          source: string | null
          stage: string
          updated_at: string
          utm: Json | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          workspace_id: string
        }
        Insert: {
          business_type?: string | null
          created_at?: string
          email?: string | null
          fbclid?: string | null
          gclid?: string | null
          goal?: string | null
          id?: string
          landing_page_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          referrer?: string | null
          revenue_range?: string | null
          score?: number | null
          source?: string | null
          stage?: string
          updated_at?: string
          utm?: Json | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          workspace_id: string
        }
        Update: {
          business_type?: string | null
          created_at?: string
          email?: string | null
          fbclid?: string | null
          gclid?: string | null
          goal?: string | null
          id?: string
          landing_page_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          referrer?: string | null
          revenue_range?: string | null
          score?: number | null
          source?: string | null
          stage?: string
          updated_at?: string
          utm?: Json | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ad_accounts: {
        Row: {
          account_id: string
          created_at: string
          currency: string | null
          id: string
          is_selected: boolean | null
          name: string
          timezone: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          currency?: string | null
          id?: string
          is_selected?: boolean | null
          name: string
          timezone?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          is_selected?: boolean | null
          name?: string
          timezone?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_ad_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ads_connections: {
        Row: {
          access_token: string | null
          app_scoped_user_id: string | null
          created_at: string
          id: string
          status: string | null
          token_expiry: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          access_token?: string | null
          app_scoped_user_id?: string | null
          created_at?: string
          id?: string
          status?: string | null
          token_expiry?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          access_token?: string | null
          app_scoped_user_id?: string | null
          created_at?: string
          id?: string
          status?: string | null
          token_expiry?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_ads_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_campaigns: {
        Row: {
          account_id: string
          campaign_id: string
          created_at: string
          id: string
          name: string
          objective: string | null
          status: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          account_id: string
          campaign_id: string
          created_at?: string
          id?: string
          name: string
          objective?: string | null
          status?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          account_id?: string
          campaign_id?: string
          created_at?: string
          id?: string
          name?: string
          objective?: string | null
          status?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_metrics_daily: {
        Row: {
          account_id: string
          actions_json: Json | null
          campaign_id: string
          clicks: number | null
          conversions: number | null
          cpc: number | null
          created_at: string
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          spend: number | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          account_id: string
          actions_json?: Json | null
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          date: string
          id?: string
          impressions?: number | null
          spend?: number | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          account_id?: string
          actions_json?: Json | null
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          created_at?: string
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          spend?: number | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_metrics_daily_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_daily: {
        Row: {
          bookings: number | null
          clicks: number | null
          cpl: number | null
          date: string
          id: string
          leads: number | null
          notes: string | null
          revenue: number | null
          spend: number | null
          workspace_id: string
        }
        Insert: {
          bookings?: number | null
          clicks?: number | null
          cpl?: number | null
          date: string
          id?: string
          leads?: number | null
          notes?: string | null
          revenue?: number | null
          spend?: number | null
          workspace_id: string
        }
        Update: {
          bookings?: number | null
          clicks?: number | null
          cpl?: number | null
          date?: string
          id?: string
          leads?: number | null
          notes?: string | null
          revenue?: number | null
          spend?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_daily_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_blueprints: {
        Row: {
          created_at: string
          id: string
          mechanism: string | null
          name: string
          objections: Json | null
          promise: string | null
          proof: string | null
          status: string
          tiers: Json | null
          updated_at: string
          version: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mechanism?: string | null
          name: string
          objections?: Json | null
          promise?: string | null
          proof?: string | null
          status?: string
          tiers?: Json | null
          updated_at?: string
          version?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mechanism?: string | null
          name?: string
          objections?: Json | null
          promise?: string | null
          proof?: string | null
          status?: string
          tiers?: Json | null
          updated_at?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_blueprints_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          industry: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          industry?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          industry?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_leads: {
        Row: {
          business_type: string | null
          created_at: string | null
          email: string | null
          goal: string | null
          id: string
          ip_address: string | null
          name: string
          notes: string | null
          phone: string | null
          revenue_range: string | null
          source: string | null
          status: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          business_type?: string | null
          created_at?: string | null
          email?: string | null
          goal?: string | null
          id?: string
          ip_address?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          revenue_range?: string | null
          source?: string | null
          status?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          business_type?: string | null
          created_at?: string | null
          email?: string | null
          goal?: string | null
          id?: string
          ip_address?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          revenue_range?: string | null
          source?: string | null
          status?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      research_findings: {
        Row: {
          content: Json
          created_at: string
          id: string
          sources: string[] | null
          type: string
          workspace_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          sources?: string[] | null
          type: string
          workspace_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          sources?: string[] | null
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_findings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_run_logs: {
        Row: {
          created_at: string
          id: string
          level: string
          message: string
          run_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string
          message: string
          run_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          message?: string
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_run_logs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "sync_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_runs: {
        Row: {
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          provider: string
          rows_upserted: number | null
          started_at: string
          status: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          provider: string
          rows_upserted?: number | null
          started_at?: string
          status?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          provider?: string
          rows_upserted?: number | null
          started_at?: string
          status?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          currency: string | null
          id: string
          industry: string | null
          name: string
          region: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          id?: string
          industry?: string | null
          name: string
          region?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          id?: string
          industry?: string | null
          name?: string
          region?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ads_metrics_daily: {
        Row: {
          account_id: string | null
          campaign_id: string | null
          clicks: number | null
          conversions: number | null
          date: string | null
          impressions: number | null
          network: string | null
          spend: number | null
          workspace_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: { Args: never; Returns: boolean }
      user_owns_workspace: {
        Args: { workspace_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
