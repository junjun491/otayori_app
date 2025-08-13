// frontend/components/AppHeader.tsx
'use client';

import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

export default function AppHeader() {
  const pathname = usePathname();
  const hide = pathname.startsWith('/login') || pathname.startsWith('/sign_up');

  if (hide) return null;

  return (
    <header style={{ padding: 8, borderBottom: '1px solid #eee' }}>
      <LogoutButton />
    </header>
  );
}
