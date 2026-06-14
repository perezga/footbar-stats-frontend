import { useState } from 'react';
import {
  type AdvancedMetrics,
  type Player,
  useAdvancedMetrics,
  useLevel,
  usePlayerStats,
  usePlayers,
  useProfile,
  useStandings,
} from '../api/hooks.js';
import { usePlayerContext } from '../api/PlayerContext.js';
import { InfoTooltip } from '../components/InfoTooltip.js';

const FOOT_LABEL: Record<string, string> = { r: 'Right', l: 'Left', b: 'Both', n: 'None' };

const RFAF_INSIGHTS: Array<keyof AdvancedMetrics> = [
  'goal_contribution_pct',
  'clutch_factor_pct',
  'discipline_rating',
  'consistency_index',
  'ppg_impact',
  'scorer_percentile',
];

const FOOTBAR_INSIGHTS: Array<keyof AdvancedMetrics> = [
  'shot_conversion_pct',
  'distance_per_goal_km',
  'workload_win_vs_loss_ratio',
  'possession_win_ratio',
  'fatigue_resistance_pct',
  'workrate_win_pct',
  'luka_modric_score',
  'intensity_vs_rank_ratio',
];

const ADVANCED_LABELS: Record<
  keyof AdvancedMetrics,
  { label: string; unit?: string; higherIsBetter?: boolean; tooltip?: string }
> = {
  goal_contribution_pct: {
    label: 'Contribución Goleadora',
    unit: '%',
    higherIsBetter: true,
    tooltip: 'Porcentaje de goles del equipo en los que has participado.',
  },
  clutch_factor_pct: {
    label: 'Clutch Factor (Goles Clave)',
    unit: '%',
    higherIsBetter: true,
    tooltip: 'Goles marcados en momentos decisivos o que cambian el signo del partido.',
  },
  discipline_rating: {
    label: 'Rating Disciplinario',
    unit: '',
    higherIsBetter: true,
    tooltip: 'Evaluación de tu conducta en el campo basada en tarjetas y faltas.',
  },
  consistency_index: {
    label: 'Índice de Consistencia',
    unit: '',
    higherIsBetter: true,
    tooltip: 'Mide la regularidad de tu rendimiento partido tras partido.',
  },
  ppg_impact: {
    label: 'Impacto PPG (Puntos)',
    unit: '',
    higherIsBetter: true,
    tooltip: 'Diferencia de puntos por partido para el equipo cuando juegas vs cuando no.',
  },
  scorer_percentile: {
    label: 'Percentil Goleador',
    unit: '%',
    higherIsBetter: true,
    tooltip: 'Tu posición relativa respecto al resto de goleadores de la liga.',
  },
  shot_conversion_pct: {
    label: 'Efectividad de Tiro',
    unit: '%',
    higherIsBetter: true,
    tooltip: 'Porcentaje de tiros a puerta que terminan en gol.',
  },
  distance_per_goal_km: {
    label: 'Km por Gol',
    unit: ' km',
    higherIsBetter: false,
    tooltip: 'Distancia recorrida media por cada gol anotado.',
  },
  workload_win_vs_loss_ratio: {
    label: 'Esfuerzo Ganado vs Perdido',
    unit: '%',
    higherIsBetter: true,
    tooltip: 'Comparativa de tu despliegue físico en victorias frente a derrotas.',
  },
  possession_win_ratio: {
    label: 'Ratio Posesión/Victoria',
    unit: '',
    higherIsBetter: true,
    tooltip: 'Relación entre el tiempo con balón y el resultado positivo.',
  },
  fatigue_resistance_pct: {
    label: 'Resistencia Fatiga',
    unit: '%',
    higherIsBetter: true,
    tooltip: 'Capacidad de mantener la intensidad física en el tramo final del partido.',
  },
  workrate_win_pct: {
    label: 'Workrate Win %',
    unit: '%',
    higherIsBetter: true,
    tooltip: 'Probabilidad de victoria del equipo según tu nivel de esfuerzo físico.',
  },
  luka_modric_score: {
    label: 'Luka Modrić Score',
    unit: '',
    higherIsBetter: true,
    tooltip: 'Métrica que premia la creatividad, pases clave y despliegue inteligente.',
  },
  intensity_vs_rank_ratio: {
    label: 'Intensidad vs Top 5',
    unit: '%',
    higherIsBetter: true,
    tooltip: 'Rendimiento físico contra los mejores equipos de la liga vs el resto.',
  },
};

