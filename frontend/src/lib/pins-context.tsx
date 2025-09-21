"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'

interface PinsContextType {
  pinsCount: number
  setPinsCount: (count: number) => void
  refreshPinsCount: () => Promise<void>
  clearPinsCount: () => void
}

const PinsContext = createContext<PinsContextType | undefined>(undefined)

// LocalStorage key for persisting pin count
const PINS_COUNT_STORAGE_KEY = 'pindown_pins_count'

export function PinsProvider({ children }: { children: ReactNode }) {
  const [pinsCount, setPinsCount] = useState(0)
  const { user, getAuthToken } = useAuth()

  // Load pin count from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCount = localStorage.getItem(PINS_COUNT_STORAGE_KEY)
      if (storedCount) {
        const count = parseInt(storedCount, 10) || 0
        setPinsCount(count)
      }
    }
  }, [])

  // Save pin count to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PINS_COUNT_STORAGE_KEY, pinsCount.toString())
    }
  }, [pinsCount])

  const fetchPinsCount = async () => {
    if (!user) {
      setPinsCount(0)
      return
    }

    try {
      const token = await getAuthToken()
      const response = await fetch('http://localhost:8000/api/pins', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const newCount = data.data.total || 0
        setPinsCount(newCount)
        return newCount
      }
    } catch (error) {
      console.error('Error fetching pins count:', error)
      setPinsCount(0)
      return 0
    }
  }

  const refreshPinsCount = async () => {
    return await fetchPinsCount()
  }

  const clearPinsCount = () => {
    setPinsCount(0)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PINS_COUNT_STORAGE_KEY)
    }
  }

  // Only fetch on user change if we don't have a stored count
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const storedCount = localStorage.getItem(PINS_COUNT_STORAGE_KEY)
      if (!storedCount) {
        // Only fetch if we don't have a stored count
        fetchPinsCount()
      }
    } else if (!user) {
      // Clear count when user logs out
      clearPinsCount()
    }
  }, [user])

  return (
    <PinsContext.Provider value={{ pinsCount, setPinsCount, refreshPinsCount, clearPinsCount }}>
      {children}
    </PinsContext.Provider>
  )
}

export function usePins() {
  const context = useContext(PinsContext)
  if (context === undefined) {
    throw new Error('usePins must be used within a PinsProvider')
  }
  return context
}
