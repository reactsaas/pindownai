"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Workflow, Code, FileText } from "lucide-react"

interface WorkflowDataSubmission {
  name: string
  dataFormat: 'json' | 'markdown'
  description?: string
}

interface WorkflowDataSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: WorkflowDataSubmission) => Promise<void>
  pinId: string
}

export function WorkflowDataSubmissionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  pinId 
}: WorkflowDataSubmissionModalProps) {
  const [formData, setFormData] = useState<WorkflowDataSubmission>({
    name: '',
    dataFormat: 'json',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Workflow name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = () => {
    return formData.name.trim()
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Create a simple dataset entry for workflow data
      const workflowDataset = {
        name: formData.name,
        type: formData.dataFormat,
        datasetType: 'workflow' as const,
        data: '{}', // Empty JSON object as string - will be populated later via API
        description: formData.description
      }

      await onSubmit(workflowDataset as any)
      
      // Reset form
      setFormData({
        name: '',
        dataFormat: 'json',
        description: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error submitting workflow data:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      dataFormat: 'json',
      description: ''
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Create Workflow Dataset
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Workflow Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workflow Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Sales Data Workflow"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Data Format */}
          <div className="space-y-2">
            <Label htmlFor="dataFormat">Expected Data Format *</Label>
            <Select
              value={formData.dataFormat}
              onValueChange={(value: 'json' | 'markdown') => setFormData(prev => ({ ...prev, dataFormat: value }))}
            >
              <SelectTrigger className={errors.dataFormat ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select data format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-500" /> JSON
                  </div>
                </SelectItem>
                <SelectItem value="markdown">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" /> Markdown
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.dataFormat && (
              <p className="text-sm text-red-500">{errors.dataFormat}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this workflow data source..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? 'Creating...' : 'Create Workflow Dataset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
