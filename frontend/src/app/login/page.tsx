"use client"

import { Pin } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { LoginForm } from "@/components/login-form"
import { AuthProvider, useAuth } from "@/lib/auth-context"

function LoginPageContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // If user is already authenticated, show redirect message and then redirect
    if (!loading && user) {
      setIsRedirecting(true)
      // Add a 2-second delay before redirect
      const timer = setTimeout(() => {
        router.push('/pins')
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [user, loading, router])

  // Show loading while checking auth state or redirecting
  if (loading || isRedirecting) {
    return (
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
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                {isRedirecting ? "You're already logged in! Redirecting to dashboard..." : "Checking authentication..."}
              </p>
              {isRedirecting && (
                <p className="text-sm text-muted-foreground mt-2">
                  Redirecting in 2 seconds...
                </p>
              )}
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
    )
  }

  // If user is authenticated, don't render login form (will redirect)
  if (user) {
    return null
  }

  // Show login form for unauthenticated users
  return (
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
  )
}

export default function LoginPage() {
  return (
    <AuthProvider requireAuth={false}>
      <LoginPageContent />
    </AuthProvider>
  )
}
