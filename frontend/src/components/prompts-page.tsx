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
  const [viewMode, setViewMode] = useState<"list">("list")

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
    <div className="h-full flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Prompts</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your reusable prompt templates</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add Prompt Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? "Edit Prompt" : "Create New Prompt"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Prompts Display */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {/* Add Prompt Inline Item */}
          <Dialog>
            <DialogTrigger asChild>
              <Card 
                className="group hover:shadow-sm transition-all duration-200 cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 bg-muted/5 hover:bg-muted/10"
                onClick={() => {
                  setEditingPrompt(null)
                  setNewPrompt({ name: "", description: "", content: "", category: "general" })
                  setIsDialogOpen(true)
                }}
              >
                <CardContent className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted/30 rounded-full flex items-center justify-center group-hover:bg-muted/50 transition-colors flex-shrink-0">
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Add New Prompt
                      </h3>
                      <p className="text-xs text-muted-foreground/70">
                        Create a new prompt template
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
          </Dialog>

          {/* Existing Prompts */}
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-sm transition-shadow border-border/50">
              <CardContent className="px-4 py-3">
                {/* Mobile Layout - Stacked */}
                <div className="block sm:hidden">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{prompt.name}</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 flex-shrink-0">
                          {prompt.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{prompt.lastModified}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{prompt.usageCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPromptContent(prompt.content)}
                      className="h-7 px-2 text-[10px] flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPrompt(prompt)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="text-destructive hover:text-destructive h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout - Horizontal */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">{prompt.name}</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 flex-shrink-0">
                          {prompt.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{prompt.lastModified}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{prompt.usageCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPromptContent(prompt.content)}
                      className="h-7 px-2 text-[10px]"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPrompt(prompt)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="text-destructive hover:text-destructive h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No prompts found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Use the 'Add New Prompt' item above to create your first prompt"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
