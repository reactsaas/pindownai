"use client";

import Link from "next/link";
import { Pin, MessageSquare, Zap, FileText, Code, Server, Bot, Image, Database, ArrowRight, Brain, Search, Globe, Key, Shield } from "lucide-react";
import { PricingSection } from "@/components/pricing-section";
import { useInView } from "react-intersection-observer";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";

function LiveValue({ value }: { value: string | number }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (value !== displayValue) {
      setIsUpdating(true);
      setDisplayValue(value);
      const timer = setTimeout(() => setIsUpdating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span className={`live-value ${isUpdating ? 'updating' : ''}`}>
      {displayValue}
    </span>
  );
}

function LiveAutomationReport() {
  const [ref, isInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [stats, setStats] = useState({
    lastUpdate: new Date(),
    databases: {
      airtable: { processed: 1245, total: 1500 },
      mongodb: { processed: 8932, total: 10000 },
      postgres: { processed: 15677, total: 15677 }
    },
    pipelines: {
      processed: 4521,
      failed: 23,
      avgTime: 2.4,
      queueSize: 156
    },
    nextMeeting: {
      time: "15:30",
      topic: "Weekly Progress Review",
      minutesUntil: 45
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        lastUpdate: new Date(),
        databases: {
          airtable: {
            processed: Math.min(prev.databases.airtable.processed + Math.floor(Math.random() * 20 + 5), prev.databases.airtable.total),
            total: prev.databases.airtable.total
          },
          mongodb: {
            processed: Math.min(prev.databases.mongodb.processed + Math.floor(Math.random() * 30 + 10), prev.databases.mongodb.total),
            total: prev.databases.mongodb.total
          },
          postgres: prev.databases.postgres
        },
        pipelines: {
          processed: prev.pipelines.processed + Math.floor(Math.random() * 5 + 1),
          failed: prev.pipelines.failed + (Math.random() > 0.9 ? 1 : 0),
          avgTime: Number((prev.pipelines.avgTime + (Math.random() * 0.2 - 0.1)).toFixed(1)),
          queueSize: Math.max(0, prev.pipelines.queueSize + Math.floor(Math.random() * 7 - 3))
        },
        nextMeeting: {
          ...prev.nextMeeting,
          minutesUntil: Math.max(0, prev.nextMeeting.minutesUntil - 1/60)
        }
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatMinutes = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div ref={ref} className={`transition-all duration-1000 ease-out ${
      isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
    }`}>
      <div className="p-6 border border-border/50 rounded-xl bg-muted/20 backdrop-blur-sm relative">
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold">Daily Automation Report</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Generated: Today at 14:30 UTC • Last Update: <LiveValue value={`${Math.floor((new Date().getTime() - stats.lastUpdate.getTime()) / 1000)}s ago`} />
            </p>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <p>
              Our automated data synchronization is currently active across multiple databases. 
              The Airtable integration has processed <span className="text-foreground"><LiveValue value={`${Math.round((stats.databases.airtable.processed / stats.databases.airtable.total) * 100)}%`} /></span> of records, 
              while MongoDB sync is at <span className="text-foreground"><LiveValue value={`${Math.round((stats.databases.mongodb.processed / stats.databases.mongodb.total) * 100)}%`} /></span> completion. 
              The Postgres migration has successfully completed, ensuring all analytics data is ready for processing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/10">
              <h3 className="text-sm font-medium mb-3">Data Processing</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Airtable</span>
                  <LiveValue value={`${Math.round((stats.databases.airtable.processed / stats.databases.airtable.total) * 100)}%`} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">MongoDB</span>
                  <LiveValue value={`${Math.round((stats.databases.mongodb.processed / stats.databases.mongodb.total) * 100)}%`} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Postgres</span>
                  <LiveValue value="Complete" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/10">
              <h3 className="text-sm font-medium mb-3">Pipeline Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processed</span>
                  <LiveValue value={stats.pipelines.processed.toLocaleString()} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Queue Size</span>
                  <LiveValue value={stats.pipelines.queueSize} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Time</span>
                  <LiveValue value={`${stats.pipelines.avgTime}s`} />
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <p>
              The data pipeline has successfully processed <span className="text-foreground"><LiveValue value={stats.pipelines.processed.toLocaleString()} /></span> records 
              with an average processing time of <span className="text-foreground"><LiveValue value={`${stats.pipelines.avgTime}s`} /></span> per record. 
              Currently, <span className="text-foreground"><LiveValue value={stats.pipelines.queueSize} /></span> items remain in the processing queue, 
              indicating a healthy throughput rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResearchReport() {
  const [stats, setStats] = useState({
    insights: {
      mainFinding: "Strong shift towards mobile-first experiences",
      marketTrend: "Increasing demand for AI-powered features",
      userBehavior: "Growing preference for self-service onboarding",
      challenge: "Integration complexity remains a concern"
    },
    recommendations: [
      "Focus on mobile optimization",
      "Expand AI capabilities",
      "Improve self-service flows",
      "Simplify integration process"
    ],
    segments: {
      emerging: "Small businesses showing rapid adoption",
      growing: "Mid-market companies increasing usage",
      enterprise: "Enterprise clients expanding deployments"
    },
    keyInsights: [
      { category: "User Experience", finding: "Simplified workflows drive adoption" },
      { category: "Integration", finding: "API-first approach gains traction" },
      { category: "Security", finding: "Enhanced compliance features requested" }
    ]
  });

  useEffect(() => {
    const insights = [
      // Market Trends
      ["Growing focus on automation capabilities", "Increasing demand for AI features", "Rising interest in workflow automation"],
      // User Behavior
      ["Preference for self-service solutions", "Demand for mobile-first experiences", "Focus on collaborative features"],
      // Challenges
      ["Integration complexity concerns", "Security compliance requirements", "Scalability considerations"],
      // Opportunities
      ["Untapped small business market", "Enterprise expansion potential", "Cross-platform integration demand"]
    ];

    const segments = [
      // Emerging
      ["Startups showing rapid adoption", "Small businesses increasing usage", "New market segments emerging"],
      // Growing
      ["Mid-market adoption accelerating", "Industry vertical expansion", "Regional market growth"],
      // Enterprise
      ["Enterprise clients scaling usage", "Department-wide deployments", "Global account expansion"]
    ];

    const findings = [
      // User Experience
      ["Simplified workflows drive adoption", "Intuitive interfaces preferred", "Self-service gaining popularity"],
      // Integration
      ["API-first approach succeeding", "Webhook integration demand rising", "Custom integration requests increasing"],
      // Security
      ["Enhanced security features needed", "Compliance requirements growing", "Data privacy focus increasing"]
    ];

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        insights: {
          mainFinding: insights[0][Math.floor(Math.random() * insights[0].length)],
          marketTrend: insights[1][Math.floor(Math.random() * insights[1].length)],
          userBehavior: insights[2][Math.floor(Math.random() * insights[2].length)],
          challenge: insights[3][Math.floor(Math.random() * insights[3].length)]
        },
        segments: {
          emerging: segments[0][Math.floor(Math.random() * segments[0].length)],
          growing: segments[1][Math.floor(Math.random() * segments[1].length)],
          enterprise: segments[2][Math.floor(Math.random() * segments[2].length)]
        },
        keyInsights: [
          { category: "User Experience", finding: findings[0][Math.floor(Math.random() * findings[0].length)] },
          { category: "Integration", finding: findings[1][Math.floor(Math.random() * findings[1].length)] },
          { category: "Security", finding: findings[2][Math.floor(Math.random() * findings[2].length)] }
        ]
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold">Market Research</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Real-time market analysis and emerging trends
        </p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div className="p-4 rounded-lg bg-muted/10">
          <h3 className="text-sm font-medium mb-3">Key Market Insights</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Our latest analysis reveals a significant trend: <span className="text-foreground"><LiveValue value={stats.insights.mainFinding} /></span>. 
              Market research indicates <span className="text-foreground"><LiveValue value={stats.insights.marketTrend} /></span>, 
              while user research shows <span className="text-foreground"><LiveValue value={stats.insights.userBehavior} /></span>. 
              However, <span className="text-foreground"><LiveValue value={stats.insights.challenge} /></span>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/10">
          <h3 className="text-sm font-medium mb-3">Market Segments</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Emerging Markets</div>
              <div><LiveValue value={stats.segments.emerging} /></div>
            </div>
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Growth Segment</div>
              <div><LiveValue value={stats.segments.growing} /></div>
            </div>
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Enterprise Status</div>
              <div><LiveValue value={stats.segments.enterprise} /></div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/10">
          <h3 className="text-sm font-medium mb-3">Latest Findings</h3>
          <div className="space-y-3">
            {stats.keyInsights.map((insight, idx) => (
              <div key={idx} className="text-sm">
                <div className="text-muted-foreground mb-1">{insight.category}</div>
                <div><LiveValue value={insight.finding} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div className="p-4 rounded-lg bg-muted/10">
          <h3 className="text-sm font-medium mb-3">Market Analysis</h3>
          <div className="space-y-3 text-muted-foreground">
            <p>
              The market landscape continues to evolve, with <span className="text-foreground"><LiveValue value={stats.segments.emerging} /></span>. 
              In the mid-market segment, we're observing that <span className="text-foreground"><LiveValue value={stats.segments.growing} /></span>. 
              Enterprise adoption shows promising trends as <span className="text-foreground"><LiveValue value={stats.segments.enterprise} /></span>.
            </p>
            <p>
              Key findings in user experience indicate that <span className="text-foreground"><LiveValue value={stats.keyInsights[0].finding} /></span>, 
              while integration patterns show <span className="text-foreground"><LiveValue value={stats.keyInsights[1].finding} /></span>. 
              Security considerations reveal <span className="text-foreground"><LiveValue value={stats.keyInsights[2].finding} /></span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleExample() {
  const [stats, setStats] = useState({
    readTime: "8 min read",
    author: "Sarah Chen",
    publishDate: "December 2024",
    category: "Technology Trends",
    revenue: 45670,
    customers: 1834,
    conversion: 12.4,
    uptime: 99.8
  });

  useEffect(() => {
    const articles = [
      {
        category: "Technology Trends",
        author: "Sarah Chen",
        readTime: "8 min read",
        revenue: 45670,
        customers: 1834,
        conversion: 12.4,
        uptime: 99.8
      },
      {
        category: "Digital Marketing",
        author: "Marcus Rodriguez", 
        readTime: "6 min read",
        revenue: 38920,
        customers: 1567,
        conversion: 9.8,
        uptime: 99.9
      },
      {
        category: "Product Strategy",
        author: "Jessica Wu",
        readTime: "12 min read", 
        revenue: 52340,
        customers: 2145,
        conversion: 15.2,
        uptime: 99.7
      }
    ];

    const interval = setInterval(() => {
      const randomArticle = articles[Math.floor(Math.random() * articles.length)];
      setStats(prev => ({
        ...prev,
        ...randomArticle,
        revenue: randomArticle.revenue + Math.floor(Math.random() * 1000 - 500),
        customers: randomArticle.customers + Math.floor(Math.random() * 50 - 25),
        conversion: Math.max(0, randomArticle.conversion + (Math.random() * 2 - 1)),
        uptime: Math.max(99.0, Math.min(100, randomArticle.uptime + (Math.random() * 0.4 - 0.2)))
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">The Future of Remote Work: AI-Powered Collaboration</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>By <LiveValue value={stats.author} /></span>
              <span>•</span>
              <span><LiveValue value={stats.readTime} /></span>
              <span>•</span>
              <span><LiveValue value={stats.publishDate} /></span>
            </div>
            <div className="inline-flex px-3 py-1 bg-muted/30 rounded-full text-xs font-medium">
              <LiveValue value={stats.category} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>

      <div className="prose prose-sm text-muted-foreground leading-relaxed">
        <p>
          As organizations continue to embrace distributed teams, the integration of artificial intelligence 
          into collaboration tools is reshaping how we work together across time zones and cultures. 
          Recent studies show that <strong className="text-foreground">AI-enhanced workflows</strong> can 
          improve team productivity by up to 40% while reducing meeting fatigue.
        </p>
        
        <p>
          The shift toward <em>asynchronous collaboration</em> is particularly evident in software development, 
          where AI-powered code review and automated documentation generation are becoming standard practice. 
          This transformation isn't just about efficiency—it's about creating more inclusive work environments 
          where diverse perspectives can contribute meaningfully to shared outcomes.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/10 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold">
            $<LiveValue value={stats.revenue.toLocaleString()} />
          </div>
          <div className="text-xs text-muted-foreground">Monthly Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            <LiveValue value={stats.customers.toLocaleString()} />
          </div>
          <div className="text-xs text-muted-foreground">Active Customers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            <LiveValue value={stats.conversion.toFixed(1)} />%
          </div>
          <div className="text-xs text-muted-foreground">Conversion Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            <LiveValue value={stats.uptime.toFixed(1)} />%
          </div>
          <div className="text-xs text-muted-foreground">System Uptime</div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Business metrics update in real-time • Data from your automation workflows
      </div>
    </div>
  );
}

function Top5List() {
  const [stats, setStats] = useState({
    category: "Most Active Features",
    items: [
      { name: "Data Processing", score: 982, trend: "Growing adoption in enterprise", change: "+12%" },
      { name: "API Integration", score: 875, trend: "High developer satisfaction", change: "+8%" },
      { name: "Analytics Dashboard", score: 754, trend: "Increased daily usage", change: "-3%" },
      { name: "Workflow Builder", score: 687, trend: "Popular among new users", change: "+15%" },
      { name: "Team Collaboration", score: 543, trend: "Strong growth in large teams", change: "+5%" }
    ],
    categories: [
      {
        name: "Most Active Features",
        trends: [
          "Growing adoption in enterprise",
          "High developer satisfaction",
          "Increased daily usage",
          "Popular among new users",
          "Strong growth in large teams",
          "Positive user feedback",
          "Rising engagement metrics"
        ]
      },
      {
        name: "Top User Requests",
        trends: [
          "Better mobile experience",
          "Advanced search capabilities",
          "Custom reporting options",
          "Enhanced security features",
          "Improved documentation",
          "More integration options",
          "Offline capabilities"
        ]
      },
      {
        name: "Growing Markets",
        trends: [
          "Enterprise adoption rising",
          "SMB segment expanding",
          "New vertical penetration",
          "International growth",
          "Partner ecosystem growing",
          "Developer community active",
          "Education sector emerging"
        ]
      }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        // Get current category index
        const currentCategoryIndex = prev.categories.findIndex(c => c.name === prev.category);
        // Get next category
        const nextCategoryIndex = (currentCategoryIndex + 1) % prev.categories.length;
        const nextCategory = prev.categories[nextCategoryIndex];

        // Update items with new scores and trends
        const updatedItems = prev.items.map(item => ({
          ...item,
          score: item.score + Math.floor(Math.random() * 40 - 20),
          trend: nextCategory.trends[Math.floor(Math.random() * nextCategory.trends.length)],
          change: `${Math.random() > 0.5 ? "+" : "-"}${Math.floor(Math.random() * 15)}%`
        }));

        // Sort by new scores
        updatedItems.sort((a, b) => b.score - a.score);

        return {
          ...prev,
          category: nextCategory.name,
          items: updatedItems
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold">Top 5 Rankings</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <LiveValue value={stats.category} />
        </p>
      </div>

      <div className="space-y-4">
        {stats.items.map((item, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-muted/10">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-muted-foreground w-12">
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-sm ${
                    item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <LiveValue value={item.change} />
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <LiveValue value={item.trend} />
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted/50 overflow-hidden">
                  <div 
                    className="h-full bg-foreground/50 transition-all duration-500" 
                    style={{ width: `${(item.score / stats.items[0].score) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Rankings update every few seconds • Based on real-time analytics
      </div>
    </div>
  );
}

function ExampleReports() {
  return (
    <div className="max-w-3xl w-full">
      <div className="text-center mb-8">
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="relative w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center overflow-hidden">
            <Pin className="w-10 h-10 text-muted-foreground relative z-10 rotate-45" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/15 to-transparent animate-[wave_3s_ease-in-out_infinite] rounded-full"></div>
          </div>
          <h2 className="text-2xl font-medium bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Realtime Dynamic Pins</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform raw data into beautiful, formatted <strong>pins</strong> using template variables and text that is shaped by AI based on your data.
        </p>
      </div>
      
      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="automation" className="flex-1">Automation Outputs</TabsTrigger>
          <TabsTrigger value="research" className="flex-1">Research</TabsTrigger>
          <TabsTrigger value="article" className="flex-1">Article</TabsTrigger>
          <TabsTrigger value="top5" className="flex-1">Top 5 List</TabsTrigger>
        </TabsList>
        <TabsContent value="automation">
          <LiveAutomationReport />
        </TabsContent>
        <TabsContent value="research">
          <ResearchReport />
        </TabsContent>
        <TabsContent value="article">
          <ArticleExample />
        </TabsContent>
        <TabsContent value="top5">
          <Top5List />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Home() {
  const [pricingRef, isPricingInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [researchRef, isResearchInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [apiKeysRef, isApiKeysInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [integrationsRef, isIntegrationsInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [transformationRef, isTransformationInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [pinShareRef, isPinShareInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [automationStackRef, isAutomationStackInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [exampleReportsRef, isExampleReportsInView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  return (
    <div>
      {/* Theme Toggle - Fixed in top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Hero section - Full viewport height */}
      <div className="min-h-screen flex items-center justify-center p-8 sm:p-20">
        <div className="flex flex-col gap-8 items-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center relative overflow-hidden">
              <Pin className="w-6 h-6 text-primary-foreground animate-[pin-drop_1.2s_ease-out_forwards]" />
            </div>
            <h1 className="text-4xl font-bold">pindown.ai</h1>
          </div>
                      <p className="text-xl text-center text-muted-foreground max-w-lg">
              Pin down your automation outputs. Transform raw data into information that everyone can understand.
            </p>
          
          <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
            <Link
              href="/login"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              <Pin className="w-4 h-4 rotate-45" />
              Get Started
            </Link>
            <Link
              href="/chat"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Docs
            </Link>
          </div>
        </div>
      </div>

      {/* Intelligent Dynamic Pins Section - First after hero */}
      <div 
        ref={exampleReportsRef}
        className={`py-16 sm:py-20 px-6 sm:px-12 bg-background transition-all duration-1000 ease-out ${
          isExampleReportsInView 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="flex flex-col items-center">
          <ExampleReports />
        </div>
      </div>



      {/* Code Setup Section */}
      <div className="py-16 sm:py-20 px-6 sm:px-12 bg-muted/10">
        <div className="flex flex-col items-center">
          <div className="max-w-6xl w-full">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Code Examples with Tabs */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">Update Pin Data</div>
                
                <Tabs defaultValue="curl" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="curl">
                    <div className="bg-muted/50 p-6 rounded-lg text-sm font-mono overflow-auto h-96 relative group">
                      <button 
                        className="absolute top-2 right-2 p-2 bg-background/80 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => navigator.clipboard.writeText(`curl -X PUT https://api.pindown.ai/pins/pin_123 -H "Content-Type: application/json" -H "Authorization: Bearer $API_KEY" -d '{"liveData":{"automation":{"status":"completed","recordsProcessed":1500,"progress":100},"performance":{"cpu":23.5,"memory":45.2}}}'`)}
                      >
                        📋
                      </button>
                      <div className="text-muted-foreground"># Update your pin with live data</div>
                      <div className="mt-2">
                        curl -X PUT \
                      </div>
                      <div className="ml-2">
                        https://api.pindown.ai/pins/pin_123 \
                      </div>
                      <div className="ml-2">
                        -H "Content-Type: application/json" \
                      </div>
                      <div className="ml-2">
                        -H "Authorization: Bearer $API_KEY" \
                      </div>
                      <div className="ml-2">
                        -d '&#123;
                      </div>
                      <div className="ml-4">
                        "liveData": &#123;
                      </div>
                      <div className="ml-6">
                        "automation": &#123;
                      </div>
                      <div className="ml-8">
                        "status": "completed",
                      </div>
                      <div className="ml-8">
                        "recordsProcessed": 1500,
                      </div>
                      <div className="ml-8">
                        "progress": 100
                      </div>
                      <div className="ml-6">&#125;,</div>
                      <div className="ml-6">
                        "performance": &#123;
                      </div>
                      <div className="ml-8">
                        "cpu": 23.5,
                      </div>
                      <div className="ml-8">
                        "memory": 45.2
                      </div>
                      <div className="ml-6">&#125;</div>
                      <div className="ml-4">&#125;</div>
                      <div className="ml-2">&#125;'</div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="nodejs">
                    <div className="bg-muted/50 p-6 rounded-lg text-sm font-mono overflow-auto h-96 relative group">
                      <button 
                        className="absolute top-2 right-2 p-2 bg-background/80 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => navigator.clipboard.writeText(`const axios = require('axios');\n\nconst response = await axios.put(\n  'https://api.pindown.ai/pins/pin_123',\n  {\n    liveData: {\n      automation: {\n        status: 'completed',\n        recordsProcessed: 1500,\n        progress: 100\n      },\n      performance: {\n        cpu: 23.5,\n        memory: 45.2\n      }\n    }\n  },\n  {\n    headers: {\n      'Authorization': \`Bearer \${API_KEY}\`\n    }\n  }\n);`)}
                      >
                        📋
                      </button>
                      <div className="text-muted-foreground">// Update pin with axios</div>
                      <div className="mt-2">
                        const axios = require('axios');
                      </div>
                      <div className="mt-2">
                        const response = await axios.put(
                      </div>
                      <div className="ml-2">
                        'https://api.pindown.ai/pins/pin_123',
                      </div>
                      <div className="ml-2">
                        &#123;
                      </div>
                      <div className="ml-4">
                        liveData: &#123;
                      </div>
                      <div className="ml-6">
                        automation: &#123;
                      </div>
                      <div className="ml-8">
                        status: 'completed',
                      </div>
                      <div className="ml-8">
                        recordsProcessed: 1500,
                      </div>
                      <div className="ml-8">
                        progress: 100
                      </div>
                      <div className="ml-6">&#125;,</div>
                      <div className="ml-6">
                        performance: &#123;
                      </div>
                      <div className="ml-8">
                        cpu: 23.5,
                      </div>
                      <div className="ml-8">
                        memory: 45.2
                      </div>
                      <div className="ml-6">&#125;</div>
                      <div className="ml-4">&#125;</div>
                      <div className="ml-2">&#125;,</div>
                      <div className="ml-2">
                        &#123;
                      </div>
                      <div className="ml-4">
                        headers: &#123;
                      </div>
                      <div className="ml-6">
                        'Authorization': `Bearer $&#123;API_KEY&#125;`
                      </div>
                      <div className="ml-4">&#125;</div>
                      <div className="ml-2">&#125;</div>
                      <div>
                        );
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="python">
                    <div className="bg-muted/50 p-6 rounded-lg text-sm font-mono overflow-auto h-96 relative group">
                      <button 
                        className="absolute top-2 right-2 p-2 bg-background/80 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={() => navigator.clipboard.writeText(`import requests\n\nresponse = requests.put(\n    'https://api.pindown.ai/pins/pin_123',\n    json={\n        'liveData': {\n            'automation': {\n                'status': 'completed',\n                'recordsProcessed': 1500,\n                'progress': 100\n            },\n            'performance': {\n                'cpu': 23.5,\n                'memory': 45.2\n            }\n        }\n    },\n    headers={\n        'Authorization': f'Bearer {API_KEY}'\n    }\n)`)}
                      >
                        📋
                      </button>
                      <div className="text-muted-foreground"># Update pin with requests</div>
                      <div className="mt-2">
                        import requests
                      </div>
                      <div className="mt-2">
                        response = requests.put(
                      </div>
                      <div className="ml-4">
                        'https://api.pindown.ai/pins/pin_123',
                      </div>
                      <div className="ml-4">
                        json=&#123;
                      </div>
                      <div className="ml-8">
                        'liveData': &#123;
                      </div>
                      <div className="ml-12">
                        'automation': &#123;
                      </div>
                      <div className="ml-16">
                        'status': 'completed',
                      </div>
                      <div className="ml-16">
                        'recordsProcessed': 1500,
                      </div>
                      <div className="ml-16">
                        'progress': 100
                      </div>
                      <div className="ml-12">&#125;,</div>
                      <div className="ml-12">
                        'performance': &#123;
                      </div>
                      <div className="ml-16">
                        'cpu': 23.5,
                      </div>
                      <div className="ml-16">
                        'memory': 45.2
                      </div>
                      <div className="ml-12">&#125;</div>
                      <div className="ml-8">&#125;</div>
                      <div className="ml-4">&#125;,</div>
                      <div className="ml-4">
                        headers=&#123;
                      </div>
                      <div className="ml-8">
                        'Authorization': f'Bearer &#123;API_KEY&#125;'
                      </div>
                      <div className="ml-4">&#125;</div>
                      <div>
                        )
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
                              {/* How to Use */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">How It Works</div>
                <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-6 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">1. Create Your Pin</h4>
                      <p className="text-sm text-muted-foreground">
                        First, create a pin with template variables. Your pin acts as a live dashboard that updates automatically when you send new data.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">2. Send Live Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the API endpoint with your pin ID to update variables. Perfect for automation scripts, webhooks, or scheduled jobs that need to report status.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">3. Instant Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Anyone viewing your pin sees updates immediately. No refresh needed. Share the link with your team for real-time visibility into your workflows.
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      Works with any automation tool or custom script
                    </div>
                  </div>
                </div>
                
                {/* Common Use Cases */}
                <div className="space-y-3 mt-6">
                  <div className="text-sm font-medium text-muted-foreground">Common Use Cases</div>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-background border rounded-lg">
                      <div className="text-sm font-medium">CI/CD Pipeline Status</div>
                      <div className="text-xs text-muted-foreground">Update deployment progress, test results, and build metrics</div>
                    </div>
                    
                    <div className="p-3 bg-background border rounded-lg">
                      <div className="text-sm font-medium">Server Monitoring</div>
                      <div className="text-xs text-muted-foreground">Send CPU, memory, and performance data from monitoring scripts</div>
                    </div>
                    
                    <div className="p-3 bg-background border rounded-lg">
                      <div className="text-sm font-medium">Data Processing Jobs</div>
                      <div className="text-xs text-muted-foreground">Track ETL progress, record counts, and processing status</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Built for Real Teams Section */}
      <div 
        ref={pinShareRef}
        className={`py-20 sm:py-24 px-6 sm:px-12 transition-all duration-1000 ease-out ${
          isPinShareInView 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="max-w-6xl w-full">
            <div className="text-center mb-16">
              <h2 className="text-2xl font-medium mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Built for Real Teams, Real Workflows</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Create shareable pages from your automation workflows that keep teams informed and stakeholders updated.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="p-6 border border-border/50 rounded-xl hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
               <div className="flex items-center gap-3 mb-4">
                 <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">CI</div>
                 <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">API</div>
               </div>
               <h3 className="font-medium mb-3 text-lg">For DevOps & SRE Teams</h3>
               <p className="text-sm text-muted-foreground mb-6"><span className="text-primary font-medium">CI/CD logs</span>, <span className="text-primary font-medium">deployment metrics</span>, and <span className="text-primary font-medium">incident alerts</span>. Stop explaining pipeline outputs to PMs. Get automatic incident summaries that actually make sense.</p>

             </div>
             
             <div className="p-6 border border-border/50 rounded-xl hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
               <div className="flex items-center gap-3 mb-4">
                 <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">DOC</div>
                 <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">OPS</div>
               </div>
               <h3 className="font-medium mb-3 text-lg">For Automation Hackers</h3>
               <p className="text-sm text-muted-foreground mb-6"><span className="text-primary font-medium">Scripts</span>, <span className="text-primary font-medium">n8n flows</span>, and <span className="text-primary font-medium">automation outputs</span>. Stop building ugly Google Docs. Turn automation outputs into client-ready reports instantly.</p>

             </div>

             <div className="p-6 border border-border/50 rounded-xl hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
               <div className="flex items-center gap-3 mb-4">
                 <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">RESEARCH</div>
                 <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">SHARE</div>
               </div>
               <h3 className="font-medium mb-3 text-lg">Information Tracking & Research</h3>
               <p className="text-sm text-muted-foreground mb-6"><span className="text-primary font-medium">Market research</span>, <span className="text-primary font-medium">competitive analysis</span>, and <span className="text-primary font-medium">data insights</span>. Transform complex research data and analysis into digestible reports for stakeholders and collaborators.</p>

             </div>
           </div>
         </div>
       </div>
     </div>

      {/* Transformation Visualization Section */}
      {/* 
      <div 
        ref={transformationRef}
        className={`py-16 sm:py-20 px-6 sm:px-12 bg-muted/20 transition-all duration-1000 ease-out ${
          isTransformationInView 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-medium mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">From Raw Data to Human Stories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Transform raw logs, metrics, and automation outputs into polished markdown reports that everyone can understand and act upon.
              </p>
            </div>
            
            <div className="relative w-full max-w-2xl mx-auto h-80 flex items-center justify-center">
              {/* Center Brain */}
              {/*
              <div className="flex flex-col items-center z-10">
                <div className="relative w-28 h-28 bg-muted/20 rounded-full flex items-center justify-center overflow-hidden">
                  <Brain className="w-18 h-18 text-muted-foreground relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/15 to-transparent animate-[wave_3s_ease-in-out_infinite] rounded-full"></div>
                </div>
                <div className="text-sm font-medium text-muted-foreground mt-3">AI Shaping</div>
              </div>
              */}
              
                             {/* Data Sources arranged in a circle */}
              {/* Top Left */}
              {/*
              <div className="absolute top-8 left-16 flex flex-col items-center p-3">
                <FileText className="w-6 h-6 text-muted-foreground mb-1" />
                <div className="text-xs text-center text-muted-foreground font-medium">Logs</div>
              </div>
              */}
              
              {/* Top Right */}
              {/*
              <div className="absolute top-8 right-16 flex flex-col items-center p-3">
                <Code className="w-6 h-6 text-muted-foreground mb-1" />
                <div className="text-xs text-center text-muted-foreground font-medium">APIs</div>
              </div>
              */}
              
              {/* Middle Left */}
              {/*
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-3">
                <Bot className="w-6 h-6 text-muted-foreground mb-1" />
                <div className="text-xs text-center text-muted-foreground font-medium">Automation</div>
              </div>
              */}
              
              {/* Middle Right */}
              {/*
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center p-3">
                <Server className="w-6 h-6 text-muted-foreground mb-1" />
                <div className="text-xs text-center text-muted-foreground font-medium">Metrics</div>
              </div>
              */}
              
              {/* Bottom Left */}
              {/*
              <div className="absolute bottom-8 left-16 flex flex-col items-center p-3">
                <Database className="w-6 h-6 text-muted-foreground mb-1" />
                <div className="text-xs text-center text-muted-foreground font-medium">Database</div>
              </div>
              */}
              
              {/* Bottom Right */}
              {/*
              <div className="absolute bottom-8 right-16 flex flex-col items-center p-3">
                <Image className="w-6 h-6 text-muted-foreground mb-1" />
                <div className="text-xs text-center text-muted-foreground font-medium">Images</div>
              </div>
           </div>

           <div className="mt-12 text-center">
             <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
               <ArrowRight className="w-4 h-4" />
               <span>Intelligent Processing</span>
               <ArrowRight className="w-4 h-4" />
               <span>Clean Reports</span>
             </div>
           </div>
         </div>
       </div>
     </div>
     */}





      {/* Automation Integration Section */}
      <div 
        ref={automationStackRef}
        className={`py-16 sm:py-20 px-6 sm:px-12 bg-muted/10 transition-all duration-1000 ease-out ${
          isAutomationStackInView 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="max-w-4xl w-full text-center">
            <div className="mb-12">
              <h2 className="text-2xl font-medium mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Works with Your Automation Stack</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Connect any automation tool or script output. Transform your workflow data into pins instantly.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="p-6 border border-border/50 rounded-xl bg-background/50 hover:bg-background hover:border-border transition-all duration-300 hover:scale-105">
                <div className="text-lg font-medium mb-2">n8n</div>
                <div className="text-xs text-muted-foreground">Workflow outputs</div>
              </div>
              <div className="p-6 border border-border/50 rounded-xl bg-background/50 hover:bg-background hover:border-border transition-all duration-300 hover:scale-105">
                <div className="text-lg font-medium mb-2">Make.com</div>
                <div className="text-xs text-muted-foreground">Scenario results</div>
              </div>
              <div className="p-6 border border-border/50 rounded-xl bg-background/50 hover:bg-background hover:border-border transition-all duration-300 hover:scale-105">
                <div className="text-lg font-medium mb-2">Zapier</div>
                <div className="text-xs text-muted-foreground">Zap outputs</div>
              </div>
              <div className="p-6 border border-border/50 rounded-xl bg-background/50 hover:bg-background hover:border-border transition-all duration-300 hover:scale-105">
                <div className="text-lg font-medium mb-2">Custom Scripts</div>
                <div className="text-xs text-muted-foreground">Any JSON/API output</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Webhook endpoints</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span>REST API integration</span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                <span>Direct script outputs</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Other sections */}
       <div className="py-20 sm:py-24 px-8 sm:px-20 bg-muted/10">
         <div className="flex flex-col items-center">
           {/* Pricing Section */}
                       <div 
              ref={pricingRef}
              className={`transition-all duration-1000 ease-out ${
                isPricingInView 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-20 scale-95'
              }`}
            >
              <PricingSection />
            </div>

           {/* Perplexity Research Section */}
           <div 
             ref={researchRef}
             className={`mt-32 max-w-4xl w-full text-center transition-all duration-1000 ease-out ${
               isResearchInView 
                 ? 'opacity-100 translate-y-0' 
                 : 'opacity-0 translate-y-12'
             }`}
           >
             <div className="mb-12">
               <h2 className="text-3xl font-medium mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Power Your Pins with Up-to-Date Research</h2>
               <p className="text-muted-foreground mb-6">Enhance your reports with real-time web research <span className="text-primary font-medium">powered by Perplexity AI</span></p>
               <div className="flex justify-center">
                 <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                   <Search className="w-8 h-8 text-primary relative z-10" />
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[wave_2.5s_ease-in-out_infinite] rounded-full"></div>
                 </div>
               </div>
             </div>
           </div>

           {/* Bring Your Own API Keys Section */}
           <div 
             ref={apiKeysRef}
             className={`mt-32 max-w-5xl w-full transition-all duration-1000 ease-out ${
               isApiKeysInView 
                 ? 'opacity-100 translate-y-0' 
                 : 'opacity-0 translate-y-12'
             }`}
           >
             <div className="relative p-8 border border-border/50 rounded-2xl bg-gradient-to-br from-background to-muted/5">
               <div className="text-center mb-8">
                 <h2 className="text-2xl font-medium">Bring Your Own API Keys</h2>
               </div>
               <div className="flex flex-col lg:flex-row items-center gap-12">
                 {/* Left side - Visual */}
                 <div className="flex-1 flex justify-center">
                   <div className="relative">
                     <div className="w-32 h-32 border-2 border-dashed border-border rounded-2xl flex items-center justify-center bg-muted/20">
                       <Key className="w-16 h-16 text-muted-foreground" />
                     </div>
                     <div className="absolute -top-2 -right-2 w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center">
                       <Shield className="w-4 h-4 text-muted-foreground" />
                     </div>
                   </div>
                 </div>
                 
                 {/* Right side - Content */}
                 <div className="flex-1 space-y-6">
                   <div className="space-y-4">
                     <div className="flex items-start gap-3">
                       <div className="mt-1 w-2 h-2 bg-primary rounded-full"></div>
                       <div>
                         <h4 className="font-medium text-sm">Direct Control & Billing</h4>
                         <p className="text-xs text-muted-foreground">Connect your OpenAI, Anthropic, or Perplexity accounts directly. No markups, transparent costs.</p>
                       </div>
                     </div>
                     
                     <div className="flex items-start gap-3">
                       <div className="mt-1 w-2 h-2 bg-primary rounded-full"></div>
                       <div>
                         <h4 className="font-medium text-sm">Enterprise Security</h4>
                         <p className="text-xs text-muted-foreground">Zero-trust architecture. Your keys are encrypted and never accessible to our platform.</p>
                       </div>
                     </div>
                     
                     <div className="flex items-start gap-3">
                       <div className="mt-1 w-2 h-2 bg-primary rounded-full"></div>
                       <div>
                         <h4 className="font-medium text-sm">Multi-Provider Support</h4>
                         <p className="text-xs text-muted-foreground">Works with all major AI providers and custom endpoints. Switch anytime.</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="pt-4 border-t border-border/30">
                     <div className="flex flex-wrap gap-2">
                       <span className="px-2 py-1 bg-muted/50 rounded text-xs font-mono">OpenAI</span>
                       <span className="px-2 py-1 bg-muted/50 rounded text-xs font-mono">Anthropic</span>
                       <span className="px-2 py-1 bg-muted/50 rounded text-xs font-mono">Perplexity</span>
                       <span className="px-2 py-1 bg-muted/50 rounded text-xs font-mono">Google</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>


          
                     <footer className="mt-20 pt-12 border-t border-border/20 flex gap-6 flex-wrap items-center justify-center">
             <p className="text-sm text-muted-foreground">
               No more manual summaries or screenshots • Built for DevOps teams and automation hackers
             </p>
           </footer>
        </div>
      </div>
    </div>
  );
}