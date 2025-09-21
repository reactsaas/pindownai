"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Clock, 
  Blocks, 
  Hash, 
  Copy, 
  MoreHorizontal,
  Edit3,
  Share2,
  Trash2,
  Pin,
  Pencil,
  Check
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Pin {
  id: string
  name: string
  description: string
  lastModified: string
  blocksCount: number
}

interface PinsListProps {
  templates: Pin[]
  onTemplateSelect: (templateId: string) => void
  onCopyTemplateId?: (templateId: string) => void
  onAddPin?: () => void
  onDeletePin?: (pinId: string) => void
  onRenamePin?: (pinId: string, newName: string) => void
  onUpdateDescription?: (pinId: string, newDescription: string) => void
}

export function PinsList({ templates, onTemplateSelect, onCopyTemplateId, onAddPin, onDeletePin, onRenamePin, onUpdateDescription }: PinsListProps) {
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null)

  const getStatusColor = () => {
    return "bg-muted text-muted-foreground"
  }

  const handleCopyClick = async (pinId: string) => {
    if (onCopyTemplateId) {
      await onCopyTemplateId(pinId)
      setCopiedPinId(pinId)
      // Reset the checkmark after 2 seconds
      setTimeout(() => {
        setCopiedPinId(null)
      }, 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Pin Field */}
          <Card 
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 bg-muted/10 hover:bg-muted/20"
            onClick={() => onAddPin && onAddPin()}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-muted/50 transition-colors">
                <Pin className="w-6 h-6 text-muted-foreground rotate-45" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-muted-foreground mb-2">Create New Pin</h3>
                <p className="text-sm text-muted-foreground/70">Click to add a new pin</p>
              </div>
            </CardContent>
          </Card>
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => onTemplateSelect(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                      <Pin className="w-4 h-4 text-primary rotate-45" />
                    </div>
                    <Badge variant="secondary" className={getStatusColor()}>
                      active
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        const newName = prompt('Enter new pin name:', template.name)
                        if (newName && newName.trim() && newName !== template.name) {
                          onRenamePin?.(template.id, newName.trim())
                        }
                      }}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        const newDescription = prompt('Enter new description:', template.description)
                        if (newDescription !== null && onUpdateDescription) {
                          onUpdateDescription(template.id, newDescription.trim())
                        }
                      }}>
                        <FileText className="w-4 h-4 mr-2" />
                        Edit Description
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
                            onDeletePin?.(template.id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-base">{template.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {template.description}
                </p>
                
                {/* ID and Copy Button */}
                <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-md">
                  <Hash className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-[10px] text-muted-foreground flex-1">{template.id}</span>
                  {onCopyTemplateId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopyClick(template.id)
                      }}
                      className={`h-6 w-6 p-0 hover:bg-primary/20 cursor-pointer transition-colors duration-200 ${
                        copiedPinId === template.id ? 'bg-green-100 text-green-600' : ''
                      }`}
                    >
                      {copiedPinId === template.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>
          ))}
        
        {/* Empty State */}
        {templates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pin className="w-8 h-8 text-muted-foreground rotate-45" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No pins yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first pin to get started
            </p>
          </div>
        )}
    </div>
  )
}
