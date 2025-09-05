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
  Grid3X3, 
  List, 
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")

  const pinboardItems: PinboardItem[] = [
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
  ]

  const filteredItems = pinboardItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = selectedFilter === "all" || item.type === selectedFilter
    
    return matchesSearch && matchesFilter
  })

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
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pinboard</h1>
          <p className="text-muted-foreground">
            Your pinned items and quick access workspace
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add to Pinboard
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search pinboard items..."
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

        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 px-3 rounded-r-none border-r"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 px-3 rounded-l-none"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredItems.length} items found
        </p>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-xl">{getTypeIcon(item.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        <Badge variant="secondary" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.lastModified}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{item.views}</span>
                      </div>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
  )
}



