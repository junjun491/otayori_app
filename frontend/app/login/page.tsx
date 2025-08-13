'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, safeNextParam } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);

  // ✅ 既ログインならスキップ
  useEffect(() => {
    const t = getToken();
    if (t) {
      const next = safeNextParam('/teacher/dashboard');
      router.replace(next);
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
      const res = await fetch(`${base}/teachers/sign_in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ※ ここはあなたのAPI仕様に合わせて。現状シンプルJSONでOK
        body: JSON.stringify({ teacher: { email, password } }),
      });

      if (!res.ok) {
        setErr('メールまたはパスワードが正しくありません。');
        return;
      }

      // レスポンスヘッダから Authorization を取得して保存
      const auth = res.headers.get('Authorization');
      if (auth) {
        setToken(auth); // "Bearer ..." で保存（auth.tsで自動補正あり）
      }

      const next = safeNextParam('/teacher/dashboard');
      router.replace(next);
    } catch (e) {
      setErr('通信に失敗しました。しばらくしてから再度お試しください。');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>ログイン</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">サインイン</button>
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </form>
    </main>
  );
}
