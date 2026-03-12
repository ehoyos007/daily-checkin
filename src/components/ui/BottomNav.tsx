import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Check-In', icon: '✅' },
  { to: '/trends', label: 'Trends', icon: '📈' },
  { to: '/history', label: 'History', icon: '📅' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 safe-area-pb">
      <div className="flex max-w-md mx-auto">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs transition-colors
               ${isActive ? 'text-orange-500' : 'text-gray-500 hover:text-gray-300'}`
            }
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
