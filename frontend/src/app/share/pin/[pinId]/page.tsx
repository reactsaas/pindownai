"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Calendar, User, BarChart, TrendingUp, Users, Globe, Pin, Sun, Moon, LogOut, Settings, Home, List, X, MessageCircle, Send, FileText } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'katex/dist/katex.min.css'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

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



function UserAvatar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) return null

  // Get initials from user name or email
  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const initials = getInitials(user.displayName, user.email)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {initials}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.displayName && (
              <p className="font-medium">{user.displayName}</p>
            )}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/pins')}>
          <Home className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-8 w-8 p-0"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

interface TocItem {
  id: string
  text: string
  level: number
}

function TableOfContents({ content, isVisible, onToggle }: { content: string, isVisible: boolean, onToggle: () => void }) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const items: TocItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      
      items.push({ id, text, level })
    }

    setTocItems(items)
  }, [content])

  useEffect(() => {
    // Intersection observer for active section tracking
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0% -80% 0%' }
    )

    // Observe all heading elements
    tocItems.forEach(item => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [tocItems])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (tocItems.length === 0) return null

  return (
    <>
      {/* Table of Contents Panel */}
      {isVisible && (
        <div className="fixed right-4 top-20 w-64 max-h-[70vh] overflow-y-auto hidden xl:block z-40">
          <div className="bg-white/95 dark:bg-[#1D1D1D]/95 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 shadow-lg">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Table of Contents
            </h3>
            <nav className="space-y-1">
              {tocItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "block w-full text-left text-sm hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors",
                    "py-1 px-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    activeSection === item.id
                      ? "text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 font-medium"
                      : "text-neutral-600 dark:text-neutral-400",
                    item.level === 1 && "font-medium",
                    item.level === 2 && "pl-4",
                    item.level === 3 && "pl-6",
                    item.level === 4 && "pl-8",
                    item.level === 5 && "pl-10",
                    item.level === 6 && "pl-12"
                  )}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

function AskAI({ pinContent }: { pinContent: string }) {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    
    // Mock AI response - in real app this would call your AI API
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock response based on question
      const mockResponses = [
        "Based on the content, this appears to be related to the setup and configuration process. The key steps involve installing dependencies and configuring environment variables.",
        "Looking at the document, the main concepts covered include database setup, API configuration, and deployment procedures.",
        "From what I can see in the content, this focuses on automation workflows and integration patterns for modern development practices.",
        "The content discusses best practices for implementation, including security considerations and performance optimization strategies."
      ]
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      setResponse(randomResponse)
    } catch (error) {
      setResponse("I'm having trouble processing your question right now. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setQuestion('')
    setResponse('')
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Ask AI about this content"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Ask AI</h4>
            <p className="text-xs text-muted-foreground">
              Ask questions about this content and get instant answers.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              placeholder="What would you like to know about this content?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="text-sm"
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                size="sm" 
                disabled={!question.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-3 w-3 mr-2" />
                )}
                {isLoading ? 'Thinking...' : 'Ask'}
              </Button>
              {(question || response) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              )}
            </div>
          </form>

          {response && (
            <div className="p-3 bg-muted/50 rounded-lg border">
              <p className="text-sm leading-relaxed">{response}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function SharePinPage() {
  const params = useParams()
  const pinId = params.pinId as string
  const { getAuthToken, user, loading } = useAuth()
  const { theme } = useTheme()
  const [pin, setPin] = useState<Pin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTocVisible, setIsTocVisible] = useState(false)

  useEffect(() => {
    if (loading) return
    const fetchPinData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        

        
        // Get auth token if user is logged in
        const token = await getAuthToken()
        console.log('Auth token retrieved:', token ? 'YES' : 'NO')
        console.log('User state:', user ? 'LOGGED_IN' : 'NOT_LOGGED_IN')
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        }
        
        // Add auth header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
          console.log('Sending auth token:', token.substring(0, 20) + '...')
        } else {
          console.log('No auth token available - this might cause access issues for private pins')
        }
        
        const response = await fetch(`http://localhost:8000/api/public/pins/${pinId}`, {
          headers
        })
        
        if (response.status === 404) {
          setError('Pin not found or is private')
          return
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch pin: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Pin response data:', data)
        setPin(data.data.pin)
      } catch (err) {
        console.error('Error fetching pin:', err)
        setError(err instanceof Error ? err.message : 'Failed to load pin')
      } finally {
        setIsLoading(false)
      }
    }

    if (pinId) {
      fetchPinData()
    }
  }, [pinId, getAuthToken, user, loading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (error || !pin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Pin not found</h1>
          <p className="text-muted-foreground">
            {error || "The pin you're looking for doesn't exist or has been removed."}
          </p>
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: Pin["type"]) => {
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

  const getTypeColor = (type: Pin["type"]) => {
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

  const getTypeLabel = (type: Pin["type"]) => {
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

  return (
    <div className="min-h-screen bg-white dark:bg-[#1D1D1D]">
      <style dangerouslySetInnerHTML={{
        __html: `
          body::-webkit-scrollbar {
            width: 12px !important;
          }
          body::-webkit-scrollbar-track {
            background: #e5e5e5 !important;
          }
          body::-webkit-scrollbar-thumb {
            background: #1f2937 !important;
            border-radius: 6px !important;
          }
          body::-webkit-scrollbar-thumb:hover {
            background: #111827 !important;
          }
          .dark body::-webkit-scrollbar-track {
            background: #1D1D1D !important;
          }
          .dark body::-webkit-scrollbar-thumb {
            background: #525252 !important;
          }
          .dark body::-webkit-scrollbar-thumb:hover {
            background: #737373 !important;
          }
          html::-webkit-scrollbar {
            width: 12px !important;
          }
          html::-webkit-scrollbar-track {
            background: #e5e5e5 !important;
          }
          html::-webkit-scrollbar-thumb {
            background: #1f2937 !important;
            border-radius: 6px !important;
          }
          html::-webkit-scrollbar-thumb:hover {
            background: #111827 !important;
          }
          .dark html::-webkit-scrollbar-track {
            background: #1D1D1D !important;
          }
          .dark html::-webkit-scrollbar-thumb {
            background: #525252 !important;
          }
          .dark html::-webkit-scrollbar-thumb:hover {
            background: #737373 !important;
          }
        `
      }} />
      {/* Header */}
              <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#1D1D1D]/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-[#1D1D1D]/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a 
                href="/"
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="h-8 w-8 bg-foreground text-background rounded-lg flex items-center justify-center">
                  <Pin className="h-4 w-4 rotate-45" />
                </div>
                <span className="font-semibold text-lg">pindown.ai</span>
              </a>
            </div>
            <div className="flex items-center space-x-3">
              {pin.type && (
                <Badge variant="secondary" className={cn("flex items-center gap-1", getTypeColor(pin.type))}>
                  {getTypeIcon(pin.type)}
                  {getTypeLabel(pin.type)}
                </Badge>
              )}
              <AskAI pinContent={pin.blocks.map(b => b.template).join('\n\n')} />
              <Button
                onClick={() => setIsTocVisible(!isTocVisible)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hidden xl:flex"
                title={isTocVisible ? "Hide Table of Contents" : "Show Table of Contents"}
              >
                {isTocVisible ? <X className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
              <ThemeToggle />
              <UserAvatar />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-6 bg-transparent">
            <div className="space-y-4">
              <CardTitle className="text-3xl font-bold leading-tight">{pin.metadata.title}</CardTitle>
              <p className="text-muted-foreground text-lg">{pin.metadata.description}</p>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(pin.metadata.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated {new Date(pin.metadata.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{pin.blocks.length} block{pin.blocks.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{pin.metadata.is_public ? 'Public' : 'Private'}</span>
                </div>
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
          </CardHeader>
          
          <CardContent className="bg-transparent">
            {/* Blocks Content */}
            <div className="space-y-8">
              {pin.blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => (
                  <div key={block.id} className="block-content">
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
                        {block.template}
              </ReactMarkdown>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Table of Contents */}
      <TableOfContents 
        content={pin.blocks.map(block => block.template).join('\n\n')} 
        isVisible={isTocVisible}
        onToggle={() => setIsTocVisible(!isTocVisible)}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Created with <span className="font-semibold">pindown.ai</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Transform your automation outputs into beautiful, shareable content
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

