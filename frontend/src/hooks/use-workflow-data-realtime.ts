import { useState, useEffect, useRef } from 'react'
import { subscribeToWorkflowData } from '@/lib/firebase-realtime'

interface UseWorkflowDataRealtimeOptions {
  enabled?: boolean
  onError?: (error: Error) => void
}

export function useWorkflowDataRealtime(
  pinId: string | null,
  datasetId: string | null,
  options: UseWorkflowDataRealtimeOptions = {}
) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!pinId || !datasetId || !options.enabled) {
      setIsLoading(false)
      setIsConnected(false)
      return
    }

    setIsLoading(true)
    setError(null)

    // Subscribe to workflow data updates
    const unsubscribe = subscribeToWorkflowData(
      pinId,
      datasetId,
      (newData) => {
        setData(newData)
        setIsLoading(false)
        setIsConnected(true)
        setLastUpdate(new Date())
      },
      (error) => {
        setError(error)
        setIsLoading(false)
        setIsConnected(false)
        options.onError?.(error)
      }
    )

    unsubscribeRef.current = unsubscribe

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      setIsConnected(false)
    }
  }, [pinId, datasetId, options.enabled, options.onError])

  return {
    data,
    isLoading,
    error,
    isConnected,
    lastUpdate
  }
}

// Hook for multiple workflow data sources
export function useMultiWorkflowDataRealtime(
  pinId: string | null,
  datasetIds: string[],
  options: UseWorkflowDataRealtimeOptions = {}
) {
  const [workflowData, setWorkflowData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [connections, setConnections] = useState<Record<string, boolean>>({})
  const [lastUpdates, setLastUpdates] = useState<Record<string, Date>>({})
  const [errors, setErrors] = useState<Record<string, Error>>({})
  const unsubscribeRefs = useRef<Record<string, () => void>>({})

  useEffect(() => {
    if (!pinId || !datasetIds.length || !options.enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setWorkflowData({})
    setConnections({})
    setLastUpdates({})
    setErrors({})

    // Subscribe to each workflow data source
    datasetIds.forEach(datasetId => {
      const unsubscribe = subscribeToWorkflowData(
        pinId,
        datasetId,
        (newData) => {
          setWorkflowData(prev => ({
            ...prev,
            [datasetId]: newData
          }))
          
          setConnections(prev => ({
            ...prev,
            [datasetId]: true
          }))
          
          setLastUpdates(prev => ({
            ...prev,
            [datasetId]: new Date()
          }))

          // Remove any previous errors for this dataset
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[datasetId]
            return newErrors
          })

          setLoading(false)
        },
        (error) => {
          console.error(`Error subscribing to ${datasetId}:`, error)
          setConnections(prev => ({
            ...prev,
            [datasetId]: false
          }))
          
          setErrors(prev => ({
            ...prev,
            [datasetId]: error
          }))
          
          setLoading(false)
        }
      )

      unsubscribeRefs.current[datasetId] = unsubscribe
    })

    // Cleanup
    return () => {
      Object.values(unsubscribeRefs.current).forEach(unsubscribe => {
        unsubscribe()
      })
      unsubscribeRefs.current = {}
      setConnections({})
    }
  }, [pinId, datasetIds, options.enabled, options.onError])

  return {
    workflowData,
    loading,
    connections,
    lastUpdates,
    errors,
    isConnected: Object.values(connections).some(connected => connected),
    allConnected: Object.values(connections).every(connected => connected)
  }
}
