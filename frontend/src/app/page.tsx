"use client";

import Link from "next/link";
import { Pin, MessageSquare, Zap, FileText, Code, Server, Bot, Image, Database, ArrowRight, ArrowDown, Brain, Search, Globe, Key, Shield, Share2, Eye, Users } from "lucide-react";
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

function TypingEffect() {
  const [showText, setShowText] = useState(true);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Pin Your Data';
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (showText) {
      // Typing effect
      if (currentIndex < fullText.length) {
        const timer = setTimeout(() => {
          setDisplayedText(fullText.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, 100);
        return () => clearTimeout(timer);
      } else {
        // Wait a bit, then switch to pin
        const timer = setTimeout(() => {
          setShowText(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      // Show pin for a bit, then restart
      const timer = setTimeout(() => {
        setShowText(true);
        setDisplayedText('');
        setCurrentIndex(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showText, currentIndex]);

  return (
    <div className="relative bg-transparent">
      {showText ? (
        <div className="text-4xl font-semibold text-foreground bg-transparent">
          {displayedText}
          <span className="animate-pulse ml-1">|</span>
        </div>
      ) : (
        <div className="bg-transparent">
          <Pin className="w-20 h-20 text-foreground rotate-45" />
        </div>
      )}
    </div>
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

function DataAnalysis() {
  const [analysis, setAnalysis] = useState({
    category: "Revenue Analysis",
    metrics: [
      { name: "Monthly Revenue", value: "$127,450", trend: "Strong growth trajectory", change: "+18.2%", type: "currency" },
      { name: "Active Users", value: "12,847", trend: "Steady user acquisition", change: "+8.5%", type: "number" },
      { name: "Conversion Rate", value: "3.24%", trend: "Above industry average", change: "+0.3%", type: "percentage" },
      { name: "Churn Rate", value: "2.1%", trend: "Low churn indicates satisfaction", change: "-0.8%", type: "percentage" },
      { name: "Avg. Session Duration", value: "4m 32s", trend: "High engagement levels", change: "+12s", type: "duration" }
    ],
    categories: [
      {
        name: "Revenue Analysis",
        insights: [
          "Strong growth trajectory",
          "Above industry benchmarks",
          "Seasonal patterns detected",
          "Premium tier driving growth",
          "Enterprise segment expanding",
          "Geographic expansion successful",
          "Product-market fit achieved"
        ]
      },
      {
        name: "User Behavior",
        insights: [
          "Steady user acquisition",
          "High engagement levels",
          "Mobile usage increasing",
          "Feature adoption growing",
          "Retention rates improving",
          "Social sharing trending up",
          "Community engagement strong"
        ]
      },
      {
        name: "Performance Metrics",
        insights: [
          "Above industry average",
          "Low churn indicates satisfaction",
          "Response times optimized",
          "Uptime exceeding targets",
          "Scalability proven",
          "Security metrics excellent",
          "Customer satisfaction high"
        ]
      }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAnalysis(prev => {
        // Get current category index
        const currentCategoryIndex = prev.categories.findIndex(c => c.name === prev.category);
        // Get next category
        const nextCategoryIndex = (currentCategoryIndex + 1) % prev.categories.length;
        const nextCategory = prev.categories[nextCategoryIndex];

        // Update metrics with new values and insights
        const updatedMetrics = prev.metrics.map(metric => {
          const newInsight = nextCategory.insights[Math.floor(Math.random() * nextCategory.insights.length)];
          
          // Generate realistic changes based on metric type
          let newChange = "";
          if (metric.type === "currency") {
            const change = Math.floor(Math.random() * 20 - 5);
            newChange = change >= 0 ? `+${change}%` : `${change}%`;
          } else if (metric.type === "percentage") {
            const change = (Math.random() * 2 - 1).toFixed(1);
            newChange = change.startsWith('-') ? `${change}%` : `+${change}%`;
          } else if (metric.type === "number") {
            const change = Math.floor(Math.random() * 10 - 2);
            newChange = change >= 0 ? `+${change}%` : `${change}%`;
          } else {
            const change = Math.floor(Math.random() * 30 - 10);
            newChange = change >= 0 ? `+${change}s` : `${change}s`;
          }

          return {
            ...metric,
            trend: newInsight,
            change: newChange
          };
        });

        return {
          ...prev,
          category: nextCategory.name,
          metrics: updatedMetrics
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold">Data Analysis Dashboard</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <LiveValue value={analysis.category} />
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {analysis.metrics.map((metric, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-muted/10">
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-sm text-muted-foreground">{metric.name}</div>
              <div className="text-sm font-semibold text-muted-foreground">
                <LiveValue value={metric.change} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">
              <LiveValue value={metric.value} />
            </div>
            <div className="text-xs text-muted-foreground">
              <LiveValue value={metric.trend} />
            </div>
            <div className="mt-3 h-1 rounded-full bg-muted/50 overflow-hidden">
              <div 
                className="h-full bg-foreground/50 transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(20, 60 + Math.random() * 40))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/5 border border-muted/20">
          <h3 className="font-semibold mb-2">Key Insights</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {analysis.category === "Revenue Analysis" && (
              <>
                <p>• Revenue growth is accelerating with <strong>18.2% month-over-month increase</strong>, indicating strong product-market fit</p>
                <p>• Premium tier adoption is driving <strong>enterprise segment expansion</strong> and geographic growth</p>
                <p>• Seasonal patterns detected show <strong>consistent growth trajectory</strong> across all quarters</p>
                <p>• Product-market fit achieved with <strong>above-industry benchmarks</strong> in key metrics</p>
              </>
            )}
            {analysis.category === "User Behavior" && (
              <>
                <p>• User acquisition remains steady at <strong>8.5% growth</strong> with strong retention rates</p>
                <p>• Mobile usage is <strong>increasing significantly</strong> with improved engagement levels</p>
                <p>• Feature adoption is growing with <strong>high community engagement</strong> and social sharing</p>
                <p>• Average session duration of <strong>4m 32s shows high engagement</strong> and user satisfaction</p>
              </>
            )}
            {analysis.category === "Performance Metrics" && (
              <>
                <p>• Conversion rate of <strong>3.24% exceeds industry benchmarks</strong> by 0.8 percentage points</p>
                <p>• Low churn rate of <strong>2.1% indicates high customer satisfaction</strong> and product value</p>
                <p>• Response times are <strong>optimized with 99.9% uptime</strong> exceeding all targets</p>
                <p>• Security metrics are <strong>excellent with proven scalability</strong> for future growth</p>
              </>
            )}
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/5 border border-muted/20">
          <h3 className="font-semibold mb-2">Recommendations</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {analysis.category === "Revenue Analysis" && (
              <>
                <p>• <strong>Scale marketing efforts</strong> to capitalize on strong conversion metrics</p>
                <p>• <strong>Expand enterprise features</strong> given strong revenue growth trajectory</p>
                <p>• <strong>Invest in geographic expansion</strong> to leverage successful market penetration</p>
                <p>• <strong>Develop premium tier features</strong> to maintain competitive advantage</p>
              </>
            )}
            {analysis.category === "User Behavior" && (
              <>
                <p>• <strong>Optimize mobile experience</strong> to capitalize on increasing mobile usage</p>
                <p>• <strong>Enhance social features</strong> to leverage growing community engagement</p>
                <p>• <strong>Improve onboarding flow</strong> to boost feature adoption rates</p>
                <p>• <strong>Develop retention programs</strong> to maintain high engagement levels</p>
              </>
            )}
            {analysis.category === "Performance Metrics" && (
              <>
                <p>• <strong>Maintain security standards</strong> to preserve excellent security metrics</p>
                <p>• <strong>Scale infrastructure</strong> to support proven scalability requirements</p>
                <p>• <strong>Optimize response times</strong> to maintain competitive performance edge</p>
                <p>• <strong>Invest in monitoring</strong> to ensure continued uptime excellence</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Metrics update every 4 seconds • Real-time business intelligence
      </div>
    </div>
  );
}

function InformationHub() {
  const [hubData, setHubData] = useState({
    category: "Mixed Information",
    items: [
      { type: "task", title: "Review Q4 metrics", status: "pending", priority: "high", time: "Due today" },
      { type: "metric", title: "Project Progress", value: "78%", trend: "On track", icon: "●" },
      { type: "announcement", title: "New client signed", content: "Enterprise deal worth $50K", time: "2 hours ago" },
      { type: "reminder", title: "Team standup", content: "Daily sync at 9 AM", time: "Tomorrow" },
      { type: "metric", title: "Team Productivity", value: "92%", trend: "Above target", icon: "●" },
      { type: "task", title: "Update documentation", status: "in-progress", priority: "medium", time: "This week" },
      { type: "alert", title: "System maintenance", content: "Scheduled downtime", time: "Tomorrow 2 AM" },
      { type: "metric", title: "Budget Utilization", value: "65%", trend: "Within limits", icon: "●" },
      { type: "event", title: "Team retreat planning", content: "Annual company retreat", time: "Next week" },
      { type: "task", title: "Code review", status: "completed", priority: "low", time: "Done" },
      { type: "news", title: "Industry update", content: "New regulations announced", time: "1 day ago" },
      { type: "metric", title: "Customer Satisfaction", value: "4.8/5", trend: "Excellent", icon: "●" }
    ],
    categories: [
      {
        name: "Mixed Information",
        items: [
          { type: "task", title: "Review Q4 metrics", status: "pending", priority: "high", time: "Due today" },
          { type: "metric", title: "Project Progress", value: "78%", trend: "On track", icon: "●" },
          { type: "announcement", title: "New client signed", content: "Enterprise deal worth $50K", time: "2 hours ago" },
          { type: "reminder", title: "Team standup", content: "Daily sync at 9 AM", time: "Tomorrow" },
          { type: "metric", title: "Team Productivity", value: "92%", trend: "Above target", icon: "●" },
          { type: "task", title: "Update documentation", status: "in-progress", priority: "medium", time: "This week" },
          { type: "alert", title: "System maintenance", content: "Scheduled downtime", time: "Tomorrow 2 AM" },
          { type: "metric", title: "Budget Utilization", value: "65%", trend: "Within limits", icon: "●" },
          { type: "event", title: "Team retreat planning", content: "Annual company retreat", time: "Next week" },
          { type: "task", title: "Code review", status: "completed", priority: "low", time: "Done" },
          { type: "news", title: "Industry update", content: "New regulations announced", time: "1 day ago" },
          { type: "metric", title: "Customer Satisfaction", value: "4.8/5", trend: "Excellent", icon: "●" }
        ]
      },
      {
        name: "Work & Life Mix",
        items: [
          { type: "task", title: "Grocery shopping", status: "pending", priority: "medium", time: "This evening" },
          { type: "metric", title: "Steps today", value: "8,432", trend: "Good progress", icon: "●" },
          { type: "reminder", title: "Doctor appointment", content: "Annual checkup", time: "Friday 2 PM" },
          { type: "task", title: "Finish presentation", status: "in-progress", priority: "high", time: "Due tomorrow" },
          { type: "metric", title: "Reading progress", value: "67%", trend: "On track", icon: "●" },
          { type: "event", title: "Friend's birthday", content: "Birthday party", time: "Saturday" },
          { type: "task", title: "Pay bills", status: "pending", priority: "high", time: "This week" },
          { type: "metric", title: "Workout streak", value: "12 days", trend: "Keep it up!", icon: "●" },
          { type: "news", title: "Weather update", content: "Rain expected tomorrow", time: "Just now" },
          { type: "task", title: "Call mom", status: "completed", priority: "medium", time: "Done" },
          { type: "reminder", title: "Car service", content: "Oil change due", time: "Next month" },
          { type: "metric", title: "Sleep quality", value: "7.5h", trend: "Good rest", icon: "●" }
        ]
      },
      {
        name: "Project & Personal",
        items: [
          { type: "task", title: "Deploy to production", status: "pending", priority: "high", time: "Today" },
          { type: "metric", title: "Website traffic", value: "12.4K", trend: "+15%", icon: "●" },
          { type: "announcement", title: "Promotion news", content: "Team lead position", time: "Yesterday" },
          { type: "task", title: "Plan vacation", status: "in-progress", priority: "low", time: "This month" },
          { type: "metric", title: "GitHub commits", value: "23", trend: "Active week", icon: "●" },
          { type: "reminder", title: "Dentist appointment", content: "Regular cleaning", time: "Next Tuesday" },
          { type: "task", title: "Review PRs", status: "pending", priority: "medium", time: "This afternoon" },
          { type: "metric", title: "Learning progress", value: "3/5 courses", trend: "On schedule", icon: "●" },
          { type: "event", title: "Conference call", content: "Client meeting", time: "Tomorrow 3 PM" },
          { type: "task", title: "Update resume", status: "completed", priority: "low", time: "Done" },
          { type: "news", title: "Tech news", content: "New framework released", time: "3 hours ago" },
          { type: "metric", title: "Happiness score", value: "8.5/10", trend: "Great mood", icon: "●" }
        ]
      }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setHubData(prev => {
        const currentCategoryIndex = prev.categories.findIndex(c => c.name === prev.category);
        const nextCategoryIndex = (currentCategoryIndex + 1) % prev.categories.length;
        const nextCategory = prev.categories[nextCategoryIndex];

        return {
          ...prev,
          category: nextCategory.name,
          items: nextCategory.items
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold">Information Hub</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <LiveValue value={hubData.category} />
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hubData.items.map((item, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-muted/10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <div className="font-medium text-sm">{item.title}</div>
              </div>
              {item.status && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">
                  {item.status}
                </span>
              )}
            </div>
            
            {item.value && (
              <div className="text-xl font-bold mb-1">
                <LiveValue value={item.value} />
              </div>
            )}
            
            {item.content && (
              <div className="text-sm text-muted-foreground mb-2">
                {item.content}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              <LiveValue value={(item.trend || item.time || item.priority) ?? ""} />
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Information updates every 5 seconds • Your centralized command center
      </div>
    </div>
  );
}

function ExampleReports() {
  return (
    <div className="max-w-4xl w-full">
      
      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="w-full mb-6 grid grid-cols-4 gap-1">
          <TabsTrigger value="automation" className="text-xs px-1 py-2">Reports</TabsTrigger>
          <TabsTrigger value="article" className="text-xs px-1 py-2">Article</TabsTrigger>
          <TabsTrigger value="top5" className="text-xs px-1 py-2">Insights</TabsTrigger>
          <TabsTrigger value="hub" className="text-xs px-1 py-2">Hub</TabsTrigger>
        </TabsList>
        <TabsContent value="automation">
          <blockquote className="border-l-4 border-muted-foreground/20 pl-4 py-2 mb-6 text-sm text-muted-foreground italic">
            Perfect for <strong>automated business reports</strong> that update in real-time. Ideal for dashboards, KPI monitoring, and operational metrics that need to stay current without manual intervention.
          </blockquote>
          <LiveAutomationReport />
        </TabsContent>
        <TabsContent value="article">
          <blockquote className="border-l-4 border-muted-foreground/20 pl-4 py-2 mb-6 text-sm text-muted-foreground italic">
            Great for <strong>dynamic articles and blog posts</strong> that incorporate live data. Perfect for news sites, financial reports, and content that needs to stay updated with current information.
          </blockquote>
          <ArticleExample />
        </TabsContent>
        <TabsContent value="top5">
          <blockquote className="border-l-4 border-muted-foreground/20 pl-4 py-2 mb-6 text-sm text-muted-foreground italic">
            Perfect for <strong>business intelligence and data insights</strong> that require real-time analysis. Ideal for executive dashboards, performance monitoring, and strategic decision-making.
          </blockquote>
          <DataAnalysis />
        </TabsContent>
        <TabsContent value="hub">
          <blockquote className="border-l-4 border-muted-foreground/20 pl-4 py-2 mb-6 text-sm text-muted-foreground italic">
            Perfect for <strong>consolidating all your important information</strong> in one centralized location. Ideal for personal dashboards, project overviews, and keeping track of everything that matters to you.
          </blockquote>
          <InformationHub />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Home() {
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  
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

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsNavbarVisible(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 transition-transform duration-300 ${
        isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Pin className="w-6 h-6 text-primary rotate-45" />
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                pindown.ai
              </span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Features
              </button>
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <Link 
                href={process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://docs.pindown.ai'} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </Link>
            </div>
            
            {/* CTA Button & Theme Toggle */}
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="hidden sm:inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero section - Full viewport height */}
      <div className="min-h-screen flex items-center justify-center p-8 sm:p-20 pt-24 bg-gradient-to-b from-background to-gray-50 dark:to-muted/5 relative overflow-hidden">
        {/* Pin-themed background pattern */}
        <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.3]">
          {/* Pinboard grid pattern - much more visible */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
          
          {/* Pin dots at grid intersections - more subtle */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 0px 0px, rgba(0,0,0,0.08) 2px, transparent 2px),
              radial-gradient(circle at 50px 50px, rgba(0,0,0,0.08) 2px, transparent 2px),
              radial-gradient(circle at 100px 100px, rgba(0,0,0,0.08) 2px, transparent 2px),
              radial-gradient(circle at 150px 150px, rgba(0,0,0,0.08) 2px, transparent 2px),
              radial-gradient(circle at 200px 200px, rgba(0,0,0,0.08) 2px, transparent 2px),
              radial-gradient(circle at 250px 250px, rgba(0,0,0,0.08) 2px, transparent 2px),
              radial-gradient(circle at 300px 300px, rgba(0,0,0,0.08) 2px, transparent 2px),
              radial-gradient(circle at 350px 350px, rgba(0,0,0,0.08) 2px, transparent 2px)
            `,
            backgroundSize: '400px 400px'
          }}></div>
          
          {/* Larger decorative pins - more visible */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-gray-700/30 dark:bg-gray-200/30 rounded-full transform rotate-45 animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-32 right-24 w-5 h-5 bg-gray-700/25 dark:bg-gray-200/25 rounded-full transform rotate-45 animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-28 left-32 w-3 h-3 bg-gray-700/35 dark:bg-gray-200/35 rounded-full transform rotate-45 animate-pulse" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
          <div className="absolute bottom-20 right-20 w-4 h-4 bg-gray-700/28 dark:bg-gray-200/28 rounded-full transform rotate-45 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}></div>
          <div className="absolute top-1/2 left-16 w-3.5 h-3.5 bg-gray-700/32 dark:bg-gray-200/32 rounded-full transform rotate-45 animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3.8s'}}></div>
          <div className="absolute top-2/3 right-16 w-5 h-5 bg-gray-700/26 dark:bg-gray-200/26 rounded-full transform rotate-45 animate-pulse" style={{animationDelay: '2.5s', animationDuration: '4.2s'}}></div>
          <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-gray-700/30 dark:bg-gray-200/30 rounded-full transform rotate-45 animate-pulse" style={{animationDelay: '3s', animationDuration: '3.2s'}}></div>
          <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-gray-700/22 dark:bg-gray-200/22 rounded-full transform rotate-45 animate-pulse" style={{animationDelay: '0.8s', animationDuration: '4.8s'}}></div>
        </div>
        
        {/* Hero content - positioned above background */}
        <div className="relative z-10 flex flex-col gap-12 items-center max-w-5xl mx-auto px-4">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center relative overflow-hidden shadow-lg">
                <Pin className="w-8 h-8 text-primary-foreground animate-[pin-drop_1.2s_ease-out_forwards]" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-muted-foreground bg-clip-text text-transparent animate-fade-in">
                pindown.ai
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-center text-muted-foreground max-w-3xl leading-relaxed font-light">
              Transform your data into 
              <span className="text-primary font-semibold"> beautiful reports</span>, 
              <span className="text-primary font-semibold"> engaging articles</span> and 
              <span className="text-primary font-semibold"> insightful pages</span> that everyone can understand and share.
            </p>
          </div>
          
          <div className="flex gap-6 items-center flex-col sm:flex-row mt-12">
           <Link
             href="/login"
             className="group relative rounded-full border border-solid border-transparent transition-all duration-300 flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] hover:scale-105 hover:shadow-lg text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8 overflow-hidden"
           >
             {/* Animated background effect */}
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
             <Pin className="w-4 h-4 rotate-45 relative z-10" />
             <span className="relative z-10 font-semibold">Get Started</span>
           </Link>
                                    <Link
              href={process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://docs.pindown.ai'}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-all duration-300 flex items-center justify-center bg-[#f2f2f2] dark:bg-[#1a1a1a] hover:bg-[#eaeaea] dark:hover:bg-[#151515] hover:border-transparent hover:scale-105 hover:shadow-md text-sm sm:text-base h-12 sm:h-14 px-6 sm:px-8"
            >
              <MessageSquare className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-medium">View Docs</span>
            </Link>
          </div>
          
          {/* Social proof */}
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full border-2 border-background flex items-center justify-center">
                <Pin className="w-3 h-3 text-primary" />
              </div>
              <div className="w-6 h-6 bg-primary/20 rounded-full border-2 border-background flex items-center justify-center">
                <Pin className="w-3 h-3 text-primary" />
              </div>
              <div className="w-6 h-6 bg-primary/20 rounded-full border-2 border-background flex items-center justify-center">
                <Pin className="w-3 h-3 text-primary" />
              </div>
            </div>
            <span>Join 500+ automation teams</span>
          </div>
        </div>
      </div>

      {/* Quick Demo Preview Section */}
      <div className="py-20 px-6 sm:px-12 bg-gradient-to-b from-gray-50 to-background dark:from-muted/5 dark:to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              See It In Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how your raw automation data transforms into beautiful, shareable pages in seconds.
            </p>
          </div>
          
          <div className="relative bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-background/90 dark:to-muted/20 rounded-3xl p-8 shadow-2xl border border-border/50 backdrop-blur-sm">
             {/* Demo content */}
             <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
               {/* Input side */}
               <div className="space-y-3 lg:max-w-md">
                 <h3 className="text-lg font-semibold text-muted-foreground mb-3">Raw Automation Output</h3>
                 <div className="bg-muted/20 p-4 rounded-lg font-mono text-sm overflow-auto max-h-48 border border-border/50">
                   <div className="text-muted-foreground">// Webhook payload from n8n</div>
                   <div className="text-foreground">{"{"}</div>
                   <div className="ml-2 text-foreground">"status": "completed",</div>
                   <div className="ml-2 text-foreground">"recordsProcessed": 1247,</div>
                   <div className="ml-2 text-foreground">"errors": 3,</div>
                   <div className="ml-2 text-foreground">"duration": "2m 34s",</div>
                   <div className="ml-2 text-foreground">"timestamp": "2024-01-15T14:30:00Z"</div>
                   <div className="text-foreground">{"}"}</div>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                   <span>Real-time webhook data</span>
                 </div>
               </div>

               {/* Live Example - Full Page Layout */}
               <div className="flex justify-center">
                 <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-background/90 dark:to-muted/20 rounded-xl border border-border/50 shadow-lg backdrop-blur-sm max-w-sm w-full overflow-hidden">
                   {/* Page Header */}
                   <div className="p-4 border-b border-border/50">
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="font-semibold text-base">Daily Automation Report</h4>
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                         <span className="text-xs font-medium text-primary">Live</span>
                       </div>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       Generated: Today at 14:30 UTC • Last Update: 0s ago
                     </p>
                   </div>
                   
                   {/* Page Content */}
                   <div className="p-4 space-y-4">
                     {/* Description */}
                     <p className="text-xs text-muted-foreground leading-relaxed">
                       Our automated data synchronization is currently active across multiple databases. The n8n integration has processed 100% of records, while MongoDB sync is at 100% completion. The Postgres migration has successfully completed, ensuring all analytics data is ready for processing.
                     </p>
                     
                     {/* Data Processing Section */}
                     <div className="space-y-3">
                       <h5 className="text-sm font-medium text-foreground">Data Processing</h5>
                       <div className="space-y-2">
                         <div className="flex justify-between items-center">
                           <span className="text-xs text-muted-foreground">n8n</span>
                           <span className="text-xs font-medium text-primary">100%</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-xs text-muted-foreground">MongoDB</span>
                           <span className="text-xs font-medium text-primary">100%</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span className="text-xs text-muted-foreground">Postgres</span>
                           <span className="text-xs font-medium text-primary">Complete</span>
                         </div>
                       </div>
                     </div>
                     
                     {/* Pipeline Status */}
                     <div className="space-y-3">
                       <h5 className="text-sm font-medium text-foreground">Pipeline Status</h5>
                       <div className="grid grid-cols-3 gap-3">
                         <div className="text-center">
                           <div className="text-sm font-bold text-primary">1,247</div>
                           <div className="text-xs text-muted-foreground">Processed</div>
                         </div>
                         <div className="text-center">
                           <div className="text-sm font-bold text-orange-600 dark:text-orange-400">3</div>
                           <div className="text-xs text-muted-foreground">Queue Size</div>
                         </div>
                         <div className="text-center">
                           <div className="text-sm font-bold">2m 34s</div>
                           <div className="text-xs text-muted-foreground">Avg Time</div>
                         </div>
                       </div>
                     </div>
                     
                     {/* Bottom Description */}
                     <p className="text-xs text-muted-foreground leading-relaxed">
                       The data pipeline has successfully processed 1,247 records with an average processing time of 2m 34s per batch. Currently, 3 items remain in the processing queue, indicating a healthy throughput rate.
                     </p>
                   </div>
                 </div>
               </div>

             </div>
            
            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to transform your automation data?
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
              >
                <Pin className="w-4 h-4 rotate-45" />
                Start Building
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* UI Layer for AI Automations Section */}
      <div id="features" className="py-24 sm:py-32 px-6 sm:px-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-muted/10 dark:to-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
                  <Zap className="w-4 h-4" />
                  <span>The Problem</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                  The Missing UI Layer for 
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"> AI-Driven Automations</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Your automations generate tons of data, but where does it go? PinDown.ai bridges the gap between your AI workflows and human understanding.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-background/50 dark:hover:bg-background/20 transition-all duration-300">
                  <div className="w-10 h-10 bg-muted/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Connect Any Automation</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Zapier, Make, n8n, or custom scripts - we integrate with any automation platform seamlessly
                    </p>
                  </div>
                </div>
                
                <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-background/50 dark:hover:bg-background/20 transition-all duration-300">
                  <div className="w-10 h-10 bg-muted/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">AI-Powered Formatting</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Raw data gets transformed into beautiful, readable content automatically with intelligent structuring
                    </p>
                  </div>
                </div>
                
                <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-background/50 dark:hover:bg-background/20 transition-all duration-300">
                  <div className="w-10 h-10 bg-muted/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Share2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Instant Sharing</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Share results with clients, teams, or stakeholders in real-time with beautiful, professional layouts
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-background/80 dark:to-muted/20 rounded-3xl p-10 border border-border/50 shadow-2xl backdrop-blur-sm">
                <div className="space-y-8">
                  <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-muted/20 transition-all duration-300 group-hover:bg-gray-100/50 dark:group-hover:bg-muted/30">
                    <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Server className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-base">Automation Output</div>
                      <div className="text-sm text-muted-foreground">Raw JSON data from your workflows</div>
                    </div>
                  </div>
                  
                   <div className="flex items-center justify-center">
                     <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                       <ArrowDown className="w-5 h-5 text-primary animate-pulse" />
                     </div>
                   </div>
                   
                   <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-muted/20 transition-all duration-300 group-hover:bg-gray-100/50 dark:group-hover:bg-muted/30">
                     <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                       <Brain className="w-6 h-6 text-muted-foreground" />
                     </div>
                     <div>
                       <div className="font-semibold text-base">AI Processing</div>
                       <div className="text-sm text-muted-foreground">Intelligent data transformation</div>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-center">
                     <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                       <ArrowDown className="w-5 h-5 text-primary animate-pulse" />
                     </div>
                   </div>
                  
                  <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-muted/20 transition-all duration-300 group-hover:bg-gray-100/50 dark:group-hover:bg-muted/30">
                    <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-base">Beautiful Page</div>
                      <div className="text-sm text-muted-foreground">Client-ready report ready to share</div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Pin icon */}
                <div className="absolute -right-4 -top-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-xl group hover:scale-105 transition-transform duration-300">
                    <Pin className="w-12 h-12 text-primary-foreground drop-shadow-lg animate-[pin-drop_1.2s_ease-out_forwards] group-hover:rotate-12 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligent Dynamic Pins Section - First after hero */}
      <div 
        ref={exampleReportsRef}
        className={`py-24 sm:py-32 px-6 sm:px-12 bg-gradient-to-b from-gray-50 to-background dark:from-muted/5 dark:to-background transition-all duration-1000 ease-out ${
          isExampleReportsInView 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="flex flex-col items-center max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6">
              <Pin className="w-4 h-4 rotate-45" />
              <span>Live Examples</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
              Realtime Updated Pages
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your data into beautiful, shareable <strong>pages -- ( pins )</strong> that update automatically with your automation workflows.
            </p>
          </div>
          <ExampleReports />
        </div>
      </div>

      {/* AI-Powered Data Transformation Section */}
      {/* <div className="py-16 sm:py-20 px-6 sm:px-12 bg-muted/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                <Brain className="w-8 h-8 text-primary relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[wave_2.5s_ease-in-out_infinite] rounded-full"></div>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              AI Shapes Your Raw Data Into Beautiful Pages
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our intelligent system takes your automation data and transforms it into clean, readable content that your clients will love. No more manual formatting or confusing spreadsheets.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto">
                <Database className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">Raw Data Input</h3>
              <p className="text-sm text-muted-foreground">
                Upload your automation outputs, API responses, or any structured data
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto">
                <Bot className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">AI Processing</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes and structures your data into meaningful insights
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold">Beautiful Output</h3>
              <p className="text-sm text-muted-foreground">
                Get professional, client-ready reports and articles instantly
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Code Setup Section */}
      <div className="py-16 sm:py-20 px-6 sm:px-12 bg-gradient-to-b from-background to-gray-100 dark:to-muted/15">
        <div className="flex flex-col items-center">
          <div className="max-w-6xl w-full">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Code Examples with Tabs */}
              <div className="space-y-4">
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
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">How It Works</h2>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Built for Real Teams Section */}
      <div 
        ref={pinShareRef}
        className={`py-24 sm:py-32 px-6 sm:px-12 bg-gradient-to-b from-gray-100 to-gray-150 dark:from-muted/10 dark:to-muted/20 transition-all duration-1000 ease-out ${
          isPinShareInView 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-12'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="max-w-7xl w-full">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-6">
                <Users className="w-4 h-4" />
                <span>For Teams</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
                Built for Real Teams, Real Workflows
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Create shareable pages from your automation workflows that keep teams informed and stakeholders updated with beautiful, professional reports.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="group p-8 border border-border/50 rounded-2xl hover:border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-background/90 dark:to-muted/20 backdrop-blur-sm">
               <div className="flex items-center gap-3 mb-6">
                 <div className="flex gap-2">
                   <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">CI</div>
                   <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">API</div>
                 </div>
               </div>
               <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                 <Server className="w-6 h-6 text-muted-foreground" />
               </div>
               <h3 className="font-semibold mb-4 text-xl">For DevOps & SRE Teams</h3>
               <p className="text-muted-foreground leading-relaxed"><span className="text-primary font-semibold">CI/CD logs</span>, <span className="text-primary font-semibold">deployment metrics</span>, and <span className="text-primary font-semibold">incident alerts</span>. Stop explaining pipeline outputs to PMs. Get automatic incident summaries that actually make sense.</p>
             </div>
             
             <div className="group p-8 border border-border/50 rounded-2xl hover:border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-background/90 dark:to-muted/20 backdrop-blur-sm">
               <div className="flex items-center gap-3 mb-6">
                 <div className="flex gap-2">
                   <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">DOC</div>
                   <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">OPS</div>
                 </div>
               </div>
               <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                 <Code className="w-6 h-6 text-muted-foreground" />
               </div>
               <h3 className="font-semibold mb-4 text-xl">For Automation Hackers</h3>
               <p className="text-muted-foreground leading-relaxed"><span className="text-primary font-semibold">Scripts</span>, <span className="text-primary font-semibold">n8n flows</span>, and <span className="text-primary font-semibold">automation outputs</span>. Stop building ugly Google Docs. Turn automation outputs into client-ready reports instantly.</p>
             </div>

             <div className="group p-8 border border-border/50 rounded-2xl hover:border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-background/90 dark:to-muted/20 backdrop-blur-sm">
               <div className="flex items-center gap-3 mb-6">
                 <div className="flex gap-2">
                   <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">RESEARCH</div>
                   <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">SHARE</div>
                 </div>
               </div>
               <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                 <Search className="w-6 h-6 text-muted-foreground" />
               </div>
               <h3 className="font-semibold mb-4 text-xl">Information Tracking & Research</h3>
               <p className="text-muted-foreground leading-relaxed"><span className="text-primary font-semibold">Market research</span>, <span className="text-primary font-semibold">competitive analysis</span>, and <span className="text-primary font-semibold">data insights</span>. Transform complex research data and analysis into digestible reports for stakeholders and collaborators.</p>
             </div>
           </div>
         </div>
       </div>
     </div>

      {/* Data Management & Research Section */}
      <div className="py-16 sm:py-20 px-6 sm:px-12 bg-gradient-to-b from-gray-100 to-gray-50 dark:from-muted/10 dark:to-muted/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                <Database className="w-8 h-8 text-primary relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[wave_2.5s_ease-in-out_infinite] rounded-full"></div>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Intelligent Data Transformation & Research
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From raw documents to structured insights. Transform any data source into actionable intelligence with AI-powered processing and community-driven research.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Extract Data from Documents */}
            <div className="p-6 border border-border/50 rounded-xl hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white/95 to-gray-50 dark:from-background/80 dark:to-muted/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">EXTRACT</div>
              </div>
              <h3 className="font-semibold mb-3 text-lg">Document Intelligence</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="text-foreground font-medium">PDFs</span>, <span className="text-foreground font-medium">invoices</span>, and <span className="text-foreground font-medium">contracts</span> automatically processed into structured data. AI extracts key information, tables, and insights from any document format.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">OCR</span>
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">Tables</span>
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">Forms</span>
              </div>
            </div>
            
            {/* Turn Raw Data into Structured Outputs */}
            <div className="p-6 border border-border/50 rounded-xl hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white/95 to-gray-50 dark:from-background/80 dark:to-muted/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">TRANSFORM</div>
              </div>
              <h3 className="font-semibold mb-3 text-lg">Smart Data Structuring</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="text-foreground font-medium">Raw logs</span>, <span className="text-foreground font-medium">API responses</span>, and <span className="text-foreground font-medium">messy data</span> transformed into clean, organized formats. AI understands context and creates meaningful data structures.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">JSON</span>
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">CSV</span>
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">Schema</span>
              </div>
            </div>
            
            {/* Perplexity Research */}
            <div className="p-6 border border-border/50 rounded-xl hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white/95 to-gray-50 dark:from-background/80 dark:to-muted/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center">
                  <Search className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">RESEARCH</div>
              </div>
              <h3 className="font-semibold mb-3 text-lg">AI-Powered Research</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="text-foreground font-medium">Market trends</span>, <span className="text-foreground font-medium">competitive analysis</span>, and <span className="text-foreground font-medium">real-time insights</span> powered by Perplexity AI. Get comprehensive research reports on any topic instantly.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">Perplexity</span>
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">Web</span>
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">Analysis</span>
              </div>
            </div>
            
            {/* Community Datasets */}
            <div className="p-6 border border-border/50 rounded-xl hover:border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white/95 to-gray-50 dark:from-background/80 dark:to-muted/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">COMMUNITY</div>
              </div>
              <h3 className="font-semibold mb-3 text-lg">Community Datasets</h3>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="text-foreground font-medium">Shared templates</span>, <span className="text-foreground font-medium">public datasets</span>, and <span className="text-foreground font-medium">collaborative research</span>. Access curated data sources and contribute to the community knowledge base.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">Templates</span>
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">Public</span>
                <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded">Share</span>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                <span>Upload any document or data source</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                <span>AI processes and structures</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                <span>Get actionable insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Client Reports Section */}
      <div className="py-16 sm:py-20 px-6 sm:px-12 bg-gradient-to-b from-gray-100 to-background dark:from-muted/10 dark:to-background">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center">
            <div className="relative">
              <div className="rounded-2xl p-6">
                <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                  <div className="relative h-20 flex items-center justify-center">
                    <TypingEffect />
                  </div>
                </div>
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
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">From Raw Data to Human Stories</h2>
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
      {/* <div 
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
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Works with Your Automation Stack</h2>
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
      </div> */}


      {/* Other sections */}
       <div className="py-24 sm:py-32 px-8 sm:px-20 bg-gradient-to-b from-background to-gray-100 dark:to-muted/15">
         <div className="flex flex-col items-center max-w-7xl mx-auto">
           {/* Pricing Section */}
           <div 
             id="pricing"
             ref={pricingRef}
             className={`transition-all duration-1000 ease-out ${
               isPricingInView 
                 ? 'opacity-100 translate-y-0 scale-100' 
                 : 'opacity-0 translate-y-20 scale-95'
             }`}
           >
             <PricingSection />
           </div>

           {/* Works with Your Automation Stack Section */}
           <div 
             ref={automationStackRef}
             className={`mt-32 max-w-4xl w-full text-center transition-all duration-1000 ease-out ${
               isAutomationStackInView 
                 ? 'opacity-100 translate-y-0' 
                 : 'opacity-0 translate-y-12'
             }`}
           >
             <div className="mb-12">
               <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Works with Your Automation Stack</h2>
               <p className="text-muted-foreground max-w-2xl mx-auto">
                 Connect any automation tool or script output. Transform your workflow data into pins instantly.
               </p>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
               <div className="p-6 border border-border/50 rounded-xl bg-gradient-to-br from-white/95 to-gray-50 dark:from-background/80 dark:to-muted/10 backdrop-blur-sm hover:bg-background hover:border-border transition-all duration-300 hover:scale-105">
                 <div className="text-lg font-medium mb-2">n8n</div>
                 <div className="text-xs text-muted-foreground">Workflow outputs</div>
               </div>
               <div className="p-6 border border-border/50 rounded-xl bg-gradient-to-br from-white/95 to-gray-50 dark:from-background/80 dark:to-muted/10 backdrop-blur-sm hover:bg-background hover:border-border transition-all duration-300 hover:scale-105">
                 <div className="text-lg font-medium mb-2">Make.com</div>
                 <div className="text-xs text-muted-foreground">Scenario results</div>
               </div>
               <div className="p-6 border border-border/50 rounded-xl bg-gradient-to-br from-white/95 to-gray-50 dark:from-background/80 dark:to-muted/10 backdrop-blur-sm hover:bg-background hover:border-border transition-all duration-300 hover:scale-105">
                 <div className="text-lg font-medium mb-2">Zapier</div>
                 <div className="text-xs text-muted-foreground">Zap outputs</div>
               </div>
               <div className="p-6 border border-border/50 rounded-xl bg-gradient-to-br from-white/95 to-gray-50 dark:from-background/80 dark:to-muted/10 backdrop-blur-sm hover:bg-background hover:border-border transition-all duration-300 hover:scale-105">
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

           {/* Perplexity Research Section */}
           {/* <div 
             ref={researchRef}
             className={`mt-32 max-w-4xl w-full text-center transition-all duration-1000 ease-out ${
               isResearchInView 
                 ? 'opacity-100 translate-y-0' 
                 : 'opacity-0 translate-y-12'
             }`}
           >
             <div className="mb-12">
               <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">Share Your Pages Instantly</h2>
                <p className="text-muted-foreground mb-6">Create shareable links for your pages and collaborate with your team <span className="text-primary font-medium">in real-time</span></p>
               <div className="flex justify-center">
                 <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                   <Share2 className="w-8 h-8 text-primary relative z-10" />
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[wave_2.5s_ease-in-out_infinite] rounded-full"></div>
                 </div>
               </div>
             </div>
           </div> */}

           {/* Bring Your Own API Keys Section */}
           {/* <div 
             ref={apiKeysRef}
             className={`mt-32 max-w-5xl w-full transition-all duration-1000 ease-out ${
               isApiKeysInView 
                 ? 'opacity-100 translate-y-0' 
                 : 'opacity-0 translate-y-12'
             }`}
           >
             <div className="relative p-8 border border-border/50 rounded-2xl bg-gradient-to-br from-background to-muted/5">
               <div className="text-center mb-8">
                 <h2 className="text-3xl sm:text-4xl font-bold">Bring Your Own API Keys</h2>
               </div>
               <div className="flex flex-col lg:flex-row items-center gap-12">
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
           </div> */}


          
          {/* Footer */}
          <footer className="mt-20 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-muted/15 dark:to-muted/25 border-t border-border/50">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12">
              <div className="grid md:grid-cols-4 gap-8">
                {/* Logo and Description */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Pin className="w-6 h-6 text-primary rotate-45" />
                    <span className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      pindown.ai
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm max-w-md">
                    Transform your automation outputs into beautiful, shareable reports and insights that everyone can understand.
                  </p>
                </div>
                
                {/* Product Links */}
                <div>
                  <h3 className="font-semibold mb-4">Product</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                    <li><Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                    <li><Link href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</Link></li>
                    <li><Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link></li>
                  </ul>
                </div>
                
                {/* Company Links */}
                <div>
                  <h3 className="font-semibold mb-4">Company</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                  </ul>
                </div>
              </div>
              
              {/* Bottom Bar */}
              <div className="mt-8 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  © 2024 pindown.ai. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </Link>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Cookies
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}