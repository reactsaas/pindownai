"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Save, GripVertical, Edit, Clock, ChevronDown, Plus, Sparkles, Code2, Hash, FileText } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { AIBlockCreationModal } from "./ai-block-creation-modal"

interface BlockItem {
  id: string
  name: string
  type: string
  lastModified: string
  template: string
}

interface BlocksListProps {
  blockItems: BlockItem[]
  onBlockItemsChange: (items: BlockItem[]) => void
  onEditBlock: (blockId: string) => void
  onCopyBlockId: (blockId: string) => void
  onCreateBlock?: (blockData: {
    name: string
    type: string
    prompt: string
    selectedDataSources: any[]
    generatedTemplate: string
  }) => void
  onAddBlock?: () => void
}

export function BlocksList({ 
  blockItems, 
  onBlockItemsChange, 
  onEditBlock, 
  onCopyBlockId,
  onCreateBlock,
  onAddBlock
}: BlocksListProps) {
  const [blockPrompts, setBlockPrompts] = useState<Record<string, string>>({
    "blk_001": "Main title and introduction",
    "blk_002": "Display user information",
    "blk_003": "Show status with conditional logic",
  })

  const [savedPrompts, setSavedPrompts] = useState<Record<string, string>>({
    "blk_001": "Main title and introduction",
    "blk_002": "Display user information",
    "blk_003": "Show status with conditional logic",
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<Record<string, boolean>>({})
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({})
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  const toggleBlockExpansion = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }))
  }

  const updateBlockPrompt = (blockId: string, prompt: string) => {
    setBlockPrompts(prev => ({ ...prev, [blockId]: prompt }))
    setHasUnsavedChanges(prev => ({ 
      ...prev, 
      [blockId]: prompt !== savedPrompts[blockId] 
    }))
  }

  const saveBlockPrompt = (blockId: string) => {
    const prompt = blockPrompts[blockId]
    setSavedPrompts(prev => ({ ...prev, [blockId]: prompt }))
    setHasUnsavedChanges(prev => ({ ...prev, [blockId]: false }))
  }

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) {
      return
    }
    const items = Array.from(blockItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    onBlockItemsChange(items)
  }

  const handleCreateBlock = (blockData: {
    name: string
    type: string
    prompt: string
    selectedDataSources: any[]
    generatedTemplate: string
  }) => {
    if (onCreateBlock) {
      onCreateBlock(blockData)
    }
  }

  return (
    <div className="h-full relative blocks-list-container">
      {/* Header - Absolute positioned */}
      <div className="absolute top-0 left-0 right-0 flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 bg-background z-10 gap-2">
        <p className="text-sm text-muted-foreground">Select a block to edit or create a new one</p>
      </div>

      {/* Scrollable blocks list - Absolute positioned with proper spacing */}
      <div className="absolute top-16 left-0 right-0 bottom-0 overflow-y-auto sidebar-scroll">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div 
                className="flex flex-col gap-4 pr-2 pb-2 min-h-[1px]" 
                {...provided.droppableProps} 
                ref={provided.innerRef}
              >
                {/* Add Block Field */}
                <Card 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 bg-muted/10 hover:bg-muted/20"
                  onClick={() => onAddBlock && onAddBlock()}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[120px]">
                    <div className="w-10 h-10 bg-muted/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-muted/50 transition-colors">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-muted-foreground mb-1">Add New Block</h3>
                      <p className="text-xs text-muted-foreground/70">Click to create a new block</p>
                    </div>
                  </CardContent>
                </Card>
                
                {blockItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <Card
                          className={`hover:bg-muted/50 transition-colors duration-150 cursor-pointer border border-muted-foreground/20 bg-muted/20 hover:border-muted-foreground/40 will-change-transform ${
                            snapshot.isDragging ? 'shadow-lg border-primary' : ''
                          }`}
                          onClick={() => onEditBlock(item.id)}
                        >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <Code2 className="w-4 h-4 text-muted-foreground" />
                                  <h3 className="font-mono text-sm font-medium">{item.name}</h3>
                                </div>
                                <span className="px-2 py-0.5 bg-background border rounded text-xs font-mono text-muted-foreground">
                                  {item.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleBlockExpansion(item.id)
                                  }}
                                  className="h-8 px-2 hover:bg-muted/80 rounded-md border border-transparent hover:border-border transition-all flex items-center gap-1"
                                  title={expandedBlocks[item.id] ? "Collapse prompt" : "Add prompt"}
                                >
                                  {expandedBlocks[item.id] ? (
                                    <>
                                      <span className="text-xs text-muted-foreground">Prompt</span>
                                      <ChevronDown className="h-4 w-4 text-foreground" />
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-xs text-muted-foreground">Add prompt</span>
                                      <Plus className="h-4 w-4 text-foreground" />
                                    </>
                                  )}
                                </Button>
                                <div
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-center w-8 h-8 hover:bg-muted rounded cursor-grab active:cursor-grabbing touch-none select-none"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Drag to reorder"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                <span className="font-mono">{item.id}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onCopyBlockId(item.id)
                                  }}
                                  className="h-4 w-4 p-0 hover:bg-muted"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Modified {item.lastModified}</span>
                              </div>
                            </div>

                            {expandedBlocks[item.id] && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs text-muted-foreground">Prompt:</label>
                                  <div className="flex items-center gap-2">
                                    {hasUnsavedChanges[item.id] && (
                                      <span className="text-xs text-orange-500 font-medium">• Unsaved changes</span>
                                    )}
                                    <Button
                                      variant={hasUnsavedChanges[item.id] ? "default" : "outline"}
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        saveBlockPrompt(item.id)
                                      }}
                                      disabled={!hasUnsavedChanges[item.id]}
                                      className="h-6 px-2"
                                    >
                                      <Save className="h-3 w-3 mr-1" />
                                      Save
                                    </Button>
                                  </div>
                                </div>
                                <Textarea
                                  value={blockPrompts[item.id] || ""}
                                  onChange={(e) => updateBlockPrompt(item.id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Enter detailed prompt for this block..."
                                  className="text-xs min-h-[60px] resize-none"
                                  rows={3}
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* AI Block Creation Modal */}
      <AIBlockCreationModal
        isOpen={isAIModalOpen}
        onOpenChange={setIsAIModalOpen}
        onCreateBlock={handleCreateBlock}
      />
    </div>
  )
}
