// lib/authguard.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

const isPublic = (path: string) =>
  path === '/login' ||
  path.startsWith('/signup'); // 必要なら /public など追加

export default function AuthGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;

    // 1) ログイン/サインアップ系は常に素通り
    if (isPublic(pathname)) return;

    // 2) トークンが無ければログインへ
    const token = getToken();
    if (!token) {
      // ループ防止: next に /login が入らないようにする
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const nextRaw = `${pathname}${search}`;
      if (nextRaw.startsWith('/login')) {
        // /login 自身は next に入れない
        router.replace('/login');
        return;
      }
      const next = encodeURIComponent(nextRaw);
      router.replace(`/login?next=${next}`);
    }
  }, [pathname, router]);

  return null;
}
