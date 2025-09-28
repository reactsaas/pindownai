"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { onAuthStateChange, signInWithGoogle, signInWithGitHub, signOut as firebaseSignOut, isFirebaseConfigured } from './firebase'
import { logVerbose, logInfo, logError } from './logger'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  getAuthToken: () => Promise<string | null>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ 
  children,
  requireAuth = false 
}: { 
  children: React.ReactNode
  requireAuth?: boolean 
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user)
      setLoading(false)
      
      // Save user data to backend only on first registration
      if (user) {
        try {
          const token = await user.getIdToken()
          
          // Check if user already exists
          const checkResponse = await fetch(`http://localhost:8000/api/users/${user.uid}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          // Only save if user doesn't exist (404 response)
          if (checkResponse.status === 404) {
            const userData = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || null,
              photoURL: user.photoURL || null,
              emailVerified: user.emailVerified || false
            }

            const response = await fetch('http://localhost:8000/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(userData)
            })

            if (response.ok) {
              const result = await response.json()
              logInfo('New user registered successfully', 'AuthContext', { userId: result.uid })
            } else {
                              logError('Failed to save new user data', 'AuthContext', { status: response.statusText })
            }
          } else if (checkResponse.ok) {
            logVerbose('User already exists, skipping registration', 'AuthContext')
          } else {
            logError('Error checking user existence', 'AuthContext', { status: checkResponse.statusText })
          }
        } catch (error) {
          logError('Error handling user registration', 'AuthContext', error)
          // Don't throw error to avoid breaking the auth flow
        }
      }
      
      // If this component requires auth and user is not authenticated, redirect to login
      if (requireAuth && !user && !loading) {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [requireAuth, router])

  const handleSignInWithGoogle = async () => {
    logVerbose('Firebase configuration status', 'AuthContext', { configured: isFirebaseConfigured })
    if (!isFirebaseConfigured) {
      logError('Firebase not configured. Please set up environment variables.', 'AuthContext')
      return
    }
    try {
      setLoading(true)
      logVerbose('Calling Firebase signInWithGoogle', 'AuthContext')
      await signInWithGoogle()
      logInfo('Firebase signInWithGoogle successful', 'AuthContext')
      router.push('/pins')
    } catch (error) {
              logError('Google sign in error', 'AuthContext', error)
      setLoading(false)
    }
  }

      const handleSignInWithGitHub = async () => {
      if (!isFirebaseConfigured) {
        logError('Firebase not configured. Please set up environment variables.', 'AuthContext')
        return
      }
      try {
        setLoading(true)
        await signInWithGitHub()
        router.push('/pins')
      } catch (error) {
        logError('GitHub sign in error', 'AuthContext', error)
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (!isFirebaseConfigured) {
      logError('Firebase not configured. Please set up environment variables.', 'AuthContext')
      return
    }
    try {
      await firebaseSignOut()
      router.push('/')
    } catch (error) {
      logError('Sign out error', 'AuthContext', error)
    }
  }

  const getAuthToken = async (): Promise<string | null> => {
    if (!user) {
      return null
    }
    try {
      const token = await user.getIdToken()
      return token
    } catch (error) {
      logError('Error getting auth token', 'AuthContext', error)
      return null
    }
  }


  const value = {
    user,
    loading,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithGitHub: handleSignInWithGitHub,
    signOut: handleSignOut,
    getAuthToken,
    isAuthenticated: !!user
  }

  // Show loading screen while checking auth state
  if (loading && requireAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth is required but user is not authenticated, don't render children
  // (will redirect to login via useEffect)
  if (requireAuth && !user && !loading) {
    return null
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
