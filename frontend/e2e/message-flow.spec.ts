// frontend/e2e/message-flow.spec.ts
import { test, expect } from "@playwright/test";

const FRONT = "http://localhost:3000";
const API = "http://localhost:3001";

// 自分の開発用アカウントに置き換え
const TEACHER = { email: "teacher@example.com", password: "password" };

test("先生ログインして教室ページに行ける（APIログイン方式）", async ({
  page,
  request,
}) => {
  // 1) Rails APIに直接ログインしてJWTを取る（Devise-JWT想定）
  const res = await request.post(`${API}/teachers/sign_in`, {
    data: { teacher: TEACHER }, // ← コントローラ実装に合わせて必要ならキー名を調整
  });
  expect(res.ok()).toBeTruthy();

  // ヘッダ or JSONボディからトークンを拾う（どちらか存在する方で）
  const authHeader =
    res.headers()["authorization"] ?? res.headers()["Authorization"];
  const json = await res.json().catch(() => ({} as any));
  const token = authHeader ?? json.token ?? json.jwt;
  if (!token) throw new Error("ログインAPIからトークンを取得できませんでした");

  // 2) フロントのlocalStorageにトークンを突っ込む
  //    あなたの実装のキー名に合わせて調整（例: 'token' / 'Authorization' など）
  await page.goto(FRONT, { waitUntil: "domcontentloaded" });
  await page.addInitScript(
    ([t]) => {
      try {
        localStorage.setItem("token", t);
        localStorage.setItem("Authorization", t);
      } catch {}
    },
    [token]
  );

  // 3) 認証が要る教師ページへ直接アクセス
  await page.goto(`${FRONT}/teacher/classrooms`, {
    waitUntil: "domcontentloaded",
  });

  // 4) 教師用ページに到達できていることをざっくり検証（URL or 画面要素）
  await expect(page).toHaveURL(/teacher|classrooms/);
  // await expect(page.getByText('あなたの教室')).toBeVisible(); // 任意の文言に調整
});
