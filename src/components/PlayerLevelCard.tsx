import type { LevelResponse, PlayerLevelId } from '../api/types.js';
import { formatDate } from '../lib/units.js';

const LEVEL_ORDER: PlayerLevelId[] = ['principiante', 'novato', 'amateur', 'pro', 'goat'];

const LEVEL_STYLE: Record<
  PlayerLevelId,
  { label: string; emoji: string; card: string; bar: string; chip: string }
> = {
  principiante: {
    label: 'Principiante',
    emoji: '🌱',
    card: 'from-slate-700 to-slate-800 border-slate-500/50',
    bar: 'bg-slate-300',
    chip: 'bg-slate-400/20 text-slate-200',
  },
  novato: {
    label: 'Novato',
    emoji: '⚽',
    card: 'from-emerald-700 to-emerald-900 border-emerald-400/50',
    bar: 'bg-emerald-300',
    chip: 'bg-emerald-400/20 text-emerald-200',
  },
  amateur: {
    label: 'Amateur',
    emoji: '🏃',
    card: 'from-sky-700 to-blue-900 border-sky-400/50',
    bar: 'bg-sky-300',
    chip: 'bg-sky-400/20 text-sky-200',
  },
  pro: {
    label: 'Pro',
    emoji: '💎',
    card: 'from-violet-700 to-purple-900 border-violet-400/50',
    bar: 'bg-violet-300',
    chip: 'bg-violet-400/20 text-violet-200',
  },
  goat: {
    label: 'GOAT',
    emoji: '🐐',
    card: 'from-amber-500 to-yellow-700 border-amber-300/70',
    bar: 'bg-amber-100',
    chip: 'bg-amber-200/25 text-amber-100',
  },
};

/**
 * Prominent profile banner with the player's level (derived by the backend
 * from his last matches) and the per-criterion reasons behind it.
 */
export function PlayerLevelCard({ data }: { data: LevelResponse }) {
  if (data.level === null || data.level_index === null) return null;
  const levelIndex = data.level_index;
  const s = LEVEL_STYLE[data.level];

  return (
    <section className={`rounded-xl border bg-gradient-to-br p-5 text-white shadow-lg ${s.card}`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-5xl drop-shadow" aria-hidden="true">
          {s.emoji}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Nivel</div>
          <div className="text-3xl font-bold leading-tight">{s.label}</div>
          <div className="text-sm opacity-80">
            Según tus últimos {data.matches.length}{' '}
            {data.matches.length === 1 ? 'partido' : 'partidos'}
          </div>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            {LEVEL_ORDER.map((l, i) => (
              <div
                key={l}
                title={LEVEL_STYLE[l].label}
                className={`h-2 w-8 rounded-full ${i <= levelIndex ? s.bar : 'bg-black/30'}`}
              />
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-70">Principiante → GOAT</div>
        </div>
      </div>

      {data.reasons.length > 0 && (
        <div className="mt-4 rounded-lg bg-black/25 p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-80">
            Por qué este nivel
          </div>
          <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {data.reasons.map((r) => (
              <li key={r.metric} className="flex items-center gap-2 text-sm">
                <span className="opacity-85">{r.label}:</span>
                <span className="font-semibold tabular-nums">{r.display}</span>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${LEVEL_STYLE[r.level_name].chip}`}
                >
                  {LEVEL_STYLE[r.level_name].label}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-xs opacity-70">
            Calculado con todos los partidos de la temporada actual.
          </div>
        </div>
      )}
    </section>
  );
}
