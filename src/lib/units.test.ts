import { describe, expect, it } from 'vitest';
import type { DistanceBin } from '../api/types.js';
import {
  binsInWindow,
  madridInstantMs,
  mToKm,
  pct,
  playedMinutesFromBins,
  secToClock,
} from './units.js';

function bin(index: string, active: boolean): DistanceBin {
  return { index, low: 100, normal: active ? 200 : 0, high: active ? 50 : 0 };
}

const T0 = Date.parse('2026-01-10T16:00:00Z');
const MIN5 = 5 * 60 * 1000;
const at = (i: number) => new Date(T0 + i * MIN5).toISOString();

describe('madridInstantMs', () => {
  it('resolves a winter kickoff (CET, UTC+1)', () => {
    expect(madridInstantMs('2026-01-10', '17:00')).toBe(Date.parse('2026-01-10T16:00:00Z'));
  });

  it('resolves a summer kickoff (CEST, UTC+2)', () => {
    expect(madridInstantMs('2026-06-10', '17:00')).toBe(Date.parse('2026-06-10T15:00:00Z'));
  });

  it('handles the day of the spring-forward DST change', () => {
    // Clocks jump 02:00 -> 03:00 on 2026-03-29; an evening kickoff is UTC+2.
    expect(madridInstantMs('2026-03-29', '17:00')).toBe(Date.parse('2026-03-29T15:00:00Z'));
  });

  it('returns NaN for garbage input', () => {
    expect(Number.isNaN(madridInstantMs('nope', '17:00'))).toBe(true);
  });
});

describe('binsInWindow', () => {
  const bins = [bin(at(0), true), bin(at(1), true), bin(at(2), true)];

  it('returns all bins when no window is given', () => {
    expect(binsInWindow(bins)).toHaveLength(3);
  });

  it('keeps only bins overlapping the window', () => {
    // Window covering the second bin only.
    expect(binsInWindow(bins, T0 + MIN5, T0 + 2 * MIN5)).toHaveLength(1);
  });

  it('counts a bin that partially overlaps the window start', () => {
    expect(binsInWindow(bins, T0 + MIN5 / 2, T0 + MIN5)).toHaveLength(1);
  });
});

describe('playedMinutesFromBins', () => {
  it('counts active bins', () => {
    expect(playedMinutesFromBins([bin(at(0), true), bin(at(1), true)])).toBe(10);
  });

  it('bridges a lone idle bin between active periods', () => {
    const bins = [bin(at(0), true), bin(at(1), false), bin(at(2), true)];
    expect(playedMinutesFromBins(bins)).toBe(15);
  });

  it('excludes idle bins with no active neighbour', () => {
    const bins = [bin(at(0), true), bin(at(1), false), bin(at(2), false), bin(at(3), false)];
    expect(playedMinutesFromBins(bins)).toBe(10); // active bin + its idle neighbour
  });

  it('only counts bins inside the given window', () => {
    const bins = [bin(at(0), true), bin(at(1), true), bin(at(2), true)];
    expect(playedMinutesFromBins(bins, T0 + MIN5, T0 + 2 * MIN5)).toBe(5);
  });
});

describe('secToClock', () => {
  it('formats minutes and seconds', () => {
    expect(secToClock(65)).toBe('1:05');
  });

  it('rolls into hours past 60 minutes', () => {
    expect(secToClock(3 * 3600 + 7 * 60 + 9)).toBe('3:07:09');
  });

  it('rounds fractional seconds', () => {
    expect(secToClock(59.6)).toBe('1:00');
  });
});

describe('mToKm', () => {
  it('keeps metres under a kilometre', () => {
    expect(mToKm(999.4)).toBe('999 m');
  });

  it('switches to km with two decimals', () => {
    expect(mToKm(10550)).toBe('10.55 km');
  });
});

describe('pct', () => {
  it('scales ratios to percent', () => {
    expect(pct(0.87)).toBe('87%');
  });

  it('passes through values already in percent', () => {
    expect(pct(87)).toBe('87%');
  });
});
