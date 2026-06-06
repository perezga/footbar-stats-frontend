import type { MatchType, Position, RfafForm } from '../api/types.js';

/** Tailwind background classes for a W/D/L result badge. */
export const RESULT_STYLE: Record<RfafForm, string> = {
  W: 'bg-green-600',
  D: 'bg-yellow-500',
  L: 'bg-red-600',
};

/** Format a fixture's official kickoff (date 'YYYY-MM-DD' + optional 'HH:MM'). */
export function formatKickoff(date: string | null, time: string | null): string {
  if (!date) return '—';
  const d = new Date(`${date}T${time ?? '00:00'}`);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(time ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function mToKm(m: number): string {
  if (m >= 1000) return (m / 1000).toFixed(2) + ' km';
  return Math.round(m) + ' m';
}

export function msToKmh(ms: number): string {
  return (ms * 3.6).toFixed(1) + ' km/h';
}

export function secToClock(s: number): string {
  const sec = Math.round(s);
  const m = Math.floor(sec / 60);
  const ss = String(sec % 60).padStart(2, '0');
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, '0');
    return `${h}:${mm}:${ss}`;
  }
  return `${m}:${ss}`;
}

export function pct(n: number): string {
  return (n <= 1 ? n * 100 : n).toFixed(0) + '%';
}

export const MATCH_TYPE_LABEL: Record<MatchType, string> = {
  '11': 'Game',
  ss: 'Small-sided',
  tr: 'Training',
  ru: 'Running',
};

export const POSITION_LABEL: Record<Position, string> = {
  gk: 'Goalkeeper',
  rb: 'Right back',
  cb: 'Centre back',
  lb: 'Left back',
  rwb: 'Right wing back',
  lwb: 'Left wing back',
  cdm: 'CDM',
  cm: 'CM',
  cam: 'CAM',
  rm: 'Right mid',
  lm: 'Left mid',
  rw: 'Right wing',
  lw: 'Left wing',
  cf: 'Centre forward',
  st: 'Striker',
};

export function positionLabel(p: Position | undefined): string {
  return p ? POSITION_LABEL[p] : '—';
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
