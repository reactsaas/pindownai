'use client'

import { useState, useEffect } from 'react'
import { useWorkflowDataRealtime } from '@/hooks/use-workflow-data-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check, RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface WorkflowDataRealtimeDisplayProps {
  pinId: string
  datasetId: string
  datasetName: string
  enabled?: boolean
}

function LiveValue({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setIsUpdating(true)
      setDisplayValue(value)
      
      const timer = setTimeout(() => setIsUpdating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [value, displayValue])

  return (
    <span className={`inline-block transition-all duration-300 ${
      isUpdating ? 'bg-blue-100 text-blue-900 px-2 py-1 rounded animate-pulse' : ''
    }`}>
      {displayValue}
    </span>
  )
}

export function WorkflowDataRealtimeDisplay({ 
  pinId, 
  datasetId, 
  datasetName, 
  enabled = true 
}: WorkflowDataRealtimeDisplayProps) {
  const { data, isLoading, error, isConnected, lastUpdate } = useWorkflowDataRealtime(
    pinId,
    datasetId,
    { enabled }
  )

  const [copied, setCopied] = useState(false)

  const copyData = async () => {
    if (data) {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return date.toLocaleTimeString()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{datasetName}</CardTitle>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Connecting...</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading workflow data...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{datasetName}</CardTitle>
            <Badge variant="destructive" className="text-xs">
              <WifiOff className="h-3 w-3 mr-1" />
              Error
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600">Connection error: {error.message}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{datasetName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isConnected ? "default" : "secondary"} 
              className="text-xs"
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
            {data && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={copyData}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-3">
            {/* Display key-value pairs */}
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">{key}:</span>
                <span className="font-mono">
                  {typeof value === 'object' ? (
                    <LiveValue value={JSON.stringify(value)} />
                  ) : (
                    <LiveValue value={String(value)} />
                  )}
                </span>
              </div>
            ))}
            
            {/* Last update timestamp */}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              Last updated: <LiveValue value={formatLastUpdate(lastUpdate)} />
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No data received yet. Waiting for updates...
          </div>
        )}
      </CardContent>
    </Card>
  )
}









