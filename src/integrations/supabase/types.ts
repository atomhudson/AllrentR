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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          description: string | null
          display_duration: number
          id: string
          image_url: string | null
          link_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          display_duration?: number
          id?: string
          image_url?: string | null
          link_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          display_duration?: number
          id?: string
          image_url?: string | null
          link_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          display_order: number
          id: string
          image_url: string
          link_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          display_order?: number
          id?: string
          image_url: string
          link_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          display_order?: number
          id?: string
          image_url?: string
          link_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          published: boolean
          reference_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          published?: boolean
          reference_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          published?: boolean
          reference_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          created_by: string
          discount_amount: number
          discount_percentage: number
          id: string
          is_percentage: boolean
          updated_at: string
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          created_by: string
          discount_amount?: number
          discount_percentage: number
          id?: string
          is_percentage?: boolean
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          created_by?: string
          discount_amount?: number
          discount_percentage?: number
          id?: string
          is_percentage?: boolean
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      influencer_partners: {
        Row: {
          active: boolean
          avatar_url: string
          bio: string | null
          created_at: string
          created_by: string
          display_order: number
          followers_count: number | null
          id: string
          name: string
          platform: string
          profile_url: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url: string
          bio?: string | null
          created_at?: string
          created_by: string
          display_order?: number
          followers_count?: number | null
          id?: string
          name: string
          platform: string
          profile_url?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string
          bio?: string | null
          created_at?: string
          created_by?: string
          display_order?: number
          followers_count?: number | null
          id?: string
          name?: string
          platform?: string
          profile_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          address: string
          availability: boolean
          category: string
          coupon_code: string | null
          created_at: string
          description: string
          discount_amount: number
          final_price: number
          id: string
          images: string[] | null
          listing_status: string
          listing_type: string
          original_price: number
          owner_user_id: string
          payment_transaction: string
          payment_verified: boolean
          phone: string
          pin_code: string
          product_name: string
          product_type: Database["public"]["Enums"]["product_type"]
          rating: number | null
          rent_price: number
          views: number
        }
        Insert: {
          address?: string
          availability?: boolean
          category?: string
          coupon_code?: string | null
          created_at?: string
          description: string
          discount_amount?: number
          final_price?: number
          id?: string
          images?: string[] | null
          listing_status?: string
          listing_type?: string
          original_price?: number
          owner_user_id: string
          payment_transaction: string
          payment_verified?: boolean
          phone?: string
          pin_code: string
          product_name: string
          product_type?: Database["public"]["Enums"]["product_type"]
          rating?: number | null
          rent_price: number
          views?: number
        }
        Update: {
          address?: string
          availability?: boolean
          category?: string
          coupon_code?: string | null
          created_at?: string
          description?: string
          discount_amount?: number
          final_price?: number
          id?: string
          images?: string[] | null
          listing_status?: string
          listing_type?: string
          original_price?: number
          owner_user_id?: string
          payment_transaction?: string
          payment_verified?: boolean
          phone?: string
          pin_code?: string
          product_name?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          rating?: number | null
          rent_price?: number
          views?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          message: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          message: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          message?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_active_at: string | null
          longest_streak: number | null
          name: string
          phone: string
          pin_code: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id: string
          last_active_at?: string | null
          longest_streak?: number | null
          name: string
          phone: string
          pin_code: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_at?: string | null
          longest_streak?: number | null
          name?: string
          phone?: string
          pin_code?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      section_visibility: {
        Row: {
          id: string
          is_visible: boolean
          section_name: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          id?: string
          is_visible?: boolean
          section_name: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          id?: string
          is_visible?: boolean
          section_name?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      terms_and_conditions: {
        Row: {
          active: boolean
          content: string
          created_at: string
          created_by: string
          id: string
          updated_at: string
          version: number
        }
        Insert: {
          active?: boolean
          content: string
          created_at?: string
          created_by: string
          id?: string
          updated_at?: string
          version?: number
        }
        Update: {
          active?: boolean
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      top_profiles: {
        Row: {
          active: boolean
          avatar_url: string
          created_at: string
          created_by: string
          display_order: number
          id: string
          name: string
          streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          avatar_url: string
          created_at?: string
          created_by: string
          display_order?: number
          id?: string
          name: string
          streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          avatar_url?: string
          created_at?: string
          created_by?: string
          display_order?: number
          id?: string
          name?: string
          streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string
        }
        Relationships: []
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
    }
    Views: {
      leaderboard: {
        Row: {
          current_streak: number | null
          id: string | null
          last_active_at: string | null
          longest_streak: number | null
          name: string | null
          rank: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_listing_rating: {
        Args: { listing_id_param: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coupon_usage: {
        Args: { coupon_code: string }
        Returns: undefined
      }
      increment_listing_views: {
        Args: { listing_id: string }
        Returns: undefined
      }
      sync_top_profiles: { Args: never; Returns: undefined }
      update_user_activity: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      product_type: "rent" | "sale" | "both"
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
      app_role: ["admin", "user"],
      product_type: ["rent", "sale", "both"],
    },
  },
} as const
