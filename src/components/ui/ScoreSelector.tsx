interface ScoreSelectorProps {
  label: string;
  icon: string;
  value: number;
  onChange: (v: number) => void;
}

const EMOJIS = ['😴', '😕', '😐', '🙂', '🔥'];

export function ScoreSelector({ label, icon, value, onChange }: ScoreSelectorProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`
              flex-1 h-14 rounded-xl text-xl font-bold transition-all duration-150
              flex flex-col items-center justify-center gap-0.5
              ${value === n
                ? 'bg-orange-500 text-white scale-105 shadow-lg shadow-orange-500/30'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700 active:scale-95'
              }
            `}
            type="button"
          >
            <span className="text-base leading-none">{EMOJIS[n - 1]}</span>
            <span className="text-xs leading-none">{n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
