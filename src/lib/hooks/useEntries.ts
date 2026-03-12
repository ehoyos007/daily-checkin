import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { CheckinEntry } from '../../types';

export function useEntries(userId: string | null) {
  const [entries, setEntries] = useState<CheckinEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('checkin_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .order('session_type', { ascending: true })
      .limit(200);

    if (!error && data) setEntries(data as CheckinEntry[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (entry: Omit<CheckinEntry, 'id' | 'created_at' | 'user_id'>) => {
    if (!userId) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase
      .from('checkin_entries')
      .insert({ ...entry, user_id: userId })
      .select()
      .single();

    if (!error && data) {
      setEntries(prev => {
        const filtered = prev.filter(
          e => !(e.entry_date === entry.entry_date && e.session_type === entry.session_type)
        );
        return [data as CheckinEntry, ...filtered].sort(
          (a, b) => b.entry_date.localeCompare(a.entry_date)
        );
      });
    }
    return { data, error };
  };

  const updateEntry = async (id: string, updates: Partial<CheckinEntry>) => {
    const { data, error } = await supabase
      .from('checkin_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setEntries(prev => prev.map(e => e.id === id ? data as CheckinEntry : e));
    }
    return { data, error };
  };

  const bulkInsert = async (rawEntries: Omit<CheckinEntry, 'id' | 'created_at' | 'user_id'>[]) => {
    if (!userId) return { error: new Error('Not authenticated') };
    const withUser = rawEntries.map(e => ({ ...e, user_id: userId }));
    const { data, error } = await supabase
      .from('checkin_entries')
      .upsert(withUser, { onConflict: 'user_id,entry_date,session_type', ignoreDuplicates: true })
      .select();

    if (!error) await fetchEntries();
    return { data, error };
  };

  const todayEntry = (sessionType: 'am' | 'pm') => {
    const today = new Date().toISOString().split('T')[0];
    return entries.find(e => e.entry_date === today && e.session_type === sessionType) ?? null;
  };

  return { entries, loading, addEntry, updateEntry, bulkInsert, refetch: fetchEntries, todayEntry };
}
