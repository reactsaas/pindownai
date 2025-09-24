"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Clock, Eye, Edit, Sparkles, Save, Check, Loader2 } from "lucide-react"
import { ForwardRefEditor } from "@/components/ForwardRefEditor"
import { type MDXEditorMethods } from '@mdxeditor/editor'
import { AIEditModal } from "@/components/ai-edit-modal"
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
  const { theme } = useTheme()
  const pinId = params.pinSlug as string // This is actually the pinId, not slug
  const blockId = params.blockId as string
  const mdxEditorRef = useRef<MDXEditorMethods>(null)
  
  const [activeView, setActiveView] = useState<"edit" | "preview">(() => {
    const viewMode = searchParams.get('viewmode')
    return viewMode === 'preview' ? 'preview' : 'edit'
  })
  const [template, setTemplate] = useState("")
  const [blockData, setBlockData] = useState<BlockItem | null>(null)
  const [pinData, setPinData] = useState<Pin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAIEditModalOpen, setIsAIEditModalOpen] = useState(false)
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
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
      
    } catch (err) {
      console.error('Error saving block:', err)
      setSaveStatus('error')
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    }
  }

  const handleCopyBlockId = async () => {
    await navigator.clipboard.writeText(blockId)
    toast.success("Block ID copied to clipboard!")
  }

  const handleAIEdit = (editedContent: string) => {
    setTemplate(editedContent)
    setIsAIEditModalOpen(false)
    // In real app, this would also save to backend
  }

  const handleCopyTemplate = async () => {
    await navigator.clipboard.writeText(template)
    toast.success("Template copied to clipboard!")
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "heading": return "bg-blue-100 text-blue-800"
      case "markdown": return "bg-green-100 text-green-800"
      case "conditional": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
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
            />
          </div>
        ) : (
          <Card className="h-full m-4 bg-background border-border">
            <CardHeader className="bg-background">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Rendered Output
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full overflow-y-auto bg-background">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ children }) => {
                      const text = String(children)
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      return <h1 id={id} className="text-3xl font-bold mb-6 mt-8 first:mt-0">{children}</h1>
                    },
                    h2: ({ children }) => {
                      const text = String(children)
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      return <h2 id={id} className="text-2xl font-semibold mb-4 mt-8 first:mt-0">{children}</h2>
                    },
                    h3: ({ children }) => {
                      const text = String(children)
                      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      return <h3 id={id} className="text-xl font-medium mb-3 mt-6 first:mt-0">{children}</h3>
                    },
                    p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
                    ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="leading-7">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic my-4">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="w-full border-collapse border border-border">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2 text-left font-medium text-neutral-900 dark:text-neutral-100">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-neutral-900 dark:text-neutral-100">
                        {children}
                      </td>
                    ),
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={theme === 'dark' ? oneDark : oneLight}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg my-4"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      )
                    },
                    pre: ({ children }) => (
                      <pre className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 p-4 rounded-lg overflow-x-auto my-4 shadow-sm [&_*]:bg-transparent [&_*]:!bg-transparent [&_code]:bg-transparent [&_code]:p-0 [&_span]:bg-transparent [&_span]:!bg-transparent">
                        {children}
                      </pre>
                    ),
                  }}
                >
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
