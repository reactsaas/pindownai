"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Clock, Eye, Edit, Save, Check, Loader2 } from "lucide-react"
import { ForwardRefEditor } from "@/components/ForwardRefEditor"
import { type MDXEditorMethods } from '@mdxeditor/editor'

import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { useTemplateVariableLoading } from '@/lib/template-variable-loading-context'
import { SharedContentViewer } from '@/components/share/SharedContentViewer'

interface Pin {
  id: string
  metadata: {
    title: string
    description?: string
    created_at: string
    is_public: boolean
  }
}

interface BlockItem {
  id: string
  name: string
  type: string
  template: string
  order: number
  created_at: string
  updated_at: string
}

export default function BlockEditPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { user, getAuthToken } = useAuth()
  const { resolvedTheme } = useTheme()
  const pinId = params.pinSlug as string // This is actually the pinId, not slug
  const blockId = params.blockId as string
  const mdxEditorRef = useRef<MDXEditorMethods>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [activeView, setActiveView] = useState<"edit" | "preview">(() => {
    const viewMode = searchParams.get('viewmode')
    return viewMode === 'preview' ? 'preview' : 'edit'
  })
  const [template, setTemplate] = useState("")
  const [blockData, setBlockData] = useState<BlockItem | null>(null)
  const [pinData, setPinData] = useState<Pin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // Fetch pin data from API
  const fetchPinData = async () => {
    if (!user || !pinId) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pin not found')
        } else {
          throw new Error(`Failed to fetch pin: ${response.statusText}`)
        }
      }

      const data = await response.json()
      setPinData(data.data)
    } catch (err) {
      console.error('Error fetching pin:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch pin')
    }
  }

  // Fetch block data from API
  const fetchBlockData = async () => {
    if (!user || !pinId || !blockId) return

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
      const block = data.data.blocks.find((b: BlockItem) => b.id === blockId)
      
      if (block) {
        setBlockData(block)
        setTemplate(block.template || '')
      } else {
        throw new Error('Block not found')
      }
    } catch (err) {
      console.error('Error fetching block:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch block')
    }
  }

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
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      
      await Promise.all([
        fetchPinData(),
        fetchBlockData()
      ])
      
      setIsLoading(false)
    }

    if (user && pinId && blockId) {
      loadData()
    }
  }, [user, pinId, blockId])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

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
    router.push(`/pins/${pinId}`)
  }

  const handleViewChange = (view: "edit" | "preview") => {
    setActiveView(view)
    const url = new URL(window.location.href)
    if (view === 'preview') {
      url.searchParams.set('viewmode', 'preview')
    } else {
      url.searchParams.delete('viewmode')
    }
    router.replace(url.pathname + url.search)
  }

  const handleSave = async () => {
    if (!user || !pinId || !blockId || !blockData) return

    try {
      setSaveStatus('saving')
      
      // Get the current markdown content from the editor
      const currentMarkdown = mdxEditorRef.current?.getMarkdown() || template
      
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: blockData.name,
          type: blockData.type,
          template: currentMarkdown,
          order: blockData.order
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to save block: ${response.statusText}`)
      }

      // Update local state with the saved content
      setTemplate(currentMarkdown)
      setBlockData(prev => prev ? { ...prev, template: currentMarkdown, updated_at: new Date().toISOString() } : null)
      
      // Show success state
      setSaveStatus('success')
      
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      // Reset to idle after 2 seconds
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
      
    } catch (err) {
      console.error('Error saving block:', err)
      setSaveStatus('error')
      
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      // Reset to idle after 3 seconds
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    }
  }

  const handleCopyBlockId = async () => {
    await navigator.clipboard.writeText(blockId)
    toast.success("Block ID copied to clipboard!")
  }

  const handleAIEdit = (prompt: string, selectedDocs: any[], researchData: any[]) => {
    // Here you would integrate with your AI service
    console.log("AI Edit Request:", { prompt, selectedDocs, researchData })
    
    // For now, let's append a placeholder to the template
    const aiSuggestion = `\n\n<!-- AI Generated Content based on: "${prompt}" -->\n${prompt}\n`
    setTemplate(template + aiSuggestion)
    
    // If using MDX editor, update it as well
    if (mdxEditorRef.current) {
      mdxEditorRef.current.setMarkdown(template + aiSuggestion)
    }
  }

  const handleCopyTemplate = async () => {
    await navigator.clipboard.writeText(template)
    toast.success("Template copied to clipboard!")
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "heading": return "bg-muted text-muted-foreground"
      case "markdown": return "bg-muted text-muted-foreground"
      case "conditional": return "bg-muted text-muted-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getSaveButtonIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <Check className="h-4 w-4" />
      case 'error':
        return <Save className="h-4 w-4" />
      default:
        return <Save className="h-4 w-4" />
    }
  }

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...'
      case 'success':
        return 'Saved!'
      case 'error':
        return 'Error'
      default:
        return 'Save'
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

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push("/pins")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pins
          </Button>
        </div>
      </div>
    )
  }

  if (!pinId || !blockId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Invalid URL</p>
          <p className="text-muted-foreground mb-4">Missing pin ID or block ID in the URL.</p>
          <Button onClick={() => router.push("/pins")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pins
          </Button>
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
    <div className="h-full flex flex-col min-h-0">
      {/* Header - Hidden on mobile/tablet */}
      <div className="hidden lg:block p-3 sm:p-4 border-b border-border bg-card">
        {/* Desktop: Full information display */}
        <div className="hidden lg:flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-6 w-6 p-0 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-muted-foreground truncate">{pinData.metadata.title}</span>
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
                <span className="text-xs sm:text-sm">Last updated {new Date(blockData.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* View Toggle and Actions - Desktop */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center border rounded-md bg-muted/30">
              <Button
                variant={activeView === "edit" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("edit")}
                className="h-8 px-2 sm:px-3 rounded-r-none border-r cursor-pointer"
              >
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant={activeView === "preview" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("preview")}
                className="h-8 px-2 sm:px-3 rounded-l-none cursor-pointer"
              >
                <Eye className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={handleCopyTemplate} className="px-2 cursor-pointer hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-200">
              <Copy className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave} 
              disabled={saveStatus === 'saving'}
              className="px-2 sm:px-3 cursor-pointer hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-200"
            >
              {getSaveButtonIcon()}
              <span className="hidden sm:inline sm:ml-2">{getSaveButtonText()}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden pb-0 lg:pb-0 mb-20 lg:mb-0">
        {activeView === "edit" ? (
                      <div className="h-full min-h-0 overflow-auto editor-scroll">
            <ForwardRefEditor
              ref={mdxEditorRef}
              markdown={template}
              onChange={setTemplate}
              placeholder="Enter your markdown template with {{variable}} placeholders..."
              className="h-full min-h-0"
              onAIEdit={handleAIEdit}
              currentPinId={pinId}
            />
          </div>
        ) : (
          <div className="h-full overflow-auto">
            {pinData && blockData ? (
              <SharedContentViewer
                pin={{
                  id: pinData.id,
                  metadata: {
                    title: pinData.metadata.title,
                    description: pinData.metadata.description || '',
                    tags: [],
                    created_at: pinData.metadata.created_at,
                    updated_at: blockData.updated_at,
                    is_public: pinData.metadata.is_public
                  },
                  blocks: [{
                    id: blockData.id,
                    name: blockData.name,
                    type: blockData.type as 'markdown',
                    template: template,
                    order: blockData.order,
                    updated_at: blockData.updated_at
                  }],
                  type: 'automation'
                }}
                isModal={false}
                currentPinId={pinId}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading preview...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile/Tablet Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 flex items-center justify-between z-50 safe-area-bottom">
        <Button variant="ghost" size="sm" onClick={handleBack} className="h-10 px-3 cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm">Back</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md bg-muted/30">
            <Button
              variant={activeView === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("edit")}
              className="h-10 px-3 rounded-r-none border-r cursor-pointer"
            >
              <Edit className="h-4 w-4 mr-2" />
              <span className="text-sm">Edit</span>
            </Button>
            <Button
              variant={activeView === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("preview")}
              className="h-10 px-3 rounded-l-none cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-2" />
              <span className="text-sm">Preview</span>
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleCopyTemplate} className="h-10 px-3 cursor-pointer hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-200">
            <Copy className="h-4 w-4" />
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave} 
            disabled={saveStatus === 'saving'}
            className="h-10 px-3 cursor-pointer hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-200"
          >
            {getSaveButtonIcon()}
          </Button>
        </div>
      </div>

    </div>
  )
}

const LiveIndicator: React.FC = () => {
  const { anyConnected } = useTemplateVariableLoading()
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${anyConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-muted text-muted-foreground border-border'}`}>
        <span className={`w-2 h-2 rounded-full ${anyConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
        {anyConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  )
}

