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

// Mock data for pinboards
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
- **Total Impressions**: 2.4M
- **Click-Through Rate**: 3.2%
- **Conversion Rate**: 8.7%
- **ROI**: 340%

## Channel Performance
| Channel | Spend | Revenue | ROI |
|---------|-------|---------|-----|
| Google Ads | $2,400 | $8,160 | 240% |
| Facebook | $1,800 | $6,120 | 240% |
| LinkedIn | $1,200 | $4,080 | 240% |

## Top Performing Campaigns
1. **Product Launch Campaign** - 450% ROI
2. **Retargeting Campaign** - 380% ROI
3. **Brand Awareness** - 290% ROI

## Recommendations
- Increase budget for top-performing campaigns
- Test new ad formats on LinkedIn
- Optimize landing pages for mobile traffic`,
        lastModified: "4 hours ago",
        createdAt: "2024-12-05",
        author: "Marketing Automation",
        views: 89,
        metadata: {
          category: "Marketing Analytics",
          tags: ["marketing", "campaigns", "roi", "automation"],
          stats: {
            impressions: 2400000,
            ctr: 3.2,
            conversion: 8.7,
            roi: 340
          }
        }
      }
    ]
  },
  {
    id: "board-2",
    name: "Product Development Insights",
    description: "Research and analysis on product development trends and user feedback",
    author: "Product Team",
    createdAt: "2024-11-28",
    views: 1890,
    pins: [
      {
        id: "pin-3",
        name: "User Feedback Analysis Q4",
        type: "research",
        description: "Comprehensive analysis of user feedback collected during Q4 2024",
        content: `# User Feedback Analysis Q4 2024

## Executive Summary
Analysis of 2,847 user feedback responses collected during Q4 2024 reveals key insights for product improvement.

## Key Findings
- **Overall Satisfaction**: 4.2/5.0
- **Feature Requests**: 1,234 submissions
- **Bug Reports**: 156 issues
- **Positive Feedback**: 1,457 responses

## Top Feature Requests
1. **Dark Mode** (23% of requests)
2. **Mobile App** (18% of requests)
3. **Export Functionality** (15% of requests)
4. **Advanced Search** (12% of requests)
5. **Custom Dashboards** (10% of requests)

## Sentiment Analysis
- **Positive**: 68%
- **Neutral**: 24%
- **Negative**: 8%

## Action Items
- [ ] Implement dark mode in Q1 2025
- [ ] Begin mobile app development
- [ ] Add export options for reports
- [ ] Enhance search functionality
- [ ] Create customizable dashboard templates`,
        lastModified: "1 day ago",
        createdAt: "2024-12-04",
        author: "Research Team",
        views: 156,
        metadata: {
          category: "User Research",
          tags: ["feedback", "analysis", "q4", "research"],
          stats: {
            responses: 2847,
            satisfaction: 4.2,
            features: 1234,
            bugs: 156
          }
        }
      },
      {
        id: "pin-4",
        name: "Competitive Analysis Report",
        type: "research",
        description: "Analysis of competitor features and market positioning",
        content: `# Competitive Analysis Report

## Market Overview
Analysis of 12 key competitors in the automation and analytics space.

## Competitive Landscape
| Company | Market Share | Key Strengths | Weaknesses |
|---------|-------------|---------------|------------|
| Competitor A | 25% | Strong brand, enterprise focus | Limited customization |
| Competitor B | 18% | User-friendly interface | High pricing |
| Competitor C | 15% | Advanced analytics | Complex setup |
| Our Product | 8% | Flexible, affordable | New to market |

## Feature Comparison
### Strengths
- ✅ Most affordable pricing
- ✅ Easiest setup process
- ✅ Best customer support
- ✅ Most flexible automation

### Gaps
- ❌ Limited integrations
- ❌ Basic reporting
- ❌ No mobile app
- ❌ Limited enterprise features

