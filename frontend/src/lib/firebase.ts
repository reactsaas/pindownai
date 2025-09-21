import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'

// Firebase configuration - these should be environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

//console.log('🔍 Debug - Firebase config:', firebaseConfig)

// Check if Firebase configuration is available
const requiredConfigValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId
]

const isFirebaseConfigured = requiredConfigValues.every(value => value !== undefined && value !== null && value !== '')


if (!isFirebaseConfigured) {
  console.warn('⚠️ Firebase not configured. Authentication features will be disabled.')
  console.warn('📋 Check firebase-setup.md for setup instructions')
}

// Initialize Firebase only if configured
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : undefined

// Initialize Firebase Auth
export const auth = isFirebaseConfigured ? getAuth(app) : null

// Auth providers
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

githubProvider.setCustomParameters({
  prompt: 'consent'
})

// Auth functions
export const signInWithGoogle = () => {
  if (!auth) throw new Error('Firebase not configured')
  return signInWithPopup(auth, googleProvider)
}

export const signInWithGitHub = () => {
  if (!auth) throw new Error('Firebase not configured')
  return signInWithPopup(auth, githubProvider)
}

export const signOut = () => {
  if (!auth) throw new Error('Firebase not configured')
  return firebaseSignOut(auth)
}

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    // If Firebase is not configured, immediately call callback with null user
    callback(null)
    return () => {} // Return a no-op unsubscribe function
  }
  return onAuthStateChanged(auth, callback)
}


// Export configuration status
export { isFirebaseConfigured }

export default app
