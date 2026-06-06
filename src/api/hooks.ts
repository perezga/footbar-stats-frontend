import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client.js';
import type {
  Fixture,
  MatchType,
  Profile,
  RecordEntry,
  RfafResponse,
  Scorer,
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
}

export function useSessions(filters: SessionFilters, enabled: boolean) {
  const params = new URLSearchParams();
  if (filters.matchType) params.set('match_type', filters.matchType);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));
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

export function useStandings(enabled: boolean) {
  return useQuery({
    queryKey: ['rfaf', 'standings'],
    queryFn: () => api<RfafResponse<Standing>>('/api/rfaf/standings'),
    enabled,
  });
}

export function useScorers(enabled: boolean) {
  return useQuery({
    queryKey: ['rfaf', 'scorers'],
    queryFn: () => api<RfafResponse<Scorer>>('/api/rfaf/scorers'),
    enabled,
  });
}

export function useFixtures(enabled: boolean) {
  return useQuery({
    queryKey: ['rfaf', 'fixtures'],
    queryFn: () => api<RfafResponse<Fixture>>('/api/rfaf/fixtures'),
    enabled,
  });
}

export function useRefreshRfaf() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<{ ok: true }>('/api/rfaf/refresh', { method: 'POST' }),
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
