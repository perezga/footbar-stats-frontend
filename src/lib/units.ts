import type { DistanceBin, MatchType, Position, RfafForm } from '../api/types.js';

/** A 5-min pace bin is "active" if it has any running or sprinting distance. */
export function binIsActive(b: DistanceBin): boolean {
  return b.normal > 0 || b.high > 0;
}

const BIN_MS = 5 * 60 * 1000;

/** A match lasts two 35-min halves plus a 15-min rest between them. */
export const MATCH_DURATION_MIN = 35 + 15 + 35;
const MATCH_DURATION_MS = MATCH_DURATION_MIN * 60 * 1000;

/** Europe/Madrid UTC offset (ms) at the given absolute instant. */
function madridOffsetMs(instant: number): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const p = Object.fromEntries(dtf.formatToParts(new Date(instant)).map((x) => [x.type, x.value]));
  const asUTC = Date.UTC(+p.year!, +p.month! - 1, +p.day!, +p.hour!, +p.minute!, +p.second!);
  return asUTC - instant;
}

/** Absolute instant (ms) for a Madrid-local date 'YYYY-MM-DD' + time 'HH:MM'. */
export function madridInstantMs(date: string, time: string): number {
  const guess = Date.parse(`${date}T${time}:00Z`); // interpret naive as UTC first
  if (Number.isNaN(guess)) return NaN;
  return guess - madridOffsetMs(guess);
}

/**
 * Match window `[kickoff, kickoff + 85min]` derived from a fixture's date/time,
 * or `null` when there is no fixture / no kickoff time.
 */
export function matchWindow(
  date: string | null | undefined,
  time: string | null | undefined,
): { start: number; end: number } | null {
  if (!date || !time) return null;
  const start = madridInstantMs(date, time);
  if (Number.isNaN(start)) return null;
  return { start, end: start + MATCH_DURATION_MS };
}

/**
 * Match window anchored at the first active (running/sprinting) bin, lasting
 * `MATCH_DURATION_MIN`. Used for matches with no fixture kickoff. `null` if no
 * bin is active.
 */
export function firstActiveWindow(bins: DistanceBin[]): { start: number; end: number } | null {
  const first = bins.find(binIsActive);
  if (!first) return null;
  const start = new Date(first.index).getTime();
  if (Number.isNaN(start)) return null;
  return { start, end: start + MATCH_DURATION_MS };
}

/**
 * Whether a bin's 5-min window overlaps `[startMs, endMs)`. Returns `true` when no
 * window is given (so callers treat every bin as in-range).
 */
export function binOverlapsWindow(b: DistanceBin, startMs?: number, endMs?: number): boolean {
  if (startMs == null || endMs == null || Number.isNaN(startMs) || Number.isNaN(endMs)) return true;
  const t = new Date(b.index).getTime();
  if (Number.isNaN(t)) return false;
  return t < endMs && t + BIN_MS > startMs;
}

/** Bins whose 5-min window overlaps `[startMs, endMs)`. Unfiltered if no window. */
export function binsInWindow(bins: DistanceBin[], startMs?: number, endMs?: number): DistanceBin[] {
  if (startMs == null || endMs == null || Number.isNaN(startMs) || Number.isNaN(endMs)) return bins;
  return bins.filter((b) => binOverlapsWindow(b, startMs, endMs));
}

/**
 * Estimate minutes on the pitch from the pace bins: a 5-min bin counts as played
 * if it is active, or its immediately preceding/following bin is active (so a lone
 * walk/idle bin between active periods still counts). Walk-only/idle bins with no
 * active neighbour are excluded. For matches, pass the fixture-derived window
 * (`matchWindow`) so only bins during the match are considered.
 */
export function playedMinutesFromBins(bins: DistanceBin[], startMs?: number, endMs?: number): number {
  const ranged = binsInWindow(bins, startMs, endMs);
  let played = 0;
  for (let i = 0; i < ranged.length; i++) {
    const active =
      binIsActive(ranged[i]!) ||
      (i > 0 && binIsActive(ranged[i - 1]!)) ||
      (i < ranged.length - 1 && binIsActive(ranged[i + 1]!));
    if (active) played++;
  }
  return played * 5;
}

const madridDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Madrid',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Calendar days from today (Madrid) to a fixture date 'YYYY-MM-DD'. */
export function daysUntil(date: string): number {
  const today = madridDate.format(new Date()); // en-CA yields YYYY-MM-DD
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

/** Countdown chip text for an upcoming fixture (Spanish, fixture UI). */
export function countdownLabel(days: number): string {
  if (days <= 0) return 'hoy';
  if (days === 1) return 'mañana';
  return `en ${days} días`;
}

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
