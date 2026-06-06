import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStatus } from './api/hooks.js';
import { Layout } from './components/Layout.js';
import { League } from './pages/League.js';
import { Login } from './pages/Login.js';
import { Profile } from './pages/Profile.js';
import { SessionDetail } from './pages/SessionDetail.js';
import { Sessions } from './pages/Sessions.js';
import { Stats } from './pages/Stats.js';

function Guard({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useAuthStatus();
  const loc = useLocation();
  if (isLoading) return <div className="p-8 text-slate-400">Loading…</div>;
  if (!data?.authenticated) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route index element={<Profile />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="sessions/:id" element={<SessionDetail />} />
        <Route path="stats" element={<Stats />} />
        <Route path="league" element={<League />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
