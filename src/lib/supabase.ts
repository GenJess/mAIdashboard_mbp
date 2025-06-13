import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          type: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          owner_id?: string;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          business_id: string;
          client_name: string;
          client_phone: string | null;
          service: string;
          appointment_time: string;
          status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          client_name: string;
          client_phone?: string | null;
          service: string;
          appointment_time: string;
          status?: 'confirmed' | 'pending' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          client_name?: string;
          client_phone?: string | null;
          service?: string;
          appointment_time?: string;
          status?: 'confirmed' | 'pending' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          quantity: number;
          unit: string;
          low_stock_threshold: number;
          cost_per_unit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          quantity?: number;
          unit?: string;
          low_stock_threshold?: number;
          cost_per_unit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          quantity?: number;
          unit?: string;
          low_stock_threshold?: number;
          cost_per_unit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          price: number;
          category: string;
          ingredients: Record<string, number>;
          sold_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          price?: number;
          category?: string;
          ingredients?: Record<string, number>;
          sold_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          price?: number;
          category?: string;
          ingredients?: Record<string, number>;
          sold_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          business_id: string;
          title: string;
          description: string;
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'in-progress' | 'completed';
          due_date: string | null;
          assignee: string | null;
          category: string;
          is_recurring: boolean;
          recurrence_pattern: Record<string, any>;
          parent_task_id: string | null;
          next_due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          title: string;
          description?: string;
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in-progress' | 'completed';
          due_date?: string | null;
          assignee?: string | null;
          category?: string;
          is_recurring?: boolean;
          recurrence_pattern?: Record<string, any>;
          parent_task_id?: string | null;
          next_due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          title?: string;
          description?: string;
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in-progress' | 'completed';
          due_date?: string | null;
          assignee?: string | null;
          category?: string;
          is_recurring?: boolean;
          recurrence_pattern?: Record<string, any>;
          parent_task_id?: string | null;
          next_due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      calls: {
        Row: {
          id: string;
          business_id: string;
          caller_name: string;
          caller_phone: string | null;
          purpose: string | null;
          status: 'incoming' | 'active' | 'completed' | 'missed';
          duration: number;
          started_at: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          caller_name: string;
          caller_phone?: string | null;
          purpose?: string | null;
          status?: 'incoming' | 'active' | 'completed' | 'missed';
          duration?: number;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          caller_name?: string;
          caller_phone?: string | null;
          purpose?: string | null;
          status?: 'incoming' | 'active' | 'completed' | 'missed';
          duration?: number;
          started_at?: string;
          ended_at?: string | null;
          created_at?: string;
        };
      };
      business_metrics: {
        Row: {
          id: string;
          business_id: string;
          metric_name: string;
          metric_value: string;
          metric_change: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          metric_name: string;
          metric_value: string;
          metric_change?: number;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          metric_name?: string;
          metric_value?: string;
          metric_change?: number;
          date?: string;
          created_at?: string;
        };
      };
    };
  };
}