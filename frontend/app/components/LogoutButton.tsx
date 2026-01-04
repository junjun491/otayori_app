'use client';
import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';
import { apiFetch } from "@/lib/api";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // 1) サーバー側でセッション破棄（任意）
    try {
      await apiFetch("/teachers/sign_out", {
        method: "DELETE",
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
