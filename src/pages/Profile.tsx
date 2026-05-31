import { useProfile } from '../api/hooks.js';
import { StatTile } from '../components/StatTile.js';

const FOOT_LABEL: Record<string, string> = { r: 'Right', l: 'Left', b: 'Both', n: 'None' };
const GENDER_LABEL: Record<string, string> = { m: 'Male', f: 'Female' };
const STRENGTH_LABEL: Record<string, string> = {
  tec: 'Technical',
  pac: 'Sprinter',
  sta: 'Endurant',
  sho: 'Shooter',
  un: 'Undefined',
};

export function Profile() {
  const q = useProfile(true);
  if (q.isLoading) return <div className="text-slate-400">Loading…</div>;
  if (q.error) return <div className="text-red-400">{(q.error as Error).message}</div>;
  if (!q.data) return null;
  const p = q.data;
  const name = `${p.first_name} ${p.last_name}`.trim() || p.nickname;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {p.profile_pic && (
          <img
            src={p.profile_pic}
            alt=""
            className="h-20 w-20 rounded-full border border-slate-700"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{name}</h1>
          <div className="text-slate-400">@{p.nickname}</div>
        </div>
        {p.country_flag && (
          <img src={p.country_flag} alt="" className="h-8 w-auto ml-auto rounded" />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Age category" value={p.age_category} />
        <StatTile label="Favourite position" value={p.fav_position || '—'} />
        <StatTile label="Favourite foot" value={FOOT_LABEL[p.fav_foot ?? 'n'] ?? '—'} />
        <StatTile label="Player type" value={STRENGTH_LABEL[p.strength] ?? '—'} />
        <StatTile label="Gender" value={GENDER_LABEL[p.gender] ?? '—'} />
        <StatTile label="Date of birth" value={p.d_o_b || '—'} />
        <StatTile label="Height" value={p.height ? `${(p.height * 100).toFixed(0)} cm` : '—'} />
        <StatTile label="Weight" value={p.weight ? `${p.weight.toFixed(0)} kg` : '—'} />
      </div>
    </div>
  );
}
