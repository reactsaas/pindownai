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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'katex/dist/katex.min.css'
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { remarkTemplateVariables } from '@/lib/remark-template-variables'
import { TemplateVariable } from '@/components/TemplateVariable'
import { TemplateVariableLoadingProvider, useTemplateVariableLoading } from '@/lib/template-variable-loading-context'
import { motion, AnimatePresence } from 'framer-motion'
import { MarkdownLoadingSkeleton } from '@/components/loading-skeleton'
import { useMemo, useCallback } from 'react'

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
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-card">
        {/* Mobile: Only back button and action buttons */}
        <div className="flex md:hidden items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            <div className="flex items-center border rounded-md bg-muted/30">
              <Button
                variant={activeView === "edit" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("edit")}
                className="h-8 px-2 rounded-r-none border-r cursor-pointer"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant={activeView === "preview" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewChange("preview")}
                className="h-8 px-2 rounded-l-none cursor-pointer"
              >
                <Eye className="h-4 w-4" />
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
              className="px-2 cursor-pointer hover:bg-muted hover:border-muted-foreground/50 transition-colors duration-200"
            >
              {getSaveButtonIcon()}
            </Button>
          </div>
        </div>

        {/* Desktop: Full information display */}
        <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
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
      <div className="flex-1 min-h-0 overflow-hidden">
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
          <TemplateVariableLoadingProvider>
            <PreviewContent 
              template={template} 
              pinData={pinData} 
              theme={resolvedTheme} 
            />
          </TemplateVariableLoadingProvider>
        )}
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



// Preview content component that handles loading states and animations
const PreviewContent: React.FC<{
  template: string
  pinData: any
  theme: string | undefined
}> = ({ template, pinData, theme }) => {
  const { isInitialLoadComplete, seedVariables } = useTemplateVariableLoading()

  // Seed expected variables from template so we wait for them before reveal
  useEffect(() => {
    const matches = Array.from(template.matchAll(/\{\{(dataset\.[^}]+)\}\}/g))
    const ids: string[] = matches.map(m => m[1])
    if (ids.length > 0) seedVariables(ids)
  }, [template, seedVariables])

  // Memoize the template variable component creator to prevent infinite loops
  const createTemplateVariableComponent = useCallback((props: any) => {
    return (
      <TemplateVariable
        variableType={props.variableType || props['variable-type']}
        datasetId={props.datasetId || props['data-set-id']}
        pinId={props.pinId || props['pin-id']}
        jsonPath={props.jsonPath || props['json-path']}
        fullPath={props.fullPath || props['full-path']}
        currentPinId={pinData?.id}
      />
    )
  }, [pinData?.id])

  // Memoize the ReactMarkdown components to prevent re-creation
  const markdownComponents = useMemo(() => ({
    ...(({
      'template-variable': createTemplateVariableComponent,
      'templateVariableBlock': createTemplateVariableComponent
    }) as any),
    h1: ({ children }: any) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return <h1 id={id} className="text-3xl font-bold mb-6 mt-8 first:mt-0">{children}</h1>
    },
    h2: ({ children }: any) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return <h2 id={id} className="text-2xl font-semibold mb-4 mt-6 first:mt-0">{children}</h2>
    },
    h3: ({ children }: any) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return <h3 id={id} className="text-xl font-medium mb-3 mt-5 first:mt-0">{children}</h3>
    },
    h4: ({ children }: any) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return <h4 id={id} className="text-lg font-medium mb-2 mt-4 first:mt-0">{children}</h4>
    },
    p: ({ children }: any) => <p className="mb-4 leading-relaxed">{children}</p>,
    ul: ({ children }: any) => <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>,
    ol: ({ children }: any) => <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>,
    li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic my-4 text-muted-foreground">
        {children}
      </blockquote>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse border border-border">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-border px-4 py-2">
        {children}
      </td>
    ),
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      return match ? (
        <div className="not-prose">
          <SyntaxHighlighter
            style={theme === 'dark' ? (oneDark as any) : (oneLight as any)}
            language={match[1]}
            PreTag="div"
            className="rounded-lg my-4"
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      )
    },
    pre: ({ children }: any) => (
      <pre className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 p-4 rounded-lg overflow-x-auto my-4 shadow-sm">
        {children}
      </pre>
    ),
  }), [createTemplateVariableComponent, theme])

  return (
    <Card className="h-full m-4 bg-background border-border">
      <CardHeader className="bg-background">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Rendered Output
          </CardTitle>
          <LiveIndicator />
        </div>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto bg-background">
        <AnimatePresence mode="wait">
          <>
            {!isInitialLoadComplete && (
              <motion.div
                key="loading"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MarkdownLoadingSkeleton />
              </motion.div>
            )}
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isInitialLoadComplete ? 1 : 0, y: isInitialLoadComplete ? 0 : 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`prose prose-gray dark:prose-invert max-w-none ${!isInitialLoadComplete ? 'invisible absolute -z-10' : ''}`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath, remarkTemplateVariables]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
              >
                {template}
              </ReactMarkdown>
            </motion.div>
          </>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
