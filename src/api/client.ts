export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  init: RequestInit & { playerId?: number | null } = {},
): Promise<T> {
  const playerId =
    init.playerId !== undefined ? init.playerId : localStorage.getItem('activePlayerId');
  const headers = new Headers(init.headers);
  if (playerId) {
    headers.set('x-player-id', String(playerId));
  }

  const res = await fetch(path, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j?.error ?? msg;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, msg);
  }
  return (await res.json()) as T;
}
