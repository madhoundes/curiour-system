"use client"

import { AuthDebug } from "@/components/debug/auth-debug"

export default function DebugAuthPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-center">
        <AuthDebug />
      </div>
    </div>
  )
}