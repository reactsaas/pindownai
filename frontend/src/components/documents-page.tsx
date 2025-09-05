"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Upload, 
  FileText, 
  Image, 
  FileVideo, 
  Download, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  HardDrive,
  Filter,
  Grid3X3,
  List,
  Plus,
  FolderOpen,
  File
} from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
  uploadedBy: string
  category: string
  description?: string
}

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "doc-1",
      name: "User Research Report.pdf",
      type: "pdf",
      size: "2.3 MB",
      uploadedAt: "2 hours ago",
      uploadedBy: "John Doe",
      category: "research",
      description: "Comprehensive user research analysis for Q4 2024"
    },
    {
      id: "doc-2", 
      name: "Product Mockups.figma",
      type: "figma",
      size: "15.7 MB",
      uploadedAt: "1 day ago",
      uploadedBy: "Jane Smith",
      category: "design",
      description: "Latest product design mockups and wireframes"
    },
    {
      id: "doc-3",
      name: "Demo Video.mp4",
      type: "video",
      size: "45.2 MB", 
      uploadedAt: "3 days ago",
      uploadedBy: "Mike Johnson",
      category: "marketing",
      description: "Product demonstration video for landing page"
    },
    {
      id: "doc-4",
      name: "API Documentation.md",
      type: "markdown",
      size: "156 KB",
      uploadedAt: "5 days ago", 
      uploadedBy: "Sarah Wilson",
      category: "technical",
      description: "Complete API documentation with examples"
    },
    {
      id: "doc-5",
      name: "Brand Guidelines.pdf",
      type: "pdf",
      size: "8.9 MB",
      uploadedAt: "1 week ago",
      uploadedBy: "Alex Brown",
      category: "design",
      description: "Official brand guidelines and style guide"
    }
  ])

  const categories = [
    { id: "all", name: "All Documents", count: documents.length },
    { id: "research", name: "Research", count: documents.filter(d => d.category === "research").length },
    { id: "design", name: "Design", count: documents.filter(d => d.category === "design").length },
    { id: "marketing", name: "Marketing", count: documents.filter(d => d.category === "marketing").length },
    { id: "technical", name: "Technical", count: documents.filter(d => d.category === "technical").length },
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle file uploads
    acceptedFiles.forEach((file) => {
      const newDoc: Document = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        size: formatFileSize(file.size),
        uploadedAt: "Just now",
        uploadedBy: "You",
        category: "general",
        description: `Uploaded ${file.name}`
      }
      setDocuments(prev => [newDoc, ...prev])
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'video/*': ['.mp4', '.avi', '.mov'],
      'text/*': ['.txt', '.md', '.doc', '.docx'],
      'application/*': ['.figma', '.sketch', '.zip', '.json']
    }
  })

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  function getFileIcon(type: string) {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
      case 'md':
        return <FileText className="h-8 w-8 text-red-500" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="h-8 w-8 text-green-500" />
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo className="h-8 w-8 text-blue-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">Documents</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                <span>{documents.length} files • {documents.reduce((acc, doc) => acc + parseFloat(doc.size), 0).toFixed(1)} MB total</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Last upload 2 hours ago</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" className="h-8">
              <Plus className="h-4 w-4 mr-2" />
              Add Folder
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 space-y-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* View Mode Toggle */}
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

        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="h-7"
            >
              {category.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Drag & Drop Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-primary bg-primary/5 border-solid' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <Upload className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse files • Supports PDF, images, videos, documents
              </p>
            </div>
          </div>
        </div>

        {/* Documents Display */}
        {viewMode === "grid" ? (
          /* Grid View */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold break-words leading-tight" title={doc.name}>{doc.name}</h3>
                      <p className="text-xs text-muted-foreground">{doc.size}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {doc.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{doc.uploadedBy}</span>
                    <span>•</span>
                    <Calendar className="h-3 w-3" />
                    <span>{doc.uploadedAt}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDocument(doc.id)}
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
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="font-medium text-sm truncate" title={doc.name}>{doc.name}</h3>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground truncate overflow-hidden" title={doc.description}>{doc.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{doc.size}</span>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{doc.uploadedBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{doc.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-4">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== "all" 
                ? "Try adjusting your search or filters." 
                : "Upload your first document to get started."
              }
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button onClick={() => document.querySelector('input[type="file"]')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
