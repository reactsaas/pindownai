"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Sparkles } from "lucide-react"

interface AddPinModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (pinData: {
    name: string
    description: string
    template: string
    type: string
  }) => void
}

const templateOptions = [
  {
    id: "blank",
    name: "Blank Template",
    description: "Start from scratch",
    template: "# {{title}}\n\n{{description}}\n\n## Status\n{{status}}"
  },
  {
    id: "automation-report",
    name: "Automation Report",
    description: "For workflow and automation outputs",
    template: `# {{workflow_name}} Report

**Workflow ID:** {{workflow_id}}
**Last Updated:** {{timestamp}}

## Results
- **Status:** {{status}}
- **Records Processed:** {{records_processed}}
- **Success Rate:** {{success_rate}}%
- **Duration:** {{duration}}ms

## Summary
{{summary}}

---
*Generated automatically from workflow data*`
  },
  {
    id: "server-status",
    name: "Server Status",
    description: "System monitoring and metrics",
    template: `# Server Status Report

**Server:** {{server_name}}
**Last Updated:** {{timestamp}}

## System Metrics
- **Uptime:** {{uptime}}%
- **CPU Usage:** {{cpu_usage}}%
- **Memory Usage:** {{memory_usage}}%
- **Response Time:** {{response_time}}ms

## Status
{{#if status_ok}}
✅ All systems operational
{{else}}
⚠️ Issues detected
{{/if}}

---
*Generated automatically from monitoring data*`
  },
  {
    id: "research-report",
    name: "Research Report",
    description: "Market research and analysis",
    template: `# {{research_title}}

**Research Date:** {{date}}
**Analyst:** {{analyst}}

## Key Findings
{{key_findings}}

## Market Insights
- **Primary Trend:** {{primary_trend}}
- **Market Size:** {{market_size}}
- **Growth Rate:** {{growth_rate}}%

## Recommendations
{{recommendations}}

## Data Sources
{{data_sources}}

---
*Research powered by AI analysis*`
  }
]

export function AddPinModal({ isOpen, onOpenChange, onSubmit }: AddPinModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("blank")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    
    const templateData = templateOptions.find(t => t.id === selectedTemplate)
    
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      template: templateData?.template || templateOptions[0].template,
      type: selectedTemplate
    })
    
    // Reset form
    setName("")
    setDescription("")
    setSelectedTemplate("blank")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const selectedTemplateData = templateOptions.find(t => t.id === selectedTemplate)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create New Pin
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pin Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekly Server Report"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this pin will track..."
              rows={3}
            />
          </div>

          {selectedTemplateData && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedTemplateData.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedTemplateData.description}
              </p>
              <div className="bg-background border rounded p-3">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                  {selectedTemplateData.template.substring(0, 200)}
                  {selectedTemplateData.template.length > 200 && "..."}
                </pre>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Pin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

