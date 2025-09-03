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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          neighborhood: string
          number: string
          state: string
          street: string
          user_id: string | null
          zip_code: string
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          neighborhood: string
          number: string
          state: string
          street: string
          user_id?: string | null
          zip_code: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          neighborhood?: string
          number?: string
          state?: string
          street?: string
          user_id?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: Database["public"]["Enums"]["contact_status_enum"] | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: Database["public"]["Enums"]["contact_status_enum"] | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: Database["public"]["Enums"]["contact_status_enum"] | null
          subject?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          grind_type: string | null
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
          variation_id: string | null
        }
        Insert: {
          created_at?: string | null
          grind_type?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          unit_price: number
          variation_id?: string | null
        }
        Update: {
          created_at?: string | null
          grind_type?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
          variation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "product_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: string
          order_number: string
          payment_method: string | null
          shipping: number | null
          shipping_address: Json | null
          status: Database["public"]["Enums"]["order_status_enum"] | null
          subtotal: number
          total: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_number: string
          payment_method?: string | null
          shipping?: number | null
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status_enum"] | null
          subtotal: number
          total: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_number?: string
          payment_method?: string | null
          shipping?: number | null
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status_enum"] | null
          subtotal?: number
          total?: number
          user_id?: string | null
        }
        Relationships: []
      }
      product_attribute_values: {
        Row: {
          attribute_id: string
          created_at: string
          id: string
          slug: string
          value: string
        }
        Insert: {
          attribute_id: string
          created_at?: string
          id?: string
          slug: string
          value: string
        }
        Update: {
          attribute_id?: string
          created_at?: string
          id?: string
          slug?: string
          value?: string
        }
        Relationships: []
      }
      product_attribute_variations: {
        Row: {
          attribute_id: string
          attribute_value_id: string
          created_at: string
          id: string
          product_id: string
          variation_id: string | null
        }
        Insert: {
          attribute_id: string
          attribute_value_id: string
          created_at?: string
          id?: string
          product_id: string
          variation_id?: string | null
        }
        Update: {
          attribute_id?: string
          attribute_value_id?: string
          created_at?: string
          id?: string
          product_id?: string
          variation_id?: string | null
        }
        Relationships: []
      }
      product_attributes: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          type?: string
        }
        Relationships: []
      }
      product_variations: {
        Row: {
          created_at: string | null
          id: string
          min_stock: number | null
          price: number
          product_id: string | null
          stock: number | null
          weight: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          min_stock?: number | null
          price: number
          product_id?: string | null
          stock?: number | null
          weight?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          min_stock?: number | null
          price?: number
          product_id?: string | null
          stock?: number | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category_id: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          grind_type: Database["public"]["Enums"]["grind_type_enum"] | null
          id: string
          images: string[] | null
          meta_description: string | null
          meta_title: string | null
          name: string
          slug: string
          status: Database["public"]["Enums"]["product_status_enum"] | null
          tags: string[] | null
        }
        Insert: {
          base_price: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          grind_type?: Database["public"]["Enums"]["grind_type_enum"] | null
          id?: string
          images?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          slug: string
          status?: Database["public"]["Enums"]["product_status_enum"] | null
          tags?: string[] | null
        }
        Update: {
          base_price?: number
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          grind_type?: Database["public"]["Enums"]["grind_type_enum"] | null
          id?: string
          images?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["product_status_enum"] | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id: string
          is_admin?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string | null
          current_stock: number
          id: string
          previous_stock: number
          quantity: number
          reason: string | null
          type: Database["public"]["Enums"]["stock_movement_type_enum"] | null
          variation_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_stock: number
          id?: string
          previous_stock: number
          quantity: number
          reason?: string | null
          type?: Database["public"]["Enums"]["stock_movement_type_enum"] | null
          variation_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_stock?: number
          id?: string
          previous_stock?: number
          quantity?: number
          reason?: string | null
          type?: Database["public"]["Enums"]["stock_movement_type_enum"] | null
          variation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "product_variations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contact_status_enum: "novo" | "respondido"
      grind_type_enum: "grãos" | "fina" | "média" | "grossa"
      order_status_enum:
        | "pendente"
        | "confirmado"
        | "enviado"
        | "entregue"
        | "cancelado"
      product_status_enum: "ativo" | "inativo"
      stock_movement_type_enum:
        | "entrada"
        | "saida"
        | "venda"
        | "perda"
        | "ajuste"
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
      contact_status_enum: ["novo", "respondido"],
      grind_type_enum: ["grãos", "fina", "média", "grossa"],
      order_status_enum: [
        "pendente",
        "confirmado",
        "enviado",
        "entregue",
        "cancelado",
      ],
      product_status_enum: ["ativo", "inativo"],
      stock_movement_type_enum: [
        "entrada",
        "saida",
        "venda",
        "perda",
        "ajuste",
      ],
    },
  },
} as const
