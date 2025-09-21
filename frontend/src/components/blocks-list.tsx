"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Copy, Save, GripVertical, Edit, Clock, ChevronDown, Plus, Sparkles, Code2, Hash, FileText, MoreVertical, Trash2, Pencil } from "lucide-react"
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
  onDeleteBlock: (blockId: string) => void
  onRenameBlock: (blockId: string, newName: string) => void
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
  onDeleteBlock,
  onRenameBlock,
  onCreateBlock,
  onAddBlock
}: BlocksListProps) {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)


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
                                {/* 3-dot menu */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-muted/80"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        const newName = prompt('Enter new block name:', item.name)
                                        if (newName && newName.trim() && newName !== item.name) {
                                          onRenameBlock(item.id, newName.trim())
                                        }
                                      }}
                                    >
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Rename Block
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteBlock(item.id)
                                      }}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Block
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                
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
