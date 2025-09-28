'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Eye, 
  Calendar, 
  User, 
  BarChart, 
  TrendingUp, 
  Users, 
  Globe, 
  Pin, 
  FileText,
  X,
  ExternalLink,
  Tag
} from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'katex/dist/katex.min.css'
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { remarkTemplateVariables } from '@/lib/remark-template-variables'
import { TemplateVariable } from '@/components/TemplateVariable'
import { TemplateVariableLoadingProvider, useTemplateVariableLoading } from '@/lib/template-variable-loading-context'
import { motion, AnimatePresence } from 'framer-motion'
import { MarkdownLoadingSkeleton } from '@/components/loading-skeleton'

interface Pin {
  id: string
  metadata: {
    title: string
    description: string
    tags: string[]
    created_at: string
    updated_at: string
    is_public?: boolean
  }
  blocks: Array<{
    id: string
    name: string
    type: 'markdown' | 'mermaid' | 'conditional' | 'image' | 'image-steps'
    template: string
    order: number
    updated_at: string
  }>
  type?: string
  content?: string
}

interface SharedContentViewerProps {
  pin: Pin
  isModal?: boolean
  onClose?: () => void
  onViewFullPage?: () => void
  currentPinId?: string
}

// Live indicator component for real-time connection status
function LiveIndicator() {
  const { anyConnected } = useTemplateVariableLoading()
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs ${anyConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-muted text-muted-foreground border-border'}`}>
      <span className={`w-2 h-2 rounded-full ${anyConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
      {anyConnected ? 'Live' : 'Offline'}
    </span>
  )
}

// Metadata row component that includes LiveIndicator within loading context
function MetadataRow({ pin }: { pin: Pin }) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString || dateString === 'Invalid Date') return 'Unknown'
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  // Try to get created_at from multiple possible locations
  const createdAt = pin.metadata?.created_at || (pin as any).createdAt || (pin as any).metadata?.created_at
  const updatedAt = pin.metadata?.updated_at || (pin as any).lastModified || (pin as any).metadata?.updated_at

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        <span>Created {formatDate(createdAt)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        <span>Updated {formatDate(updatedAt)}</span>
      </div>
      <div className="flex items-center gap-1">
        <FileText className="h-4 w-4" />
        <span>{pin.blocks.length} block{pin.blocks.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center gap-1">
        <Globe className="h-4 w-4" />
        <span>{pin.metadata.is_public ? 'Public' : 'Private'}</span>
      </div>
      <LiveIndicator />
    </div>
  )
}

// Share page content component with template variable support
const SharePageContent = React.memo(function SharePageContent({ template, pinData, theme }: { template: string, pinData: Pin, theme: string | undefined }) {
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
      return <h2 id={id} className="text-2xl font-semibold mb-4 mt-8 first:mt-0">{children}</h2>
    },
    h3: ({ children }: any) => {
      const text = String(children)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return <h3 id={id} className="text-xl font-medium mb-3 mt-6 first:mt-0">{children}</h3>
    },
    p: ({ children }: any) => <p className="mb-4 leading-7">{children}</p>,
    ul: ({ children }: any) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
    li: ({ children }: any) => <li className="leading-7">{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic my-4">
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
      <th className="border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-4 py-2 text-left font-medium text-neutral-900 dark:text-neutral-100">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-neutral-900 dark:text-neutral-100">
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
      <pre className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 p-4 rounded-lg overflow-x-auto my-4 shadow-sm [&_*]:bg-transparent [&_*]:!bg-transparent [&_code]:bg-transparent [&_code]:p-0 [&_span]:bg-transparent [&_span]:!bg-transparent">
        {children}
      </pre>
    ),
  }), [createTemplateVariableComponent, theme])

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
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
            className={`${!isInitialLoadComplete ? 'invisible absolute -z-10' : ''}`}
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
    </div>
  )
})

const getTypeIcon = (type?: string) => {
  switch (type) {
    case "automation":
      return <BarChart className="h-4 w-4" />
    case "article":
      return <Globe className="h-4 w-4" />
    case "toplist":
      return <TrendingUp className="h-4 w-4" />
    case "research":
      return <Users className="h-4 w-4" />
    default:
      return <BarChart className="h-4 w-4" />
  }
}

const getTypeColor = (type?: string) => {
  switch (type) {
    case "automation":
      return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
    case "article":
      return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
    case "toplist":
      return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
    case "research":
      return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
    default:
      return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
  }
}

const getTypeLabel = (type?: string) => {
  switch (type) {
    case "automation":
      return "Automation Output"
    case "article":
      return "Article"
    case "toplist":
      return "Top List"
    case "research":
      return "Research"
    default:
      return "Content"
  }
}

export const SharedContentViewer: React.FC<SharedContentViewerProps> = ({
  pin,
  isModal = false,
  onClose,
  onViewFullPage,
  currentPinId
}) => {
  const { theme } = useTheme()

  if (isModal) {
    return (
      <>
        <style dangerouslySetInnerHTML={{
          __html: `
            .shared-content-modal::-webkit-scrollbar {
              width: 12px;
            }
            .shared-content-modal::-webkit-scrollbar-track {
              background: rgba(229, 229, 229, 0.3);
              border-radius: 6px;
            }
            .shared-content-modal::-webkit-scrollbar-thumb {
              background: rgba(31, 41, 55, 0.8);
              border-radius: 6px;
            }
            .shared-content-modal::-webkit-scrollbar-thumb:hover {
              background: rgba(17, 24, 39, 0.9);
            }
            .dark .shared-content-modal::-webkit-scrollbar-track {
              background: rgba(29, 29, 29, 0.5);
            }
            .dark .shared-content-modal::-webkit-scrollbar-thumb {
              background: rgba(82, 82, 82, 0.8);
            }
            .dark .shared-content-modal::-webkit-scrollbar-thumb:hover {
              background: rgba(115, 115, 115, 0.9);
            }
          `
        }} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
        <motion.div
          className="bg-white dark:bg-neutral-800 rounded-lg max-w-5xl w-full max-h-[95vh] h-[95vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="h-16 bg-gradient-to-br from-muted/20 to-muted/10 relative flex-shrink-0">
            <div className="absolute top-3 left-6">
              {pin.type && (
                <Badge variant="secondary" className={cn("flex items-center gap-1 mb-1", getTypeColor(pin.type))}>
                  {getTypeIcon(pin.type)}
                  {getTypeLabel(pin.type)}
                </Badge>
              )}
              <h2 className="text-2xl font-bold text-foreground text-balance">{pin.metadata.title}</h2>
            </div>
            <div className="absolute top-3 right-4 flex items-center gap-2">
              {onViewFullPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/90 dark:bg-neutral-800/90 hover:bg-white dark:hover:bg-neutral-800 text-foreground"
                  onClick={onViewFullPage}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Page
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/90 dark:bg-neutral-800/90 hover:bg-white dark:hover:bg-neutral-800 text-foreground"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Modal Content */}
          <div 
            className="flex-1 px-8 pb-8 overflow-y-auto shared-content-modal"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(31, 41, 55, 0.8) rgba(229, 229, 229, 0.3)'
            }}
          >
            <TemplateVariableLoadingProvider>
              <div className="space-y-4 mb-6">
                <p className="text-xl text-foreground text-pretty leading-relaxed font-medium">
                  {pin.metadata.description}
                </p>
                <div className="pb-4">
                  <MetadataRow pin={pin} />
                </div>
                
                {/* Tags */}
                {pin.metadata.tags && pin.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pin.metadata.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Blocks Content */}
              <div className="space-y-8">
                {pin.blocks
                  .sort((a, b) => a.order - b.order)
                  .map((block) => (
                    <div key={block.id} className="block-content">
                      <SharePageContent 
                        template={block.template}
                        pinData={pin}
                        theme={theme}
                      />
                    </div>
                  ))}
              </div>
            </TemplateVariableLoadingProvider>
          </div>
        </motion.div>
      </motion.div>
      </>
    )
  }

  // Full page view
  return (
    <TemplateVariableLoadingProvider>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="pb-6 bg-transparent">
          <div className="space-y-4">
            <CardTitle className="text-3xl font-bold leading-tight">{pin.metadata.title}</CardTitle>
            <p className="text-muted-foreground text-lg">{pin.metadata.description}</p>
            
            {/* Metadata with LiveIndicator */}
            <MetadataRow pin={pin} />

            {/* Tags */}
            {pin.metadata.tags && pin.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pin.metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="bg-transparent">
          {/* Blocks Content */}
          <div className="space-y-8">
            {pin.blocks
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <div key={block.id} className="block-content">
                  <SharePageContent 
                    template={block.template}
                    pinData={pin}
                    theme={theme}
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </TemplateVariableLoadingProvider>
  )
}
