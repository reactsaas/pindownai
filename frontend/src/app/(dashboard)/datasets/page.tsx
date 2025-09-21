"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, FileText, BookOpen, Users } from "lucide-react"
import DocumentsTab from "./documents-tab"
import ResearchTab from "./research-tab"
import CommunityTab from "./community-tab"
import { Dataset } from "./documents-tab"

export default function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("documents")

  const [datasets, setDatasets] = useState<Record<string, Dataset[]>>({
    documents: [
      {
        id: "ds-1",
        name: "Product Documentation",
        description: "API documentation and usage examples",
        type: "markdown",
        size: "156 KB",
        lastModified: "1 day ago",
        views: 89,
        tags: ["documentation", "api", "guide"]
      },
      {
        id: "ds-2",
        name: "Sales Report Template",
        description: "Monthly sales performance template with variables",
        type: "markdown",
        size: "89 KB",
        lastModified: "3 days ago",
        views: 67,
        tags: ["sales", "template", "report"]
      },
      {
        id: "ds-3",
        name: "User Manual",
        description: "Complete user guide and troubleshooting",
        type: "markdown",
        size: "234 KB",
        lastModified: "5 days ago",
        views: 45,
        tags: ["manual", "guide", "help"]
      }
    ],
    research: [
      {
        id: "ds-4",
        name: "User Analytics Data",
        description: "Weekly user engagement metrics and behavior patterns",
        type: "json",
        size: "2.3 MB",
        lastModified: "2 hours ago",
        views: 45,
        tags: ["analytics", "users", "metrics"],
        content: { users: 1250, sessions: 3400, conversion: 0.12 }
      },
      {
        id: "ds-5",
        name: "Customer Feedback",
        description: "Raw customer feedback and sentiment analysis",
        type: "json",
        size: "1.8 MB",
        lastModified: "1 week ago",
        views: 23,
        tags: ["feedback", "sentiment", "customers"]
      },
      {
        id: "ds-6",
        name: "Market Research",
        description: "Industry trends and competitive analysis",
        type: "json",
        size: "3.1 MB",
        lastModified: "2 weeks ago",
        views: 78,
        tags: ["market", "research", "trends"]
      }
    ],
    community: [
      {
        id: "ds-7",
        name: "Community Guidelines",
        description: "Rules and best practices for community participation",
        type: "markdown",
        size: "67 KB",
        lastModified: "1 month ago",
        views: 156,
        tags: ["guidelines", "community", "rules"],
        uploadedBy: "Alex Chen",
        contributions: 12,
        communityScore: 89
      },
      {
        id: "ds-8",
        name: "User Contributions",
        description: "Community-submitted content and resources",
        type: "json",
        size: "4.2 MB",
        lastModified: "3 days ago",
        views: 234,
        tags: ["contributions", "community", "resources"],
        uploadedBy: "Sarah Johnson",
        contributions: 8,
        communityScore: 76
      },
      {
        id: "ds-9",
        name: "Market Research Data",
        description: "Shared industry insights and trend analysis",
        type: "json",
        size: "1.2 MB",
        lastModified: "1 week ago",
        views: 89,
        tags: ["market", "research", "trends"],
        uploadedBy: "Mike Rodriguez",
        contributions: 15,
        communityScore: 94
      },
      {
        id: "ds-10",
        name: "Best Practices Guide",
        description: "Community-curated best practices and workflows",
        type: "markdown",
        size: "234 KB",
        lastModified: "2 weeks ago",
        views: 167,
        tags: ["practices", "workflow", "guide"],
        uploadedBy: "Emma Wilson",
        contributions: 6,
        communityScore: 82
      }
    ]
  })

  const handleAddDataset = (dataset: Dataset) => {
    setDatasets(prev => ({
      ...prev,
      [activeTab]: [dataset, ...(prev[activeTab] || [])]
    }))
  }

  const handleDeleteDataset = (id: string) => {
    setDatasets(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(d => d.id !== id)
    }))
  }

  const copyDatasetId = async (id: string) => {
    await navigator.clipboard.writeText(id)
  }

  return (
    <div className="h-screen lg:h-full flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex-shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
            <p className="text-muted-foreground">
              Manage your data sources and templates for pins
            </p>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col min-h-0 px-6 pb-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Research
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Community
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 mt-6">
            <TabsContent value="documents" className="h-full">
              <DocumentsTab
                searchQuery={searchQuery}
                datasets={datasets.documents}
                onAddDataset={handleAddDataset}
                onDeleteDataset={handleDeleteDataset}
                onCopyDatasetId={copyDatasetId}
              />
            </TabsContent>

            <TabsContent value="research" className="h-full">
              <ResearchTab
                searchQuery={searchQuery}
                datasets={datasets.research}
                onDeleteDataset={handleDeleteDataset}
                onCopyDatasetId={copyDatasetId}
              />
            </TabsContent>

            <TabsContent value="community" className="h-full">
              <CommunityTab
                searchQuery={searchQuery}
                datasets={datasets.community}
                onAddDataset={handleAddDataset}
                onDeleteDataset={handleDeleteDataset}
                onCopyDatasetId={copyDatasetId}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}