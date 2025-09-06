import { Pin } from "lucide-react"
import Link from "next/link"

import { LoginForm } from "@/components/login-form"
import { AuthProvider } from "@/lib/auth-context"

export default function LoginPage() {
  return (
    <AuthProvider requireAuth={false}>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <Pin className="size-4 rotate-45" />
              </div>
              pindown.ai
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Pin className="w-16 h-16 text-primary rotate-45" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Welcome to pindown.ai</h2>
                              <p className="text-muted-foreground max-w-sm">
                Transform your automation outputs into information that everyone can understand.
              </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}
