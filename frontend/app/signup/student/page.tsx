import React, { Suspense } from 'react';
import StudentSignupPage from './StudentSignupPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StudentSignupPage />
    </Suspense>
  );
}
