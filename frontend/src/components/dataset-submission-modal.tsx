"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Database, FileText, Code, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface DatasetSubmission {
  name: string
  type: 'markdown' | 'json'
  datasetType: 'workflow' | 'user' | 'integration' | 'document' | 'research'
  data: string
  description?: string
}

interface DatasetSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DatasetSubmission) => Promise<void>
  pinId: string
}

export function DatasetSubmissionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  pinId 
}: DatasetSubmissionModalProps) {
  const [formData, setFormData] = useState<DatasetSubmission>({
    name: '',
    type: 'json',
    datasetType: 'user',
    data: '',
    description: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Dataset name is required'
    }

    if (!formData.data.trim()) {
      newErrors.data = 'Data content is required'
    }

    // Validate JSON if type is json
    if (formData.type === 'json' && formData.data.trim()) {
      try {
        JSON.parse(formData.data)
      } catch (error) {
        newErrors.data = 'Invalid JSON format'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Check if form is valid for button state
  const isFormValid = () => {
    return formData.name.trim() && 
           formData.data.trim() && 
           (formData.type === 'markdown' || isValidJson(formData.data) === true)
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      // Reset form
      setFormData({
        name: '',
        type: 'json',
        data: '',
        description: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error submitting dataset:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      type: 'json',
      datasetType: 'user',
      data: '',
      description: ''
    })
    setErrors({})
    onClose()
  }

  const getDataPlaceholder = () => {
    switch (formData.type) {
      case 'json':
        return `{
  "totalSales": 125000,
  "newCustomers": 45,
  "conversionRate": 3.2,
  "topProduct": "Premium Plan"
}`
      case 'markdown':
        return `# Sales Report

## Summary
- Total Sales: $125,000
- New Customers: 45
- Conversion Rate: 3.2%

## Top Product
Premium Plan is our best performing product.`
      default:
        return ''
    }
  }

  const formatJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return jsonString
    }
  }

  const isValidJson = (jsonString: string) => {
    if (!jsonString.trim()) return null // Empty string
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Add Submitted Data
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Dataset Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Dataset Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Q4 Sales Report, Customer Feedback"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Data Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Data Type *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'markdown' | 'json') => 
                setFormData(prev => ({ ...prev, type: value, data: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="markdown">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Markdown
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this dataset..."
              rows={2}
            />
          </div>

          {/* Data Content */}
          <div className="space-y-2">
            <Label htmlFor="data">Data Content *</Label>
            {formData.type === 'json' ? (
              <div className="space-y-3">
                {/* Edit Area */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="data-edit" className="text-xs text-muted-foreground">
                      Paste or type your JSON here:
                    </Label>
                    {formData.data && (
                      <div className="flex items-center gap-1 text-xs">
                        {isValidJson(formData.data) === true && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>Valid JSON</span>
                          </div>
                        )}
                        {isValidJson(formData.data) === false && (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-3 w-3" />
                            <span>Invalid JSON</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Textarea
                    id="data-edit"
                    value={formData.data}
                    onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                    placeholder={getDataPlaceholder()}
                    className={`min-h-[80px] max-h-[120px] font-mono text-sm ${errors.data ? 'border-red-500' : ''} ${isValidJson(formData.data) === false ? 'border-red-300' : ''}`}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoComplete="off"
                  />
                </div>
                
                {/* Display Area */}
                {formData.data && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Preview with syntax highlighting:
                    </Label>
                    <div className="border rounded-md overflow-hidden">
                      <div className="max-h-[200px] overflow-auto">
                        <SyntaxHighlighter
                          language="json"
                          style={tomorrow}
                          customStyle={{
                            margin: 0,
                            padding: '0.75rem',
                            background: 'transparent',
                            fontSize: '0.875rem',
                            lineHeight: '1.25rem'
                          }}
                          showLineNumbers={false}
                          wrapLines={true}
                        >
                          {formatJson(formData.data)}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Edit Area */}
                <div>
                  <Label htmlFor="data-edit" className="text-xs text-muted-foreground mb-1 block">
                    Paste or type your Markdown here:
                  </Label>
                  <Textarea
                    id="data-edit"
                    value={formData.data}
                    onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                    placeholder={getDataPlaceholder()}
                    className={`min-h-[80px] max-h-[120px] font-mono text-sm ${errors.data ? 'border-red-500' : ''}`}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoComplete="off"
                  />
                </div>
                
                {/* Preview Area */}
                {formData.data && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Markdown Preview:
                    </Label>
                    <div className="border rounded-md overflow-hidden">
                      <div className="max-h-[200px] overflow-auto p-3 bg-background/50">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
                              p: ({ children }) => <p className="text-sm mb-2">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside text-sm mb-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside text-sm mb-2">{children}</ol>,
                              li: ({ children }) => <li className="text-sm">{children}</li>,
                              code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                              pre: ({ children }) => <pre className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">{children}</pre>,
                              blockquote: ({ children }) => <blockquote className="border-l-4 border-muted-foreground pl-3 italic text-sm">{children}</blockquote>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>
                            }}
                          >
                            {formData.data}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors.data && (
              <p className="text-sm text-red-500">{errors.data}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.type === 'json' 
                ? 'Enter valid JSON data. This will be accessible via template variables like {{datasets.name.field}}'
                : 'Enter markdown content. This will be accessible via template variables like {{datasets.name.content}}'
              }
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This data will be saved to the pin's dataset collection and can be accessed in blocks using template variables.
              {formData.name && (
                <span className="block mt-1 font-mono text-xs">
                  Example: {`{{datasets.${formData.name.toLowerCase().replace(/\s+/g, '_')}.field}}`}
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? 'Submitting...' : 'Submit Dataset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
