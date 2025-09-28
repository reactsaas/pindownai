"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Database, ChevronRight, FileText, Trash2, MoreVertical, Pencil, Workflow, Link, BookOpen, Search, Copy, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { WorkflowDataRealtimeDisplay } from "@/components/workflow-data-realtime-display"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface DatasetEntry {
  id: string
  name: string
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  data: Record<string, any>
  submittedBy: string
  notes?: string
  datasetType: 'workflow' | 'user' | 'integration' | 'document' | 'research'
}

interface TemplateDataSourcesProps {
  pinId: string
  datasets: DatasetEntry[]
  expandedEntries: Set<string>
  onToggleExpanded: (id: string) => void
  onAddDataset?: (datasetType: 'workflow' | 'user' | 'integration' | 'document' | 'research') => void
  onDeleteDataset?: (id: string) => void
  onRenameDataset?: (id: string, newName: string) => void
  onApproveDataset?: (id: string) => void
  onRejectDataset?: (id: string) => void
  onEditDataset?: (id: string, newContent: string) => void
}

// Helper function to get icon for dataset type
const getDatasetTypeIcon = (datasetType: string) => {
  switch (datasetType) {
    case 'workflow':
      return <Workflow className="h-4 w-4" />
    case 'user':
      return <FileText className="h-4 w-4" />
    case 'integration':
      return <Link className="h-4 w-4" />
    case 'document':
      return <BookOpen className="h-4 w-4" />
    case 'research':
      return <Search className="h-4 w-4" />
    default:
      return <Database className="h-4 w-4" />
  }
}

// Helper function to get data type from dataset
const getDataType = (dataset: DatasetEntry): 'json' | 'markdown' | null => {
  // Check metadata type first
  if (dataset.data?.metadata?.type) {
    return dataset.data.metadata.type === 'markdown' ? 'markdown' : 'json'
  }
  
  // Fallback: check if data contains content field (likely markdown)
  if (dataset.data?.content && typeof dataset.data.content === 'string') {
    return 'markdown'
  }
  
  // Default to json for structured data
  return 'json'
}

// Helper function to get data type badge styling
const getDataTypeBadge = (dataType: 'json' | 'markdown' | null) => {
  if (!dataType) return null
  
  return (
    <Badge 
      variant="outline" 
      className="text-xs h-5 px-2 bg-muted text-muted-foreground border-border"
    >
      {dataType.toUpperCase()}
    </Badge>
  )
}

// Helper function to extract markdown content from dataset
const getMarkdownContent = (dataset: DatasetEntry): string | null => {
  // Check if data has content field (direct markdown)
  if (dataset.data?.content && typeof dataset.data.content === 'string') {
    return dataset.data.content
  }
  
  // Check if it's nested in another structure
  if (dataset.data?.data?.content && typeof dataset.data.data.content === 'string') {
    return dataset.data.data.content
  }
  
  return null
}

// Helper function to get display name for dataset type
const getDatasetTypeName = (datasetType: string) => {
  switch (datasetType) {
    case 'workflow':
      return 'Workflow Data'
    case 'user':
      return 'User Submitted Data'
    case 'integration':
      return 'Integration Data'
    case 'document':
      return 'Document Data'
    case 'research':
      return 'Research Data'
    default:
      return 'Unknown Data'
  }
}

