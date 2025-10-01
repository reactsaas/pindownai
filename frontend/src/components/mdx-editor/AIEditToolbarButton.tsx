'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { logVerbose, logInfo } from '@/lib/logger'
import { AIEditModal } from '../ai-edit-modal'

interface AIEditToolbarButtonProps {
  onAIEdit?: (prompt: string, selectedDocs: any[], researchData: any[]) => void
}

export function AIEditToolbarButton({ onAIEdit }: AIEditToolbarButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleClick = () => {
    logVerbose('AI Edit button clicked', 'AIEditToolbarButton', {})
    setIsModalOpen(true)
  }

  const handleSubmit = (prompt: string, selectedDataSources: any[], researchData: any[]) => {
    logInfo('AI Edit submitted', 'AIEditToolbarButton', { 
      promptLength: prompt.length,
      dataSourcesCount: selectedDataSources.length,
      researchCount: researchData.length
    })
    
    if (onAIEdit) {
      onAIEdit(prompt, selectedDataSources, researchData)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="h-8 px-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
        title="AI Edit"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="ml-1.5 hidden xl:inline">AI Edit</span>
      </Button>

      <AIEditModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
      />
    </>
  )
}
