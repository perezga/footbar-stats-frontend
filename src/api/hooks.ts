import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client.js';
import { usePlayerContext } from './PlayerContext.js';
import type {
  AdvancedMetrics,
  AveragesResponse,
  Fixture,
  LevelResponse,
  MatchType,
  PlayerStatsResponse,
  Profile,
  RecordEntry,
  RfafResponse,
  RfafSearchResult,
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

export function useProfile(enabled: boolean, playerId?: number | null) {
  return useQuery({
    queryKey: ['profile', playerId],
    queryFn: () => api<Profile>('/api/profile', { playerId }),
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
    mutationFn: () =>
      api<{ ok: true; last_sync: number }>('/api/sessions/refresh', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['records'] });
      qc.invalidateQueries({ queryKey: ['trends'] });
      qc.invalidateQueries({ queryKey: ['level'] });
    },
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

export function useSession(id: number | string, enabled: boolean, playerId?: number | null) {
  const resolvedId = playerId ?? localStorage.getItem('activePlayerId');
  return useQuery({
    queryKey: ['session', id, resolvedId],
    queryFn: () => api<SessionDetail>(`/api/sessions/${id}`, { playerId }),
    enabled,
  });
}

export function useRefreshSession(id: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<SessionDetail>(`/api/sessions/${id}/refresh`, { method: 'POST' }),
    onSuccess: (data) => {
      qc.setQueryData(['session', id], data);
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

/** Player level derived from the last matches (see the profile banner). */
export function useLevel(enabled: boolean, playerId?: number | null) {
  const resolvedId = playerId ?? localStorage.getItem('activePlayerId');
  return useQuery({
    queryKey: ['level', resolvedId],
    queryFn: () => api<LevelResponse>('/api/stats/level', { playerId }),
    enabled,
  });
}

export function useRecords(matchType: MatchType | undefined, enabled: boolean) {
  const playerId = localStorage.getItem('activePlayerId');
  const params = new URLSearchParams();
  if (matchType) params.set('match_type', matchType);
  return useQuery({
    queryKey: ['records', matchType ?? 'all', playerId],
    queryFn: () =>
      api<{ match_type: MatchType | null; records: RecordEntry[] }>(
        `/api/stats/records?${params.toString()}`,
      ),
    enabled,
  });
}

export function useTrend(metric: string, matchType: MatchType | undefined, enabled: boolean) {
  const playerId = localStorage.getItem('activePlayerId');
  const params = new URLSearchParams({ metric });
  if (matchType) params.set('match_type', matchType);
  return useQuery({
    queryKey: ['trends', metric, matchType ?? 'all', playerId],
    queryFn: () =>
      api<{ metric: string; points: TrendPoint[] }>(`/api/stats/trends?${params.toString()}`),
    enabled,
  });
}

/** Recent-sessions averages to compare a session against (excludes itself). */
export function useAverages(matchType: MatchType, excludeId: number, enabled: boolean) {
  const playerId = localStorage.getItem('activePlayerId');
  const params = new URLSearchParams({ match_type: matchType, exclude: String(excludeId) });
  return useQuery({
    queryKey: ['averages', matchType, excludeId, playerId],
    queryFn: () => api<AveragesResponse>(`/api/stats/averages?${params.toString()}`),
    enabled,
  });
}

export function useAdvancedMetrics(playerId?: number | null) {
  const resolvedId = playerId ?? localStorage.getItem('activePlayerId');
  return useQuery({
    queryKey: ['advanced-metrics', resolvedId],
    queryFn: () => api<AdvancedMetrics>('/api/stats/advanced', { playerId }),
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

export function useStandings(enabled: boolean, season: string, playerId?: number | null) {
  const resolvedId = playerId ?? localStorage.getItem('activePlayerId');
  return useQuery({
    queryKey: ['rfaf', 'standings', season, resolvedId],
    queryFn: () => api<RfafResponse<Standing>>(`/api/rfaf/standings${seasonQs(season)}`, { playerId }),
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

export function usePlayerStats(enabled: boolean, season = '', playerId?: number | null) {
  const resolvedId = playerId ?? localStorage.getItem('activePlayerId');
  return useQuery({
    queryKey: ['rfaf', 'player-stats', season, resolvedId],
    queryFn: () =>
      api<PlayerStatsResponse>(`/api/rfaf/player-stats${seasonQs(season)}`, { playerId }),
    enabled,
  });
}

export function useRfafSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ['rfaf-search', query],
    queryFn: () => api<RfafSearchResult[]>(`/api/rfaf/search?q=${encodeURIComponent(query)}`),
    enabled: enabled && query.length >= 3,
  });
}

export interface Player {
  id: number;
  name: string;
  footbar_user_id: number | null;
  rfaf_player_id: string | null;
  rfaf_season: string | null;
  rfaf_team_id: number | null;
  rfaf_group_id: string | null;
  rfaf_competition_id: string | null;
  rfaf_own_player: string | null;
  rfaf_own_team: string | null;
  created_at: number;
}

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: () => api<Player[]>('/api/players'),
  });
}

/** All players belonging to the same team as the current active player. */
export function useTeammates() {
  const { activePlayerId } = usePlayerContext();
  const { data: allPlayers } = usePlayers();

  if (!allPlayers || !activePlayerId) return [];

  const me = allPlayers.find((p) => p.id === activePlayerId);
  if (!me?.rfaf_own_team) return [];

  return allPlayers.filter((p) => p.id !== me.id && p.rfaf_own_team === me.rfaf_own_team);
}

export function useCreatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; rfaf_player_id?: string; rfaf_own_player?: string }) =>
      api<Player>('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Player> & { id: number }) =>
      api<Player>(`/api/players/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['players'] });
      qc.setQueryData(['player', data.id], data);
    },
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api<{ success: true }>(`/api/players/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playerId?: number) =>
      api<{ ok: true }>('/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      }),
    onSuccess: () => qc.clear(),
  });
}
