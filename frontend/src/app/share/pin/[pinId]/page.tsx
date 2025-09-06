"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye, Calendar, User, BarChart, TrendingUp, Users, Globe, Pin, Sun, Moon, LogOut, Settings, Home, List, X, MessageCircle, Send } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
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

// Mock data for different types of pins
const mockPins: Pin[] = [
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
    name: "The Future of Remote Work: AI-Powered Collaboration",
    type: "article",
    description: "Exploring how artificial intelligence is reshaping the way distributed teams collaborate and communicate",
    content: `# The Future of Remote Work: AI-Powered Collaboration

As we move deeper into the digital age, artificial intelligence is fundamentally transforming how distributed teams work together. From smart scheduling to automated task management, AI is becoming the invisible backbone of modern remote collaboration.

## The Evolution of Remote Work

Remote work has evolved from a necessity during the pandemic to a permanent fixture in the modern workplace. Today's distributed teams face unique challenges:

- **Communication barriers** across time zones
- **Information silos** that hinder productivity  
- **Coordination complexity** with multiple stakeholders
- **Context switching** between different tools and platforms

## AI-Powered Solutions

### Smart Meeting Orchestration
AI assistants now handle meeting scheduling, agenda creation, and even real-time transcription with action item extraction. This reduces administrative overhead by up to 40%.

### Predictive Project Management
Machine learning algorithms analyze project patterns to predict bottlenecks, suggest resource allocation, and automatically adjust timelines based on team capacity.

### Contextual Communication
AI-powered platforms understand project context and route communications to the right people at the right time, reducing notification fatigue while ensuring important messages aren't missed.

## Implementation Strategies

1. **Start Small**: Begin with one AI tool and expand gradually
2. **Focus on Pain Points**: Identify your team's biggest collaboration challenges
3. **Measure Impact**: Track productivity metrics before and after implementation
4. **Gather Feedback**: Regular team surveys ensure AI tools enhance rather than hinder workflow

## Looking Ahead

The future of remote work isn't just about working from anywhere—it's about working smarter with AI as our collaborative partner.`,
    lastModified: "1 day ago",
    createdAt: "2024-12-05",
    author: "Sarah Chen",
    views: 2840,
    metadata: {
      category: "Technology Trends",
      readTime: "8 min read",
      tags: ["AI", "remote work", "collaboration", "future of work"]
    }
  },
  {
    id: "pin-3",
    name: "Top 10 SaaS Tools for Productivity in 2024",
    type: "toplist",
    description: "Comprehensive ranking of the most effective SaaS productivity tools based on user reviews and performance metrics",
    content: `# Top 10 SaaS Tools for Productivity in 2024

Based on extensive research, user reviews, and performance metrics, here are the top productivity tools that are transforming how teams work.

## 1. Notion - All-in-One Workspace
**Rating: 9.2/10** | **Price: Free - $8/user/month**

The ultimate workspace that combines notes, tasks, wikis, and databases. Perfect for teams that want everything in one place.

**Pros:**
- Incredible flexibility and customization
- Great for documentation and knowledge management
- Strong collaboration features

**Cons:**
- Learning curve for advanced features
- Can be slow with large databases

## 2. Linear - Issue Tracking Reimagined  
**Rating: 9.0/10** | **Price: Free - $8/user/month**

Lightning-fast issue tracking designed for modern software teams. Beautiful interface with powerful automation.

**Pros:**
- Incredibly fast and responsive
- Beautiful, intuitive design
- Excellent keyboard shortcuts

**Cons:**
- Limited customization compared to Jira
- Newer tool with smaller ecosystem

## 3. Slack - Team Communication Hub
**Rating: 8.8/10** | **Price: Free - $7.25/user/month**

The standard for team communication with channels, direct messages, and extensive app integrations.

**Pros:**
- Excellent communication features
- Huge app marketplace
- Great search functionality

**Cons:**
- Can become noisy with large teams
- Threading can be confusing

## 4. Figma - Collaborative Design
**Rating: 8.7/10** | **Price: Free - $12/user/month**

Real-time collaborative design tool that's revolutionized how design teams work together.

## 5. GitHub - Code Collaboration
**Rating: 8.6/10** | **Price: Free - $4/user/month**

The world's leading platform for code collaboration, project management, and CI/CD.

## 6. Loom - Async Video Communication
**Rating: 8.5/10** | **Price: Free - $8/user/month**

Quick screen and camera recording for async communication and documentation.

## 7. Calendly - Meeting Scheduling  
**Rating: 8.3/10** | **Price: Free - $8/user/month**

Automated meeting scheduling that eliminates back-and-forth emails.

## 8. Airtable - Flexible Database
**Rating: 8.2/10** | **Price: Free - $20/user/month**

Spreadsheet-database hybrid that's perfect for project management and data organization.

## 9. Zoom - Video Conferencing
**Rating: 8.0/10** | **Price: Free - $14.99/user/month**

Reliable video conferencing with excellent audio quality and recording features.

## 10. Todoist - Task Management
**Rating: 7.9/10** | **Price: Free - $4/user/month**

Simple yet powerful task management with natural language processing and project organization.

## Selection Criteria

Tools were evaluated based on:
- **User Experience** (30%)
- **Feature Set** (25%) 
- **Value for Money** (20%)
- **Integration Capabilities** (15%)
- **Customer Support** (10%)`,
    lastModified: "3 days ago",
    createdAt: "2024-12-03",
    author: "ProductHunt Research Team",
    views: 5670,
    metadata: {
      category: "Software Reviews",
      readTime: "12 min read",
      tags: ["SaaS", "productivity", "tools", "ranking", "2024"]
    }
  },
  {
    id: "pin-4",
    name: "Statistical Analysis: Customer Conversion Optimization",
    type: "research",
    description: "Mathematical analysis of conversion rate optimization using statistical models and A/B testing frameworks",
    content: `# Statistical Analysis: Customer Conversion Optimization

## Executive Summary

This research examines the mathematical foundations of conversion rate optimization, providing statistical models for A/B testing and predictive analytics.

## Conversion Rate Formula

The basic conversion rate is calculated as:

$$CR = \\frac{C}{V} \\times 100$$

Where:
- $CR$ = Conversion Rate (%)
- $C$ = Number of Conversions
- $V$ = Number of Visitors

## Statistical Significance Testing

### Z-Score Calculation

For A/B testing, we use the z-score to determine statistical significance:

$$z = \\frac{\\hat{p}_A - \\hat{p}_B}{\\sqrt{\\hat{p}(1-\\hat{p})(\\frac{1}{n_A} + \\frac{1}{n_B})}}$$

Where:
- $\\hat{p}_A$ and $\\hat{p}_B$ are sample conversion rates
- $\\hat{p}$ is the pooled conversion rate
- $n_A$ and $n_B$ are sample sizes

### Confidence Intervals

The 95% confidence interval for conversion rate difference:

$$CI = (\\hat{p}_A - \\hat{p}_B) \\pm 1.96 \\times SE$$

## Bayesian Analysis

### Beta Distribution

Using Bayesian methods, the posterior distribution follows a Beta distribution:

$$Beta(\\alpha + conversions, \\beta + failures)$$

### Probability of Improvement

The probability that variant B outperforms variant A:

$$P(CR_B > CR_A) = \\int_0^1 \\int_0^{p_A} Beta(p_B|\\alpha_B, \\beta_B) \\times Beta(p_A|\\alpha_A, \\beta_A) \\, dp_B \\, dp_A$$

## Advanced Models

### Logistic Regression

For multivariate analysis, we use logistic regression:

$$\\log\\left(\\frac{p}{1-p}\\right) = \\beta_0 + \\beta_1 x_1 + \\beta_2 x_2 + ... + \\beta_n x_n$$

### Expected Value Calculation

The expected value of a conversion optimization test:

$$EV = \\sum_{i=1}^{n} P(outcome_i) \\times Value(outcome_i)$$

## Sample Size Calculation

To determine minimum sample size for statistical power:

$$n = \\frac{2(z_{\\alpha/2} + z_\\beta)^2 \\times \\hat{p}(1-\\hat{p})}{d^2}$$

Where:
- $z_{\\alpha/2}$ = critical value for significance level
- $z_\\beta$ = critical value for power
- $d$ = minimum detectable effect

## Key Metrics

### Inline Math Examples

Our current baseline conversion rate is $CR_{baseline} = 2.3\\%$ with a monthly revenue impact of $\\Delta R = \\$45,670$.

The statistical power of our test is $1-\\beta = 0.8$ with significance level $\\alpha = 0.05$.

## Results Summary

| Metric | Baseline | Variant A | Variant B | Statistical Significance |
|--------|----------|-----------|-----------|-------------------------|
| Conversion Rate | 2.3% | 2.8% | 3.1% | $p < 0.001$ |
| Revenue Impact | $45K | $52K | $58K | $z = 4.2$ |
| Confidence Interval | ±0.2% | ±0.3% | ±0.2% | 95% CI |

## Conclusion

The mathematical analysis confirms that variant B provides a statistically significant improvement of $\\Delta CR = +0.8\\%$ with 99.9% confidence.

### Next Steps

1. Implement winner with gradual traffic allocation
2. Monitor long-term effects using time-series analysis
3. Apply learnings to similar conversion funnels`,
    lastModified: "1 hour ago",
    createdAt: "2024-12-06",
    author: "Data Science Team",
    views: 892,
    metadata: {
      category: "Statistical Analysis",
      readTime: "15 min read",
      tags: ["statistics", "A/B testing", "conversion", "research", "mathematics"]
    }
  },
  {
    id: "pin-5",
    name: "PinDown AI Setup Guide",
    type: "automation",
    description: "Complete setup instructions for getting started with PinDown AI automation platform",
    content: `# PinDown AI Setup Guide

Welcome to PinDown AI! This guide will help you set up your automation environment in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- A **code editor** (VS Code recommended)

## Quick Start Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-org/pindown-ai.git
cd pindown-ai
\`\`\`

### 2. Install Dependencies

Using npm:
\`\`\`bash
npm install
\`\`\`

Using yarn:
\`\`\`bash
yarn install
\`\`\`

### 3. Environment Setup

Copy the environment template:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit your \`.env.local\` file:
\`\`\`env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/pindown
REDIS_URL=redis://localhost:6379

# API Keys
OPENAI_API_KEY=sk-your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
\`\`\`

## Database Setup

### 1. Install PostgreSQL

**macOS (using Homebrew):**
\`\`\`bash
brew install postgresql
brew services start postgresql
\`\`\`

**Ubuntu/Debian:**
\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
\`\`\`

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

\`\`\`sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE pindown;
CREATE USER pindown_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pindown TO pindown_user;
\\q
\`\`\`

### 3. Run Migrations

\`\`\`bash
npx prisma migrate dev
npx prisma generate
\`\`\`

## Development Server

Start the development server:

\`\`\`bash
npm run dev
\`\`\`

Your application will be available at \`http://localhost:3000\`

## API Configuration

### Setting up OpenAI Integration

1. **Get your API key** from [OpenAI Platform](https://platform.openai.com/)
2. **Add to environment:**
   \`\`\`env
   OPENAI_API_KEY=sk-your_key_here
   \`\`\`

3. **Test the connection:**
   \`\`\`javascript
   // Test in your browser console
   fetch('/api/test-openai')
     .then(res => res.json())
     .then(console.log)
   \`\`\`

### Webhook Configuration

Configure webhooks for automation triggers:

\`\`\`javascript
// webhook-config.js
export const webhookConfig = {
  endpoints: {
    zapier: \`https://hooks.zapier.com/hooks/catch/\${ZAPIER_HOOK_ID}/\`,
    make: \`https://hook.eu1.make.com/\${MAKE_WEBHOOK_ID}\`,
    custom: process.env.CUSTOM_WEBHOOK_URL
  },
  authentication: {
    method: 'bearer',
    token: process.env.WEBHOOK_TOKEN
  }
}
\`\`\`

## Docker Setup (Optional)

For containerized deployment:

### 1. Build the Docker Image

\`\`\`bash
docker build -t pindown-ai .
\`\`\`

### 2. Run with Docker Compose

\`\`\`yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/pindown
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: pindown
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
\`\`\`

Start the stack:
\`\`\`bash
docker-compose up -d
\`\`\`

## Testing Your Setup

### 1. Health Check

Visit these URLs to verify everything is working:

- **Frontend:** \`http://localhost:3000\`
- **API Health:** \`http://localhost:3000/api/health\`
- **Database:** \`http://localhost:3000/api/db-status\`

### 2. Create Your First Pin

\`\`\`javascript
// Example: Create a simple automation pin
const pin = await fetch('/api/pins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "My First Automation",
    type: "automation",
    template: "Hello {{name}}, your order #{{order_id}} is ready!",
    data: {
      name: "John Doe",
      order_id: "12345"
    }
  })
})
\`\`\`

## Troubleshooting

### Common Issues

**Port already in use:**
\`\`\`bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
\`\`\`

**Database connection failed:**
\`\`\`bash
# Check PostgreSQL status
brew services list | grep postgresql
sudo systemctl status postgresql  # Linux
\`\`\`

**Environment variables not loading:**
\`\`\`bash
# Ensure file is named .env.local (not .env)
mv .env .env.local
\`\`\`

## Next Steps

1. **Explore the dashboard** at \`/pins\`
2. **Create your first automation** workflow
3. **Set up integrations** with your favorite tools
4. **Invite team members** to collaborate

## Support

- 📖 **Documentation:** [docs.pindown.ai](https://docs.pindown.ai)
- 💬 **Discord:** [discord.gg/pindown](https://discord.gg/pindown)
- 📧 **Email:** support@pindown.ai
- 🐛 **Issues:** [GitHub Issues](https://github.com/your-org/pindown-ai/issues)

---

**Happy automating!** 🚀`,
    lastModified: "30 minutes ago",
    createdAt: "2024-12-06",
    author: "PinDown AI Team",
    views: 1250,
    metadata: {
      category: "Setup Guide",
      readTime: "10 min read",
      tags: ["setup", "installation", "getting started", "automation", "guide"]
    }
  }
]

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
  const [pin, setPin] = useState<Pin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTocVisible, setIsTocVisible] = useState(false)

  useEffect(() => {
    // In real app, this would be an API call
    const foundPin = mockPins.find(p => p.id === pinId)
    setPin(foundPin || null)
    setIsLoading(false)
  }, [pinId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (!pin) {
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
              <div className="h-8 w-8 bg-foreground text-background rounded-lg flex items-center justify-center">
                <Pin className="h-4 w-4 rotate-45" />
              </div>
              <span className="font-semibold text-lg">pindown.ai</span>
            </div>
            <div className="flex items-center space-x-3">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-6 bg-transparent">
            <div className="space-y-4">
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
