"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Clock, Eye, Edit, Sparkles, Save } from "lucide-react"
import { ForwardRefEditor } from "@/components/ForwardRefEditor"
import { type MDXEditorMethods } from '@mdxeditor/editor'
import { AIEditModal } from "@/components/ai-edit-modal"
import { slugify } from "@/lib/utils/slug"
import ReactMarkdown from 'react-markdown'

interface Pin {
  id: string
  name: string
  slug: string
  description: string
  lastModified: string
  blocksCount: number
}

interface BlockItem {
  id: string
  name: string
  type: string
  lastModified: string
  template: string
  pinId: string
}

export default function BlockEditPage() {
  const router = useRouter()
  const params = useParams()
  const pinSlug = params.pinSlug as string
  const blockId = params.blockId as string
  const mdxEditorRef = useRef<MDXEditorMethods>(null)
  
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit")
  const [template, setTemplate] = useState("")
  const [blockData, setBlockData] = useState<BlockItem | null>(null)
  const [pinData, setPinData] = useState<Pin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAIEditModalOpen, setIsAIEditModalOpen] = useState(false)

  // Mock data - in real app this would come from API
  const mockPins: Pin[] = [
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

  const mockBlocks: BlockItem[] = [
    {
      id: "blk_001",
      name: "Header Block",
      type: "heading",
      lastModified: "2 min ago",
      template: "# {{title}}\n\n## H2 - Section Heading\n### H3 - Subsection Heading\n#### H4 - Minor Heading\n##### H5 - Small Heading\n###### H6 - Tiny Heading\n\n{{description}}",
      pinId: "pin-1",
    },
    {
      id: "blk_002",
      name: "User Info Block",
      type: "markdown",
      lastModified: "5 min ago",
      template: "**User:** {{user_name}}\n**Email:** {{user_email}}\n**Role:** {{user_role}}",
      pinId: "pin-1",
    },
    {
      id: "blk_003",
      name: "Status Block",
      type: "conditional",
      lastModified: "10 min ago",
      template: "{{#if success}}\n✅ **Status:** Success\n{{else}}\n❌ **Status:** Failed\n{{/if}}",
      pinId: "pin-2",
    },
  ]

  // Mock data for rendering preview
  const mockData = {
    title: "Dynamic Title",
    description: "This is a dynamic description for the block.",
    user_name: "Alice Smith",
    user_email: "alice@example.com",
    user_role: "Admin",
    success: true,
  }

  useEffect(() => {
    // Find pin by slug
    const pin = mockPins.find(p => p.slug === pinSlug)
    if (pin) {
      setPinData(pin)
      
      // Find block that belongs to this pin
      const block = mockBlocks.find(b => b.id === blockId && b.pinId === pin.id)
      if (block) {
        setBlockData(block)
        setTemplate(block.template)
      }
    }
    setIsLoading(false)
  }, [pinSlug, blockId])

  const renderTemplate = (md: string, data: Record<string, any>) => {
    let rendered = md
    for (const key in data) {
      const regex = new RegExp(`{{${key}}}`, "g")
      rendered = rendered.replace(regex, data[key].toString())
    }

    // Handle conditional blocks (simple #if / #else)
    rendered = rendered.replace(/{{#if (\w+)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g, (match, conditionKey, ifBlock, elseBlock) => {
      if (data[conditionKey]) {
        return ifBlock.trim()
      } else {
        return elseBlock.trim()
      }
    })
    rendered = rendered.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, conditionKey, ifBlock) => {
      if (data[conditionKey]) {
        return ifBlock.trim()
      } else {
        return ""
      }
    })

    return rendered
  }

  const handleBack = () => {
    if (pinData) {
      router.push(`/pins/${pinData.slug}`)
    } else {
      router.push("/pins")
    }
  }

  const handleSave = () => {
    // In real app, save to API
    console.log("Saving block:", { pinSlug, blockId, template })
    // Show success toast
  }

  const handleCopyBlockId = async () => {
    await navigator.clipboard.writeText(blockId)
    console.log(`Copied block ID: ${blockId}`)
  }

  const handleAIEdit = (editedContent: string) => {
    setTemplate(editedContent)
    setIsAIEditModalOpen(false)
    // In real app, this would also save to backend
  }

  const handleCopyTemplate = async () => {
    await navigator.clipboard.writeText(template)
    console.log("Copied template content to clipboard")
    // In real app, show success toast
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "heading": return "bg-blue-100 text-blue-800"
      case "markdown": return "bg-green-100 text-green-800"
      case "conditional": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading block...</p>
        </div>
      </div>
    )
  }

  if (!pinData || !blockData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Block not found</p>
          <p className="text-muted-foreground mb-4">The block you're looking for doesn't exist or doesn't belong to this pin.</p>
          <Button onClick={() => router.push("/pins")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pins
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-6 w-6 p-0 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-muted-foreground truncate">{pinData.name}</span>
                <span className="text-muted-foreground flex-shrink-0">/</span>
                <h2 className="font-semibold truncate">{blockData.name}</h2>
              </div>
              <Badge variant="secondary" className={getTypeColor(blockData.type)}>
                {blockData.type}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground ml-8">
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs sm:text-sm">Block ID: {blockId}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyBlockId}
                  className="h-4 w-4 p-0 hover:bg-muted cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs sm:text-sm">Last updated {blockData.lastModified}</span>
              </div>
            </div>
          </div>

          {/* View Toggle and Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center border rounded-md bg-muted/30">
              <Button
                variant={activeView === "edit" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("edit")}
                className="h-8 px-2 sm:px-3 rounded-r-none border-r cursor-pointer"
              >
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant={activeView === "preview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("preview")}
                className="h-8 px-2 sm:px-3 rounded-l-none cursor-pointer"
              >
                <Eye className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </div>

            <Button 
              size="sm" 
              onClick={() => setIsAIEditModalOpen(true)} 
              className="px-2 sm:px-3 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 hover:from-violet-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 sm:mr-2 animate-pulse fill-current" />
              <span className="hidden sm:inline">AI Edit</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handleCopyTemplate} className="px-2 cursor-pointer hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-200">
              <Copy className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleSave} className="px-2 sm:px-3 cursor-pointer hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-200">
              <Save className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {activeView === "edit" ? (
          <ForwardRefEditor
            ref={mdxEditorRef}
            markdown={template}
            onChange={setTemplate}
            placeholder="Enter your markdown template with {{variable}} placeholders..."
            className="h-full"
          />
        ) : (
          <Card className="h-full m-4 bg-background border-border">
            <CardHeader className="bg-background">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Rendered Output
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full overflow-y-auto bg-background">
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <ReactMarkdown>
                  {renderTemplate(template, mockData)}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Edit Modal */}
      <AIEditModal
        isOpen={isAIEditModalOpen}
        onOpenChange={setIsAIEditModalOpen}
        onSubmit={handleAIEdit}
      />
    </div>
  )
}
