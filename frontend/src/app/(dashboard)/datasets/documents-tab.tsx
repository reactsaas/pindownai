"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  Upload,
  Image,
  FileVideo,
  Download,
  Calendar,
  User,
  File
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Dataset {
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

interface UploadedDocument {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
  uploadedBy: string
  description?: string
}

interface DocumentsTabProps {
  searchQuery: string
  datasets: Dataset[]
  onAddDataset: (dataset: Dataset) => void
  onDeleteDataset: (id: string) => void
  onCopyDatasetId: (id: string) => void
}

export default function DocumentsTab({ 
  searchQuery, 
  datasets, 
  onAddDataset, 
  onDeleteDataset, 
  onCopyDatasetId 
}: DocumentsTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newDataset, setNewDataset] = useState({
    name: "",
    description: "",
    type: "json" as Dataset["type"],
    content: ""
  })
  
  // Uploaded documents state
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([
    {
      id: "upload-1",
      name: "User Research Report.pdf",
      type: "pdf",
      size: "2.3 MB",
      uploadedAt: "2 hours ago",
      uploadedBy: "You",
      description: "Comprehensive user research analysis"
    },
    {
      id: "upload-2",
      name: "Product Mockups.figma",
      type: "figma",
      size: "15.7 MB",
      uploadedAt: "1 day ago",
      uploadedBy: "You",
      description: "Latest product design mockups"
    },
    {
      id: "upload-3",
      name: "Marketing Strategy.docx",
      type: "docx",
      size: "1.2 MB",
      uploadedAt: "3 days ago",
      uploadedBy: "You",
      description: "Q4 marketing strategy document"
    },
    {
      id: "upload-4",
      name: "Analytics Dashboard.png",
      type: "png",
      size: "3.8 MB",
      uploadedAt: "1 week ago",
      uploadedBy: "You",
      description: "Screenshot of analytics dashboard"
    },
    {
      id: "upload-5",
      name: "User Feedback.csv",
      type: "csv",
      size: "0.5 MB",
      uploadedAt: "2 weeks ago",
      uploadedBy: "You",
      description: "Raw user feedback data"
    },
    {
      id: "upload-6",
      name: "Team Roadmap.md",
      type: "md",
      size: "0.3 MB",
      uploadedAt: "3 weeks ago",
      uploadedBy: "You",
      description: "Product team roadmap"
    },
    {
      id: "upload-7",
      name: "Quarterly Results.pdf",
      type: "pdf",
      size: "4.1 MB",
      uploadedAt: "1 month ago",
      uploadedBy: "You",
      description: "Q3 financial results"
    },
    {
      id: "upload-8",
      name: "Customer List.xlsx",
      type: "xlsx",
      size: "2.6 MB",
      uploadedAt: "1 month ago",
      uploadedBy: "You",
      description: "Active customers export"
    },
    {
      id: "upload-9",
      name: "Bug Reports.txt",
      type: "txt",
      size: "0.2 MB",
      uploadedAt: "2 months ago",
      uploadedBy: "You",
      description: "Consolidated bug reports"
    },
    {
      id: "upload-10",
      name: "API Documentation.pdf",
      type: "pdf",
      size: "1.8 MB",
      uploadedAt: "2 months ago",
      uploadedBy: "You",
      description: "API reference guide"
    },
    {
      id: "upload-11",
      name: "Database Schema.sql",
      type: "sql",
      size: "0.4 MB",
      uploadedAt: "3 months ago",
      uploadedBy: "You",
      description: "Database structure"
    },
    {
      id: "upload-12",
      name: "Meeting Notes.docx",
      type: "docx",
      size: "0.7 MB",
      uploadedAt: "3 months ago",
      uploadedBy: "You",
      description: "Weekly team meeting notes"
    },
    {
      id: "upload-13",
      name: "Logo Assets.zip",
      type: "zip",
      size: "5.2 MB",
      uploadedAt: "4 months ago",
      uploadedBy: "You",
      description: "Company logo variations"
    }
  ])

  // Selected documents state
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

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

  // Upload functions
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const newDoc: UploadedDocument = {
        id: `upload-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        size: formatFileSize(file.size),
        uploadedAt: "Just now",
        uploadedBy: "You",
        description: `Uploaded ${file.name}`
      }
      setUploadedDocuments(prev => [newDoc, ...prev])
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
        return <FileText className="h-8 w-8 text-muted-foreground" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="h-8 w-8 text-muted-foreground" />
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo className="h-8 w-8 text-muted-foreground" />
      case 'figma':
      case 'sketch':
        return <File className="h-8 w-8 text-muted-foreground" />
      default:
        return <File className="h-8 w-8 text-muted-foreground" />
    }
  }

  const handleDeleteDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId))
  }

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto min-h-0">
      {/* Uploaded Documents Section */}
      <div className="mb-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Your Files</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Click on files to select them for processing
              </p>
            </div>
            {selectedDocuments.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedDocuments.length} selected • {uploadedDocuments
                  .filter(doc => selectedDocuments.includes(doc.id))
                  .reduce((acc, doc) => acc + parseFloat(doc.size), 0)
                  .toFixed(1)} MB
              </div>
            )}
          </div>
        </div>

        {/* Two Column Layout: Uploaded Documents (Left) + Dropzone (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Left Column: Uploaded Documents */}
          <div className="space-y-4">
            {uploadedDocuments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {uploadedDocuments.map((doc) => {
                  const isSelected = selectedDocuments.includes(doc.id)
                  return (
                    <Card 
                      key={doc.id} 
                      className={`group hover:shadow-sm transition-all cursor-pointer py-1 px-1 ${
                        isSelected 
                          ? 'bg-primary/10 border-primary shadow-sm' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleDocumentSelect(doc.id)}
                    >
                      <CardContent className="p-2">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              <div className="w-4 h-4 flex items-center justify-center">
                                {getFileIcon(doc.type)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-medium truncate leading-tight" title={doc.name}>
                                {doc.name.length > 20 ? `${doc.name.substring(0, 20)}...` : doc.name}
                              </h3>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <Eye className="w-3 h-3 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                  <Download className="w-3 h-3 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteDocument(doc.id)
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex justify-start items-center">
                            <p className="text-xs text-muted-foreground">{doc.size}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No files uploaded yet</p>
                <p className="text-xs text-muted-foreground">Upload files using the dropzone on the right</p>
              </div>
            )}
          </div>

          {/* Right Column: Drag & Drop Upload Area */}
          <div className="space-y-4 pl-4 pr-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer min-h-[200px] flex items-center justify-center ${
                isDragActive 
                  ? 'border-primary bg-primary/5 border-solid' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <Upload className={`h-6 w-6 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium text-sm">
                    {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, images, videos, docs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Templates Section */}
      <div className="flex-1">
        <div className="space-y-4 pb-12">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Datasets</h3>
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
    </div>
  )
}
