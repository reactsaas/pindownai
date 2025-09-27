'use client'

import React, { useState } from 'react'
// import { useCellValue } from '@mdxeditor/editor'
// import { currentPinId$ } from './templateVariablePlugin'
import { usePinDatasets } from '@/hooks/usePinDatasets'
import { JsonKeyTree } from './JsonKeyTree'
import { TemplateVariablePreview } from './TemplateVariablePreview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Database, FileText } from 'lucide-react'

interface DatasetSelectorProps {
  onSelect: (variablePath: string) => void
  currentPinId?: string | null
  onSelectionChange?: (dataset: any, jsonPath: string, pinId: string | null) => void
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({ onSelect, currentPinId, onSelectionChange }) => {
  const { currentPinDatasets, otherPinDatasets, isLoading, error } = usePinDatasets(currentPinId, { enabled: true })
  
  const [selectedDataset, setSelectedDataset] = useState<any>(null)
  const [selectedJsonPath, setSelectedJsonPath] = useState<string>('')
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)

  const handleDatasetSelect = (dataset: any, pinId: string) => {
    setSelectedDataset(dataset)
    setSelectedPinId(pinId)
    setSelectedJsonPath('')
    onSelectionChange?.(dataset, '', pinId)
  }

  const handleJsonPathSelect = (path: string) => {
    setSelectedJsonPath(path)
    onSelectionChange?.(selectedDataset, path, selectedPinId)
  }

  const handleInsert = () => {
    if (!selectedDataset || !selectedPinId) return

    let variablePath: string
    
    if (selectedPinId === currentPinId) {
      // Use shorthand for current pin
      if (selectedDataset.isMarkdown || selectedJsonPath === 'markdown') {
        variablePath = `dataset.current.${selectedDataset.datasetId}.markdown`
      } else if (selectedJsonPath) {
        variablePath = `dataset.current.${selectedDataset.datasetId}.${selectedJsonPath}`
      } else {
        variablePath = `dataset.current.${selectedDataset.datasetId}`
      }
    } else {
      // Use full path for other pins
      if (selectedDataset.isMarkdown || selectedJsonPath === 'markdown') {
        variablePath = `dataset.pin.${selectedPinId}.${selectedDataset.datasetId}.markdown`
      } else if (selectedJsonPath) {
        variablePath = `dataset.pin.${selectedPinId}.${selectedDataset.datasetId}.${selectedJsonPath}`
      } else {
        variablePath = `dataset.pin.${selectedPinId}.${selectedDataset.datasetId}`
      }
    }

    onSelect(variablePath)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading datasets...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Failed to load datasets: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">
            Current Pin
            {currentPinDatasets.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {currentPinDatasets.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="other">
            Other Pins
            {otherPinDatasets.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {otherPinDatasets.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentPinDatasets.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No datasets available in current pin</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {currentPinDatasets.map((dataset) => (
                <Card 
                  key={`${dataset.pinId}-${dataset.datasetId}`}
                  className={`cursor-pointer transition-colors ${
                    selectedDataset?.datasetId === dataset.datasetId && selectedPinId === dataset.pinId
                      ? 'ring-2 ring-muted-foreground ring-inset'
                      : 'hover:!bg-white/10'
                  }`}
                  onClick={() => handleDatasetSelect(dataset, dataset.pinId)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {dataset.isMarkdown ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <Database className="h-4 w-4" />
                      )}
                      {dataset.datasetName}
                      {dataset.isMarkdown && (
                        <Badge variant="outline" className="text-xs">Markdown</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          {otherPinDatasets.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No datasets available in other pins</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {otherPinDatasets.map((dataset) => (
                <Card 
                  key={`${dataset.pinId}-${dataset.datasetId}`}
                  className={`cursor-pointer transition-colors ${
                    selectedDataset?.datasetId === dataset.datasetId && selectedPinId === dataset.pinId
                      ? 'ring-2 ring-muted-foreground ring-inset'
                      : 'hover:!bg-white/10'
                  }`}
                  onClick={() => handleDatasetSelect(dataset, dataset.pinId)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {dataset.isMarkdown ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <Database className="h-4 w-4" />
                      )}
                      {dataset.datasetName}
                      {dataset.isMarkdown && (
                        <Badge variant="outline" className="text-xs">Markdown</Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs text-gray-500">From: {dataset.pinTitle}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedDataset && !selectedDataset.isMarkdown && (
        <JsonKeyTree
          data={selectedDataset.data}
          onPathSelect={handleJsonPathSelect}
          selectedPath={selectedJsonPath}
        />
      )}
    </div>
  )
}
