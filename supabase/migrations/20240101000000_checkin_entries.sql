CREATE TABLE IF NOT EXISTS checkin_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('am', 'pm')),
  energy SMALLINT NOT NULL CHECK (energy BETWEEN 1 AND 5),
  focus SMALLINT NOT NULL CHECK (focus BETWEEN 1 AND 5),
  mood SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  weight NUMERIC(5,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  entry_date DATE DEFAULT CURRENT_DATE NOT NULL
);

ALTER TABLE checkin_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their entries" ON checkin_entries;
CREATE POLICY "Users own their entries" ON checkin_entries FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS checkin_entries_user_date ON checkin_entries(user_id, entry_date DESC);
