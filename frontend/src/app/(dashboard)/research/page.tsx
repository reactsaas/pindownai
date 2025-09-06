"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  Clock,
  Eye,
  Share2,
  Edit3,
  Trash2,
  FolderOpen,
  Folder,
  FileText,
  BookOpen,
  Link,
  Globe
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

interface ResearchItem {
  id: string
  name: string
  type: "folder" | "document" | "link" | "note" | "research"
  parentId?: string
  description?: string
  url?: string
  content?: string
  tags: string[]
  lastModified: string
  createdBy: string
}

export default function ResearchPage() {
  const router = useRouter()
  // No view mode toggle - always use default grid view
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addItemType, setAddItemType] = useState<"folder" | "item">("folder")
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)

  const [researchItems, setResearchItems] = useState<ResearchItem[]>([
    {
      id: "folder-1",
      name: "Market Research",
      type: "folder",
      description: "Collection of market analysis and competitor research",
      tags: ["market", "analysis"],
      lastModified: "2 hours ago",
      createdBy: "John Doe"
    },
    {
      id: "folder-2", 
      name: "Product Documentation",
      type: "folder",
      description: "Technical docs and specifications",
      tags: ["docs", "technical"],
      lastModified: "1 day ago",
      createdBy: "Jane Smith"
    },
    {
      id: "doc-1",
      name: "AI Trends 2024",
      type: "research",
      parentId: "folder-1",
      description: "Comprehensive analysis of AI market trends for 2024",
      content: "Detailed research findings...",
      tags: ["ai", "trends", "2024"],
      lastModified: "3 hours ago",
      createdBy: "Research Team"
    },
    {
      id: "link-1",
      name: "Competitor Analysis Report",
      type: "link",
      parentId: "folder-1",
      description: "External report on competitor landscape",
      url: "https://example.com/competitor-analysis",
      tags: ["competitors", "analysis"],
      lastModified: "1 day ago",
      createdBy: "Marketing Team"
    },
    {
      id: "note-1",
      name: "Meeting Notes - Q4 Planning",
      type: "note",
      description: "Notes from quarterly planning meeting",
      content: "Key discussion points and action items...",
      tags: ["meeting", "planning", "q4"],
      lastModified: "2 days ago",
      createdBy: "Project Manager"
    }
  ])

  const [newItem, setNewItem] = useState({
    name: "",
    type: "research" as ResearchItem["type"],
    description: "",
    url: "",
    content: "",
    tags: ""
  })

  const getCurrentItems = () => {
    return researchItems.filter(item => 
      currentFolder ? item.parentId === currentFolder : !item.parentId
    )
  }

  const filteredItems = getCurrentItems().filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = selectedFilter === "all" || item.type === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "folder": return <Folder className="w-5 h-5 text-muted-foreground" />
      case "document": return <FileText className="w-5 h-5 text-muted-foreground" />
      case "research": return <BookOpen className="w-5 h-5 text-muted-foreground" />
      case "link": return <Link className="w-5 h-5 text-muted-foreground" />
      case "note": return <FileText className="w-5 h-5 text-muted-foreground" />
      default: return <FileText className="w-5 h-5 text-muted-foreground" />
    }
  }

  const handleAddItem = () => {
    const newId = `${addItemType === 'folder' ? 'folder' : newItem.type}-${Date.now()}`
    const tagsArray = newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    
    const item: ResearchItem = {
      id: newId,
      name: newItem.name,
      type: addItemType === 'folder' ? 'folder' : newItem.type,
      parentId: currentFolder || undefined,
      description: newItem.description || undefined,
      url: newItem.type === 'link' ? newItem.url : undefined,
      content: newItem.type === 'research' || newItem.type === 'note' ? newItem.content : undefined,
      tags: tagsArray,
      lastModified: "Just now",
      createdBy: "Current User"
    }

    setResearchItems(prev => [...prev, item])
    setNewItem({
      name: "",
      type: "research",
      description: "",
      url: "",
      content: "",
      tags: ""
    })
    setIsAddModalOpen(false)
  }

  const handleFolderClick = (folderId: string) => {
    // Navigate to /research/list with the folder ID as a path parameter
    router.push(`/research/list/${folderId}`)
  }

  const handleBackToParent = () => {
    setCurrentFolder(null)
  }

  const getCurrentFolderName = () => {
    if (!currentFolder) return "Research"
    const folder = researchItems.find(item => item.id === currentFolder)
    return folder?.name || "Research"
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {currentFolder && (
                <Button variant="ghost" size="sm" onClick={handleBackToParent}>
                  ← Back
                </Button>
              )}
              <h1 className="text-3xl font-bold tracking-tight">{getCurrentFolderName()}</h1>
            </div>
            <p className="text-muted-foreground">
              Organize and manage your research materials
            </p>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search research items..."
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
              <DropdownMenuItem onClick={() => setSelectedFilter("folder")}>
                Folders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("research")}>
                Research
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("note")}>
                Notes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("link")}>
                Links
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Research Item Field */}
          <Card 
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 bg-muted/10 hover:bg-muted/20"
            onClick={() => {
              setAddItemType("item")
              setNewItem(prev => ({ ...prev, type: "research" }))
              setIsAddModalOpen(true)
            }}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-muted/50 transition-colors">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-muted-foreground mb-2">Add Research Item</h3>
                <p className="text-sm text-muted-foreground/70">Click to add a new research item</p>
              </div>
            </CardContent>
          </Card>
          
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => item.type === 'folder' ? handleFolderClick(item.id) : undefined}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted/20 rounded-full flex items-center justify-center">
                      {getTypeIcon(item.type)}
                    </div>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      {item.type}
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
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
                
                {item.url && (
                  <div className="flex items-center gap-1 mb-3 text-sm text-blue-600">
                    <Globe className="w-3 h-3" />
                    <span className="truncate">{item.url}</span>
                  </div>
                )}
                
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
                  <span>{item.createdBy}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No research items found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Start by adding folders and research items"}
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Research Item
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {addItemType === 'folder' ? <Folder className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
              {addItemType === 'folder' ? 'Create New Folder' : 'Add Research Item'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder={addItemType === 'folder' ? "e.g., Market Research" : "e.g., AI Trends Analysis"}
              />
            </div>

            {addItemType === 'item' && (
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={newItem.type} onValueChange={(value: ResearchItem["type"]) => setNewItem(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="link">External Link</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description..."
                rows={3}
              />
            </div>

            {addItemType === 'item' && newItem.type === 'link' && (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={newItem.url}
                  onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {addItemType === 'item' && (newItem.type === 'research' || newItem.type === 'note') && (
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newItem.content}
                  onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your content here..."
                  rows={6}
                />
              </div>
            )}

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
              <Button onClick={handleAddItem} disabled={!newItem.name.trim()}>
                {addItemType === 'folder' ? 'Create Folder' : 'Add Item'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


