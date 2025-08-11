// app/teacher/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';

type Me = {
  id: number;
  name: string;
  email: string;
  // 必要に応じて追加
};

export default function TeacherDashboard() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    // 簡易ガード：トークン未保持ならログインへ
    if (!getToken()) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await apiFetch('/teachers/profile'); // Authorization 自動付与 & 401共通処理
        if (!res.ok) throw new Error('プロフィール取得に失敗しました');
        const json = await res.json();
        setMe(json.data as Me);
      } catch (e: any) {
        // apiFetch が 401 のときはすでにリダイレクトされる想定
        setErr(e?.message || '読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold mb-4">教師ダッシュボード</h1>
        <p>読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">教師ダッシュボード</h1>

      {err && <p className="text-red-500 mb-4">{err}</p>}

      {me ? (
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">プロフィール</h2>
            <pre className="bg-gray-100 p-3 rounded overflow-auto">
              {JSON.stringify(me, null, 2)}
            </pre>
          </div>

          {/* ここにダッシュボードのカード等を増やしていく */}
        </section>
      ) : (
        <p>プロフィール情報が見つかりません。</p>
      )}
    </main>
  );
}
