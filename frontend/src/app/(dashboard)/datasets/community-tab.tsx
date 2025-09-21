"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Hash,
  User,
  Users
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dataset } from "./documents-tab"

interface CommunityTabProps {
  searchQuery: string
  datasets: Dataset[]
  onAddDataset: (dataset: Dataset) => void
  onDeleteDataset: (id: string) => void
  onCopyDatasetId: (id: string) => void
}

export default function CommunityTab({ 
  searchQuery, 
  datasets, 
  onAddDataset, 
  onDeleteDataset, 
  onCopyDatasetId 
}: CommunityTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newDataset, setNewDataset] = useState({
    name: "",
    description: "",
    type: "json" as Dataset["type"],
    content: ""
  })

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  const handleAddDataset = () => {
    if (newDataset.name && newDataset.content) {
      const dataset: Dataset = {
        id: `ds-${Date.now()}`,
        name: newDataset.name,
        description: newDataset.description,
        type: newDataset.type,
        size: "0 KB",
        lastModified: "Just now",
        views: 0,
        tags: [],
        content: newDataset.type === "json" ? JSON.parse(newDataset.content) : newDataset.content
      }
      onAddDataset(dataset)
      setNewDataset({ name: "", description: "", type: "json", content: "" })
      setIsAddModalOpen(false)
    }
  }

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
        <div className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Community Datasets</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {filteredDatasets.length} datasets found
              </p>
            </div>
          </div>

          {/* Add Dataset Inline Item */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Card className="group hover:shadow-sm transition-all duration-200 cursor-pointer border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 bg-transparent">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted/30 rounded-full flex items-center justify-center group-hover:bg-muted/50 transition-colors flex-shrink-0">
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Share Dataset with Community
                      </h3>
                      <p className="text-xs text-muted-foreground/70">
                        Click to contribute a dataset to the community
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Add New Community Dataset
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Dataset Name *</Label>
                      <Input
                        id="name"
                        value={newDataset.name}
                        onChange={(e) => setNewDataset(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Community Guidelines"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Data Type</Label>
                      <Select value={newDataset.type} onValueChange={(value: Dataset["type"]) => setNewDataset(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON Data</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newDataset.description}
                        onChange={(e) => setNewDataset(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of this community dataset..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">
                        {newDataset.type === "json" ? "JSON Content" : "Content"} *
                      </Label>
                      <Textarea
                        id="content"
                        value={newDataset.content}
                        onChange={(e) => setNewDataset(prev => ({ ...prev, content: e.target.value }))}
                        placeholder={
                          newDataset.type === "json" 
                            ? '{"key": "value", "data": [1, 2, 3]}'
                            : newDataset.type === "markdown"
                            ? "# Title\n\nContent with **markdown** formatting"
                            : "Enter your text content here..."
                        }
                        className="min-h-[200px] font-mono"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddDataset} disabled={!newDataset.name.trim() || !newDataset.content.trim()}>
                        Add Dataset
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>by {dataset.uploadedBy || 'Community User'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>•</span>
                            <span>{dataset.contributions || 0} contributions</span>
                          </div>
                        </div>
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
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{dataset.communityScore || 0}</span>
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
              <h3 className="text-lg font-semibold mb-2">No community datasets found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Start by adding your first community dataset"}
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