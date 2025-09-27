'use client'

import React, { useState } from 'react'
import { DatasetSelector } from './DatasetSelector'
import { TemplateVariablePreview } from './TemplateVariablePreview'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TemplateVariableModalProps {
  isOpen: boolean
  onClose: () => void
  currentPinId?: string | null
}

export const TemplateVariableModal: React.FC<TemplateVariableModalProps> = ({ 
  isOpen, 
  onClose,
  currentPinId
}) => {
  const [selectedDataset, setSelectedDataset] = useState<any>(null)
  const [selectedJsonPath, setSelectedJsonPath] = useState<string>('')
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)

  const handleSelectionChange = (dataset: any, jsonPath: string, pinId: string | null) => {
    setSelectedDataset(dataset)
    setSelectedJsonPath(jsonPath)
    setSelectedPinId(pinId)
  }

  const handleCopy = async () => {
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

    const fullVariable = `{{${variablePath}}}`
    
    try {
      await navigator.clipboard.writeText(fullVariable)
      // TODO: Show success toast
      console.log('Copied variable:', fullVariable)
      onClose()
    } catch (err) {
      console.error('Failed to copy variable:', err)
      // TODO: Show error toast
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[80vh] overflow-hidden sm:max-w-6xl flex flex-col justify-start">
        <DialogHeader>
          <DialogTitle>Insert Template Variable</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 h-full overflow-hidden">
          <div className="space-y-4 overflow-hidden flex flex-col items-start">
            <h3 className="text-sm font-medium">Select Dataset</h3>
            <div className="flex-1 overflow-y-auto w-full">
              <DatasetSelector 
                onSelect={() => {}} 
                currentPinId={currentPinId} 
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </div>
          <div className="space-y-4 overflow-hidden flex flex-col items-start">
            <h3 className="text-sm font-medium">Variable Preview</h3>
            <div className="flex-1 overflow-y-auto w-full">
              {selectedDataset ? (
                <TemplateVariablePreview
                  dataset={selectedDataset}
                  jsonPath={selectedJsonPath}
                  pinId={selectedPinId}
                  currentPinId={currentPinId}
                />
              ) : (
                <div className="text-center text-muted-foreground pt-4 w-full">
                  Select a dataset and path to see the template variable preview
                </div>
              )}
            </div>
            {selectedDataset && (
              <Button 
                onClick={handleCopy}
                className="w-full mt-4"
                disabled={!selectedDataset}
              >
                Copy Variable
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
