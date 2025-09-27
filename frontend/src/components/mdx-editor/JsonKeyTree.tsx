'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, ChevronDown, FileText, Database } from 'lucide-react'

interface JsonKeyTreeProps {
  data: any
  onPathSelect: (path: string) => void
  selectedPath: string
  basePath?: string
}

export const JsonKeyTree: React.FC<JsonKeyTreeProps> = ({ 
  data, 
  onPathSelect, 
  selectedPath, 
  basePath = '' 
}) => {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedKeys)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedKeys(newExpanded)
  }

  const renderValue = (value: any, key: string, path: string): React.ReactNode => {
    const isExpanded = expandedKeys.has(path)
    const isSelected = selectedPath === path

    if (value === null || value === undefined) {
      return (
        <div 
          className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${
            isSelected ? 'bg-blue-500/10 text-blue-300' : 'hover:bg-muted/30'
          }`}
          onClick={() => onPathSelect(path)}
        >
          <span className="text-muted-foreground">null</span>
        </div>
      )
    }

    if (typeof value === 'string') {
      const isLongText = value.length > 50
      const displayValue = isLongText ? value.substring(0, 50) + '...' : value
      const isMarkdown = value.includes('\n') || value.includes('#') || value.includes('*')
      
      return (
        <div 
          className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${
            isSelected ? 'bg-blue-500/10 text-blue-300' : 'hover:bg-muted/30'
          }`}
          onClick={() => onPathSelect(path)}
        >
          {isMarkdown ? (
            <FileText className="h-4 w-4 text-green-600" />
          ) : (
            <Database className="h-4 w-4 text-blue-600" />
          )}
          <span className="font-mono text-xs">{key}:</span>
          <span className="text-muted-foreground">"{displayValue}"</span>
          {isMarkdown && (
            <span className="text-xs bg-green-100 text-green-800 px-1 rounded">markdown</span>
          )}
        </div>
      )
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return (
        <div 
          className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${
            isSelected ? 'bg-blue-500/10 text-blue-300' : 'hover:bg-muted/30'
          }`}
          onClick={() => onPathSelect(path)}
        >
          <Database className="h-4 w-4 text-blue-600" />
          <span className="font-mono text-xs">{key}:</span>
          <span className="text-muted-foreground">{String(value)}</span>
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div>
          <div 
            className="flex items-center gap-2 p-2 rounded cursor-pointer text-sm hover:bg-muted/30"
            onClick={() => toggleExpanded(path)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Database className="h-4 w-4 text-purple-600" />
            <span className="font-mono text-xs">{key}:</span>
            <span className="text-muted-foreground">Array ({value.length} items)</span>
          </div>
          {isExpanded && (
            <div className="ml-6 space-y-1">
              {value.slice(0, 10).map((item, index) => (
                <div key={index}>
                  {renderValue(item, `[${index}]`, `${path}[${index}]`)}
                </div>
              ))}
              {value.length > 10 && (
                <div className="text-xs text-muted-foreground p-2">
                  ... and {value.length - 10} more items
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value)
      return (
        <div>
          <div 
            className="flex items-center gap-2 p-2 rounded cursor-pointer text-sm hover:bg-muted/30"
            onClick={() => toggleExpanded(path)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Database className="h-4 w-4 text-orange-600" />
            <span className="font-mono text-xs">{key}:</span>
            <span className="text-muted-foreground">Object ({keys.length} keys)</span>
          </div>
          {isExpanded && (
            <div className="ml-6 space-y-1">
              {keys.map((subKey) => (
                <div key={subKey}>
                  {renderValue(value[subKey], subKey, path ? `${path}.${subKey}` : subKey)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return null
  }

  if (!data || typeof data !== 'object') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Select Data Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            No data available to browse
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Select Data Path</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {Object.keys(data).map((key) => (
            <div key={key}>
              {renderValue(data[key], key, key)}
            </div>
          ))}
        </div>
        
        {selectedPath && (
          <div className="mt-4 p-2 bg-muted/50 rounded text-sm">
            <span className="font-medium text-foreground">Selected path:</span>
            <code className="ml-2 bg-muted px-2 py-1 rounded border text-foreground">
              {selectedPath}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