const RFAF_DESCRIPTIONS: Record<string, string> = {
  'Partidos Jugados': 'Total de encuentros oficiales en los que has participado.',
  Goles: 'Suma total de goles anotados en competición oficial.',
  Amarillas: 'Tarjetas amarillas acumuladas durante la temporada.',
  Rojas: 'Tarjetas rojas directas recibidas.',
  'Doble Amarilla': 'Expulsiones por acumulación de dos tarjetas amarillas en un mismo partido.',
  Convocatorias: 'Número de veces que has sido incluido en el acta oficial.',
  Titular: 'Partidos en los que has salido en el once inicial.',
  'Goles Propia': 'Goles accidentales anotados en la propia portería.',
  'Minutes Played': 'Total de minutos disputados en el terreno de juego.',
};

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  pace: 'Capacidad de aceleración y velocidad punta alcanzada.',
  shooting: 'Efectividad y potencia de tus disparos a portería.',
  passing: 'Volumen de juego y precisión en la distribución del balón.',
  dribbling: 'Habilidad para conducir el balón y superar oponentes.',
  defending: 'Capacidad de recuperación, intercepciones y posicionamiento.',
  physical: 'Resistencia total y despliegue físico durante el partido.',
};

const PERFORMANCE_DESCRIPTIONS: Record<string, string> = {
  'Max Speed (km/h)': 'Velocidad máxima absoluta registrada en cualquiera de tus sesiones.',
  'Avg Distance (km)': 'Promedio de kilómetros recorridos por partido.',
  'Avg Sprints': 'Media de carreras explosivas realizadas por encuentro.',
  'Shot Power (km/h)': 'Velocidad más alta registrada en un disparo a puerta.',
};

function ComparisonRow({
  label,
  valA,
  valB,
  type = 'number',
  higherIsBetter = true,
  unit = '',
  tooltip,
}: {
  label: string;
  valA: string | number | null;
  valB: string | number | null;
  type?: 'number' | 'text';
  higherIsBetter?: boolean;
  unit?: string;
  tooltip?: string;
}) {
  const numA = typeof valA === 'number' ? valA : Number.parseFloat(String(valA));
  const numB = typeof valB === 'number' ? valB : Number.parseFloat(String(valB));

  const isAValid = !Number.isNaN(numA) && valA !== null;
  const isBValid = !Number.isNaN(numB) && valB !== null;

  let winA = false;
  let winB = false;

  if (type === 'number' && isAValid && isBValid) {
    if (numA > numB) {
      winA = higherIsBetter;
      winB = !higherIsBetter;
    } else if (numB > numA) {
      winB = higherIsBetter;
      winA = !higherIsBetter;
    }
  }

  const displayA =
    isAValid && typeof valA === 'number' ? `${valA.toLocaleString()}${unit}` : (valA ?? '—');
  const displayB =
    isBValid && typeof valB === 'number' ? `${valB.toLocaleString()}${unit}` : (valB ?? '—');

  return (
    <div className="group border-b border-slate-800 py-3 last:border-0">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-slate-400 transition-colors">
          {label}
        </span>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className="flex items-center justify-between gap-4">
        <div
          className={`flex-1 text-right font-bold text-lg ${winA ? 'text-brand' : 'text-slate-300'}`}
        >
          {displayA}
        </div>

        {/* Visual comparison bar for mobile and desktop */}
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex max-w-[100px] md:max-w-[200px]">
          {type === 'number' && isAValid && isBValid && numA + numB !== 0 ? (
            <>
              <div
                className={`h-full transition-all duration-500 ${winA ? 'bg-brand' : 'bg-slate-600'}`}
                style={{ width: `${(numA / (numA + numB)) * 100}%` }}
              />
              <div
                className={`h-full transition-all duration-500 ${winB ? 'bg-brand' : 'bg-slate-700'}`}
                style={{ width: `${(numB / (numA + numB)) * 100}%` }}
              />
            </>
          ) : (
            <div className="w-full bg-slate-800" />
          )}
        </div>

        <div
          className={`flex-1 text-left font-bold text-lg ${winB ? 'text-brand' : 'text-slate-300'}`}
        >
          {displayB}
        </div>
      </div>
    </div>
  );
}

