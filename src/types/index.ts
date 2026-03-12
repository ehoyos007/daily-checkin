export type SessionType = 'am' | 'pm';

export interface CheckinEntry {
  id: string;
  user_id: string;
  session_type: SessionType;
  energy: number;
  focus: number;
  mood: number;
  weight: number | null;
  notes: string | null;
  created_at: string;
  entry_date: string;
}

export interface CheckinFormData {
  session_type: SessionType;
  energy: number;
  focus: number;
  mood: number;
  weight: string;
  notes: string;
}

export interface DayStats {
  date: string;
  am?: CheckinEntry;
  pm?: CheckinEntry;
  count: number;
}

export interface MetricStats {
  avg7d: number;
  avg30d: number;
  delta: number; // vs previous 7d
  data30d: number[];
}
