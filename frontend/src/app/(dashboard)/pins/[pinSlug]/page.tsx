"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, Copy, Database, FileText, Sparkles } from "lucide-react"
import { BlocksList } from "@/components/blocks-list"
import { TemplateDataSources } from "@/components/template-data-sources"
import { TemplateSettingsPopover } from "@/components/template-settings-popover"
import { SharePopover } from "@/components/share-popover"
import { AvatarPopover } from "@/components/avatar-popover"
import { AIBlockCreationModal } from "@/components/ai-block-creation-modal"
import { DatasetSubmissionModal } from "@/components/dataset-submission-modal"
import { WorkflowDataSubmissionModal } from "@/components/workflow-data-submission-modal"
import { useAuth } from "@/lib/auth-context"

interface Pin {
  id: string
  user_id: string
  wid: string | null
  data_type: string
  content: string
  metadata: {
    title: string
    description: string
    tags: string[]
    workflow_sources: string[]
    created_at: string
    is_public: boolean
  }
  permissions: {
    is_public: boolean
    created_by: string
  }
}

interface BlockItem {
  id: string
  name: string
  type: string
  lastModified: string
  template: string
}

export default function PinEditPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const pinId = params.pinSlug as string // This is actually the pin ID, not a slug
  const { user, getAuthToken } = useAuth()
  
  const [pinData, setPinData] = useState<Pin | null>(null)
  const [blockItems, setBlockItems] = useState<BlockItem[]>([])
  const [templateTab, setTemplateTab] = useState("blocks")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState("v1.3")
  const [isAIBlockModalOpen, setIsAIBlockModalOpen] = useState(false)
  const [isDatasetSubmissionModalOpen, setIsDatasetSubmissionModalOpen] = useState(false)
  const [isWorkflowDataModalOpen, setIsWorkflowDataModalOpen] = useState(false)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  
  // Real submitted data entries from Firebase
  const [submittedDataEntries, setSubmittedDataEntries] = useState<SubmittedDataEntry[]>([])

  // Initialize tab state from URL
  useEffect(() => {
    const view = searchParams.get('view')
    if (view === 'dataset') {
      setTemplateTab("data-sources")
    } else {
      setTemplateTab("blocks")
    }
  }, [searchParams])

  // Handle tab change and update URL
  const handleTabChange = (tab: string) => {
    setTemplateTab(tab)
    
    const params = new URLSearchParams(searchParams.toString())
    if (tab === "data-sources") {
      params.set('view', 'dataset')
    } else {
      params.delete('view')
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl)
  }

  // Fetch blocks for the pin
  const fetchPinBlocks = async () => {
    if (!user || !pinId) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}/blocks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch blocks: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Convert API blocks to BlockItem format
      const blocks: BlockItem[] = data.data.blocks.map((block: any) => ({
        id: block.id,
        name: block.name,
        type: block.type,
        lastModified: new Date(block.updated_at).toLocaleDateString(),
        template: block.template
      }))
      setBlockItems(blocks)
    } catch (err) {
      console.error('Error fetching blocks:', err)
      // Don't set error state for blocks, just log it
      setBlockItems([])
    }
  }

  // Fetch datasets for the pin
  const fetchDatasets = async () => {
    if (!user || !pinId) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}/datasets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch datasets: ${response.statusText}`)
      }

      const data = await response.json()
      const datasets: SubmittedDataEntry[] = data.data.datasets.map((dataset: any) => ({
        id: dataset.id, // Keep the actual Firebase ID
        name: dataset.metadata.name,
        submittedAt: dataset.metadata.createdAt,
        status: dataset.metadata.status === 'active' ? 'approved' as const : 'pending' as const,
        data: dataset.data,
        submittedBy: dataset.metadata.createdBy,
        notes: dataset.metadata.description,
        datasetType: dataset.metadata.datasetType || 'user' // Map the datasetType with default fallback
      }))
      
      setSubmittedDataEntries(datasets)
    } catch (err) {
      console.error('Error fetching datasets:', err)
      // Don't set error state for datasets, just log it
      setSubmittedDataEntries([])
    }
  }

  // Fetch pin data from API
  const fetchPinData = async () => {
    if (!user || !pinId) return

    try {
      setIsLoading(true)
      setError(null)
      
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('Pin not found')
        } else {
          throw new Error(`Failed to fetch pin: ${response.statusText}`)
        }
        return
      }

      const data = await response.json()
      setPinData(data.data)
      
      // Fetch blocks for this pin
      await fetchPinBlocks()
      
      // Fetch datasets for this pin
      await fetchDatasets()
    } catch (err) {
      console.error('Error fetching pin:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch pin')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPinData()
  }, [pinId, user])

  const handleBack = () => {
    router.push("/pins")
  }

  const startEditingBlock = (blockId: string) => {
    if (pinData) {
      router.push(`/pins/${pinData.id}/${blockId}`)
    }
  }

  const copyBlockId = async (blockId: string) => {
    await navigator.clipboard.writeText(blockId)
    console.log(`Copied block ID: ${blockId}`)
  }

  const deleteBlock = async (blockId: string) => {
    if (!user || !pinId) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}/blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete block: ${response.statusText}`)
      }

      // Remove the block from local state
      setBlockItems(prev => prev.filter(block => block.id !== blockId))
      console.log('Block deleted successfully')
      // TODO: Show success toast
    } catch (err) {
      console.error('Error deleting block:', err)
      // TODO: Show error toast
    }
  }

  const renameBlock = async (blockId: string, newName: string) => {
    if (!user || !pinId) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newName
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to rename block: ${response.statusText}`)
      }

      // Update the block name in local state
      setBlockItems(prev => prev.map(block => 
        block.id === blockId ? { ...block, name: newName } : block
      ))
      console.log('Block renamed successfully')
      // TODO: Show success toast
    } catch (err) {
      console.error('Error renaming block:', err)
      // TODO: Show error toast
    }
  }

  const copyPinId = async () => {
    if (pinData) {
      await navigator.clipboard.writeText(pinData.id)
      console.log(`Copied pin ID: ${pinData.id}`)
    }
  }

  const handleCreateBlock = async (blockData: {
    name: string
    type: string
    prompt: string
    selectedDataSources: any[]
    generatedTemplate: string
  }) => {
    if (!pinData || !user) return
    
    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}/blocks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: blockData.name,
          type: blockData.type,
          template: blockData.generatedTemplate || `# ${blockData.name}\n\nAdd your content here...`,
          order: blockItems.length
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create block: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Refresh blocks list
      await fetchPinBlocks()
      
      console.log('Block created successfully:', data.data.blockId)
    } catch (err) {
      console.error('Error creating block:', err)
      // TODO: Show error toast to user
    }
  }

  // Interface for submitted data entries with datasetType
  interface SubmittedDataEntry {
    id: string
    name: string
    submittedAt: string
    status: "pending" | "approved" | "rejected"
    data: Record<string, any>
    submittedBy: string
    notes?: string
    datasetType: 'workflow' | 'user' | 'integration' | 'document' | 'research'
  }

  const handleAddSubmittedData = () => {
    setIsDatasetSubmissionModalOpen(true)
  }

  const toggleExpanded = (id: string) => {
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

  const handleDeleteSubmittedData = async (id: string) => {
    if (!user || !pinId) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}/datasets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete dataset: ${response.statusText}`)
      }

      // Remove from local state
      setSubmittedDataEntries(prev => prev.filter(entry => entry.id !== id))
      console.log('Dataset deleted successfully')
    } catch (err) {
      console.error('Error deleting dataset:', err)
      // TODO: Show error toast
    }
  }

  const handleApproveSubmittedData = (id: string) => {
    setSubmittedDataEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, status: 'approved' as const } : entry
      )
    )
  }

  const handleRejectSubmittedData = (id: string) => {
    setSubmittedDataEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, status: 'rejected' as const } : entry
      )
    )
  }

  const handleRenameSubmittedData = (id: string, newName: string) => {
    setSubmittedDataEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, name: newName } : entry
      )
    )
  }

  const handleDatasetSubmission = async (data: { name: string; type: 'markdown' | 'json'; data: string; description?: string }) => {
    if (!user || !pinId) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}/datasets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Failed to submit dataset: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Dataset submitted successfully:', result)
      
      // Refresh the datasets list
      await fetchDatasets()
      
      // TODO: Show success toast
    } catch (err) {
      console.error('Error submitting dataset:', err)
      // TODO: Show error toast
    }
  }

  const handleWorkflowDataSubmission = async (data: any) => {
    if (!user || !pinId) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}/datasets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Failed to create workflow data source: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Workflow data source created successfully:', result)
      
      // Refresh the datasets list
      await fetchDatasets()
      
      // TODO: Show success toast
    } catch (err) {
      console.error('Error creating workflow data source:', err)
      // TODO: Show error toast
    }
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

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pins
          </Button>
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
      <div className="p-3 sm:p-4 border-b border-border bg-card">
        {/* Mobile: Compact layout with essential info */}
        <div className="flex md:hidden flex-col gap-2">
          {/* First row: Back button, title, and ID */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0 cursor-pointer flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold truncate text-sm">{pinData.metadata.title}</h2>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-mono text-xs text-muted-foreground">{pinData.id}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyPinId}
                className="h-6 w-6 p-0 hover:bg-muted cursor-pointer"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* Second row: Tabs and action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center border rounded-md bg-muted/30">
              <Button
                variant={templateTab === "data-sources" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("data-sources")}
                className="h-8 px-2 rounded-r-none border-r cursor-pointer"
              >
                <Database className="h-4 w-4" />
              </Button>
              <Button
                variant={templateTab === "blocks" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("blocks")}
                className="h-8 px-2 rounded-l-none cursor-pointer"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          
                      <div className="flex items-center gap-1">
              {/* <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="w-12 h-8 text-xs bg-muted/50 border-muted-foreground/20 hover:bg-muted cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1.3">v1.3</SelectItem>
                  <SelectItem value="v1.2">v1.2</SelectItem>
                  <SelectItem value="v1.1">v1.1</SelectItem>
                  <SelectItem value="v1.0">v1.0</SelectItem>
                </SelectContent>
              </Select> */}
              <TemplateSettingsPopover />
              <SharePopover 
                templateId={pinData?.id}
                templateName={pinData?.metadata.title}
                isTemplate={true}
                isPublished={pinData?.metadata.is_public || false}
              />
            </div>
          </div>
        </div>

        {/* Desktop: Full information display */}
        <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-6 w-6 p-0 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="font-semibold">{pinData.metadata.title}</h2>
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
                <span>Created {new Date(pinData.metadata.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Tab Toggle and Actions - Desktop */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md bg-muted/30">
              <Button
                variant={templateTab === "data-sources" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("data-sources")}
                className="h-8 px-3 rounded-r-none border-r cursor-pointer"
              >
                <Database className="h-4 w-4 mr-2" />
                Dataset
              </Button>
              <Button
                variant={templateTab === "blocks" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTabChange("blocks")}
                className="h-8 px-3 rounded-l-none cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                Blocks
              </Button>
            </div>

            {/* Version dropdown */}
            {/* <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="w-16 h-7 text-xs bg-muted/50 border-muted-foreground/20 hover:bg-muted cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="v1.3">v1.3</SelectItem>
                <SelectItem value="v1.2">v1.2</SelectItem>
                <SelectItem value="v1.1">v1.1</SelectItem>
                <SelectItem value="v1.0">v1.0</SelectItem>
              </SelectContent>
            </Select> */}

            
            <TemplateSettingsPopover />
            
            <SharePopover 
              templateId={pinData?.id}
              templateName={pinData?.metadata.title}
              isTemplate={true}
              isPublished={pinData?.metadata.is_public || false}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {templateTab === "data-sources" ? (
        <div className="flex-1 space-y-6 p-6">
          <TemplateDataSources
            pinId={pinId}
            datasets={submittedDataEntries}
            expandedEntries={expandedEntries}
            onToggleExpanded={toggleExpanded}
            onAddDataset={(datasetType) => {
              if (datasetType === 'workflow') {
                setIsWorkflowDataModalOpen(true)
              } else {
                setIsDatasetSubmissionModalOpen(true)
              }
            }}
            onDeleteDataset={handleDeleteSubmittedData}
            onRenameDataset={handleRenameSubmittedData}
            onApproveDataset={handleApproveSubmittedData}
            onRejectDataset={handleRejectSubmittedData}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 p-4">
          <BlocksList
            blockItems={blockItems}
            onBlockItemsChange={setBlockItems}
            onEditBlock={startEditingBlock}
            onCopyBlockId={copyBlockId}
            onDeleteBlock={deleteBlock}
            onRenameBlock={renameBlock}
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

      {/* Dataset Submission Modal */}
      <DatasetSubmissionModal
        isOpen={isDatasetSubmissionModalOpen}
        onClose={() => setIsDatasetSubmissionModalOpen(false)}
        onSubmit={handleDatasetSubmission}
        pinId={pinId}
      />

      {/* Workflow Data Submission Modal */}
      <WorkflowDataSubmissionModal
        isOpen={isWorkflowDataModalOpen}
        onClose={() => setIsWorkflowDataModalOpen(false)}
        onSubmit={handleWorkflowDataSubmission}
        pinId={pinId}
      />
    </div>
  )
}
