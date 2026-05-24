import { API_ENDPOINTS } from './config';

/** Paths that must not trigger a refresh-and-retry loop. */
const SKIP_REFRESH_PATHS = [
  '/api/auth/refresh-token',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
];

function shouldSkipRefresh(url: string): boolean {
  return SKIP_REFRESH_PATHS.some((path) => url.includes(path));
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh the session using the HttpOnly refresh_token cookie.
 * Concurrent callers share a single in-flight request (token rotation safe).
 */
export async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        method: 'POST',
        headers: { 'x-csrf-token': '1' },
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * fetch wrapper: on 401, refresh tokens once and retry the original request.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = resolveUrl(input);
  const options: RequestInit = {
    ...init,
    credentials: init?.credentials ?? 'include',
  };

  let response = await fetch(input, options);

  if (response.status === 401 && !shouldSkipRefresh(url)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      response = await fetch(input, options);
    }
  }

  return response;
}

/** Validate callbackUrl to prevent open redirects. */
export function safeCallbackUrl(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}
