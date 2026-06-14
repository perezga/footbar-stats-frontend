import { useState } from 'react';
import { useSession, useTeammates, useProfile, type SessionDetail } from '../api/hooks.js';
import { InfoTooltip } from './InfoTooltip.js';

interface ComparisonRowProps {
  label: string;
  valA: number | string | null;
  valB: number | string | null;
  valC?: number | string | null;
  labelA?: string;
  labelB?: string;
  labelC?: string;
  unit?: string;
  higherIsBetter?: boolean;
  tooltip?: string;
  format?: (v: any) => string;
}

function ComparisonRow({
  label,
  valA,
  valB,
  valC,
  labelA,
  labelB,
  labelC,
  unit = '',
  higherIsBetter = true,
  tooltip,
  format = (v) => (typeof v === 'number' ? v.toLocaleString() : String(v || '—')),
}: ComparisonRowProps) {
  const isA = valA !== null && valA !== undefined;
  const isB = valB !== null && valB !== undefined;
  const isC = valC !== null && valC !== undefined;

  const numA = typeof valA === 'number' ? valA : 0;
  const numB = typeof valB === 'number' ? valB : 0;
  const numC = typeof valC === 'number' ? valC : 0;

  const max = Math.max(numA, numB, numC);
  const getWidth = (v: any) =>
    typeof v === 'number' && max > 0 ? `${(v / max) * 100}%` : '0%';

  const isBest = (v: any) => {
    if (typeof v !== 'number') return false;
    const vals = [valA, valB, valC].filter((x): x is number => typeof x === 'number');
    if (vals.length < 2) return false;
    const best = higherIsBetter ? Math.max(...vals) : Math.min(...vals);
    return v === best && max > 0;
  };

  return (
    <div className="group border-b border-slate-800/50 py-4 last:border-0">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-400">
          {label}
        </span>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">
              {labelA || 'You'}
            </span>
            <span className={`font-bold ${isBest(valA) ? 'text-brand' : 'text-slate-200'}`}>
              {isA ? `${format(valA)}${unit}` : '—'}
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${isBest(valA) ? 'bg-brand' : 'bg-slate-600'}`}
              style={{ width: getWidth(valA) }}
            />
          </div>
        </div>

        {valB !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 text-[10px] uppercase font-semibold truncate max-w-[150px]">
                {labelB || 'Teammate 1'}
              </span>
              <span className={`font-bold ${isBest(valB) ? 'text-brand' : 'text-slate-200'}`}>
                {isB ? `${format(valB)}${unit}` : '—'}
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${isBest(valB) ? 'bg-brand' : 'bg-slate-600'}`}
                style={{ width: getWidth(valB) }}
              />
            </div>
          </div>
        )}

        {valC !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 text-[10px] uppercase font-semibold truncate max-w-[150px]">
                {labelC || 'Teammate 2'}
              </span>
              <span className={`font-bold ${isBest(valC) ? 'text-brand' : 'text-slate-200'}`}>
                {isC ? `${format(valC)}${unit}` : '—'}
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${isBest(valC) ? 'bg-brand' : 'bg-slate-600'}`}
                style={{ width: getWidth(valC) }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MatchComparison({ sessionA, date }: { sessionA: SessionDetail; date: string }) {
  const teammates = useTeammates();
  const { data: profileA } = useProfile(true);
  const [pBId, setPBId] = useState<number | null>(null);
  const [pCId, setPCId] = useState<number | null>(null);

  const sessionB = useSession(`date:${date}`, !!pBId, pBId);
  const sessionC = useSession(`date:${date}`, !!pCId, pCId);

  const sB = sessionB.data;
  const sC = sessionC.data;

  const formatFirstName = (full: string | undefined) => {
    if (!full) return undefined;
    // RFAF names are often 'SURNAME1 SURNAME2, NAME'
    if (full.includes(',')) {
      const parts = full.split(',');
      return parts[1].trim().split(' ')[0];
    }
    return full.split(' ')[0];
  };

  const nameB = formatFirstName(teammates.find((t) => t.id === pBId)?.name);
  const nameC = formatFirstName(teammates.find((t) => t.id === pCId)?.name);
  const nameA = formatFirstName(profileA?.first_name || profileA?.nickname);

  const getRFAFStats = (s: SessionDetail | undefined) => {
    if (!s?.fixture) return { goals: 0, cards: 0, started: 'No', minutes: null };
    return {
      goals: s.fixture.events.filter((e) => e.kind === 'goal').length,
      cards: s.fixture.events.filter((e) => e.kind.includes('yellow') || e.kind === 'red').length,
      started: s.fixture.started ? 'Yes' : 'No',
      minutes: s.playing_time > 0 ? Math.round(s.playing_time / 60) : null,
    };
  };

  const stA = getRFAFStats(sessionA);
  const stB = getRFAFStats(sB);
  const stC = getRFAFStats(sC);

  return (
    <div className="bg-brand-panel border border-slate-800 rounded-2xl mt-8">
      <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 rounded-t-2xl">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand"></span>
          Teammate Match Comparison
        </h2>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">
              Teammate 1
            </label>
            <select
              value={pBId || ''}
              onChange={(e) => setPBId(Number(e.target.value) || null)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg focus:ring-brand focus:border-brand block w-full p-2 outline-none"
            >
              <option value="">None</option>
              {teammates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">
              Teammate 2
            </label>
            <select
              value={pCId || ''}
              onChange={(e) => setPCId(Number(e.target.value) || null)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg focus:ring-brand focus:border-brand block w-full p-2 outline-none"
            >
              <option value="">None</option>
              {teammates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!pBId && !pCId ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500 text-xs italic">
              Select at least one teammate to start comparing performance for this match.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* RFAF SECTION */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand/70 border-b border-brand/20 pb-1">
                Official Match Data (RFAF)
              </h3>
              <div className="space-y-1">
                <ComparisonRow
                  label="Match Goals"
                  valA={stA.goals}
                  valB={pBId ? stB.goals : null}
                  valC={pCId ? stC.goals : null}
                  labelA={nameA}
                  labelB={nameB}
                  labelC={nameC}
                  tooltip="Goals scored in this specific match according to official records."
                />
                <ComparisonRow
                  label="Match Cards"
                  valA={stA.cards}
                  valB={pBId ? stB.cards : null}
                  valC={pCId ? stC.cards : null}
                  labelA={nameA}
                  labelB={nameB}
                  labelC={nameC}
                  higherIsBetter={false}
                  tooltip="Total cards received (Yellow/Red) in this match."
                />
                <ComparisonRow
                  label="Minutes Played"
                  valA={stA.minutes}
                  valB={pBId ? stB.minutes : null}
                  valC={pCId ? stC.minutes : null}
                  labelA={nameA}
                  labelB={nameB}
                  labelC={nameC}
                  unit=" min"
                  tooltip="Total time on pitch as recorded in the match details."
                />
                <ComparisonRow
                  label="Started (Titular)"
                  valA={stA.started}
                  valB={pBId ? stB.started : null}
                  valC={pCId ? stC.started : null}
                  labelA={nameA}
                  labelB={nameB}
                  labelC={nameC}
                  tooltip="Whether the player was in the starting eleven."
                />
              </div>
            </div>

            {/* FOOTBAR SECTION */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand/70 border-b border-brand/20 pb-1">
                Physical Performance (Footbar)
              </h3>
              <div className="space-y-1">
                <ComparisonRow
                  label="Distance"
                  valA={sessionA.distance}
                  valB={sB?.id ? sB.distance : pBId ? null : undefined}
                  valC={sC?.id ? sC.distance : pCId ? null : undefined}
                  labelA={nameA}
                  labelB={nameB}
                  labelC={nameC}
                  unit=" km"
                  format={(v) => (v / 1000).toFixed(2)}
                  tooltip="Total distance covered during the match."
                />
                <ComparisonRow
                  label="Top Speed"
                  valA={sessionA.sprint_speed}
                  valB={sB?.id ? sB.sprint_speed : pBId ? null : undefined}
                  valC={sC?.id ? sC.sprint_speed : pCId ? null : undefined}
                  labelA={nameA}
                  labelB={nameB}
                  labelC={nameC}
                  unit=" km/h"
                  format={(v) => (v * 3.6).toFixed(1)}
                  tooltip="Highest speed reached during the match."
                />
                <ComparisonRow
                  label="Sprints"
                  valA={sessionA.sprint_count}
                  valB={sB?.id ? sB.sprint_count : pBId ? null : undefined}
                  valC={sC?.id ? sC.sprint_count : pCId ? null : undefined}
                  labelA={nameA}
                  labelB={nameB}
                  labelC={nameC}
                  tooltip="Number of explosive sprints performed."
                />
                <ComparisonRow
                  label="Top Shot"
                  valA={sessionA.shot_speed}
                  valB={sB?.id ? sB.shot_speed : pBId ? null : undefined}
                  valC={sC?.id ? sC.shot_speed : pCId ? null : undefined}
                  labelA={nameA}
                  labelB={nameB}
                  labelC={nameC}
                  unit=" km/h"
                  format={(v) => (v * 3.6).toFixed(1)}
                  tooltip="Speed of your fastest shot."
                />
                <ComparisonRow
                  label="Passes"
                  valA={sessionA.pass_count}
                  valB={sB?.id ? sB.pass_count : pBId ? null : undefined}
                  valC={sC?.id ? sC.pass_count : pCId ? null : undefined}
                  labelA={nameA}
                  labelB={nameB}
                  labelC={nameC}
                  tooltip="Total number of successful passes."
                />
                <ComparisonRow
                  label="Stars"
                  valA={sessionA.score_stars}
                  valB={sB?.id ? sB.score_stars : pBId ? null : undefined}
                  valC={sC?.id ? sC.score_stars : pCId ? null : undefined}
                  labelA={nameA}
                  labelB={nameB}
                  labelC={nameC}
                  format={(v) => v.toFixed(1)}
                  tooltip="Overall match performance rating."
                />
              </div>
              {(pBId || pCId) &&
                !(sB?.id || sC?.id) && (
                  <p className="text-[10px] text-slate-500 italic mt-2">
                    Note: Physical metrics are only available for players with a linked Footbar tracker.
                  </p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
