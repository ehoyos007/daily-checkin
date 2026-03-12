import { useAuth } from '../lib/hooks/useAuth';
import { useEntries } from '../lib/hooks/useEntries';
import { useStats } from '../lib/hooks/useStats';
import { Sparkline } from '../components/ui/Sparkline';
import { Card } from '../components/ui/Card';

function DeltaArrow({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.05) return <span className="text-gray-500 text-xs">→</span>;
  return (
    <span className={`text-xs font-bold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
      {delta > 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}
    </span>
  );
}

function AmPmBar({ am, pm, color }: { am: number; pm: number; color: string }) {
  const max = 5;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="w-6">AM</span>
        <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(am / max) * 100}%`, backgroundColor: color }}
          />
        </div>
        <span className="w-6 text-right">{am.toFixed(1)}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="w-6">PM</span>
        <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all opacity-70"
            style={{ width: `${(pm / max) * 100}%`, backgroundColor: color }}
          />
        </div>
        <span className="w-6 text-right">{pm.toFixed(1)}</span>
      </div>
    </div>
  );
}

const METRICS = [
  { key: 'energy' as const, label: 'Energy', icon: '⚡', color: '#f97316' },
  { key: 'focus' as const, label: 'Focus', icon: '🎯', color: '#3b82f6' },
  { key: 'mood' as const, label: 'Mood', icon: '😊', color: '#10b981' },
];

export function Trends() {
  const { user } = useAuth();
  const { entries, loading } = useEntries(user?.id ?? null);
  const { metricStats, weightData30d, todayStats, amPmComparison } = useStats(entries);

  if (loading) {
    return <div className="p-4 text-center text-gray-400 mt-20">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-white mb-4">Trends</h1>

      {/* Today */}
      {todayStats && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Today</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['am', 'pm'] as const).map(session => {
              const e = todayStats[session];
              return e ? (
                <div key={session} className="bg-zinc-800 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-2 font-medium uppercase">{session}</p>
                  {METRICS.map(m => (
                    <div key={m.key} className="flex justify-between text-sm">
                      <span className="text-gray-400">{m.icon}</span>
                      <span className="font-semibold" style={{ color: m.color }}>{e[m.key]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div key={session} className="bg-zinc-800 rounded-xl p-3 flex items-center justify-center">
                  <span className="text-xs text-gray-500 uppercase">{session} pending</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* 7-day averages */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">7-Day Averages</h2>
        <div className="space-y-3">
          {METRICS.map(m => {
            const stats = metricStats[m.key];
            return (
              <div key={m.key} className="flex items-center gap-3">
                <span className="text-lg w-7">{m.icon}</span>
                <span className="text-sm text-gray-300 w-12">{m.label}</span>
                <span className="text-lg font-bold text-white w-8">
                  {stats.avg7d > 0 ? stats.avg7d.toFixed(1) : '—'}
                </span>
                <DeltaArrow delta={stats.delta} />
                <div className="flex-1 flex justify-end">
                  <Sparkline data={stats.data30d} color={m.color} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* AM vs PM comparison */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">AM vs PM (avg)</h2>
        <div className="space-y-4">
          {METRICS.map(m => (
            <div key={m.key}>
              <div className="flex items-center gap-2 mb-1">
                <span>{m.icon}</span>
                <span className="text-sm text-gray-300">{m.label}</span>
              </div>
              <AmPmBar
                am={amPmComparison[m.key].am}
                pm={amPmComparison[m.key].pm}
                color={m.color}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Weight sparkline */}
      {weightData30d.some(v => v !== null) && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Weight (30 days)</h2>
          <div className="flex items-center gap-3">
            <span className="text-lg">⚖️</span>
            <Sparkline
              data={weightData30d.map(v => v ?? 0)}
              width={240}
              height={48}
              color="#a78bfa"
              maxVal={Math.max(...weightData30d.filter((v): v is number => v !== null)) * 1.02}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {weightData30d.filter(v => v !== null).length} data points · latest:{' '}
            {[...weightData30d].reverse().find(v => v !== null) ?? '—'} lbs
          </div>
        </Card>
      )}

      {entries.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-3">📊</div>
          <p>No data yet. Start checking in!</p>
        </div>
      )}
    </div>
  );
}
