'use client';
import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // 1) サーバー側でセッション破棄（任意）
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teachers/sign_out`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${clearToken()}` },
      });
    } catch (e) {
      console.warn('サーバー側ログアウト失敗（無視可能）', e);
    }

    // 2) ローカルのトークン削除
    clearToken();

    // 3) ログイン画面へ
    router.replace('/login');
  };

  return <button onClick={handleLogout}>ログアウト</button>;
}
