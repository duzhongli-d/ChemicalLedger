/**
 * Cookie utilities for auth token storage.
 * Note: HttpOnly cookies can't be read by JS, but we use these for
 * cases where we need to check if a cookie exists (not for reading token).
 */

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/access_token=([^;]+)/);
  return match ? match[1] : null;
}

export function setAuthToken(token: string): void {
  if (typeof document === "undefined") return;
  // Secure + SameSite=None for cross-origin HTTPS (frontend -> API on different subdomain)
  document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; Secure; SameSite=None`;
}

export function clearAuthToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = "access_token=; path=/; max-age=0";
}

export function hasAuthToken(): boolean {
  return getAuthToken() !== null;
}
