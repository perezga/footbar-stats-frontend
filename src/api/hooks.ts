import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client.js';
import type {
  AveragesResponse,
  Fixture,
  MatchType,
  PlayerStatsResponse,
  Profile,
  RecordEntry,
  RfafResponse,
  Scorer,
  SeasonsResponse,
  SessionDetail,
  SessionListResponse,
  Standing,
  TrendPoint,
} from './types.js';

export interface AuthStatus {
  authenticated: boolean;
  user_id: number | null;
}

export function useAuthStatus() {
  return useQuery({
    queryKey: ['auth-status'],
    queryFn: () => api<AuthStatus>('/auth/status'),
  });
}

export function useProfile(enabled: boolean) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api<Profile>('/api/profile'),
    enabled,
  });
}

export interface SessionFilters {
  matchType?: MatchType | undefined;
  limit?: number;
  offset?: number;
  /** Merge in RFAF fixtures the tracker didn't record (id null rows). */
  includeFixtures?: boolean;
}

export function useSessions(filters: SessionFilters, enabled: boolean) {
  const params = new URLSearchParams();
  if (filters.matchType) params.set('match_type', filters.matchType);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));
  if (filters.includeFixtures) params.set('include_fixtures', '1');
  const qs = params.toString();
  return useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => api<SessionListResponse>(`/api/sessions${qs ? `?${qs}` : ''}`),
    enabled,
  });
}

export function useRefreshSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<{ ok: true; last_sync: number }>('/api/sessions/refresh', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['records'] });
      qc.invalidateQueries({ queryKey: ['trends'] });
    },
  });
}

export function useSession(id: number, enabled: boolean) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => api<SessionDetail>(`/api/sessions/${id}`),
    enabled,
  });
}

export function useRefreshSession(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<SessionDetail>(`/api/sessions/${id}/refresh`, { method: 'POST' }),
    onSuccess: (data) => {
      qc.setQueryData(['session', id], data);
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['records'] });
      qc.invalidateQueries({ queryKey: ['trends'] });
    },
  });
}

export function useRecords(matchType: MatchType | undefined, enabled: boolean) {
  const qs = matchType ? `?match_type=${matchType}` : '';
  return useQuery({
    queryKey: ['records', matchType ?? 'all'],
    queryFn: () => api<{ records: RecordEntry[] }>(`/api/stats/records${qs}`),
    enabled,
  });
}

export function useTrend(metric: string, matchType: MatchType | undefined, enabled: boolean) {
  const params = new URLSearchParams({ metric });
  if (matchType) params.set('match_type', matchType);
  return useQuery({
    queryKey: ['trends', metric, matchType ?? 'all'],
    queryFn: () =>
      api<{ metric: string; points: TrendPoint[] }>(`/api/stats/trends?${params.toString()}`),
    enabled,
  });
}

/** Recent-sessions averages to compare a session against (excludes itself). */
export function useAverages(matchType: MatchType, excludeId: number, enabled: boolean) {
  const params = new URLSearchParams({ match_type: matchType, exclude: String(excludeId) });
  return useQuery({
    queryKey: ['averages', matchType, excludeId],
    queryFn: () => api<AveragesResponse>(`/api/stats/averages?${params.toString()}`),
    enabled,
  });
}

/** '' selects the backend's default (current) season. */
const seasonQs = (season: string) => (season ? `?season=${season}` : '');

export function useSeasons() {
  return useQuery({
    queryKey: ['rfaf', 'seasons'],
    queryFn: () => api<SeasonsResponse>('/api/rfaf/seasons'),
  });
}

export function useStandings(enabled: boolean, season: string) {
  return useQuery({
    queryKey: ['rfaf', 'standings', season],
    queryFn: () => api<RfafResponse<Standing>>(`/api/rfaf/standings${seasonQs(season)}`),
    enabled,
  });
}

export function useScorers(enabled: boolean, season: string) {
  return useQuery({
    queryKey: ['rfaf', 'scorers', season],
    queryFn: () => api<RfafResponse<Scorer>>(`/api/rfaf/scorers${seasonQs(season)}`),
    enabled,
  });
}

export function useFixtures(enabled: boolean, season: string) {
  return useQuery({
    queryKey: ['rfaf', 'fixtures', season],
    queryFn: () => api<RfafResponse<Fixture>>(`/api/rfaf/fixtures${seasonQs(season)}`),
    enabled,
  });
}

export function usePlayerStats(enabled: boolean, season = '') {
  return useQuery({
    queryKey: ['rfaf', 'player-stats', season],
    queryFn: () => api<PlayerStatsResponse>(`/api/rfaf/player-stats${seasonQs(season)}`),
    enabled,
  });
}

export function useRefreshRfaf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (season: string) =>
      api<{ ok: true }>(`/api/rfaf/refresh${seasonQs(season)}`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rfaf'] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<{ ok: true }>('/auth/logout', { method: 'POST' }),
    onSuccess: () => qc.clear(),
  });
}
