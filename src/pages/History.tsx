import { useAuth } from '../lib/hooks/useAuth';
import { useEntries } from '../lib/hooks/useEntries';
import { useStats } from '../lib/hooks/useStats';
import { HeatmapGrid } from '../components/ui/HeatmapGrid';
import { Card } from '../components/ui/Card';
import type { CheckinEntry } from '../types';

function EntryCard({ entry }: { entry: CheckinEntry }) {
  const time = new Date(entry.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });
  const date = new Date(entry.entry_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-bold uppercase text-orange-500 mr-2">
            {entry.session_type}
          </span>
          <span className="text-xs text-gray-400">{date} · {time}</span>
        </div>
        {entry.weight && (
          <span className="text-xs text-gray-400">⚖️ {entry.weight} lbs</span>
        )}
      </div>
      <div className="flex gap-4 text-sm">
        <span>⚡ <strong className="text-orange-400">{entry.energy}</strong></span>
        <span>🎯 <strong className="text-blue-400">{entry.focus}</strong></span>
        <span>😊 <strong className="text-emerald-400">{entry.mood}</strong></span>
      </div>
      {entry.notes && (
        <p className="mt-2 text-xs text-gray-400 italic">"{entry.notes}"</p>
      )}
    </div>
  );
}

export function History() {
  const { user } = useAuth();
  const { entries, loading } = useEntries(user?.id ?? null);
  const { heatmap30d, streak } = useStats(entries);

  const recent = entries.slice(0, 10);

  if (loading) {
    return <div className="p-4 text-center text-gray-400 mt-20">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-white mb-4">History</h1>

      {/* Streak */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="text-5xl">🔥</div>
          <div>
            <div className="text-3xl font-bold text-white">{streak}</div>
            <div className="text-sm text-gray-400">day streak</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-bold text-orange-500">{entries.length}</div>
            <div className="text-xs text-gray-400">total entries</div>
          </div>
        </div>
      </Card>

      {/* Heatmap */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Last 30 Days
        </h2>
        <HeatmapGrid data={heatmap30d} />
      </Card>

      {/* Recent entries */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            Recent Entries
          </h2>
          <div className="space-y-3">
            {recent.map(entry => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-3">📅</div>
          <p>No check-ins yet. Get started!</p>
        </div>
      )}
    </div>
  );
}
