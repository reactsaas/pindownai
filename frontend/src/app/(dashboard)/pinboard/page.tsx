"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Plus, 
  Filter, 
  Pin, 
  MoreHorizontal,
  Clock,
  Eye,
  Share2,
  Edit3,
  Trash2,
  FileText,
  MessageSquare,
  Settings,
  FolderOpen
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PinboardItem {
  id: string
  title: string
  description: string
  type: "template" | "document" | "prompt" | "workflow"
  status: "active" | "draft" | "archived"
  lastModified: string
  views: number
  tags: string[]
  color?: string
}

export default function PinboardPage() {
  // No view mode toggle - always use grid view
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    type: "template" as PinboardItem["type"],
    tags: ""
  })

  const [pinboardItems, setPinboardItems] = useState<PinboardItem[]>([
    {
      id: "1",
      title: "Marketing Campaign Template",
      description: "Complete template for email marketing campaigns with A/B testing",
      type: "template",
      status: "active",
      lastModified: "2 hours ago",
      views: 156,
      tags: ["marketing", "email", "campaign"],
      color: "bg-blue-500"
    },
    {
      id: "2",
      title: "Q4 Sales Report",
      description: "Quarterly sales analysis and projections",
      type: "document",
      status: "active",
      lastModified: "1 day ago",
      views: 89,
      tags: ["sales", "report", "quarterly"],
      color: "bg-green-500"
    },
    {
      id: "3",
      title: "Customer Support Prompt",
      description: "AI-powered customer service response template",
      type: "prompt",
      status: "active",
      lastModified: "3 days ago",
      views: 234,
      tags: ["support", "ai", "customer"],
      color: "bg-purple-500"
    },
    {
      id: "4",
      title: "Product Launch Workflow",
      description: "Automated workflow for new product releases",
      type: "workflow",
      status: "draft",
      lastModified: "1 week ago",
      views: 45,
      tags: ["product", "launch", "automation"],
      color: "bg-orange-500"
    },
    {
      id: "5",
      title: "Social Media Calendar",
      description: "Monthly social media content planning template",
      type: "template",
      status: "active",
      lastModified: "2 weeks ago",
      views: 178,
      tags: ["social", "content", "calendar"],
      color: "bg-pink-500"
    },
    {
      id: "6",
      title: "Budget Analysis",
      description: "Financial budget tracking and analysis document",
      type: "document",
      status: "archived",
      lastModified: "1 month ago",
      views: 67,
      tags: ["finance", "budget", "analysis"],
      color: "bg-red-500"
    }
  ])

  const filteredItems = pinboardItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = selectedFilter === "all" || item.type === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const handleAddItem = () => {
    const newId = `item-${Date.now()}`
    const tagsArray = newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    
    const item: PinboardItem = {
      id: newId,
      title: newItem.title,
      description: newItem.description,
      type: newItem.type,
      status: "active",
      lastModified: "Just now",
      views: 0,
      tags: tagsArray,
      color: "bg-blue-500"
    }

    setPinboardItems(prev => [...prev, item])
    setNewItem({
      title: "",
      description: "",
      type: "template",
      tags: ""
    })
    setIsAddModalOpen(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "template": return <FileText className="w-5 h-5 text-muted-foreground" />
      case "document": return <FolderOpen className="w-5 h-5 text-muted-foreground" />
      case "prompt": return <MessageSquare className="w-5 h-5 text-muted-foreground" />
      case "workflow": return <Settings className="w-5 h-5 text-muted-foreground" />
      default: return <Pin className="w-5 h-5 text-muted-foreground rotate-45" />
    }
  }

  const getStatusColor = (status: string) => {
    return "bg-muted text-muted-foreground"
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pinboard</h1>
            <p className="text-muted-foreground">
              Your pinned items and quick access workspace
            </p>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search pinboard items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                {selectedFilter === "all" ? "All Types" : selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("template")}>
                Templates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("document")}>
                Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("prompt")}>
                Prompts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("workflow")}>
                Workflows
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} items found
          </p>
        </div>
      </div>

      {/* Scrollable Grid View */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Add Pinboard Item Field */}
          <Card 
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 bg-muted/10 hover:bg-muted/20"
            onClick={() => setIsAddModalOpen(true)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-muted/50 transition-colors">
                <Pin className="w-6 h-6 text-muted-foreground rotate-45" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-muted-foreground mb-2">Add New Pinboard</h3>
                <p className="text-sm text-muted-foreground/70">Click to add a new pinboard item</p>
              </div>
            </CardContent>
          </Card>
          
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted/20 rounded-full flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>
                    <Badge variant="secondary" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove from Pinboard
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.lastModified}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{item.views}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Pin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Start by adding items to your pinboard"}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add to Pinboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Pinboard Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pin className="h-5 w-5 rotate-45" />
              Add New Pinboard Item
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Marketing Campaign Template"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={newItem.type} onValueChange={(value: PinboardItem["type"]) => setNewItem(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="prompt">Prompt</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this pinboard item..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={newItem.tags}
                onChange={(e) => setNewItem(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} disabled={!newItem.title.trim()}>
                Add to Pinboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}



