interface SparklineProps {
  data: (number | null)[];
  width?: number;
  height?: number;
  color?: string;
  maxVal?: number;
}

export function Sparkline({ data, width = 120, height = 32, color = '#f97316', maxVal = 5 }: SparklineProps) {
  const validData = data.map(v => v ?? 0);
  const max = Math.max(maxVal, ...validData);
  const min = 0;
  const range = max - min || 1;

  const step = width / (data.length - 1 || 1);
  const points = validData.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  // Fill area
  const fillD = `M ${points[0]} L ${points.join(' L ')} L ${(data.length - 1) * step},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
