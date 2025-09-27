'use client'

import React, { useState, useEffect, memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@/lib/auth-context'
import { useTemplateVariableLoading } from '@/lib/template-variable-loading-context'
import { isRealtimeConfigured, subscribeToWorkflowData } from '@/lib/firebase-realtime'

interface TemplateVariableProps {
  variableType: 'current' | 'pin'
  datasetId: string
  pinId?: string
  jsonPath?: string | null
  fullPath: string
  currentPinId?: string
}

export const TemplateVariable: React.FC<TemplateVariableProps> = memo(({
  variableType,
  datasetId,
  pinId,
  jsonPath,
  fullPath,
  currentPinId
}) => {
  const [value, setValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  const { getAuthToken } = useAuth()
  const { registerVariable, unregisterVariable, markVariableLoaded, isInitialLoadComplete, setConnection } = useTemplateVariableLoading()
  const variableId = fullPath

  // Register/unregister variable for loading tracking
  useEffect(() => {
    console.log('TemplateVariable registering:', { variableId, fullPath })
    registerVariable(variableId)
    return () => {
      console.log('TemplateVariable unregistering:', { variableId, fullPath })
      unregisterVariable(variableId)
    }
  }, [variableId, registerVariable, unregisterVariable])

    useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const run = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = await getAuthToken()
        const targetPinId = variableType === 'current' ? currentPinId : pinId
        if (!targetPinId) throw new Error('Pin ID not available')

        // Initial fetch for fast first paint
        const url = `http://localhost:8000/api/pins/${targetPinId}/datasets/${datasetId}`
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        if (!response.ok) throw new Error(`Failed to fetch dataset: ${response.statusText}`)
        const data = await response.json()
        const dataset = data?.data?.dataset
        let extractedValue = dataset?.data

        if (dataset?.metadata?.type === 'markdown' && extractedValue?.content) {
          if (jsonPath === 'markdown' || !jsonPath) extractedValue = extractedValue.content
        }
        if (jsonPath && jsonPath !== 'markdown' && extractedValue) {
          const pathParts = jsonPath.split('.')
          for (const part of pathParts) {
            if (extractedValue && typeof extractedValue === 'object') extractedValue = extractedValue[part]
            else throw new Error(`Path not found: ${jsonPath}`)
          }
        }

        // Set value from initial fetch
        if (extractedValue === null || extractedValue === undefined) setValue('')
        else if (typeof extractedValue === 'string') setValue(extractedValue)
        else if (typeof extractedValue === 'object') setValue(JSON.stringify(extractedValue, null, 2))
        else setValue(String(extractedValue))

        // Mark loaded once initial value is in
        if (!hasInitiallyLoaded) {
          setHasInitiallyLoaded(true)
          markVariableLoaded(variableId)
        }

        // Realtime subscription (only specific dataset path)
        if (isRealtimeConfigured) {
          unsubscribe = subscribeToWorkflowData(
            targetPinId,
            datasetId,
            (liveData) => {
              setConnection(variableId, true)
              let liveValue: any = liveData
              if (dataset?.metadata?.type === 'markdown' && liveValue?.content) {
                if (jsonPath === 'markdown' || !jsonPath) liveValue = liveValue.content
              }
              if (jsonPath && jsonPath !== 'markdown' && liveValue) {
                const pathParts = jsonPath.split('.')
                for (const part of pathParts) {
                  if (liveValue && typeof liveValue === 'object') liveValue = liveValue[part]
                  else return
                }
              }

              if (liveValue === null || liveValue === undefined) setValue('')
              else if (typeof liveValue === 'string') setValue(liveValue)
              else if (typeof liveValue === 'object') setValue(JSON.stringify(liveValue, null, 2))
              else setValue(String(liveValue))
            },
            (e) => {
              setConnection(variableId, false)
            }
          )
        }
      } catch (err) {
        console.error('Error fetching template variable:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setValue(`{{${fullPath}}}`)
        if (!hasInitiallyLoaded) {
          setHasInitiallyLoaded(true)
          markVariableLoaded(variableId)
        }
      } finally {
        setIsLoading(false)
      }
    }

    run()
    return () => {
      if (unsubscribe) unsubscribe()
      setConnection(variableId, false)
    }
  }, [variableType, datasetId, pinId, jsonPath, fullPath, currentPinId, getAuthToken, markVariableLoaded, hasInitiallyLoaded, variableId, setConnection])

  if (isLoading && !isInitialLoadComplete) {
    // During initial page load, show skeleton
    return (
      <span className="inline-block h-5 w-20 bg-muted animate-pulse rounded" />
    )
  }

  if (isLoading && isInitialLoadComplete) {
    // During real-time updates, show mini spinner
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
        <div className="w-3 h-3 border border-muted-foreground border-t-transparent rounded-full animate-spin" />
        Loading...
      </span>
    )
  }

  if (error) {
    return (
      <span 
        className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-sm cursor-help" 
        title={error}
      >
        Error: {fullPath}
      </span>
    )
  }

  // Check if this is markdown content that should be rendered
  const isMarkdownContent = jsonPath === 'markdown' || 
    (value.includes('\n') && (value.includes('#') || value.includes('*') || value.includes('-')))

  if (isMarkdownContent && value.length > 100) {
    return (
      <div className="template-variable-markdown border-l-4 border-blue-500 dark:border-blue-400 pl-4 my-4 bg-muted/20 rounded-r">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {value}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <span 
      className="template-variable inline-block px-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded" 
      data-variable-path={fullPath}
      title={`Variable: ${fullPath}`}
    >
      {value || `{{${fullPath}}}`}
    </span>
  )
})
