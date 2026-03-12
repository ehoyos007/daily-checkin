import { useEffect, useState } from 'react';
import { ScoreSelector } from '../components/ui/ScoreSelector';
import { useEntries } from '../lib/hooks/useEntries';
import { useAuth } from '../lib/hooks/useAuth';
import type { CheckinEntry, SessionType } from '../types';

function getSessionType(): SessionType {
  return new Date().getHours() < 12 ? 'am' : 'pm';
}

function getGreeting(session: SessionType): string {
  return session === 'am' ? '🌅 Good Morning' : '🌙 Good Evening';
}

interface CheckInFormProps {
  sessionType: SessionType;
  initial?: CheckinEntry | null;
  onSave: () => void;
  userId: string;
}

function CheckInForm({ sessionType, initial, onSave, userId }: CheckInFormProps) {
  const { addEntry, updateEntry } = useEntries(userId);
  const [energy, setEnergy] = useState(initial?.energy ?? 0);
  const [focus, setFocus] = useState(initial?.focus ?? 0);
  const [mood, setMood] = useState(initial?.mood ?? 0);
  const [weight, setWeight] = useState(initial?.weight?.toString() ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!energy || !focus || !mood) {
      setError('Please rate all three metrics.');
      return;
    }
    setError('');
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const payload = {
      session_type: sessionType,
      energy,
      focus,
      mood,
      weight: weight ? parseFloat(weight) : null,
      notes: notes || null,
      entry_date: today,
    };

    const { error: err } = initial
      ? await updateEntry(initial.id, payload)
      : await addEntry(payload);

    if (err) {
      setError(err.message);
    } else {
      onSave();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <ScoreSelector label="Energy" icon="⚡" value={energy} onChange={setEnergy} />
      <ScoreSelector label="Focus" icon="🎯" value={focus} onChange={setFocus} />
      <ScoreSelector label="Mood" icon="😊" value={mood} onChange={setMood} />

      <div className="mt-4">
        <label className="block text-sm text-gray-400 mb-1">Weight (lbs) — optional</label>
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500 transition"
          placeholder="e.g. 175.5"
        />
      </div>

      <div className="mt-3">
        <label className="block text-sm text-gray-400 mb-1">Notes — optional</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
          placeholder="How's it going?"
        />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold py-4 rounded-2xl text-lg transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
      >
        {loading ? 'Saving...' : initial ? 'Update Check-In' : 'Submit Check-In'}
      </button>
    </form>
  );
}

export function CheckIn() {
  const { user } = useAuth();
  const sessionType = getSessionType();
  const { todayEntry, refetch } = useEntries(user?.id ?? null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const existing = todayEntry(sessionType);

  useEffect(() => {
    setSaved(false);
    setEditing(false);
  }, [sessionType]);

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    refetch();
  };

  if (!user) return null;

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{getGreeting(sessionType)}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {sessionType === 'am' ? 'AM' : 'PM'} Check-In · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {existing && !editing ? (
        <div className="bg-zinc-900 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-white">
                  {sessionType === 'am' ? 'Morning' : 'Evening'} done!
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(existing.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-orange-500 hover:text-orange-400 font-medium"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Energy', icon: '⚡', value: existing.energy },
              { label: 'Focus', icon: '🎯', value: existing.focus },
              { label: 'Mood', icon: '😊', value: existing.mood },
            ].map(m => (
              <div key={m.label} className="bg-zinc-800 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">{m.icon}</div>
                <div className="text-2xl font-bold text-orange-500">{m.value}</div>
                <div className="text-xs text-gray-400">{m.label}</div>
              </div>
            ))}
          </div>

          {existing.weight && (
            <div className="mt-3 text-sm text-gray-400">
              ⚖️ {existing.weight} lbs
            </div>
          )}
          {existing.notes && (
            <div className="mt-2 text-sm text-gray-300 bg-zinc-800 rounded-xl p-3">
              "{existing.notes}"
            </div>
          )}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-2xl p-5">
          <CheckInForm
            sessionType={sessionType}
            initial={editing ? existing : null}
            onSave={handleSave}
            userId={user.id}
          />
        </div>
      )}

      {saved && !editing && (
        <div className="mt-4 bg-green-900/30 border border-green-700 rounded-xl px-4 py-3 text-sm text-green-400 text-center">
          ✅ Check-in saved!
        </div>
      )}
    </div>
  );
}
