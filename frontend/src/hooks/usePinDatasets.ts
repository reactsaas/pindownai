'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'

interface PinDataset {
  pinId: string
  pinTitle: string
  datasetId: string
  datasetName: string
  data: any
  isMarkdown: boolean
}

interface UsePinDatasetsOptions {
  enabled?: boolean
  onError?: (error: Error) => void
}

export function usePinDatasets(
  currentPinId?: string | null,
  options: UsePinDatasetsOptions = {}
) {
  const [datasets, setDatasets] = useState<PinDataset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { user, getAuthToken } = useAuth()

  const fetchDatasets = async () => {
    if (!user || !options.enabled) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = await getAuthToken()
      
      // Fetch pins to get available datasets
      const pinsResponse = await fetch('http://localhost:8000/api/pins', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!pinsResponse.ok) {
        throw new Error(`Failed to fetch pins: ${pinsResponse.status}`)
      }

      const pinsData = await pinsResponse.json()
      console.log('Pins API response:', pinsData)
      
      const pins = Array.isArray(pinsData) ? pinsData : pinsData.data?.pins || []
      console.log('Processed pins:', pins)
      
      const allDatasets: PinDataset[] = []

      // For each pin, fetch its datasets
      for (const pin of pins) {
        try {
          // Fetch datasets for this pin
          const datasetsResponse = await fetch(
            `http://localhost:8000/api/pins/${pin.id}/datasets`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          )

          if (datasetsResponse.ok) {
            const datasetsData = await datasetsResponse.json()
            console.log(`Datasets for pin ${pin.id}:`, datasetsData)
            
            // Extract datasets from response
            if (datasetsData && datasetsData.success && datasetsData.data && datasetsData.data.datasets) {
              datasetsData.data.datasets.forEach((dataset: any) => {
                allDatasets.push({
                  pinId: pin.id,
                  pinTitle: pin.metadata?.title || `Pin ${pin.id}`,
                  datasetId: dataset.id,
                  datasetName: dataset.metadata?.name || `Dataset ${dataset.id}`,
                  data: dataset.data,
                  isMarkdown: dataset.metadata?.type === 'markdown'
                })
              })
            }
          }
        } catch (pinError) {
          console.warn(`Failed to fetch datasets for pin ${pin.id}:`, pinError)
        }
      }

      setDatasets(allDatasets)
    } catch (err) {
      console.error('Error fetching datasets:', err)
      const error = err instanceof Error ? err : new Error('Failed to fetch datasets')
      setError(error)
      options.onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDatasets()
  }, [user, options.enabled])

  // Get datasets for current pin
  const currentPinDatasets = datasets.filter(d => d.pinId === currentPinId)
  
  // Get datasets from other pins
  const otherPinDatasets = datasets.filter(d => d.pinId !== currentPinId)

  return {
    datasets,
    currentPinDatasets,
    otherPinDatasets,
    isLoading,
    error,
    refetch: fetchDatasets
  }
}
