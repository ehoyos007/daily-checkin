import { useMemo } from 'react';
import type { CheckinEntry, DayStats, MetricStats } from '../../types';

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function dateRange(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function useStats(entries: CheckinEntry[]) {
  const days30 = useMemo(() => dateRange(30), []);
  const days7 = useMemo(() => dateRange(7), []);
  const days14 = useMemo(() => dateRange(14), []);

  const byDate = useMemo(() => {
    const map: Record<string, DayStats> = {};
    for (const e of entries) {
      if (!map[e.entry_date]) map[e.entry_date] = { date: e.entry_date, count: 0 };
      if (e.session_type === 'am') map[e.entry_date].am = e;
      else map[e.entry_date].pm = e;
      map[e.entry_date].count = (map[e.entry_date].am ? 1 : 0) + (map[e.entry_date].pm ? 1 : 0);
    }
    return map;
  }, [entries]);

  const metricStats = useMemo((): Record<'energy' | 'focus' | 'mood', MetricStats> => {
    const metrics = ['energy', 'focus', 'mood'] as const;
    const result = {} as Record<'energy' | 'focus' | 'mood', MetricStats>;

    for (const m of metrics) {
      const data30d = days30.map(date => {
        const day = byDate[date];
        if (!day) return 0;
        const vals = [day.am?.[m], day.pm?.[m]].filter((v): v is number => v !== undefined);
        return vals.length ? avg(vals) : 0;
      });

      const vals7 = days7.flatMap(date => {
        const day = byDate[date];
        if (!day) return [];
        return [day.am?.[m], day.pm?.[m]].filter((v): v is number => v !== undefined);
      });

      const prevDays7 = days14.slice(0, 7).flatMap(date => {
        const day = byDate[date];
        if (!day) return [];
        return [day.am?.[m], day.pm?.[m]].filter((v): v is number => v !== undefined);
      });

      const allVals = entries.map(e => e[m]);

      result[m] = {
        avg7d: avg(vals7),
        avg30d: avg(allVals),
        delta: avg(vals7) - avg(prevDays7),
        data30d,
      };
    }
    return result;
  }, [byDate, days14, days30, days7, entries]);

  const weightData30d = useMemo(() => {
    return days30.map(date => {
      const day = byDate[date];
      if (!day) return null;
      return day.pm?.weight ?? day.am?.weight ?? null;
    });
  }, [byDate, days30]);

  const heatmap30d = useMemo(() => {
    return days30.map(date => ({
      date,
      count: byDate[date]?.count ?? 0,
    }));
  }, [byDate, days30]);

  const streak = useMemo(() => {
    let count = 0;
    const reversed = [...days30].reverse();
    for (const date of reversed) {
      if ((byDate[date]?.count ?? 0) > 0) count++;
      else break;
    }
    return count;
  }, [byDate, days30]);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return byDate[today] ?? null;
  }, [byDate]);

  const amPmComparison = useMemo(() => {
    const metrics = ['energy', 'focus', 'mood'] as const;
    const result = {} as Record<'energy' | 'focus' | 'mood', { am: number; pm: number }>;
    for (const m of metrics) {
      const amVals = entries.filter(e => e.session_type === 'am').map(e => e[m]);
      const pmVals = entries.filter(e => e.session_type === 'pm').map(e => e[m]);
      result[m] = { am: avg(amVals), pm: avg(pmVals) };
    }
    return result;
  }, [entries]);

  return { metricStats, weightData30d, heatmap30d, streak, todayStats, amPmComparison, byDate };
}
