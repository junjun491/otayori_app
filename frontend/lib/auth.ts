export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

// 追加: /login自己参照や外部URLを弾く安全な next 抽出
export function safeNextParam(defaultPath = "/dashboard"): string {
  if (typeof window === "undefined") return defaultPath;
  const here = new URL(window.location.href);
  const raw = here.searchParams.get("next") || defaultPath;
  try {
    if (raw.startsWith("/login")) return defaultPath; // /login 自己参照を防ぐ
    const u = new URL(raw, window.location.origin);
    if (u.origin !== window.location.origin) return defaultPath; // 外部URL禁止
    return u.pathname + (u.search || "") + (u.hash || "");
  } catch {
    return defaultPath;
  }
}

export const AUTH_KEY = "authToken";

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(AUTH_KEY) ?? "";
}

export function setToken(raw: string) {
  const token = raw && !raw.startsWith("Bearer ") ? `Bearer ${raw}` : raw;
  localStorage.setItem(AUTH_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}
