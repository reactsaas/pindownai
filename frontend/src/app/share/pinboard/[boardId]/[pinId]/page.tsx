"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  Sun, 
  Moon, 
  LogOut, 
  Settings, 
  Home, 
  List, 
  X, 
  MessageCircle, 
  Send,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  ArrowLeft
} from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { cn } from "@/lib/utils"
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

interface Pin {
  id: string
  name: string
  type: "automation" | "article" | "toplist" | "research"
  description: string
  content: string
  lastModified: string
  createdAt: string
  author: string
  views: number
  metadata?: {
    category?: string
    readTime?: string
    tags?: string[]
    stats?: Record<string, string | number>
  }
}

interface Pinboard {
  id: string
  name: string
  description: string
  pins: Pin[]
  createdAt: string
  author: string
  views: number
}

interface TocItem {
  id: string
  text: string
  level: number
}

// Mock data for pinboards (same as the main pinboard page)
const mockPinboards: Pinboard[] = [
  {
    id: "board-1",
    name: "Weekly Business Reports",
    description: "Collection of automated weekly reports covering sales, marketing, and operations",
    author: "Business Intelligence Team",
    createdAt: "2024-12-01",
    views: 2450,
    pins: [
      {
        id: "pin-1",
        name: "Weekly Sales Performance Report",
        type: "automation",
        description: "Automated weekly sales performance summary with key metrics and insights",
        content: `# Weekly Sales Performance Report

## Executive Summary
This week showed strong performance across all key metrics with a notable 15% increase in conversion rates.

## Key Metrics
- **Total Revenue**: $45,670
- **New Customers**: 1,834
- **Conversion Rate**: 12.4%
- **System Uptime**: 99.8%

## Performance Highlights
✅ Exceeded weekly revenue target by 8%
✅ Customer acquisition up 23% vs last week  
✅ Zero critical system incidents
⚠️ Support response time slightly above target

## Regional Breakdown
| Region | Revenue | Growth |
|--------|---------|--------|
| North America | $28,400 | +12% |
| Europe | $12,800 | +18% |
| Asia Pacific | $4,470 | +25% |

## Next Steps
1. Optimize checkout flow to improve conversion
2. Expand successful campaigns to underperforming regions
3. Review support staffing for peak hours`,
        lastModified: "2 hours ago",
        createdAt: "2024-12-06",
        author: "Sales Automation System",
        views: 127,
        metadata: {
          category: "Sales Analytics",
          tags: ["weekly", "sales", "performance", "automation"],
          stats: {
            revenue: 45670,
            customers: 1834,
            conversion: 12.4,
            uptime: 99.8
          }
        }
      },
      {
        id: "pin-2",
        name: "Marketing Campaign Performance",
        type: "automation",
        description: "Weekly marketing campaign analysis with ROI and engagement metrics",
        content: `# Marketing Campaign Performance

## Campaign Overview
This week's marketing campaigns showed exceptional performance across all channels.

## Key Metrics
- **Total Spend**: $12,500
- **ROI**: 340%
- **Click-Through Rate**: 4.2%
- **Conversion Rate**: 8.7%

## Channel Performance
| Channel | Spend | Revenue | ROI |
|---------|-------|---------|-----|
| Google Ads | $5,200 | $18,400 | 254% |
| Facebook | $3,800 | $14,200 | 274% |
| LinkedIn | $2,500 | $9,800 | 292% |
| Email | $1,000 | $4,200 | 320% |

## Top Performing Campaigns
1. **Q4 Product Launch** - 450% ROI
2. **Holiday Special** - 380% ROI  
3. **Retargeting Campaign** - 320% ROI

## Recommendations
- Increase budget for Q4 Product Launch
- Test similar creative for Holiday Special
- Expand retargeting audience`,
        lastModified: "4 hours ago",
        createdAt: "2024-12-06",
        author: "Marketing Automation",
        views: 89,
        metadata: {
          category: "Marketing Analytics",
          tags: ["marketing", "campaigns", "ROI", "performance"],
          stats: {
            spend: 12500,
            roi: 340,
            ctr: 4.2,
            conversion: 8.7
          }
        }
      },
      {
        id: "pin-3",
        name: "Customer Support Metrics",
        type: "automation",
        description: "Weekly customer support performance and satisfaction metrics",
        content: `# Customer Support Metrics

## Support Overview
Customer support team maintained high performance standards this week.

## Key Metrics
- **Total Tickets**: 1,247
- **Response Time**: 2.3 hours
- **Resolution Time**: 18.5 hours
- **Satisfaction Score**: 4.7/5

## Ticket Categories
| Category | Count | Avg Resolution | Satisfaction |
|----------|-------|----------------|--------------|
| Technical Issues | 456 | 12.3h | 4.8/5 |
| Billing Questions | 234 | 4.2h | 4.9/5 |
| Feature Requests | 189 | 24.1h | 4.6/5 |
| General Support | 368 | 8.7h | 4.5/5 |

## Team Performance
- **Sarah Chen**: 156 tickets, 4.9/5 rating
- **Mike Rodriguez**: 142 tickets, 4.8/5 rating
- **Lisa Wang**: 138 tickets, 4.7/5 rating

## Improvements
- Reduced average response time by 15%
- Increased first-call resolution to 78%
- Launched new knowledge base articles`,
        lastModified: "6 hours ago",
        createdAt: "2024-12-06",
        author: "Support Analytics",
        views: 67,
        metadata: {
          category: "Support Analytics",
          tags: ["support", "tickets", "satisfaction", "performance"],
          stats: {
            tickets: 1247,
            responseTime: 2.3,
            resolutionTime: 18.5,
            satisfaction: 4.7
          }
        }
      }
    ]
  },
  {
    id: "board-2",
    name: "Product Research & Analysis",
    description: "Market research, competitive analysis, and product insights",
    author: "Product Team",
    createdAt: "2024-11-28",
    views: 1890,
    pins: [
      {
        id: "pin-3",
        name: "Market Research Report",
        type: "research",
        description: "Comprehensive market analysis and trend insights for Q4 2024",
        content: `# Market Research Report: Q4 2024

## Executive Summary
Our comprehensive market research reveals significant opportunities in the automation and analytics space, with growing demand for AI-powered solutions.

## Market Size & Growth
- **Total Addressable Market**: $12.4B
- **Serviceable Addressable Market**: $3.2B
- **Market Growth Rate**: 23% YoY
- **Expected Market Size 2025**: $15.2B

## Key Market Trends
### 1. AI Integration
- 78% of businesses plan to integrate AI in 2025
- Average budget increase: 34%
- Top use cases: Automation, Analytics, Customer Service

### 2. Remote Work Tools
- 65% of companies maintaining hybrid models
- Increased demand for collaboration features
- Security and compliance remain top concerns

### 3. Data-Driven Decision Making
- 89% of enterprises prioritize data analytics
- Real-time insights becoming standard
- Self-service analytics on the rise

## Customer Segments
| Segment | Size | Growth | Key Needs |
|---------|------|--------|-----------|
| SMB (10-100 employees) | 45% | 28% | Easy setup, affordable pricing |
| Mid-Market (100-1000) | 35% | 22% | Advanced features, integrations |
| Enterprise (1000+) | 20% | 18% | Security, customization, support |

## Competitive Landscape
- **Market Leaders**: 3 major players control 60% market share
- **Emerging Players**: 12+ new entrants in past 18 months
- **Differentiation**: AI capabilities, user experience, pricing

## Opportunities
1. **SMB Market**: Underserved with complex solutions
2. **Vertical Solutions**: Industry-specific features
3. **International Expansion**: Limited global presence
4. **Integration Ecosystem**: Better third-party connections

## Recommendations
- Focus on SMB market with simplified solutions
- Develop industry-specific templates
- Expand to European and Asian markets
- Build comprehensive integration marketplace`,
        lastModified: "3 days ago",
        createdAt: "2024-12-03",
        author: "Market Research Team",
        views: 156,
        metadata: {
          category: "Market Research",
          tags: ["market", "research", "analysis", "trends"],
          stats: {
            marketSize: 12400000000,
            growth: 23,
            segments: 3,
            opportunities: 4
          }
        }
      },
      {
        id: "pin-4",
        name: "Competitive Analysis: Q4 2024",
        type: "research",
        description: "Comprehensive analysis of competitor features and market positioning",
        content: `# Competitive Analysis: Q4 2024

## Market Overview
The competitive landscape has evolved significantly with new entrants and feature expansions.

## Key Competitors
### Direct Competitors
1. **Competitor A**
   - Market Share: 23%
   - Key Features: Advanced automation, AI integration
   - Pricing: $29-99/month
   - Strengths: Strong enterprise features
   - Weaknesses: Complex onboarding

2. **Competitor B**
   - Market Share: 18%
   - Key Features: User-friendly interface, mobile-first
   - Pricing: $19-79/month
   - Strengths: Excellent UX
   - Weaknesses: Limited advanced features

### Indirect Competitors
- **Tool X**: 15% market share, strong in SMB
- **Platform Y**: 12% market share, enterprise focus
- **Solution Z**: 8% market share, niche vertical

## Feature Comparison
| Feature | Us | Competitor A | Competitor B |
|---------|----|--------------|--------------|
| AI Integration | ✅ | ✅ | ❌ |
| Mobile App | ✅ | ✅ | ✅ |
| API Access | ✅ | ✅ | ❌ |
| White-label | ✅ | ❌ | ❌ |
| Pricing | $15-99 | $29-99 | $19-79 |

## Market Opportunities
1. **SMB Segment**: Underserved by current solutions
2. **Vertical Solutions**: Industry-specific features
3. **International**: Limited global presence
4. **Integration**: Better third-party connections

## Recommendations
- Focus on SMB market differentiation
- Develop industry-specific templates
- Expand international presence
- Strengthen integration ecosystem`,
        lastModified: "1 day ago",
        createdAt: "2024-12-05",
        author: "Product Research Team",
        views: 234,
        metadata: {
          category: "Market Research",
          tags: ["competitive", "analysis", "market", "research"],
          readTime: "12 min read"
        }
      },
      {
        id: "pin-5",
        name: "User Feedback Analysis",
        type: "research",
        description: "Analysis of user feedback and feature requests from Q4",
        content: `# User Feedback Analysis

## Feedback Overview
Collected 2,847 pieces of feedback across multiple channels this quarter.

## Feedback Sources
- **In-app surveys**: 1,234 responses
- **Support tickets**: 892 requests
- **User interviews**: 156 sessions
- **Social media**: 565 mentions

## Top Feature Requests
1. **Mobile App Improvements** (23% of requests)
   - Offline functionality
   - Better navigation
   - Push notifications

2. **Advanced Analytics** (18% of requests)
   - Custom dashboards
   - Export capabilities
   - Real-time data

3. **Integration Enhancements** (15% of requests)
   - More third-party apps
   - Webhook improvements
   - API rate limits

4. **Collaboration Features** (12% of requests)
   - Team workspaces
   - Comment system
   - Sharing improvements

## Sentiment Analysis
- **Positive**: 68%
- **Neutral**: 24%
- **Negative**: 8%

## User Satisfaction Trends
- **Q1**: 4.2/5
- **Q2**: 4.3/5
- **Q3**: 4.4/5
- **Q4**: 4.6/5

## Action Items
1. Prioritize mobile app development
2. Plan advanced analytics roadmap
3. Expand integration partnerships
4. Design collaboration features`,
        lastModified: "2 days ago",
        createdAt: "2024-12-04",
        author: "User Research Team",
        views: 189,
        metadata: {
          category: "User Research",
          tags: ["feedback", "analysis", "features", "satisfaction"],
          readTime: "8 min read"
        }
      }
    ]
  }
]

