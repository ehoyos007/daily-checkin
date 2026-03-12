import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/hooks/useAuth';
import { BottomNav } from './components/ui/BottomNav';
import { Auth } from './pages/Auth';
import { CheckIn } from './pages/CheckIn';
import { Trends } from './pages/Trends';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

function AppLayout() {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 pb-20 overflow-y-auto">
        <Routes>
          <Route path="/" element={<CheckIn />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-zinc-950">
        <div className="text-4xl animate-pulse">🟠</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user ? <AppLayout /> : <Auth />}
    </BrowserRouter>
  );
}

export default App;
