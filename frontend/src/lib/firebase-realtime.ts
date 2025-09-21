import { initializeApp } from 'firebase/app'
import { 
  getDatabase,
  ref,
  onValue,
  off,
  update,
  serverTimestamp
} from 'firebase/database'

// Firebase Realtime Database configuration
const firebaseRealtimeConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if Firebase Realtime Database is configured
const isRealtimeConfigured = !!(
  firebaseRealtimeConfig.apiKey &&
  firebaseRealtimeConfig.authDomain &&
  firebaseRealtimeConfig.databaseURL &&
  firebaseRealtimeConfig.projectId &&
  firebaseRealtimeConfig.appId
)

if (!isRealtimeConfigured) {
  console.warn('⚠️ Firebase Realtime Database not configured. Real-time features will be disabled.')
  console.warn('📋 Add NEXT_PUBLIC_FIREBASE_DATABASE_URL to your .env.local file')
}

// Initialize Firebase Realtime Database
const realtimeApp = isRealtimeConfigured ? initializeApp(firebaseRealtimeConfig, 'realtime') : undefined
export const database = isRealtimeConfigured ? getDatabase(realtimeApp) : null

// Realtime Database functions
export const subscribeToWorkflowData = (
  pinId: string, 
  datasetId: string, 
  callback: (data: any) => void,
  errorCallback?: (error: Error) => void
) => {
  if (!database) {
    console.warn('Firebase Realtime Database not configured - database URL missing')
    return () => {}
  }

  const workflowRef = ref(database, `pin_datasets/${pinId}/${datasetId}/data`)
  
  const unsubscribe = onValue(
    workflowRef,
    (snapshot) => {
      const data = snapshot.val()
      callback(data)
    },
    (error) => {
      console.error('Firebase subscription error:', error)
      errorCallback?.(error)
    }
  )

  return unsubscribe
}

export const updateWorkflowData = async (
  pinId: string, 
  datasetId: string, 
  data: any
) => {
  if (!database) {
    throw new Error('Firebase Realtime Database not configured')
  }

  const updates = {}
  updates[`pin_datasets/${pinId}/${datasetId}/data`] = {
    ...data,
    last_update: serverTimestamp()
  }

  return update(ref(database), updates)
}

// Export configuration status
export { isRealtimeConfigured }

export default realtimeApp

