import { useState, useRef } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { useEntries } from '../lib/hooks/useEntries';
import { Card } from '../components/ui/Card';
import type { CheckinEntry, SessionType } from '../types';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += line[i];
    }
  }
  result.push(current.trim());
  return result;
}

function detectSessionType(timestamp: string): SessionType {
  const d = new Date(timestamp);
  return d.getHours() < 12 ? 'am' : 'pm';
}

function parseNumber(s: string): number | null {
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

type RawEntry = Omit<CheckinEntry, 'id' | 'created_at' | 'user_id'>;

function parseCSV(text: string): RawEntry[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));

  const findCol = (...names: string[]) => {
    for (const name of names) {
      const i = headers.findIndex(h => h.includes(name));
      if (i !== -1) return i;
    }
    return -1;
  };

  const timestampCol = findCol('timestamp', 'date', 'time');
  const energyCol = findCol('energy');
  const focusCol = findCol('focus');
  const moodCol = findCol('mood');
  const weightCol = findCol('weight');
  const notesCol = findCol('notes', 'note', 'comment');
  const sessionCol = findCol('session', 'am_pm', 'type');

  const entries: RawEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 4) continue;

    const timestamp = timestampCol >= 0 ? cols[timestampCol] : '';
    const d = timestamp ? new Date(timestamp) : new Date();
    const entryDate = d.toISOString().split('T')[0];

    let sessionType: SessionType;
    if (sessionCol >= 0 && cols[sessionCol]) {
      const raw = cols[sessionCol].toLowerCase().trim();
      sessionType = raw.includes('am') || raw === 'morning' ? 'am' : 'pm';
    } else {
      sessionType = detectSessionType(timestamp);
    }

    const energy = parseNumber(energyCol >= 0 ? cols[energyCol] : '');
    const focus = parseNumber(focusCol >= 0 ? cols[focusCol] : '');
    const mood = parseNumber(moodCol >= 0 ? cols[moodCol] : '');

    if (!energy || !focus || !mood) continue;
    if (energy < 1 || energy > 5 || focus < 1 || focus > 5 || mood < 1 || mood > 5) continue;

    entries.push({
      session_type: sessionType,
      energy: Math.round(energy) as 1 | 2 | 3 | 4 | 5,
      focus: Math.round(focus) as 1 | 2 | 3 | 4 | 5,
      mood: Math.round(mood) as 1 | 2 | 3 | 4 | 5,
      weight: weightCol >= 0 ? parseNumber(cols[weightCol]) : null,
      notes: notesCol >= 0 && cols[notesCol] ? cols[notesCol] : null,
      entry_date: entryDate,
    });
  }

  // Deduplicate by date + session_type (keep last)
  const map = new Map<string, RawEntry>();
  for (const e of entries) {
    map.set(`${e.entry_date}_${e.session_type}`, e);
  }
  return Array.from(map.values());
}

export function Settings() {
  const { user, signOut } = useAuth();
  const { bulkInsert } = useEntries(user?.id ?? null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success?: string; error?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        setImportResult({ error: 'No valid entries found in CSV. Check column headers.' });
        return;
      }

      const { error } = await bulkInsert(parsed);
      if (error) {
        setImportResult({ error: error.message });
      } else {
        setImportResult({ success: `Imported ${parsed.length} entries successfully!` });
      }
    } catch (err) {
      setImportResult({ error: 'Failed to parse CSV file.' });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>

      {/* Account */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Account</h2>
        <p className="text-sm text-gray-300 mb-4">{user?.email}</p>
        <button
          onClick={signOut}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-sm font-medium transition active:scale-95"
        >
          Sign Out
        </button>
      </Card>

      {/* CSV Import */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-1 uppercase tracking-wide">
          Import from CSV
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Upload a Google Forms CSV export. Expected columns: timestamp, energy, focus, mood, weight (optional), notes (optional).
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className={`block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl text-sm font-medium transition cursor-pointer
            ${importing ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {importing ? 'Importing...' : '📂 Choose CSV File'}
        </label>

        {importResult?.success && (
          <div className="mt-3 bg-green-900/30 border border-green-700 rounded-xl px-4 py-3 text-sm text-green-400">
            ✅ {importResult.success}
          </div>
        )}
        {importResult?.error && (
          <div className="mt-3 bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 text-sm text-red-400">
            ❌ {importResult.error}
          </div>
        )}
      </Card>

      {/* App Info */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">About</h2>
        <p className="text-sm text-gray-500">Daily Check-In v2 · Built with ❤️</p>
      </Card>
    </div>
  );
}
