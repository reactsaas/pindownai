'use client'

import React, { useState } from 'react'
import { Variable } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TemplateVariableModal } from './TemplateVariableModal'

interface TemplateVariableToolbarButtonProps {
  currentPinId?: string | null
}

export const TemplateVariableToolbarButton: React.FC<TemplateVariableToolbarButtonProps> = ({ currentPinId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="h-8 w-8 p-0"
        title="Insert Template Variable"
        type="button"
      >
        <Variable className="h-4 w-4" />
      </Button>
      {isModalOpen && (
        <TemplateVariableModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentPinId={currentPinId}
        />
      )}
    </>
  )
}
