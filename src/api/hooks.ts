import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client.js';
import type {
  MatchType,
  Profile,
  RecordEntry,
  SessionDetail,
  SessionListResponse,
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

export function useRecords(enabled: boolean) {
  return useQuery({
    queryKey: ['records'],
    queryFn: () => api<{ records: RecordEntry[] }>('/api/stats/records'),
    enabled,
  });
}

export function useTrend(metric: string, enabled: boolean) {
  return useQuery({
    queryKey: ['trends', metric],
    queryFn: () =>
      api<{ metric: string; points: TrendPoint[] }>(
        `/api/stats/trends?metric=${encodeURIComponent(metric)}`,
      ),
    enabled,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api<{ ok: true }>('/auth/logout', { method: 'POST' }),
    onSuccess: () => qc.clear(),
  });
}
