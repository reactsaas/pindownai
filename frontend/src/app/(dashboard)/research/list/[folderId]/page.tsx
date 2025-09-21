"use client"

import { useState, useEffect } from "react"
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

interface ResearchListPageProps {
  params: {
    folderId: string
  }
}

export default function ResearchListPage({ params }: ResearchListPageProps) {
  const router = useRouter()
  // No view mode toggle - always use default compact list view
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addItemType, setAddItemType] = useState<"folder" | "item">("folder")
  const [currentFolder, setCurrentFolder] = useState<string | null>(params.folderId)

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
    setCurrentFolder(folderId)
  }

  const handleBackToParent = () => {
    router.push('/research')
  }

  const getCurrentFolderName = () => {
    if (!currentFolder) return "Research"
    const folder = researchItems.find(item => item.id === currentFolder)
    return folder?.name || "Research"
  }

  return (
    <div className="flex-1 space-y-6 p-6">
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
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                setAddItemType("folder")
                setIsAddModalOpen(true)
              }}>
                <Folder className="w-4 h-4 mr-2" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setAddItemType("item")
                setNewItem(prev => ({ ...prev, type: "research" }))
                setIsAddModalOpen(true)
              }}>
                <BookOpen className="w-4 h-4 mr-2" />
                Research Item
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setAddItemType("item")
                setNewItem(prev => ({ ...prev, type: "note" }))
                setIsAddModalOpen(true)
              }}>
                <FileText className="w-4 h-4 mr-2" />
                Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setAddItemType("item")
                setNewItem(prev => ({ ...prev, type: "link" }))
                setIsAddModalOpen(true)
              }}>
                <Link className="w-4 h-4 mr-2" />
                External Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search research items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
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

      {/* Compact List View like Prompts */}
      <div className="space-y-1">
        {filteredItems.map((item) => (
          <Card 
            key={item.id} 
            className="hover:shadow-sm transition-shadow border-border/50 cursor-pointer"
            onClick={() => item.type === 'folder' ? handleFolderClick(item.id) : undefined}
          >
            <CardContent className="px-3 py-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1 flex-shrink-0 bg-muted text-muted-foreground">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-shrink-0">
                    <div className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{item.lastModified}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {getTypeIcon(item.type)}
                      <span>{item.createdBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  {item.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(item.url, '_blank')
                      }}
                      className="h-6 px-1.5 text-[10px]"
                    >
                      <Globe className="h-2.5 w-2.5 mr-0.5" />
                      Open
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle edit
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit3 className="h-2.5 w-2.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle delete
                    }}
                    className="text-destructive hover:text-destructive h-6 w-6 p-0"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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


