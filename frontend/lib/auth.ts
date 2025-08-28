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

export function getJwtPayload(): any | null {
  if (typeof window === "undefined") return null;
  const auth = getToken(); // "Bearer xxx.yyy.zzz"
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  const jwt = m ? m[1] : auth;
  const parts = jwt.split(".");
  if (parts.length < 2) return null;

  function b64urlDecode(s: string): string {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return atob(s);
  }

  try {
    const payloadJson = b64urlDecode(parts[1]);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

export function getRoleFromToken(): "teacher" | "student" | null {
  const p = getJwtPayload();
  const sub: string | undefined = p?.sub;
  if (!sub) return null;
  const role = sub.split(":")[0];
  if (role === "teacher" || role === "student") return role;
  return null;
}

export function isTokenExpired(graceSeconds = 0): boolean {
  const p = getJwtPayload();
  const now = Math.floor(Date.now() / 1000);
  const exp: number | undefined = p?.exp;
  if (!exp) return false; // expが無ければ期限判定しない
  return now > exp - graceSeconds;
}
