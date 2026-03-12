interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-zinc-900 rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}
