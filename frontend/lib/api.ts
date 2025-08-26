// app/lib/api.ts
import { getToken, clearToken } from "./auth";

let isRedirecting = false; // 多重リダイレクト防止

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const token = getToken();

  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", token);

  const hasBody = typeof init.body !== "undefined";
  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  // localStorage運用なので cookie は送らない
  // 将来 HttpOnly クッキーに切替えたら 'include' に変更
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    credentials: "omit",
  });

  if (res.status === 401) {
    // 認証切れ：トークン破棄 → ログインへ
    clearToken();
    if (typeof window !== "undefined" && !isRedirecting) {
      isRedirecting = true;
      // 現在URLをクエリに残しておくと再ログイン後リダイレクトに使える
      const back = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      window.location.href = `/login?next=${back}`;
    }
    // 以降の呼び出し側が try/catch できるようエラーにする
    throw new Error("認証が失効しました。再ログインしてください。");
  }

  return res;
}
