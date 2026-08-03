import { ReactNode } from 'react'
import { Toaster } from "@/components/ui/sonner"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {children}
        <Toaster />
      </div>
    </div>
  )
}