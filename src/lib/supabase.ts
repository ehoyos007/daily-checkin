import { createClient } from '@supabase/supabase-js';
import type { CheckinEntry } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

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
