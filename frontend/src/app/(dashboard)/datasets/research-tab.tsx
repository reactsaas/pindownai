"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Layers, 
  MoreHorizontal,
  Clock,
  Eye,
  Share2,
  Edit3,
  Trash2,
  FileText,
  Database,
  Copy,
  Hash
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dataset } from "./documents-tab"

interface ResearchTabProps {
  searchQuery: string
  datasets: Dataset[]
  onDeleteDataset: (id: string) => void
  onCopyDatasetId: (id: string) => void
}

export default function ResearchTab({ 
  searchQuery, 
  datasets, 
  onDeleteDataset, 
  onCopyDatasetId 
}: ResearchTabProps) {

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'json':
        return <Database className="h-4 w-4 text-muted-foreground" />
      case 'markdown':
      case 'text':
        return <FileText className="h-4 w-4 text-muted-foreground" />
      default:
        return <Layers className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-6 pb-4">
          {/* Research Query Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Research Query</h3>
            <div className="flex gap-3">
              <Input
                placeholder="Enter your research question or topic..."
                className="flex-1"
              />
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Research
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Research Datasets</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {filteredDatasets.length} datasets found
              </p>
            </div>
          </div>

          {/* Dataset Cards */}
          <div className="space-y-3">
            {filteredDatasets.map((dataset) => (
              <Card key={dataset.id} className="group hover:shadow-sm transition-all duration-200 cursor-pointer py-0">
                <CardContent className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {getTypeIcon(dataset.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate" title={dataset.name}>{dataset.name}</h3>
                        <p className="text-xs text-muted-foreground truncate" title={dataset.description}>
                          {dataset.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{dataset.id}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onCopyDatasetId(dataset.id)
                            }}
                            className="h-6 w-6 p-0 hover:bg-primary/20"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{dataset.lastModified}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{dataset.views}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-4">
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
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteDataset(dataset.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State for Datasets */}
          {filteredDatasets.length === 0 && (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No research datasets found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Start by adding your first research dataset"}
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Dataset
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}