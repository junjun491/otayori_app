// app/signup/invalid/page.tsx
import React, { Suspense } from 'react';
import InvalidInvitationPage from './InvalidInvitationPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InvalidInvitationPage />
    </Suspense>
  );
}