function UserAvatar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) return null

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
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
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

export default function SharePinboardPinPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string
  const pinId = params.pinId as string
  const [pinboard, setPinboard] = useState<Pinboard | null>(null)
  const [pin, setPin] = useState<Pin | null>(null)
  const [currentPinIndex, setCurrentPinIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isTocVisible, setIsTocVisible] = useState(false)

  useEffect(() => {
    // In real app, this would be an API call
    const foundPinboard = mockPinboards.find(b => b.id === boardId)
    if (foundPinboard) {
      setPinboard(foundPinboard)
      const foundPin = foundPinboard.pins.find(p => p.id === pinId)
      if (foundPin) {
        setPin(foundPin)
        setCurrentPinIndex(foundPinboard.pins.findIndex(p => p.id === pinId))
      }
    }
    setIsLoading(false)
  }, [boardId, pinId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (!pinboard || !pin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Pin not found</h1>
          <p className="text-muted-foreground">The pin you&apos;re looking for doesn&apos;t exist or has been removed.</p>
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

  const goToPreviousPin = () => {
    if (currentPinIndex > 0) {
      const prevPin = pinboard.pins[currentPinIndex - 1]
      router.push(`/share/pinboard/${boardId}/${prevPin.id}`)
    }
  }

  const goToNextPin = () => {
    if (currentPinIndex < pinboard.pins.length - 1) {
      const nextPin = pinboard.pins[currentPinIndex + 1]
      router.push(`/share/pinboard/${boardId}/${nextPin.id}`)
    }
  }

  const goToPinboard = () => {
    router.push(`/share/pinboard/${boardId}`)
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
        `
      }} />
      
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#1D1D1D]/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-[#1D1D1D]/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Top Row - Logo and Essential Actions */}
          <div className="flex items-center justify-between mb-2 sm:mb-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPinboard}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <a 
                href="/"
                className="flex items-center gap-1 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-foreground text-background rounded-lg flex items-center justify-center">
                  <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="hidden sm:block">
                  <span className="font-semibold text-base sm:text-lg">pindown.ai</span>
                  <span className="text-xs sm:text-sm text-muted-foreground ml-1 sm:ml-2">Pinboard</span>
                </div>
                <div className="block sm:hidden">
                  <span className="font-semibold text-sm">pindown.ai</span>
                </div>
              </a>
            </div>
            
            {/* Right side - Essential actions only on mobile */}
            <div className="flex items-center space-x-2 sm:hidden">
              <ThemeToggle />
              <UserAvatar />
            </div>
            
            {/* Desktop right side */}
            <div className="hidden sm:flex items-center space-x-3">
              <Badge variant="secondary" className={cn("flex items-center gap-1", getTypeColor(pin.type))}>
                {getTypeIcon(pin.type)}
                {getTypeLabel(pin.type)}
              </Badge>
              <AskAI pinContent={pin.content} />
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
          
          
          {/* Desktop Navigation Row */}
          <div className="hidden sm:flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPin}
                disabled={currentPinIndex === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {currentPinIndex + 1} of {pinboard.pins.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPin}
                disabled={currentPinIndex === pinboard.pins.length - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Pinboard Info */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold">{pinboard.name}</h1>
            <p className="text-sm text-muted-foreground">{pinboard.description}</p>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-6 bg-transparent">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn("flex items-center gap-1", getTypeColor(pin.type))}>
                  {getTypeIcon(pin.type)}
                  {getTypeLabel(pin.type)}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-bold leading-tight">{pin.name}</CardTitle>
              <p className="text-muted-foreground text-lg">{pin.description}</p>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{pin.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{pin.createdAt}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Updated {pin.lastModified}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{pin.views.toLocaleString()} views</span>
                </div>
                {pin.metadata?.readTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{pin.metadata.readTime}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {pin.metadata?.tags && (
                <div className="flex flex-wrap gap-2">
                  {pin.metadata.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats for automation type */}
              {pin.type === "automation" && pin.metadata?.stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  {Object.entries(pin.metadata.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold">
                        {typeof value === 'number' && value > 1000 
                          ? value.toLocaleString() 
                          : value
                        }
                        {key === 'conversion' && '%'}
                        {key === 'uptime' && '%'}
                        {key === 'roi' && '%'}
                        {key === 'ctr' && '%'}
                        {key === 'satisfaction' && '/5'}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="bg-transparent">
            {/* Content */}
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
                  code: ({ children }) => (
                    <code className="bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 p-4 rounded-lg overflow-x-auto my-4 shadow-sm [&_*]:bg-transparent [&_*]:!bg-transparent [&_code]:bg-transparent [&_code]:p-0 [&_span]:bg-transparent [&_span]:!bg-transparent">
                      {children}
                    </pre>
                  ),
                }}
              >
                {pin.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Table of Contents */}
      <TableOfContents 
        content={pin.content} 
        isVisible={isTocVisible}
        onToggle={() => setIsTocVisible(!isTocVisible)}
      />

      {/* Mobile Navigation - Fixed Bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#1D1D1D]/95 backdrop-blur border-t border-neutral-200 dark:border-neutral-800 z-50">
        <div className="flex items-center justify-center py-3 px-4">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPin}
              disabled={currentPinIndex === 0}
              className="h-10 w-10 p-0 flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center px-4 min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{pin.name}</div>
              <div className="text-xs text-muted-foreground">
                {currentPinIndex + 1} of {pinboard.pins.length}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPin}
              disabled={currentPinIndex === pinboard.pins.length - 1}
              className="h-10 w-10 p-0 flex-shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer - Hidden on Mobile */}
      <footer className="hidden sm:block border-t border-neutral-200 dark:border-neutral-800 mt-16">
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
