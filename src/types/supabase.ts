export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// This is a placeholder for your Supabase database types
// You can generate these types using the Supabase CLI:
// npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
export interface Database {
  public: {
    Tables: {
      // Add your table definitions here
      // Example:
      // profiles: {
      //   Row: {
      //     id: string
      //     username: string | null
      //     created_at: string
      //   }
      //   Insert: {
      //     id?: string
      //     username?: string | null
      //     created_at?: string
      //   }
      //   Update: {
      //     id?: string
      //     username?: string | null
      //     created_at?: string
      //   }
      // }
    }
    Views: {
      // Add your view definitions here
    }
    Functions: {
      // Add your function definitions here
    }
    Enums: {
      // Add your enum definitions here
    }
    CompositeTypes: {
      // Add your composite type definitions here
    }
  }
}