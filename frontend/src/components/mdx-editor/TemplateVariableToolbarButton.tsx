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
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="h-8 px-3 bg-slate-200 dark:bg-slate-700 border-border hover:bg-slate-300 dark:hover:bg-slate-600 font-medium"
        title="Insert Template Variable - Click to add dynamic data placeholders"
        type="button"
      >
        <Variable className="h-4 w-4 mr-1.5" />
        <span className="text-xs">Insert Variable</span>
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
