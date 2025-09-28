"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, Edit, Copy, Database, Clock, ChevronRight, Settings, ArrowLeft, FileText, Github, Share, Upload, Palette, Code, Zap, Bell, Users, Lock, Search, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ForwardRefEditor } from "./ForwardRefEditor"
import { type MDXEditorMethods } from '@mdxeditor/editor'
import { BlocksList } from "./blocks-list"
import { PinsList } from "./pins-list"
import { TemplateDataSources } from "./template-data-sources"
import { TemplateSettingsPopover } from "./template-settings-popover"
import { SharePopover } from "./share-popover"
import { PublishPopover } from "./publish-popover"
import { AvatarPopover } from "./avatar-popover"
import { AddPinModal } from "./add-pin-modal"
import { AIBlockCreationModal } from "./ai-block-creation-modal"
import { slugify, generateUniqueSlug } from "@/lib/utils/slug"

interface MarkdownEditorProps {
  template: string
  onTemplateChange: (template: string) => void
  workflowId: string
  initialView?: "templates" | "blocks"
}

export function MarkdownEditor({ template, onTemplateChange, workflowId, initialView = "templates" }: MarkdownEditorProps) {
  const router = useRouter()
  const [activeView, setActiveView] = useState("edit")
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    initialView === "blocks" ? "template-1" : null
  )
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [templateTab, setTemplateTab] = useState("blocks")
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set())
  const [selectedVersion, setSelectedVersion] = useState("v1.3")
  const [isAddPinModalOpen, setIsAddPinModalOpen] = useState(false)
  const [isAIBlockModalOpen, setIsAIBlockModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const mdxEditorRef = useRef<MDXEditorMethods>(null)

  const templates = [
    {
      id: "pin-1",
      name: "User Onboarding Pin",
      slug: slugify("User Onboarding Pin"),
      description: "Welcome new users with personalized content",
      lastModified: "2 hours ago",
      blocksCount: 4,
    },
    {
      id: "pin-2",
      name: "Order Confirmation Pin",
      slug: slugify("Order Confirmation Pin"),
      description: "Confirm orders and provide tracking info",
      lastModified: "1 day ago",
      blocksCount: 3,
    },
    {
      id: "pin-3",
      name: "Weekly Report Pin",
      slug: slugify("Weekly Report Pin"),
      description: "Generate weekly performance reports",
      lastModified: "3 days ago",
      blocksCount: 6,
    },
  ]

  const [pins, setPins] = useState(templates)

  // Filter pins based on search query
  const filteredPins = pins.filter(pin => {
    const matchesSearch = pin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pin.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // For now, no type filtering since pins don't have types like pinboard items
    // We could add categories later if needed
    return matchesSearch
  })

  

  const initialBlockItems = [
    {
      id: "blk_001",
      name: "Header Block",
      type: "heading",
      lastModified: "2 min ago",
      template: "# {{title}}\n\n## H2 - Section Heading\n### H3 - Subsection Heading\n#### H4 - Minor Heading\n##### H5 - Small Heading\n###### H6 - Tiny Heading\n\n{{description}}",
    },
    {
      id: "blk_002",
      name: "User Info Block",
      type: "markdown",
      lastModified: "5 min ago",
      template: "**User:** {{user_name}}\n**Email:** {{user_email}}\n**Role:** {{user_role}}",
    },
    {
      id: "blk_003",
      name: "Status Block",
      type: "conditional",
      lastModified: "10 min ago",
      template: "{{#if success}}\n✅ **Status:** Success\n{{else}}\n❌ **Status:** Failed\n{{/if}}",
    },
  ]

  const [blockItems, setBlockItems] = useState(initialBlockItems)
  const [receivedDataEntries, setReceivedDataEntries] = useState([
    {
      id: 1,
      timestamp: "22:29:42",
      data: {
        user_id: "usr_123",
        action: "login",
        ip_address: "192.168.1.100",
        user_agent: "Mozilla/5.0...",
        session_id: "sess_abc123",
        timestamp: "2024-01-15T22:29:42Z",
        success: true,
        location: "New York, NY",
      },
    },
    {
      id: 2,
      timestamp: "22:29:52",
      data: {
        user_id: "usr_456",
        action: "purchase",
        product_id: "prod_789",
        amount: 29.99,
        currency: "USD",
        payment_method: "credit_card",
        timestamp: "2024-01-15T22:29:52Z",
        success: true,
      },
    },
    {
      id: 3,
      timestamp: "22:30:15",
      data: {
        user_id: "usr_789",
        action: "logout",
        session_duration: 1847,
        pages_visited: 12,
        timestamp: "2024-01-15T22:30:15Z",
        success: true,
      },
    },
  ])

  const [extractedDataSources, setExtractedDataSources] = useState([
    {
      id: 1,
      name: "User Research Insights",
      sourceDocument: "User Research Report.pdf",
      extractedAt: "2 hours ago",
      dataType: "structured" as const,
      status: "completed" as const,
      data: {
        content: {
          "user_segments": ["power_users", "casual_users", "enterprise"],
          "key_findings": ["87% prefer dark mode", "Mobile usage increased 45%"],
          "recommendations": ["Improve onboarding", "Add advanced filters"],
          "metrics": {
            "satisfaction_score": 8.2,
            "retention_rate": "73%",
            "avg_session_time": "12m 34s"
          }
        },
        images: [
          {
            url: "/research-chart-1.png",
            caption: "User Satisfaction by Feature",
            extractedText: "Chart showing 85% satisfaction with search, 78% with filters"
          },
          {
            url: "/research-chart-2.png", 
            caption: "Usage Patterns Over Time",
            extractedText: "Monthly active users grew from 1.2K to 3.4K"
          }
        ],
        links: [
          {
            url: "https://figma.com/research-wireframes",
            title: "Research Wireframes",
            description: "Updated wireframes based on user feedback"
          }
        ]
      }
    },
    {
      id: 2,
      name: "API Documentation Extract",
      sourceDocument: "API Documentation.md",
      extractedAt: "1 hour ago", 
      dataType: "mixed" as const,
      status: "completed" as const,
      data: {
        content: {
          "endpoints": [
            {
              "method": "GET",
              "path": "/api/users",
              "description": "Retrieve user list",
              "parameters": ["limit", "offset", "search"]
            },
            {
              "method": "POST", 
              "path": "/api/users",
              "description": "Create new user",
              "required_fields": ["email", "password", "name"]
            }
          ],
          "authentication": "Bearer token required",
          "rate_limits": "1000 requests per hour"
        },
        links: [
          {
            url: "https://docs.example.com/api",
            title: "API Documentation",
            description: "Complete API reference"
          }
        ]
      }
    }
  ])

  const [perplexityResearchDataSources, setPerplexityResearchDataSources] = useState([
    {
      id: 1,
      name: "Market Analysis Research",
      query: "Latest trends in AI-powered automation tools 2024",
      researchedAt: "1 hour ago",
      status: "completed" as const,
      data: {
        summary: "AI automation tools are increasingly focusing on no-code solutions, with significant growth in workflow automation and document processing capabilities.",
        sources: [
          {
            url: "https://example.com/ai-trends-2024",
            title: "AI Automation Trends 2024",
            snippet: "The market for AI-powered automation tools is expected to grow 45% this year..."
          },
          {
            url: "https://example.com/no-code-ai",
            title: "No-Code AI Solutions",
            snippet: "No-code platforms are democratizing AI access for businesses..."
          }
        ],
        insights: [
          "No-code AI platforms are growing rapidly",
          "Document processing is a key focus area",
          "Integration capabilities are crucial for adoption"
        ]
      }
    }
  ])

  const mockData = {
    workflow_id: workflowId,
    timestamp: new Date().toLocaleString(),
    uptime: 99.8,
    cpu_usage: 45,
    memory_usage: 67,
    response_time: 120,
    status_ok: true,
  }

  const [integrationsData, setIntegrationsData] = useState([
    {
      id: 1,
      name: "Supabase Database",
      type: "database",
      status: "connected" as const,
      datasets: ["users", "orders", "products"],
      lastSync: "2 min ago",
    },
    {
      id: 2,
      name: "Stripe Payments",
      type: "payment",
      status: "connected" as const,
      datasets: ["transactions", "customers", "subscriptions"],
      lastSync: "5 min ago",
    },
    {
      id: 3,
      name: "SendGrid Email",
      type: "email",
      status: "disconnected" as const,
      datasets: ["campaigns", "contacts", "templates"],
      lastSync: "1 hour ago",
    },
  ])

  const toggleExpanded = (entryId: number) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedEntries(newExpanded)
  }

  const handleAddReceivedData = () => {
    const newId = Math.max(...receivedDataEntries.map(entry => entry.id), 0) + 1
    const newEntry = {
      id: newId,
      timestamp: new Date().toLocaleTimeString(),
      data: {
        new_field: "new_value",
        timestamp: new Date().toISOString(),
        status: "pending"
      }
    } as any
    setReceivedDataEntries(prev => [...prev, newEntry])
  }

  const handleAddExtractedData = () => {
    const newId = Math.max(...extractedDataSources.map(source => source.id), 0) + 1
    const newSource = {
      id: newId,
      name: `New Document ${newId}`,
      sourceDocument: "New Document.pdf",
      extractedAt: "Just now",
      dataType: "text" as const,
      status: "processing" as const,
      data: {
        content: "Processing new document..."
      }
    } as any
    setExtractedDataSources(prev => [...prev, newSource])
  }

  const handleDeleteReceivedData = (id: number) => {
    setReceivedDataEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const handleDeleteExtractedData = (id: number) => {
    setExtractedDataSources(prev => prev.filter(source => source.id !== id))
  }

  const handleAddPerplexityResearchData = () => {
    const newId = Math.max(...perplexityResearchDataSources.map(source => source.id), 0) + 1
    const newSource = {
      id: newId,
      name: `New Research ${newId}`,
      query: "Enter your research query here...",
      researchedAt: "Just now",
      status: "processing" as const,
      data: {
        summary: "Processing research query...",
        sources: [],
        insights: []
      }
    } as any
    setPerplexityResearchDataSources(prev => [...prev, newSource])
  }

  const handleAddIntegrationData = () => {
    const newId = Math.max(...integrationsData.map(integration => integration.id), 0) + 1
    const newIntegration = {
      id: newId,
      name: `New Integration ${newId}`,
      type: "api",
      status: "disconnected" as const,
      datasets: ["new_dataset"],
      lastSync: "Never"
    } as any
    setIntegrationsData(prev => [...prev, newIntegration])
  }

  const handleDeletePerplexityResearchData = (id: number) => {
    setPerplexityResearchDataSources(prev => prev.filter(source => source.id !== id))
  }

  const handleDeleteIntegrationData = (id: number) => {
    setIntegrationsData(prev => prev.filter(integration => integration.id !== id))
  }

  const renderTemplate = (template: string, data: Record<string, any>) => {
    let rendered = template
    Object.entries(data).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), String(value))
    })

    rendered = rendered.replace(
      /{{#if status_ok}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g,
      mockData.status_ok ? "$1" : "$2",
    )

    return rendered
  }

  const currentTemplate = editingBlockId
    ? blockItems.find((item) => item.id === editingBlockId)?.template || template
    : template

  const renderedMarkdown = renderTemplate(currentTemplate, mockData)

  const copyWorkflowId = async () => {
    try {
      await navigator.clipboard.writeText(workflowId)
    } catch (err) {
      console.error("Failed to copy workflow ID:", err)
    }
  }

  const handleAIEdit = (prompt: string, selectedDocs: any[], researchData: any[]) => {
    // Here you would integrate with your AI service
    console.log("AI Edit Request:", { prompt, selectedDocs, researchData })
    
    // For now, let's append a placeholder to the template
    const aiSuggestion = `\n\n<!-- AI Generated Content based on: "${prompt}" -->\n${prompt}\n`
    onTemplateChange(template + aiSuggestion)
    
    // If using MDX editor, update it as well
    if (mdxEditorRef.current) {
      mdxEditorRef.current.setMarkdown(template + aiSuggestion)
    }
  }

  const copyBlockId = async (blockId: string) => {
    try {
      await navigator.clipboard.writeText(blockId)
    } catch (err) {
      console.error("Failed to copy block ID:", err)
    }
  }

  const copyTemplateId = async (templateId: string) => {
    try {
      await navigator.clipboard.writeText(templateId)
    } catch (err) {
      console.error("Failed to copy template ID:", err)
    }
  }

  const handleCreateBlock = (blockData: {
    name: string
    type: string
    prompt: string
    selectedDataSources: any[]
    generatedTemplate: string
  }) => {
    // Generate a unique ID for the new block
    const newBlockId = `blk_${Date.now().toString().slice(-6)}`
    
    const newBlock = {
      id: newBlockId,
      name: blockData.name,
      type: blockData.type,
      lastModified: "Just now",
      template: blockData.generatedTemplate,
    }

    // Add the new block to the blockItems array
    setBlockItems(prev => [...prev, newBlock])
    
    // Automatically start editing the new block
    startEditingBlock(newBlockId)
  }

  const handleCreatePin = (pinData: {
    name: string
    description: string
    template: string
    type: string
  }) => {
    // Generate a unique ID for the new pin
    const newPinId = `pin_${Date.now().toString().slice(-6)}`
    
    // Generate unique slug
    const existingSlugs = pins.map(p => p.slug)
    const baseSlug = slugify(pinData.name)
    const uniqueSlug = generateUniqueSlug(baseSlug, existingSlugs)
    
    const newPin = {
      id: newPinId,
      name: pinData.name,
      slug: uniqueSlug,
      description: pinData.description,
      lastModified: "Just now",
      blocksCount: 1,
    }

    // Add the new pin to the pins array
    setPins(prev => [...prev, newPin])
    
    // Automatically start editing the new pin
    startEditingTemplate(newPinId)
    setIsAddPinModalOpen(false)
  }



  const handleOnDragEnd = (result: any) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(blockItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setBlockItems(items)
  }

  const startEditingTemplate = (templateId: string) => {
    const pin = pins.find(p => p.id === templateId)
    if (pin) {
      router.push(`/pins/${pin.slug}`)
    }
  }

  const startEditingBlock = (blockId: string) => {
    // For now, navigate to the first pin's slug - in real app this would be contextual
    const currentPin = pins[0] // This should be the currently selected pin
    if (currentPin) {
      router.push(`/pins/${currentPin.slug}/${blockId}`)
    }
  }

  const backToPins = () => {
    setEditingTemplateId(null)
    setEditingBlockId(null)
    router.push("/pins")
  }

  const backToTemplate = () => {
    setEditingBlockId(null)
  }

  const handleViewChange = (view: string) => {
    setActiveView(view)
  }

  return (
    <div className="h-full flex flex-col">
      {editingTemplateId && (
        <div className="p-4 border-b border-border bg-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              {!editingBlockId ? (
              <>
                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={backToPins} className="h-6 w-6 p-0 cursor-pointer">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                  <h2 className="font-semibold">
                    {pins.find((t) => t.id === editingTemplateId)?.name || "Pin Editor"}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
                  <div className="flex items-center gap-1">
                    <span className="font-mono">ID: {editingTemplateId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyWorkflowId()}
                      className="h-4 w-4 p-0 hover:bg-muted cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Last updated {pins.find((t) => t.id === editingTemplateId)?.lastModified || "2 min ago"}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={backToTemplate} className="h-6 w-6 p-0 cursor-pointer">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                  <h2 className="font-semibold">
                    {blockItems.find((item) => item.id === editingBlockId)?.name || "Block Editor"}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
                  <div className="flex items-center gap-1">
                    <span className="font-mono">ID: {workflowId}</span>
                                      <Button variant="ghost" size="sm" onClick={copyWorkflowId} className="h-5 w-5 p-0 hover:bg-muted cursor-pointer">
                    <Copy className="h-3 w-3" />
                  </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Last updated {blockItems.find((item) => item.id === editingBlockId)?.lastModified || "2 min ago"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {!editingTemplateId ? (
            <div></div>
          ) : editingTemplateId && !editingBlockId && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md bg-muted/30">
                <Button
                  variant={templateTab === "data-sources" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTemplateTab("data-sources")}
                  className="h-8 px-3 rounded-r-none border-r cursor-pointer"
                >
                  <Database className="h-4 w-4" />
                </Button>
                <Button
                  variant={templateTab === "blocks" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTemplateTab("blocks")}
                  className="h-8 px-3 rounded-l-none cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>

              {/* TopBar items integrated into blocks view */}
              <div className="flex items-center gap-2">
                {/* Version dropdown */}
                <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                  <SelectTrigger className="w-16 h-7 text-xs bg-muted/50 border-muted-foreground/20 hover:bg-muted cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1.3">v1.3</SelectItem>
                    <SelectItem value="v1.2">v1.2</SelectItem>
                    <SelectItem value="v1.1">v1.1</SelectItem>
                    <SelectItem value="v1.0">v1.0</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 bg-muted/50 hover:bg-muted cursor-pointer">
                  <Github className="h-4 w-4" />
                </Button>

                <SharePopover 
                  templateId={editingTemplateId || undefined}
                  templateName={pins.find(t => t.id === editingTemplateId)?.name}
                  isTemplate={!editingBlockId}
                />

                <PublishPopover
                  templateId={editingTemplateId || undefined}
                  templateName={pins.find(t => t.id === editingTemplateId)?.name}
                  isTemplate={!editingBlockId}
                  isPublished={false}
                />

                <div className="ml-2">
                  <AvatarPopover 
                    userName="Workflow User"
                    userEmail="user@example.com"
                    isPro={true}
                  />
                </div>
              </div>
            </div>
          )}

          {editingBlockId && (
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md bg-muted/30">
                <Button
                  variant={activeView === "edit" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("edit")}
                  className="h-8 px-3 rounded-r-none border-r cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeView === "preview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewChange("preview")}
                  className="h-8 px-3 rounded-l-none cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy Template
              </Button>
            </div>
          )}
        </div>
        </div>
      )}

      {!editingTemplateId && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 flex-shrink-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Pins</h1>
                <p className="text-muted-foreground">
                  Manage your reusable pin templates
                </p>
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search pins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredPins.length} pins found
              </p>
            </div>
          </div>

          {/* Scrollable Pins Grid */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <PinsList
              templates={filteredPins}
              onTemplateSelect={startEditingTemplate}
              onCopyTemplateId={copyTemplateId}
              onAddPin={() => setIsAddPinModalOpen(true)}
            />
          </div>
        </div>
      )}

      {editingTemplateId && !editingBlockId && templateTab === "data-sources" && (
        <div className="flex-1 space-y-6 p-6">
          <TemplateDataSources
            receivedDataEntries={receivedDataEntries}
            integrationsData={integrationsData}
            extractedDataSources={extractedDataSources}
            perplexityResearchDataSources={perplexityResearchDataSources}
            expandedEntries={expandedEntries}
            onToggleExpanded={toggleExpanded}
            onAddReceivedData={handleAddReceivedData}
            onAddExtractedData={handleAddExtractedData}
            onAddPerplexityResearchData={handleAddPerplexityResearchData}
            onAddIntegrationData={handleAddIntegrationData}
            onDeleteReceivedData={handleDeleteReceivedData}
            onDeleteExtractedData={handleDeleteExtractedData}
            onDeletePerplexityResearchData={handleDeletePerplexityResearchData}
            onDeleteIntegrationData={handleDeleteIntegrationData}
          />
        </div>
      )}

      {editingTemplateId && !editingBlockId && templateTab === "blocks" && (
        <div className="flex-1 min-h-0 p-4">
            <BlocksList
              blockItems={blockItems}
              onBlockItemsChange={setBlockItems}
              onEditBlock={startEditingBlock}
              onCopyBlockId={copyBlockId}
              onCreateBlock={handleCreateBlock}
              onAddBlock={() => setIsAIBlockModalOpen(true)}
            />
        </div>
      )}

      {editingBlockId && activeView === "edit" && (
          <div className="h-full flex flex-col min-h-0">
            <ForwardRefEditor
              ref={mdxEditorRef}
              markdown={template}
              onChange={(markdown) => onTemplateChange(markdown)}
              placeholder="Enter your markdown template with {{variable}} placeholders..."
              className="flex-1 min-h-0"
              onAIEdit={handleAIEdit}
            />
          </div>
        )}

        {editingBlockId && activeView === "preview" && (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Rendered Output</CardTitle>
            </CardHeader>
            <CardContent className="h-full overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {renderTemplate(template, mockData)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Add Pin Modal */}
      <AddPinModal
        isOpen={isAddPinModalOpen}
        onOpenChange={setIsAddPinModalOpen}
        onSubmit={handleCreatePin}
      />
      
      {/* AI Block Creation Modal */}
      <AIBlockCreationModal
        isOpen={isAIBlockModalOpen}
        onOpenChange={setIsAIBlockModalOpen}
        onCreateBlock={handleCreateBlock}
      />
    </div>
  )
}
