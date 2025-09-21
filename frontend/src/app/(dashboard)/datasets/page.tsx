"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
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
  BookOpen,
  Users
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Dataset {
  id: string
  name: string
  description: string
  type: "json" | "markdown" | "text"
  size: string
  lastModified: string
  views: number
  tags: string[]
  content?: any
}

export default function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("documents")
  const [newDataset, setNewDataset] = useState({
    name: "",
    description: "",
    type: "json" as Dataset["type"],
    content: ""
  })

  const [datasets, setDatasets] = useState<Record<string, Dataset[]>>({
    documents: [
      {
        id: "ds-1",
        name: "Product Documentation",
        description: "API documentation and usage examples",
        type: "markdown",
        size: "156 KB",
        lastModified: "1 day ago",
        views: 89,
        tags: ["documentation", "api", "guide"]
      },
      {
        id: "ds-2",
        name: "Sales Report Template",
        description: "Monthly sales performance template with variables",
        type: "markdown",
        size: "89 KB",
        lastModified: "3 days ago",
        views: 67,
        tags: ["sales", "template", "report"]
      },
      {
        id: "ds-3",
        name: "User Manual",
        description: "Complete user guide and troubleshooting",
        type: "markdown",
        size: "234 KB",
        lastModified: "5 days ago",
        views: 45,
        tags: ["manual", "guide", "help"]
      }
    ],
    research: [
      {
        id: "ds-4",
        name: "User Analytics Data",
        description: "Weekly user engagement metrics and behavior patterns",
        type: "json",
        size: "2.3 MB",
        lastModified: "2 hours ago",
        views: 45,
        tags: ["analytics", "users", "metrics"],
        content: { users: 1250, sessions: 3400, conversion: 0.12 }
      },
      {
        id: "ds-5",
        name: "Customer Feedback",
        description: "Raw customer feedback and sentiment analysis",
        type: "json",
        size: "1.8 MB",
        lastModified: "1 week ago",
        views: 23,
        tags: ["feedback", "sentiment", "customers"]
      },
      {
        id: "ds-6",
        name: "Market Research",
        description: "Industry trends and competitive analysis",
        type: "json",
        size: "3.1 MB",
        lastModified: "2 weeks ago",
        views: 78,
        tags: ["market", "research", "trends"]
      }
    ],
    community: [
      {
        id: "ds-7",
        name: "Community Guidelines",
        description: "Rules and best practices for community participation",
        type: "markdown",
        size: "67 KB",
        lastModified: "1 month ago",
        views: 156,
        tags: ["guidelines", "community", "rules"]
      },
      {
        id: "ds-8",
        name: "User Contributions",
        description: "Community-submitted content and resources",
        type: "json",
        size: "4.2 MB",
        lastModified: "3 days ago",
        views: 234,
        tags: ["contributions", "community", "resources"]
      }
    ]
  })


  const currentDatasets = datasets[activeTab] || []
  
  const filteredDatasets = currentDatasets.filter(dataset => {
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
        size: "0 KB", // Would calculate actual size
        lastModified: "Just now",
        views: 0,
        tags: [],
        content: newDataset.type === "json" ? JSON.parse(newDataset.content) : newDataset.content
      }
      setDatasets(prev => ({
        ...prev,
        [activeTab]: [dataset, ...(prev[activeTab] || [])]
      }))
      setNewDataset({ name: "", description: "", type: "json", content: "" })
      setIsAddModalOpen(false)
    }
  }

  const handleDeleteDataset = (id: string) => {
    setDatasets(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(d => d.id !== id)
    }))
  }

  const copyDatasetId = async (id: string) => {
    await navigator.clipboard.writeText(id)
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'json':
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case 'markdown':
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case 'text':
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
            <p className="text-muted-foreground">
              Manage your data sources and templates for pins
            </p>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Research
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-6">
            <div className="space-y-4">

              {/* Results */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredDatasets.length} datasets found
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="research" className="mt-6">
            <div className="space-y-4">

              {/* Results */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredDatasets.length} datasets found
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            <div className="space-y-4">

              {/* Results */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredDatasets.length} datasets found
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Scrollable List View */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-4">
          {/* Add Dataset Field */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Card 
                className="group hover:shadow-sm transition-all duration-200 cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 bg-muted/5 hover:bg-muted/10 py-0"
                onClick={() => setIsAddModalOpen(true)}
              >
                <CardContent className="px-3 py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted/30 rounded-full flex items-center justify-center group-hover:bg-muted/50 transition-colors flex-shrink-0">
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Add New Dataset
                      </h3>
                      <p className="text-xs text-muted-foreground/70">
                        Click to add JSON data or text/markdown
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
                  Add New Dataset
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Dataset Name *</Label>
                  <Input
                    id="name"
                    value={newDataset.name}
                    onChange={(e) => setNewDataset(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., User Analytics Data"
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
                    placeholder="Brief description of this dataset..."
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
          
          {filteredDatasets.map((dataset) => (
            <Card key={dataset.id} className="group hover:shadow-sm transition-all duration-200 cursor-pointer py-0">
              <CardContent className="px-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-muted/20 rounded-full flex items-center justify-center">
                        {getTypeIcon(dataset.type)}
                      </div>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        {dataset.type}
                      </Badge>
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
                            copyDatasetId(dataset.id)
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
                            handleDeleteDataset(dataset.id)
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

        {/* Empty State */}
        {filteredDatasets.length === 0 && (
          <div className="text-center py-12">
            <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No datasets found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Start by adding your first dataset"}
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Dataset
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
