'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface TemplateVariablePreviewProps {
  dataset: any
  jsonPath: string
  pinId: string | null
  currentPinId: string | null
}

export const TemplateVariablePreview: React.FC<TemplateVariablePreviewProps> = ({
  dataset,
  jsonPath,
  pinId,
  currentPinId
}) => {
  const [copied, setCopied] = useState(false)

  const generateVariablePath = (): string => {
    if (!dataset || !pinId) return ''

    let variablePath: string
    
    if (pinId === currentPinId) {
      // Use shorthand for current pin
      if (dataset.isMarkdown || jsonPath === 'markdown') {
        variablePath = `dataset.current.${dataset.datasetId}.markdown`
      } else if (jsonPath) {
        variablePath = `dataset.current.${dataset.datasetId}.${jsonPath}`
      } else {
        variablePath = `dataset.current.${dataset.datasetId}`
      }
    } else {
      // Use full path for other pins
      if (dataset.isMarkdown || jsonPath === 'markdown') {
        variablePath = `dataset.pin.${pinId}.${dataset.datasetId}.markdown`
      } else if (jsonPath) {
        variablePath = `dataset.pin.${pinId}.${dataset.datasetId}.${jsonPath}`
      } else {
        variablePath = `dataset.pin.${pinId}.${dataset.datasetId}`
      }
    }

    return `{{${variablePath}}}`
  }

  const getValuePreview = (): string => {
    if (!dataset) return ''

    let value = dataset.data

    // For markdown datasets, show the content directly
    if (dataset.isMarkdown && value && typeof value === 'object' && value.content) {
      value = value.content
    } else if (jsonPath && jsonPath !== 'markdown') {
      // Navigate to the selected JSON path
      const pathParts = jsonPath.split('.')
      for (const part of pathParts) {
        if (value && typeof value === 'object') {
          value = value[part]
        } else {
          return 'Path not found'
        }
      }
    }

    if (value === null || value === undefined) {
      return 'null'
    }

    if (typeof value === 'string') {
      return value.length > 100 ? value.substring(0, 100) + '...' : value
    }

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2).substring(0, 100) + '...'
    }

    return String(value)
  }

  const handleCopy = async () => {
    const variablePath = generateVariablePath()
    try {
      await navigator.clipboard.writeText(variablePath)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const variablePath = generateVariablePath()
  const valuePreview = getValuePreview()

  if (!dataset) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Template Variable Preview
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs font-medium text-foreground mb-1">Variable Path:</div>
          <code className="block p-2 bg-muted rounded text-sm font-mono break-all text-foreground">
            {variablePath}
          </code>
        </div>

        <div>
          <div className="text-xs font-medium text-foreground mb-1">Value Preview:</div>
          <div className="p-2 bg-muted/50 rounded text-sm max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-foreground">
              {valuePreview}
            </pre>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {pinId === currentPinId ? 'Current Pin' : 'Other Pin'}
          </Badge>
          {dataset.isMarkdown && (
            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
              Markdown
            </Badge>
          )}
          {jsonPath && (
            <Badge variant="outline" className="text-xs">
              Path: {jsonPath}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
