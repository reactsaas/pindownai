"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Plus, Search, Edit, Trash2, Copy, Clock, Grid3X3, List } from "lucide-react"

interface Prompt {
  id: string
  name: string
  description: string
  content: string
  category: string
  createdAt: string
  lastModified: string
  usageCount: number
}

export function PromptsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: "prompt-1",
      name: "User Onboarding Welcome",
      description: "Welcome message for new users",
      content: "Welcome to our platform! We're excited to have you here. Let's get you started with...",
      category: "onboarding",
      createdAt: "2024-01-15",
      lastModified: "2 hours ago",
      usageCount: 45
    },
    {
      id: "prompt-2",
      name: "Email Confirmation",
      description: "Email confirmation prompt",
      content: "Please confirm your email address by clicking the link below...",
      category: "authentication",
      createdAt: "2024-01-10",
      lastModified: "1 day ago",
      usageCount: 123
    },
    {
      id: "prompt-3",
      name: "Error Handling",
      description: "Generic error message prompt",
      content: "Oops! Something went wrong. Please try again or contact support if the issue persists.",
      category: "error",
      createdAt: "2024-01-08",
      lastModified: "3 days ago",
      usageCount: 78
    }
  ])

  const [newPrompt, setNewPrompt] = useState({
    name: "",
    description: "",
    content: "",
    category: "general"
  })

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "onboarding", label: "Onboarding" },
    { value: "authentication", label: "Authentication" },
    { value: "error", label: "Error Messages" },
    { value: "general", label: "General" }
  ]

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreatePrompt = () => {
    if (newPrompt.name && newPrompt.content) {
      const prompt: Prompt = {
        id: `prompt-${Date.now()}`,
        name: newPrompt.name,
        description: newPrompt.description,
        content: newPrompt.content,
        category: newPrompt.category,
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: "just now",
        usageCount: 0
      }
      setPrompts([prompt, ...prompts])
      setNewPrompt({ name: "", description: "", content: "", category: "general" })
      setIsDialogOpen(false)
    }
  }

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setNewPrompt({
      name: prompt.name,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category
    })
    setIsDialogOpen(true)
  }

  const handleUpdatePrompt = () => {
    if (editingPrompt && newPrompt.name && newPrompt.content) {
      setPrompts(prompts.map(p => 
        p.id === editingPrompt.id 
          ? { ...p, ...newPrompt, lastModified: "just now" }
          : p
      ))
      setEditingPrompt(null)
      setNewPrompt({ name: "", description: "", content: "", category: "general" })
      setIsDialogOpen(false)
    }
  }

  const handleDeletePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id))
  }

  const copyPromptContent = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prompts</h1>
          <p className="text-muted-foreground">Manage your reusable prompt templates</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPrompt(null)
              setNewPrompt({ name: "", description: "", content: "", category: "general" })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPrompt ? "Edit Prompt" : "Create New Prompt"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Prompt Name</Label>
                  <Input
                    id="name"
                    value={newPrompt.name}
                    onChange={(e) => setNewPrompt({...newPrompt, name: e.target.value})}
                    placeholder="Enter prompt name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newPrompt.category} onValueChange={(value) => setNewPrompt({...newPrompt, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newPrompt.description}
                  onChange={(e) => setNewPrompt({...newPrompt, description: e.target.value})}
                  placeholder="Brief description of the prompt"
                />
              </div>
              <div>
                <Label htmlFor="content">Prompt Content</Label>
                <Textarea
                  id="content"
                  value={newPrompt.content}
                  onChange={(e) => setNewPrompt({...newPrompt, content: e.target.value})}
                  placeholder="Enter your prompt content here..."
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingPrompt ? handleUpdatePrompt : handleCreatePrompt}>
                  {editingPrompt ? "Update" : "Create"} Prompt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* View Toggle */}
        <div className="flex items-center border rounded-md bg-muted/30">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 px-3 rounded-r-none border-r"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 px-3 rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Prompts Display */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "grid" ? (
          /* Grid View */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{prompt.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {prompt.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-4">
                  <div className="bg-muted p-3 rounded-md flex-1">
                    <p className="text-sm line-clamp-3">{prompt.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{prompt.lastModified}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{prompt.usageCount} uses</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPromptContent(prompt.content)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPrompt(prompt)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-1">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="hover:shadow-sm transition-shadow border-border/50">
                <CardContent className="px-3 py-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{prompt.name}</h3>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1 flex-shrink-0">
                            {prompt.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-shrink-0">
                        <div className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{prompt.lastModified}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <MessageSquare className="h-2.5 w-2.5" />
                          <span>{prompt.usageCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyPromptContent(prompt.content)}
                        className="h-6 px-1.5 text-[10px]"
                      >
                        <Copy className="h-2.5 w-2.5 mr-0.5" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPrompt(prompt)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-2.5 w-2.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePrompt(prompt.id)}
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
        )}

        {filteredPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No prompts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Create your first prompt to get started"}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Prompt
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