export function TemplateDataSources({ 
  pinId,
  datasets, 
  expandedEntries, 
  onToggleExpanded,
  onAddDataset,
  onDeleteDataset,
  onRenameDataset,
  onApproveDataset,
  onRejectDataset,
  onEditDataset
}: TemplateDataSourcesProps) {
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set())
  const [editingDataset, setEditingDataset] = useState<string | null>(null)
  const [editContent, setEditContent] = useState<string>('')

  // Start editing a dataset
  const startEditing = (dataset: DatasetEntry) => {
    const content = getMarkdownContent(dataset) || ''
    setEditContent(content)
    setEditingDataset(dataset.id)
  }

  // Save edited content
  const saveEdit = () => {
    if (editingDataset && onEditDataset) {
      onEditDataset(editingDataset, editContent)
      setEditingDataset(null)
      setEditContent('')
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingDataset(null)
    setEditContent('')
  }
  // Group datasets by type
  const datasetsByType = (datasets || []).reduce((acc, dataset) => {
    if (!acc[dataset.datasetType]) {
      acc[dataset.datasetType] = []
    }
    acc[dataset.datasetType].push(dataset)
    return acc
  }, {} as Record<string, DatasetEntry[]>)

  // Define the order of dataset types
  const datasetTypeOrder: Array<'workflow' | 'user' | 'integration' | 'document' | 'research'> = [
    'workflow',
    'user', 
    'integration',
    'document',
    'research'
  ]

  return (
    <div className="h-full relative">
      {/* Header - Absolute positioned */}
      <div className="absolute top-0 left-0 right-0 p-6 pb-4 bg-background border-b z-10">
        <CardTitle className="text-sm font-medium">Template Data Sources</CardTitle>
      </div>

      {/* Scrollable content - Absolute positioned with proper spacing */}
      <div className="absolute top-16 left-0 right-0 bottom-0 overflow-y-auto sidebar-scroll p-6 space-y-6">
        {datasetTypeOrder.map((datasetType) => {
          const typeDatasets = datasetsByType[datasetType] || []
          
          return (
            <div key={datasetType}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  {getDatasetTypeIcon(datasetType)}
                  {getDatasetTypeName(datasetType)}
                </h3>
                {onAddDataset && (
                  <Button
                    variant="outline" 
                    size="sm" 
                    onClick={() => onAddDataset(datasetType)}
                    className="h-7 px-2 text-xs"
                  >
                    Add Item
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {typeDatasets.map((dataset) => (
                  <Card key={dataset.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => onToggleExpanded(dataset.id)}
                            className="flex items-center gap-2 text-left flex-1"
                          >
                            <ChevronRight 
                              className={`h-4 w-4 transition-transform ${
                                expandedEntries.has(dataset.id) ? 'rotate-90' : ''
                              }`} 
                            />
                            <span className="font-medium text-sm">{dataset.name}</span>
                            {getDataTypeBadge(getDataType(dataset))}
                          </button>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs font-mono bg-muted/50 hover:bg-muted cursor-pointer flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.clipboard.writeText(dataset.id)
                                setCopiedIds(prev => new Set(prev).add(dataset.id))
                                setTimeout(() => {
                                  setCopiedIds(prev => {
                                    const newSet = new Set(prev)
                                    newSet.delete(dataset.id)
                                    return newSet
                                  })
                                }, 2000)
                              }}
                            >
                              {copiedIds.has(dataset.id) ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {dataset.id}
                            </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onRenameDataset && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  const newName = prompt('Enter new name:', dataset.name)
                                  if (newName !== null && newName.trim()) {
                                    onRenameDataset(dataset.id, newName.trim())
                                  }
                                }}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                              )}
                              {onEditDataset && getDataType(dataset) === 'markdown' && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  startEditing(dataset)
                                }}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Edit Content
                                </DropdownMenuItem>
                              )}
                              {dataset.status === 'pending' && onApproveDataset && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  onApproveDataset(dataset.id)
                                }}>
                                  <span className="w-4 h-4 mr-2 text-green-600">✓</span>
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {dataset.status === 'pending' && onRejectDataset && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  onRejectDataset(dataset.id)
                                }}>
                                  <span className="w-4 h-4 mr-2 text-red-600">✗</span>
                                  Reject
                                </DropdownMenuItem>
                              )}
                              {onDeleteDataset && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm('Are you sure you want to delete this dataset?')) {
                                    onDeleteDataset(dataset.id)
                                  }
                                }}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Submitted by {dataset.submittedBy} • {new Date(dataset.submittedAt).toLocaleDateString()}
                        </div>

                        {expandedEntries.has(dataset.id) && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="space-y-3">
                              {dataset.notes && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes:</p>
                                  <p className="text-sm">{dataset.notes}</p>
                                </div>
                              )}
                              
                              {/* Real-time display for workflow datasets */}
                              {dataset.datasetType === 'workflow' ? (
                                <WorkflowDataRealtimeDisplay
                                  pinId={pinId}
                                  datasetId={dataset.id}
                                  datasetName={dataset.name}
                                  enabled={true}
                                />
                              ) : (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-2">Data:</p>
                                  {editingDataset === dataset.id ? (
                                    // Edit mode for markdown
                                    <div className="space-y-3">
                                      <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full h-48 p-3 text-sm font-mono bg-background/50 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                        placeholder="Enter markdown content..."
                                      />
                                      <div className="flex gap-2">
                                        <Button 
                                          size="sm" 
                                          onClick={saveEdit}
                                          className="h-7 px-3 text-xs"
                                        >
                                          Save
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={cancelEdit}
                                          className="h-7 px-3 text-xs"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : getDataType(dataset) === 'markdown' ? (
                                    // Markdown content display
                                    <div className="bg-background/50 border rounded p-4">
                                      <div className="prose prose-sm prose-gray dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                          {getMarkdownContent(dataset) || 'No content available'}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                  ) : (
                                    // JSON content display
                                    <div className="bg-background/50 border rounded p-3">
                                      <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                                        {JSON.stringify(dataset.data, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {typeDatasets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {getDatasetTypeIcon(datasetType)}
                    <p className="text-sm mt-2">No {getDatasetTypeName(datasetType).toLowerCase()} yet</p>
                    <p className="text-xs">Data of this type will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
