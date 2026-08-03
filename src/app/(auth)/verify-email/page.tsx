import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
