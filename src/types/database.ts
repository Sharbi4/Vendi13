export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string | null
          date: string
          id: number
          is_available: boolean | null
          listing_id: number
          price_override: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: never
          is_available?: boolean | null
          listing_id: number
          price_override?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: never
          is_available?: boolean | null
          listing_id?: number
          price_override?: number | null
        }
      }
      booking_addons: {
        Row: {
          booking_id: number
          created_at: string | null
          description: string | null
          id: number
          name: string
          price: number
          quantity: number | null
          status: string | null
        }
        Insert: {
          booking_id: number
          created_at?: string | null
          description?: string | null
          id?: never
          name: string
          price: number
          quantity?: number | null
          status?: string | null
        }
        Update: {
          booking_id?: number
          created_at?: string | null
          description?: string | null
          id?: never
          name?: string
          price?: number
          quantity?: number | null
          status?: string | null
        }
      }
      bookings: {
        Row: {
          addons_total: number | null
          base_price: number
          created_at: string | null
          end_date: string
          guest_email: string
          host_email: string
          id: number
          listing_id: number | null
          notes: string | null
          payment_intent_id: string | null
          payment_status: string | null
          refund_amount: number | null
          refund_date: string | null
          selected_addons: Json | null
          service_fee: number | null
          start_date: string
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          addons_total?: number | null
          base_price: number
          created_at?: string | null
          end_date: string
          guest_email: string
          host_email: string
          id?: never
          listing_id?: number | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          selected_addons?: Json | null
          service_fee?: number | null
          start_date: string
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          addons_total?: number | null
          base_price?: number
          created_at?: string | null
          end_date?: string
          guest_email?: string
          host_email?: string
          id?: never
          listing_id?: number | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          selected_addons?: Json | null
          service_fee?: number | null
          start_date?: string
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
      }
      conversations: {
        Row: {
          created_at: string | null
          id: number
          last_message_at: string | null
          listing_id: number | null
          participant_1: string
          participant_2: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          last_message_at?: string | null
          listing_id?: number | null
          participant_1: string
          participant_2: string
        }
        Update: {
          created_at?: string | null
          id?: never
          last_message_at?: string | null
          listing_id?: number | null
          participant_1?: string
          participant_2?: string
        }
      }
      escrows: {
        Row: {
          amount: number
          buyer_email: string
          created_at: string | null
          delivery_confirmed_at: string | null
          funds_released_date: string | null
          id: number
          listing_id: number | null
          payment_intent_id: string | null
          receipt_confirmed_at: string | null
          seller_email: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_email: string
          created_at?: string | null
          delivery_confirmed_at?: string | null
          funds_released_date?: string | null
          id?: never
          listing_id?: number | null
          payment_intent_id?: string | null
          receipt_confirmed_at?: string | null
          seller_email: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_email?: string
          created_at?: string | null
          delivery_confirmed_at?: string | null
          funds_released_date?: string | null
          id?: never
          listing_id?: number | null
          payment_intent_id?: string | null
          receipt_confirmed_at?: string | null
          seller_email?: string
          status?: string | null
          updated_at?: string | null
        }
      }
      listings: {
        Row: {
          accepts_offers: boolean | null
          address: string | null
          asset_category: string
          average_rating: number | null
          city: string | null
          created_at: string | null
          created_by: string
          daily_price: number | null
          delivery_available: boolean | null
          description: string | null
          featured_until: string | null
          generator_included: boolean | null
          hood_system: boolean | null
          id: number
          instant_book: boolean | null
          is_featured: boolean | null
          latitude: number | null
          listing_mode: string
          longitude: number | null
          media: Json | null
          minimum_offer: number | null
          monthly_price: number | null
          public_location_label: string | null
          refrigeration: boolean | null
          review_count: number | null
          sale_price: number | null
          security_deposit: number | null
          state: string | null
          status: string | null
          title: string
          updated_at: string | null
          verification_status: string | null
          view_count: number | null
          weekly_price: number | null
          zip_code: string | null
        }
        Insert: {
          accepts_offers?: boolean | null
          address?: string | null
          asset_category: string
          average_rating?: number | null
          city?: string | null
          created_at?: string | null
          created_by: string
          daily_price?: number | null
          delivery_available?: boolean | null
          description?: string | null
          featured_until?: string | null
          generator_included?: boolean | null
          hood_system?: boolean | null
          id?: never
          instant_book?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          listing_mode: string
          longitude?: number | null
          media?: Json | null
          minimum_offer?: number | null
          monthly_price?: number | null
          public_location_label?: string | null
          refrigeration?: boolean | null
          review_count?: number | null
          sale_price?: number | null
          security_deposit?: number | null
          state?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          verification_status?: string | null
          view_count?: number | null
          weekly_price?: number | null
          zip_code?: string | null
        }
        Update: {
          accepts_offers?: boolean | null
          address?: string | null
          asset_category?: string
          average_rating?: number | null
          city?: string | null
          created_at?: string | null
          created_by?: string
          daily_price?: number | null
          delivery_available?: boolean | null
          description?: string | null
          featured_until?: string | null
          generator_included?: boolean | null
          hood_system?: boolean | null
          id?: never
          instant_book?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          listing_mode?: string
          longitude?: number | null
          media?: Json | null
          minimum_offer?: number | null
          monthly_price?: number | null
          public_location_label?: string | null
          refrigeration?: boolean | null
          review_count?: number | null
          sale_price?: number | null
          security_deposit?: number | null
          state?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          verification_status?: string | null
          view_count?: number | null
          weekly_price?: number | null
          zip_code?: string | null
        }
      }
      messages: {
        Row: {
          content: string
          conversation_id: number
          created_at: string | null
          id: number
          is_read: boolean | null
          scheduled_at: string | null
          sender_email: string
          sent_at: string | null
        }
        Insert: {
          content: string
          conversation_id: number
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          scheduled_at?: string | null
          sender_email: string
          sent_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: number
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          scheduled_at?: string | null
          sender_email?: string
          sent_at?: string | null
        }
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          link: string | null
          message: string
          read: boolean | null
          reference_id: string | null
          title: string
          type: string
          user_email: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          link?: string | null
          message: string
          read?: boolean | null
          reference_id?: string | null
          title: string
          type: string
          user_email: string
        }
        Update: {
          created_at?: string | null
          id?: never
          link?: string | null
          message?: string
          read?: boolean | null
          reference_id?: string | null
          title?: string
          type?: string
          user_email?: string
        }
      }
      payouts: {
        Row: {
          amount: number
          created_at: string | null
          host_email: string
          id: number
          net_amount: number
          payout_date: string | null
          platform_fee: number | null
          shipping_cost: number | null
          status: string | null
          stripe_transfer_id: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          host_email: string
          id?: never
          net_amount: number
          payout_date?: string | null
          platform_fee?: number | null
          shipping_cost?: number | null
          status?: string | null
          stripe_transfer_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          host_email?: string
          id?: never
          net_amount?: number
          payout_date?: string | null
          platform_fee?: number | null
          shipping_cost?: number | null
          status?: string | null
          stripe_transfer_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
      }
      reviews: {
        Row: {
          booking_id: number | null
          content: string | null
          created_at: string | null
          host_email: string
          host_response: string | null
          host_response_date: string | null
          id: number
          listing_id: number | null
          rating: number
          reviewer_email: string
          sentiment_label: string | null
          sentiment_score: number | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: number | null
          content?: string | null
          created_at?: string | null
          host_email: string
          host_response?: string | null
          host_response_date?: string | null
          id?: never
          listing_id?: number | null
          rating: number
          reviewer_email: string
          sentiment_label?: string | null
          sentiment_score?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: number | null
          content?: string | null
          created_at?: string | null
          host_email?: string
          host_response?: string | null
          host_response_date?: string | null
          id?: never
          listing_id?: number | null
          rating?: number
          reviewer_email?: string
          sentiment_label?: string | null
          sentiment_score?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: number
          metadata: Json | null
          payment_intent_id: string | null
          payment_method: string | null
          receipt_url: string | null
          reference_id: string | null
          refund_amount: number | null
          refund_date: string | null
          refund_reason: string | null
          seller_shipping_cost: number | null
          status: string | null
          transaction_type: string
          updated_at: string | null
          user_email: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: never
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reference_id?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          refund_reason?: string | null
          seller_shipping_cost?: number | null
          status?: string | null
          transaction_type: string
          updated_at?: string | null
          user_email: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: never
          metadata?: Json | null
          payment_intent_id?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reference_id?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          refund_reason?: string | null
          seller_shipping_cost?: number | null
          status?: string | null
          transaction_type?: string
          updated_at?: string | null
          user_email?: string
        }
      }
      users: {
        Row: {
          ai_assistant_current_period_end: string | null
          ai_assistant_subscription_id: string | null
          ai_assistant_subscription_status: string | null
          ai_assistant_trial_end: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          identity_verification_completed: string | null
          identity_verification_session_id: string | null
          identity_verification_status: string | null
          phone: string | null
          role: string | null
          stripe_account_id: string | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          ai_assistant_current_period_end?: string | null
          ai_assistant_subscription_id?: string | null
          ai_assistant_subscription_status?: string | null
          ai_assistant_trial_end?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          identity_verification_completed?: string | null
          identity_verification_session_id?: string | null
          identity_verification_status?: string | null
          phone?: string | null
          role?: string | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_assistant_current_period_end?: string | null
          ai_assistant_subscription_id?: string | null
          ai_assistant_subscription_status?: string | null
          ai_assistant_trial_end?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          identity_verification_completed?: string | null
          identity_verification_session_id?: string | null
          identity_verification_status?: string | null
          phone?: string | null
          role?: string | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type User = Tables<'users'>
export type Listing = Tables<'listings'>
export type Booking = Tables<'bookings'>
export type Review = Tables<'reviews'>
export type Message = Tables<'messages'>
export type Conversation = Tables<'conversations'>
export type Transaction = Tables<'transactions'>
export type Notification = Tables<'notifications'>
export type Payout = Tables<'payouts'>
export type Escrow = Tables<'escrows'>
export type Availability = Tables<'availability'>
