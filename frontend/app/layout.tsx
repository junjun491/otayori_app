import AuthGuard from '@/lib/authguard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AuthGuard />  {/* ← Client Component */}
        {children}
      </body>
    </html>
  );
}