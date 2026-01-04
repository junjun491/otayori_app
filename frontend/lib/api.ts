// app/lib/api.ts
import { getToken, clearToken } from "./auth";

let isRedirecting = false; // 多重リダイレクト防止

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  // base 環境変数は廃止（ローカルは next.config の rewrites、AWSは ALB で /api/* を backend へ）
  // 呼び出し側は "/teachers/..." でも "/api/teachers/..." でもOKにするため、ここで /api を自動付与
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiPath = normalizedPath.startsWith("/api/")
    ? normalizedPath
    : `/api${normalizedPath}`;

  const token = getToken();

  const headers = new Headers(init.headers || {});
  // JWTは Authorization: Bearer <token> が基本（もし getToken() が "Bearer ..." を返す設計ならそのままでOK）
  if (token) {
    const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    headers.set("Authorization", value);
  }

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
  const res = await fetch(apiPath, {
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
