'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { setToken } from '@/lib/auth'; // ← localStorage に保存するやつ

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nextParam = (() => {
    const raw = sp.get('next') || '';
    try {
      const decoded = decodeURIComponent(raw);
      return decoded.startsWith('/login') ? '' : decoded; // ループ防止
    } catch { return ''; }
  })();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/teachers/sign_in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacher: { email, password } })
    });

    if (!res.ok) { alert('ログイン失敗'); return; }

    // Authorization をヘッダから保存（バックエンドが付与している前提）
    const token = res.headers.get('Authorization');
    if (token) setToken(token);

    router.replace(nextParam || '/teacher/dashboard');
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>ログイン</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">ログイン</button>
      </form>
    </main>
  );
}