function PlayerSelector({
  label,
  playerId,
  onSelect,
  players,
  profilePic,
}: {
  label: string;
  playerId: number | null;
  onSelect: (id: number) => void;
  players: Player[] | undefined;
  profilePic?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800 w-full">
      <div className="relative">
        {profilePic ? (
          <img
            src={profilePic}
            alt=""
            className="h-16 w-16 rounded-full border-2 border-slate-700 object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-xl font-bold border-2 border-slate-700">
            {players?.find((p) => p.id === playerId)?.name?.[0] || '?'}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 bg-brand text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter text-white">
          {label}
        </div>
      </div>
      <select
        value={playerId || ''}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5 outline-none"
      >
        <option value="" disabled>
          Select Player
        </option>
        {players?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Comparison() {
  const { activePlayerId } = usePlayerContext();
  const { data: players } = usePlayers();

  const [pAId, setPAId] = useState<number | null>(activePlayerId);
  const [pBId, setPBId] = useState<number | null>(null);

  // Player A Data
  const profileA = useProfile(!!pAId, pAId);
  const rfafA = usePlayerStats(!!pAId, '', pAId);
  const standingsA = useStandings(!!pAId, '', pAId);
  const levelA = useLevel(!!pAId, pAId);
  const advancedA = useAdvancedMetrics(pAId);

  // Player B Data
  const profileB = useProfile(!!pBId, pBId);
  const rfafB = usePlayerStats(!!pBId, '', pBId);
  const standingsB = useStandings(!!pBId, '', pBId);
  const levelB = useLevel(!!pBId, pBId);
  const advancedB = useAdvancedMetrics(pBId);

  const statsA = rfafA.data?.results;
  const statsB = rfafB.data?.results;

  const posA = standingsA.data?.results.find((s) => s.own)?.position;
  const posB = standingsB.data?.results.find((s) => s.own)?.position;

  // Group RFAF stats and cards
  const allRfafLabels = Array.from(
    new Set([
      ...(statsA?.stats.map((s) => s.name) || []),
      ...(statsB?.stats.map((s) => s.name) || []),
      ...(statsA?.cards.map((c) => c.name) || []),
      ...(statsB?.cards.map((c) => c.name) || []),
    ]),
  ).filter((l) => l !== 'Suplente');

  return (
    <div className="space-y-8 pb-12">
      <section className="grid grid-cols-2 gap-4 md:gap-8">
        <PlayerSelector
          label="Player A"
          playerId={pAId}
          onSelect={setPAId}
          players={players}
          profilePic={profileA.data?.profile_pic}
        />
        <PlayerSelector
          label="Player B"
          playerId={pBId}
          onSelect={setPBId}
          players={players}
          profilePic={profileB.data?.profile_pic}
        />
      </section>

      {!pBId ? (
        <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4">🆚</div>
          <h3 className="text-slate-300 font-semibold text-lg">Select a second player</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
            Choose someone from the list to compare your stats side-by-side.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Physical & General */}
          <section className="bg-brand-panel border border-slate-800 rounded-2xl">
            <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Team & Standing
              </h2>
            </div>
            <div className="p-6 pt-2">
              <ComparisonRow label="Team" valA={statsA?.team || null} valB={statsB?.team || null} type="text" />
              <ComparisonRow
                label="Category / Group"
                valA={statsA?.category || null}
                valB={statsB?.category || null}
                type="text"
              />
              <ComparisonRow
                label="League Position"
                valA={posA ?? null}
                valB={posB ?? null}
                higherIsBetter={false}
              />
            </div>
          </section>

          {/* RFAF Complete Stats */}
          <section className="bg-brand-panel border border-slate-800 rounded-2xl">
            <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                RFAF Season Stats
              </h2>
            </div>
            <div className="p-6 pt-2">
              <ComparisonRow
                label="Minutes Played"
                valA={statsA?.minutes_played}
                valB={statsB?.minutes_played}
                tooltip={RFAF_DESCRIPTIONS['Minutes Played']}
              />
              {allRfafLabels.map((l) => {
                const valA =
                  statsA?.stats.find((s) => s.name === l)?.value ??
                  statsA?.cards.find((c) => c.name === l)?.value;
                const valB =
                  statsB?.stats.find((s) => s.name === l)?.value ??
                  statsB?.cards.find((c) => c.name === l)?.value;

                const isNegative = /tarjeta|amarilla|roja|propia/i.test(l);

                return (
                  <ComparisonRow
                    key={l}
                    label={l}
                    valA={valA ?? 0}
                    valB={valB ?? 0}
                    higherIsBetter={!isNegative}
                    tooltip={RFAF_DESCRIPTIONS[l]}
                  />
                );
              })}
            </div>
          </section>

          {/* Advanced Analytical Insights (RFAF derived) */}
          <section className="bg-brand-panel border border-slate-800 rounded-2xl">
            <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Advanced Analytical Insights (RFAF)
              </h2>
            </div>
            <div className="p-6 pt-2">
              {RFAF_INSIGHTS.map((key) => {
                const cfg = ADVANCED_LABELS[key];
                const rawA = advancedA.data?.[key];
                const rawB = advancedB.data?.[key];

                let valA = rawA;
                let valB = rawB;

                if (key === 'scorer_percentile' && rawA != null && rawB != null) {
                  valA = 100 - rawA;
                  valB = 100 - rawB;
                }

                return (
                  <ComparisonRow
                    key={key}
                    label={cfg.label}
                    valA={typeof valA === 'number' ? Number(valA.toFixed(key.includes('ppg') ? 2 : 1)) : null}
                    valB={typeof valB === 'number' ? Number(valB.toFixed(key.includes('ppg') ? 2 : 1)) : null}
                    unit={cfg.unit}
                    higherIsBetter={cfg.higherIsBetter}
                    tooltip={cfg.tooltip}
                  />
                );
              })}
            </div>
          </section>

          {/* Player Level Comparison */}
          <section className="bg-brand-panel border border-slate-800 rounded-2xl">
            <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Player Level Attributes
              </h2>
            </div>
            <div className="p-6 pt-2">
              {levelA.data?.reasons.map((rA) => {
                const rB = levelB.data?.reasons.find((r) => r.metric === rA.metric);
                return (
                  <ComparisonRow
                    key={rA.metric}
                    label={rA.label}
                    valA={rA.display}
                    valB={rB?.display || '—'}
                    tooltip={LEVEL_DESCRIPTIONS[rA.metric]}
                  />
                );
              })}
            </div>
          </section>

          {/* Footbar Performance & Insights */}
          <section className="bg-brand-panel border border-slate-800 rounded-2xl">
            <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Footbar Performance & Insights
              </h2>
            </div>
            <div className="p-6 pt-2">
              <ComparisonRow
                label="Max Speed (km/h)"
                valA={
                  typeof advancedA.data?.top_speed === 'number'
                    ? advancedA.data.top_speed.toFixed(1)
                    : null
                }
                valB={
                  typeof advancedB.data?.top_speed === 'number'
                    ? advancedB.data.top_speed.toFixed(1)
                    : null
                }
                tooltip={PERFORMANCE_DESCRIPTIONS['Max Speed (km/h)']}
              />
              <ComparisonRow
                label="Avg Distance (km)"
                valA={
                  typeof advancedA.data?.avg_distance === 'number'
                    ? advancedA.data.avg_distance.toFixed(2)
                    : null
                }
                valB={
                  typeof advancedB.data?.avg_distance === 'number'
                    ? advancedB.data.avg_distance.toFixed(2)
                    : null
                }
                tooltip={PERFORMANCE_DESCRIPTIONS['Avg Distance (km)']}
              />
              <ComparisonRow
                label="Avg Sprints"
                valA={
                  typeof advancedA.data?.avg_sprints === 'number'
                    ? advancedA.data.avg_sprints.toFixed(1)
                    : null
                }
                valB={
                  typeof advancedB.data?.avg_sprints === 'number'
                    ? advancedB.data.avg_sprints.toFixed(1)
                    : null
                }
                tooltip={PERFORMANCE_DESCRIPTIONS['Avg Sprints']}
              />
              <ComparisonRow
                label="Shot Power (km/h)"
                valA={
                  typeof advancedA.data?.top_shot_power === 'number'
                    ? advancedA.data.top_shot_power.toFixed(1)
                    : null
                }
                valB={
                  typeof advancedB.data?.top_shot_power === 'number'
                    ? advancedB.data.top_shot_power.toFixed(1)
                    : null
                }
                tooltip={PERFORMANCE_DESCRIPTIONS['Shot Power (km/h)']}
              />
              
              {/* Footbar Derived Insights */}
              <div className="mt-4 pt-4 border-t border-slate-800/50">
                {FOOTBAR_INSIGHTS.map((key) => {
                  const cfg = ADVANCED_LABELS[key];
                  const valA = advancedA.data?.[key];
                  const valB = advancedB.data?.[key];

                  return (
                    <ComparisonRow
                      key={key}
                      label={cfg.label}
                      valA={typeof valA === 'number' ? Number(valA.toFixed(1)) : null}
                      valB={typeof valB === 'number' ? Number(valB.toFixed(1)) : null}
                      unit={cfg.unit}
                      higherIsBetter={cfg.higherIsBetter}
                      tooltip={cfg.tooltip}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
