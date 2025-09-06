"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, Copy, Database, FileText, Sparkles } from "lucide-react"
import { BlocksList } from "@/components/blocks-list"
import { TemplateDataSources } from "@/components/template-data-sources"
import { TemplateSettingsPopover } from "@/components/template-settings-popover"
import { SharePopover } from "@/components/share-popover"
import { PublishPopover } from "@/components/publish-popover"
import { AvatarPopover } from "@/components/avatar-popover"
import { AIBlockCreationModal } from "@/components/ai-block-creation-modal"
import { slugify } from "@/lib/utils/slug"

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

export default function PinEditPage() {
  const router = useRouter()
  const params = useParams()
  const pinSlug = params.pinSlug as string
  
  const [pinData, setPinData] = useState<Pin | null>(null)
  const [blockItems, setBlockItems] = useState<BlockItem[]>([])
  const [templateTab, setTemplateTab] = useState("blocks")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState("v1.3")
  const [isAIBlockModalOpen, setIsAIBlockModalOpen] = useState(false)
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set())

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

  useEffect(() => {
    // Find pin by slug and load its blocks
    const pin = mockPins.find(p => p.slug === pinSlug)
    if (pin) {
      setPinData(pin)
      // Filter blocks that belong to this pin
      const pinBlocks = mockBlocks.filter(b => b.pinId === pin.id)
      setBlockItems(pinBlocks)
    }
    setIsLoading(false)
  }, [pinSlug])

  const handleBack = () => {
    router.push("/pins")
  }

  const startEditingBlock = (blockId: string) => {
    if (pinData) {
      router.push(`/pins/${pinData.slug}/${blockId}`)
    }
  }

  const copyBlockId = async (blockId: string) => {
    await navigator.clipboard.writeText(blockId)
    console.log(`Copied block ID: ${blockId}`)
  }

  const copyPinId = async () => {
    if (pinData) {
      await navigator.clipboard.writeText(pinData.id)
      console.log(`Copied pin ID: ${pinData.id}`)
    }
  }

  const handleCreateBlock = (blockData: {
    name: string
    type: string
    prompt: string
    selectedDataSources: any[]
    generatedTemplate: string
  }) => {
    if (!pinData) return
    
    const newBlockId = `blk_${Date.now()}`
    const newBlock: BlockItem = {
      id: newBlockId,
      name: blockData.name,
      type: blockData.type,
      lastModified: "Just now",
      template: blockData.generatedTemplate,
      pinId: pinData.id,
    }
    
    setBlockItems(prev => [...prev, newBlock])
    // Navigate to edit the new block
    router.push(`/pins/${pinData.slug}/${newBlockId}`)
  }

  // Mock data source handlers
  const [receivedDataEntries, setReceivedDataEntries] = useState([
    { 
      id: 1, 
      data: { 
        user: "Alice", 
        event: "login",
        timestamp: "2024-01-15T10:30:00Z",
        source: "webhook"
      }
    },
  ])
  const [extractedDataSources, setExtractedDataSources] = useState([
    {
      id: 1,
      name: "User Profile Data",
      sourceDocument: "user_profile.pdf",
      extractedAt: "2024-01-15T10:25:00Z",
      dataType: "structured" as const,
      status: "completed" as const,
      data: {
        content: {
          name: "Alice Smith",
          email: "alice@example.com",
          role: "Admin"
        }
      }
    },
  ])
  const [perplexityResearchDataSources, setPerplexityResearchDataSources] = useState([
    {
      id: 1,
      query: "AI market trends 2024",
      searchedAt: "2024-01-15T10:20:00Z",
      status: "completed" as const,
      data: {
        summary: "AI market expected to grow by 20% in 2024...",
        sources: ["OpenAI research", "McKinsey report"],
        confidence: 0.85
      }
    },
  ])
  const [integrationsData, setIntegrationsData] = useState([
    {
      id: 1,
      name: "Stripe",
      type: "payment",
      status: "connected" as const,
      lastSync: "2024-01-15T10:15:00Z",
      datasets: ["customers", "payments", "subscriptions"]
    },
  ])

  const handleAddReceivedData = (data: { name: string; value: string }) => {
    const newEntry = { 
      id: Date.now(), 
      data: { 
        [data.name]: data.value,
        timestamp: new Date().toISOString(),
        source: "manual"
      }
    }
    setReceivedDataEntries(prev => [...prev, newEntry])
  }
  const handleDeleteReceivedData = (id: number) => {
    setReceivedDataEntries(prev => prev.filter(item => item.id !== id))
  }

  const handleAddExtractedData = (data: { name: string; value: string }) => {
    const newEntry = {
      id: Date.now(),
      name: data.name,
      sourceDocument: "manual_input.txt",
      extractedAt: new Date().toISOString(),
      dataType: "text" as const,
      status: "completed" as const,
      data: {
        content: data.value
      }
    }
    setExtractedDataSources(prev => [...prev, newEntry])
  }
  const handleDeleteExtractedData = (id: number) => {
    setExtractedDataSources(prev => prev.filter(item => item.id !== id))
  }

  const handleAddPerplexityResearchData = (data: { name: string; value: string }) => {
    const newEntry = {
      id: Date.now(),
      query: data.name,
      searchedAt: new Date().toISOString(),
      status: "completed" as const,
      data: {
        summary: data.value,
        sources: ["Manual input"],
        confidence: 0.9
      }
    }
    setPerplexityResearchDataSources(prev => [...prev, newEntry])
  }
  const handleDeletePerplexityResearchData = (id: number) => {
    setPerplexityResearchDataSources(prev => prev.filter(item => item.id !== id))
  }

  const handleAddIntegrationData = (data: { name: string; value: string }) => {
    const newEntry = {
      id: Date.now(),
      name: data.name,
      type: "custom",
      status: "connected" as const,
      lastSync: new Date().toISOString(),
      datasets: [data.value]
    }
    setIntegrationsData(prev => [...prev, newEntry])
  }
  const handleDeleteIntegrationData = (id: number) => {
    setIntegrationsData(prev => prev.filter(item => item.id !== id))
  }

  const toggleExpanded = (id: number) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pin...</p>
        </div>
      </div>
    )
  }

  if (!pinData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Pin not found</p>
          <p className="text-muted-foreground mb-4">The pin you're looking for doesn't exist.</p>
          <Button onClick={handleBack}>
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
      <div className="p-4 border-b border-border bg-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-6 w-6 p-0 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold">{pinData.name}</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
              <div className="flex items-center gap-1">
                <span className="font-mono">ID: {pinData.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPinId}
                  className="h-4 w-4 p-0 hover:bg-muted cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last updated {pinData.lastModified}</span>
              </div>
            </div>
          </div>

          {/* Tab Toggle and Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md bg-muted/30">
              <Button
                variant={templateTab === "data-sources" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTemplateTab("data-sources")}
                className="h-8 px-3 rounded-r-none border-r cursor-pointer"
              >
                <Database className="h-4 w-4 mr-2" />
                Data
              </Button>
              <Button
                variant={templateTab === "blocks" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTemplateTab("blocks")}
                className="h-8 px-3 rounded-l-none cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Blocks
              </Button>
            </div>

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

            
            <TemplateSettingsPopover />
            
            <SharePopover 
              templateId={pinData?.id}
              templateName={pinData?.name}
              isTemplate={true}
            />
            
            <PublishPopover
              templateId={pinData?.id}
              templateName={pinData?.name}
              isTemplate={true}
              isPublished={false}
            />
            
            <AvatarPopover />
          </div>
        </div>
      </div>

      {/* Content */}
      {templateTab === "data-sources" ? (
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
      ) : (
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

      {/* AI Block Creation Modal */}
      <AIBlockCreationModal
        isOpen={isAIBlockModalOpen}
        onOpenChange={setIsAIBlockModalOpen}
        onCreateBlock={handleCreateBlock}
      />
    </div>
  )
}
