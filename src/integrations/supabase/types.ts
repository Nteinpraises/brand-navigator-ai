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
      audiences: {
        Row: {
          created_at: string
          description: string | null
          goals: Json
          id: string
          industries: Json
          name: string
          pain_points: Json
          preferred_topics: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goals?: Json
          id?: string
          industries?: Json
          name: string
          pain_points?: Json
          preferred_topics?: Json
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goals?: Json
          id?: string
          industries?: Json
          name?: string
          pain_points?: Json
          preferred_topics?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          action: string | null
          calendar_id: string | null
          completed_at: string | null
          created_at: string
          draft_id: string | null
          error: string | null
          error_message: string | null
          execution_id: string | null
          id: string
          message: string | null
          metadata: Json
          opportunity_id: string | null
          ran_at: string | null
          run_date: string
          started_at: string | null
          status: string
          user_id: string
          workflow_name: string
        }
        Insert: {
          action?: string | null
          calendar_id?: string | null
          completed_at?: string | null
          created_at?: string
          draft_id?: string | null
          error?: string | null
          error_message?: string | null
          execution_id?: string | null
          id?: string
          message?: string | null
          metadata?: Json
          opportunity_id?: string | null
          ran_at?: string | null
          run_date?: string
          started_at?: string | null
          status?: string
          user_id?: string
          workflow_name: string
        }
        Update: {
          action?: string | null
          calendar_id?: string | null
          completed_at?: string | null
          created_at?: string
          draft_id?: string | null
          error?: string | null
          error_message?: string | null
          execution_id?: string | null
          id?: string
          message?: string | null
          metadata?: Json
          opportunity_id?: string | null
          ran_at?: string | null
          run_date?: string
          started_at?: string | null
          status?: string
          user_id?: string
          workflow_name?: string
        }
        Relationships: []
      }
      brand_profiles: {
        Row: {
          bio: string | null
          content_pillars: string | null
          created_at: string
          expertise: Json
          id: string
          industries: Json
          is_active: boolean | null
          name: string | null
          positioning: string | null
          professional_title: string | null
          services: Json
          settings: Json
          target_audiences: string | null
          tone: string | null
          updated_at: string
          user_id: string
          words_to_avoid: Json
          writing_style: string | null
        }
        Insert: {
          bio?: string | null
          content_pillars?: string | null
          created_at?: string
          expertise?: Json
          id?: string
          industries?: Json
          is_active?: boolean | null
          name?: string | null
          positioning?: string | null
          professional_title?: string | null
          services?: Json
          settings?: Json
          target_audiences?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
          words_to_avoid?: Json
          writing_style?: string | null
        }
        Update: {
          bio?: string | null
          content_pillars?: string | null
          created_at?: string
          expertise?: Json
          id?: string
          industries?: Json
          is_active?: boolean | null
          name?: string | null
          positioning?: string | null
          professional_title?: string | null
          services?: Json
          settings?: Json
          target_audiences?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
          words_to_avoid?: Json
          writing_style?: string | null
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          client_or_project: string | null
          created_at: string
          id: string
          industries: Json
          lessons: string | null
          metrics: Json
          problem: string | null
          results: string | null
          solution: string | null
          technologies: Json
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_or_project?: string | null
          created_at?: string
          id?: string
          industries?: Json
          lessons?: string | null
          metrics?: Json
          problem?: string | null
          results?: string | null
          solution?: string | null
          technologies?: Json
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          client_or_project?: string | null
          created_at?: string
          id?: string
          industries?: Json
          lessons?: string | null
          metrics?: Json
          problem?: string | null
          results?: string | null
          solution?: string | null
          technologies?: Json
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_analytics: {
        Row: {
          calendar_id: string | null
          comments: number | null
          created_at: string
          draft_id: string | null
          followers_gained: number | null
          id: string
          impressions: number | null
          leads: number | null
          meetings_booked: number | null
          profile_visits: number | null
          published_at: string | null
          reactions: number | null
          reposts: number | null
          saves: number | null
          user_id: string | null
        }
        Insert: {
          calendar_id?: string | null
          comments?: number | null
          created_at?: string
          draft_id?: string | null
          followers_gained?: number | null
          id?: string
          impressions?: number | null
          leads?: number | null
          meetings_booked?: number | null
          profile_visits?: number | null
          published_at?: string | null
          reactions?: number | null
          reposts?: number | null
          saves?: number | null
          user_id?: string | null
        }
        Update: {
          calendar_id?: string | null
          comments?: number | null
          created_at?: string
          draft_id?: string | null
          followers_gained?: number | null
          id?: string
          impressions?: number | null
          leads?: number | null
          meetings_booked?: number | null
          profile_visits?: number | null
          published_at?: string | null
          reactions?: number | null
          reposts?: number | null
          saves?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      content_calendar: {
        Row: {
          audience_id: string | null
          audience_name: string | null
          created_at: string
          date: string | null
          draft_id: string | null
          format: string | null
          id: string
          objective: string | null
          opportunity_id: string | null
          pillar_id: string | null
          pillar_name: string | null
          scheduled_date: string
          status: string
          topic: string | null
          updated_at: string
          user_id: string
          visual_prompt_id: string | null
        }
        Insert: {
          audience_id?: string | null
          audience_name?: string | null
          created_at?: string
          date?: string | null
          draft_id?: string | null
          format?: string | null
          id?: string
          objective?: string | null
          opportunity_id?: string | null
          pillar_id?: string | null
          pillar_name?: string | null
          scheduled_date?: string
          status?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
          visual_prompt_id?: string | null
        }
        Update: {
          audience_id?: string | null
          audience_name?: string | null
          created_at?: string
          date?: string | null
          draft_id?: string | null
          format?: string | null
          id?: string
          objective?: string | null
          opportunity_id?: string | null
          pillar_id?: string | null
          pillar_name?: string | null
          scheduled_date?: string
          status?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
          visual_prompt_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_calendar_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "content_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_calendar_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "content_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_calendar_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "content_pillars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_calendar_visual_prompt_id_fkey"
            columns: ["visual_prompt_id"]
            isOneToOne: false
            referencedRelation: "visual_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_drafts: {
        Row: {
          ai_model: string | null
          body: string | null
          calendar_id: string | null
          closing: string | null
          created_at: string
          cta: string | null
          feedback: string | null
          full_post: string | null
          generation_metadata: Json
          hashtags: Json
          hook: string | null
          id: string
          opportunity_id: string | null
          published_at: string | null
          recommended_format: string | null
          rejection_reason: string | null
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          body?: string | null
          calendar_id?: string | null
          closing?: string | null
          created_at?: string
          cta?: string | null
          feedback?: string | null
          full_post?: string | null
          generation_metadata?: Json
          hashtags?: Json
          hook?: string | null
          id?: string
          opportunity_id?: string | null
          published_at?: string | null
          recommended_format?: string | null
          rejection_reason?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          ai_model?: string | null
          body?: string | null
          calendar_id?: string | null
          closing?: string | null
          created_at?: string
          cta?: string | null
          feedback?: string | null
          full_post?: string | null
          generation_metadata?: Json
          hashtags?: Json
          hook?: string | null
          id?: string
          opportunity_id?: string | null
          published_at?: string | null
          recommended_format?: string | null
          rejection_reason?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_drafts_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "content_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_drafts_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "content_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      content_insights: {
        Row: {
          created_at: string
          id: string
          recurring_themes: string | null
          summary: string | null
          top_audiences: string | null
          top_formats: string | null
          top_hooks: string | null
          top_pillars: string | null
          top_topics: string | null
          user_id: string | null
          weak_patterns: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          recurring_themes?: string | null
          summary?: string | null
          top_audiences?: string | null
          top_formats?: string | null
          top_hooks?: string | null
          top_pillars?: string | null
          top_topics?: string | null
          user_id?: string | null
          weak_patterns?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          recurring_themes?: string | null
          summary?: string | null
          top_audiences?: string | null
          top_formats?: string | null
          top_hooks?: string | null
          top_pillars?: string | null
          top_topics?: string | null
          user_id?: string | null
          weak_patterns?: string | null
        }
        Relationships: []
      }
      content_opportunities: {
        Row: {
          audience_id: string | null
          business_implication: string | null
          business_value_score: number | null
          calendar_id: string | null
          content_angle: string | null
          created_at: string
          evidence_score: number | null
          id: string
          key_insight: string | null
          main_topic: string | null
          originality_score: number | null
          overall_score: number | null
          pillar_id: string | null
          potential_hook: string | null
          recommended_format: string | null
          relevance_score: number | null
          research_item_id: string | null
          statistics: Json
          status: string
          suggested_angle: string | null
          suggested_hook: string | null
          supporting_evidence: Json
          timeliness_score: number | null
          topic: string | null
          useful_statistics: string | null
          user_id: string
          why_it_matters: string | null
        }
        Insert: {
          audience_id?: string | null
          business_implication?: string | null
          business_value_score?: number | null
          calendar_id?: string | null
          content_angle?: string | null
          created_at?: string
          evidence_score?: number | null
          id?: string
          key_insight?: string | null
          main_topic?: string | null
          originality_score?: number | null
          overall_score?: number | null
          pillar_id?: string | null
          potential_hook?: string | null
          recommended_format?: string | null
          relevance_score?: number | null
          research_item_id?: string | null
          statistics?: Json
          status?: string
          suggested_angle?: string | null
          suggested_hook?: string | null
          supporting_evidence?: Json
          timeliness_score?: number | null
          topic?: string | null
          useful_statistics?: string | null
          user_id?: string
          why_it_matters?: string | null
        }
        Update: {
          audience_id?: string | null
          business_implication?: string | null
          business_value_score?: number | null
          calendar_id?: string | null
          content_angle?: string | null
          created_at?: string
          evidence_score?: number | null
          id?: string
          key_insight?: string | null
          main_topic?: string | null
          originality_score?: number | null
          overall_score?: number | null
          pillar_id?: string | null
          potential_hook?: string | null
          recommended_format?: string | null
          relevance_score?: number | null
          research_item_id?: string | null
          statistics?: Json
          status?: string
          suggested_angle?: string | null
          suggested_hook?: string | null
          supporting_evidence?: Json
          timeliness_score?: number | null
          topic?: string | null
          useful_statistics?: string | null
          user_id?: string
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_opportunities_audience_id_fkey"
            columns: ["audience_id"]
            isOneToOne: false
            referencedRelation: "audiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_opportunities_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "content_pillars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_opportunities_research_item_id_fkey"
            columns: ["research_item_id"]
            isOneToOne: false
            referencedRelation: "research_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pillars: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          objectives: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          objectives?: Json
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          objectives?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          change_reason: string | null
          content: string | null
          created_at: string
          draft_id: string
          id: string
          user_id: string
          version_number: number
        }
        Insert: {
          change_reason?: string | null
          content?: string | null
          created_at?: string
          draft_id: string
          id?: string
          user_id?: string
          version_number?: number
        }
        Update: {
          change_reason?: string | null
          content?: string | null
          created_at?: string
          draft_id?: string
          id?: string
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "content_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      gamma_generations: {
        Row: {
          calendar_id: string | null
          created_at: string
          export_url: string | null
          gamma_url: string | null
          id: string
          meta: Json
          status: string
          updated_at: string
          user_id: string
          visual_prompt_id: string | null
        }
        Insert: {
          calendar_id?: string | null
          created_at?: string
          export_url?: string | null
          gamma_url?: string | null
          id?: string
          meta?: Json
          status?: string
          updated_at?: string
          user_id?: string
          visual_prompt_id?: string | null
        }
        Update: {
          calendar_id?: string | null
          created_at?: string
          export_url?: string | null
          gamma_url?: string | null
          id?: string
          meta?: Json
          status?: string
          updated_at?: string
          user_id?: string
          visual_prompt_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gamma_generations_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "content_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gamma_generations_visual_prompt_id_fkey"
            columns: ["visual_prompt_id"]
            isOneToOne: false
            referencedRelation: "visual_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_stories: {
        Row: {
          audiences: Json
          created_at: string
          id: string
          lesson: string | null
          pillars: Json
          story: string | null
          title: string | null
          topics: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          audiences?: Json
          created_at?: string
          id?: string
          lesson?: string | null
          pillars?: Json
          story?: string | null
          title?: string | null
          topics?: Json
          updated_at?: string
          user_id?: string
        }
        Update: {
          audiences?: Json
          created_at?: string
          id?: string
          lesson?: string | null
          pillars?: Json
          story?: string | null
          title?: string | null
          topics?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      research_items: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          credibility_score: number | null
          extracted_facts: Json
          hash: string | null
          id: string
          published_at: string | null
          published_date: string | null
          relevance_score: number | null
          source: string | null
          source_name: string | null
          source_type: string | null
          summary: string | null
          title: string | null
          url: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          credibility_score?: number | null
          extracted_facts?: Json
          hash?: string | null
          id?: string
          published_at?: string | null
          published_date?: string | null
          relevance_score?: number | null
          source?: string | null
          source_name?: string | null
          source_type?: string | null
          summary?: string | null
          title?: string | null
          url?: string | null
          user_id?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          credibility_score?: number | null
          extracted_facts?: Json
          hash?: string | null
          id?: string
          published_at?: string | null
          published_date?: string | null
          relevance_score?: number | null
          source?: string | null
          source_name?: string | null
          source_type?: string | null
          summary?: string | null
          title?: string | null
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      visual_prompts: {
        Row: {
          aspect_ratio: string | null
          calendar_id: string | null
          concept: string | null
          created_at: string
          draft_id: string | null
          gamma_prompt: string | null
          generation_id: string | null
          id: string
          image_meta: Json | null
          image_prompt: string | null
          image_url: string | null
          layout: string | null
          required_elements: Json
          status: string
          style: string | null
          user_id: string
          visual_text: string | null
          visual_type: string | null
        }
        Insert: {
          aspect_ratio?: string | null
          calendar_id?: string | null
          concept?: string | null
          created_at?: string
          draft_id?: string | null
          gamma_prompt?: string | null
          generation_id?: string | null
          id?: string
          image_meta?: Json | null
          image_prompt?: string | null
          image_url?: string | null
          layout?: string | null
          required_elements?: Json
          status?: string
          style?: string | null
          user_id?: string
          visual_text?: string | null
          visual_type?: string | null
        }
        Update: {
          aspect_ratio?: string | null
          calendar_id?: string | null
          concept?: string | null
          created_at?: string
          draft_id?: string | null
          gamma_prompt?: string | null
          generation_id?: string | null
          id?: string
          image_meta?: Json | null
          image_prompt?: string | null
          image_url?: string | null
          layout?: string | null
          required_elements?: Json
          status?: string
          style?: string | null
          user_id?: string
          visual_text?: string | null
          visual_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visual_prompts_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "content_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
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
