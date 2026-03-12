import { createClient } from '@supabase/supabase-js';
import type { CheckinEntry } from '../types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://msqhstkdltiabqntjyqh.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zcWhzdGtkbHRpYWJxbnRqeXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MTQ3MDYsImV4cCI6MjA4NTI5MDcwNn0.X8gT3yC6FWRTrEzNE0Jykm9gUw7OgOXtnSzLzZ98wiI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      checkin_entries: {
        Row: CheckinEntry;
        Insert: Omit<CheckinEntry, 'id' | 'created_at' | 'user_id'> & {
          id?: string;
          created_at?: string;
          user_id?: string;
        };
        Update: Partial<CheckinEntry>;
      };
    };
  };
};
