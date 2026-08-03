'use client'

import { Suspense } from 'react'; 
import ResetPasswordContent from './ResetPasswordContent';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <Suspense fallback={
        <div className="text-white text-xl flex items-center justify-center min-h-[50vh]">
          Loading reset password form...
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}