interface HeatmapCell {
  date: string;
  count: number;
}

interface HeatmapGridProps {
  data: HeatmapCell[];
}

function cellColor(count: number): string {
  if (count === 0) return 'bg-zinc-800';
  if (count === 1) return 'bg-orange-700';
  return 'bg-orange-500';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function HeatmapGrid({ data }: HeatmapGridProps) {
  return (
    <div>
      <div className="grid grid-cols-10 gap-1.5">
        {data.map(cell => (
          <div
            key={cell.date}
            title={`${formatDate(cell.date)}: ${cell.count} check-in${cell.count !== 1 ? 's' : ''}`}
            className={`aspect-square rounded-sm ${cellColor(cell.count)} transition-colors`}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-zinc-800" /> None
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-orange-700" /> 1 check-in
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-orange-500" /> Both
        </div>
      </div>
    </div>
  );
}