## Recommendations
1. **Short-term**: Improve reporting capabilities
2. **Medium-term**: Expand integration ecosystem
3. **Long-term**: Develop enterprise features`,
        lastModified: "3 days ago",
        createdAt: "2024-12-02",
        author: "Strategy Team",
        views: 98,
        metadata: {
          category: "Competitive Analysis",
          tags: ["competition", "analysis", "market", "research"],
          stats: {
            competitors: 12,
            marketShare: 8,
            features: 15,
            gaps: 4
          }
        }
      }
    ]
  }
]

function UserAvatar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
        Sign In
      </Button>
    )
  }

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.[0].toUpperCase() || 'U'

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
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

export default function SharePinboardPage() {
  const params = useParams()
  const router = useRouter()
  const boardId = params.boardId as string
  const [pinboard, setPinboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPinboard = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`http://localhost:8000/api/pinboards/${boardId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Pinboard not found')
          } else {
            setError('Failed to load pinboard')
          }
          return
        }

        const data = await response.json()
        const pinboardData = data.data
        
        // Fetch the actual pins for this pinboard
        if (pinboardData.pins && pinboardData.pins.length > 0) {
          const pinsPromises = pinboardData.pins.map(async (pinId: string) => {
            try {
              const pinResponse = await fetch(`http://localhost:8000/api/pins/${pinId}`)
              if (pinResponse.ok) {
                const pinData = await pinResponse.json()
                return {
                  id: pinData.data.id,
                  name: pinData.data.metadata?.title || 'Untitled Pin',
                  type: "automation" as const,
                  description: pinData.data.metadata?.description || '',
                  content: pinData.data.content || '',
                  lastModified: new Date(pinData.data.metadata?.created_at || Date.now()).toLocaleDateString(),
                  createdAt: new Date(pinData.data.metadata?.created_at || Date.now()).toLocaleDateString(),
                  author: pinData.data.metadata?.created_by || 'Unknown',
                  views: Math.floor(Math.random() * 1000), // Mock views for now
                  metadata: {
                    category: pinData.data.metadata?.category,
                    tags: pinData.data.metadata?.tags || []
                  }
                }
              }
              return null
            } catch (err) {
              console.error(`Error fetching pin ${pinId}:`, err)
              return null
            }
          })
          
          const pins = (await Promise.all(pinsPromises)).filter(Boolean)
          setPinboard({
            ...pinboardData,
            pins
          })
        } else {
          setPinboard({
            ...pinboardData,
            pins: []
          })
        }
      } catch (err) {
        console.error('Error fetching pinboard:', err)
        setError('Failed to load pinboard')
      } finally {
        setIsLoading(false)
      }
    }

    if (boardId) {
      fetchPinboard()
    }
  }, [boardId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (error || !pinboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Pinboard not found</h1>
          <p className="text-muted-foreground">{error || "The pinboard you're looking for doesn't exist or has been removed."}</p>
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

  const handlePinClick = (pin: Pin) => {
    router.push(`/share/pinboard/${boardId}/${pin.id}`)
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a 
                href="/"
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="h-8 w-8 bg-foreground text-background rounded-lg flex items-center justify-center">
                  <Grid3X3 className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-lg">pindown.ai</span>
                  <span className="text-sm text-muted-foreground ml-2">Pinboard</span>
                </div>
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Grid3X3 className="h-3 w-3" />
                {pinboard.pins.length} pins
              </Badge>
              <ThemeToggle />
              <UserAvatar />
            </div>
          </div>
        </div>
      </header>

      {/* Pinboard Info */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{pinboard.name}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{pinboard.description}</p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{pinboard.user_id || 'Unknown User'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(pinboard.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{pinboard.is_public ? 'Public Pinboard' : 'Private Pinboard'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pinterest-style Board Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pinboard.pins.map((pin) => (
            <Card 
              key={pin.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-white dark:bg-neutral-800 shadow-sm dark:shadow-neutral-800/20"
              onClick={() => handlePinClick(pin)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {getTypeIcon(pin.type)}
                    </div>
                    <Badge variant="secondary" className={cn("text-xs", getTypeColor(pin.type))}>
                      {getTypeLabel(pin.type)}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
                  {pin.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {pin.description}
                </p>
                
                {/* Metadata */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{pin.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{pin.views}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{pin.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{pin.lastModified}</span>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {pin.metadata?.tags && (
                    <div className="flex flex-wrap gap-1">
                      {pin.metadata.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {pin.metadata.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{pin.metadata.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Automation Stats Preview */}
                  {pin.type === "automation" && pin.metadata?.stats && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                      {Object.entries(pin.metadata.stats).slice(0, 2).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-sm font-semibold text-primary">{value}</div>
                          <div className="text-xs text-muted-foreground capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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