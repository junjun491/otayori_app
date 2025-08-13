import AuthGuard from '@/lib/authguard';     // ← ClientでもServerから子として使える
import AppHeader from './components/AppHeader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthGuard />      {/* 認証チェック（リダイレクトなど） */}
        <AppHeader />      {/* /login と /sign_up では内部で非表示にする */}
        {children}
      </body>
    </html>
  );
}
