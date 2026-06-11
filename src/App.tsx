import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStatus } from './api/hooks.js';
import { Layout } from './components/Layout.js';
import { Login } from './pages/Login.js';

// Route-level code splitting: keeps recharts (Stats/League/SessionDetail) and
// leaflet (SessionDetail) out of the entry chunk. Login/Layout stay static.
const Profile = lazy(() => import('./pages/Profile.js').then((m) => ({ default: m.Profile })));
const Sessions = lazy(() => import('./pages/Sessions.js').then((m) => ({ default: m.Sessions })));
const SessionDetail = lazy(() =>
  import('./pages/SessionDetail.js').then((m) => ({ default: m.SessionDetail })),
);
const Stats = lazy(() => import('./pages/Stats.js').then((m) => ({ default: m.Stats })));
const League = lazy(() => import('./pages/League.js').then((m) => ({ default: m.League })));

function Guard({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useAuthStatus();
  const loc = useLocation();
  if (isLoading) return <div className="p-8 text-slate-400">Loading…</div>;
  if (!data?.authenticated) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Loading…</div>}>
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
    </Suspense>
  );
}
