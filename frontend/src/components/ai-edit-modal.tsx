"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Sparkles, 
  FileText, 
  Search, 
  Plus, 
  Loader2, 
  Check,
  Image,
  FileVideo,
  File,
  Globe,
  BookOpen,
  Brain,
  Zap,
  CheckSquare,
  Square
} from "lucide-react"

interface DataSource {
  id: string
  name: string
  type: "workflow" | "integration" | "document"
  description: string
  datasets?: string[]
  status?: "connected" | "disconnected"
}

interface ResearchResult {
  id: string
  title: string
  snippet: string
  url: string
  source: string
}

interface AIEditModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (prompt: string, selectedDataSources: DataSource[], researchData: ResearchResult[]) => void
}

export function AIEditModal({ isOpen, onOpenChange, onSubmit }: AIEditModalProps) {
  const [prompt, setPrompt] = useState("")
  const [researchQuery, setResearchQuery] = useState("")
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource[]>([])
  const [resourcePrompts, setResourcePrompts] = useState<Record<string, string>>({})
  const [researchResults, setResearchResults] = useState<ResearchResult[]>([])
  const [selectedResearch, setSelectedResearch] = useState<ResearchResult[]>([])
  const [isResearching, setIsResearching] = useState(false)
  const [activeTab, setActiveTab] = useState("prompt")

  // Mock data sources - in real app, this would come from props or API
  const availableDataSources: DataSource[] = [
    {
      id: "workflow-data",
      name: "Workflow Data",
      type: "workflow",
      description: "Real-time data received from workflow triggers"
    },
    {
      id: "user-research",
      name: "User Research Report.pdf",
      type: "document",
      description: "Comprehensive user research analysis for Q4 2024"
    },
    {
      id: "api-docs",
      name: "API Documentation.md",
      type: "document",
      description: "Complete API documentation with examples"
    },
    {
      id: "brand-guidelines",
      name: "Brand Guidelines.pdf",
      type: "document",
      description: "Official brand guidelines and style guide"
    }
  ]

  const handleDataSourceToggle = (dataSource: DataSource) => {
    setSelectedDataSources(prev => {
      const isSelected = prev.find(ds => ds.id === dataSource.id)
      if (isSelected) {
        // Remove from selected and clear its prompt
        setResourcePrompts(prompts => {
          const newPrompts = { ...prompts }
          delete newPrompts[dataSource.id]
          return newPrompts
        })
        return prev.filter(ds => ds.id !== dataSource.id)
      } else {
        return [...prev, dataSource]
      }
    })
  }

  const updateResourcePrompt = (resourceId: string, prompt: string) => {
    setResourcePrompts(prev => ({
      ...prev,
      [resourceId]: prompt
    }))
  }

  const getDataSourceIcon = (type: string) => {
    switch (type) {
      case "workflow":
        return <Zap className="h-4 w-4 text-blue-500" />
      case "document":
        return <FileText className="h-4 w-4 text-orange-500" />
      default:
        return <Globe className="h-4 w-4 text-gray-500" />
    }
  }

  const handleResearchToggle = (research: ResearchResult) => {
    setSelectedResearch(prev => {
      const isSelected = prev.find(r => r.id === research.id)
      if (isSelected) {
        return prev.filter(r => r.id !== research.id)
      } else {
        return [...prev, research]
      }
    })
  }

  const handlePerplexitySearch = async () => {
    if (!researchQuery.trim()) return
    
    setIsResearching(true)
    
    // Mock Perplexity API call - replace with actual API
    setTimeout(() => {
      const mockResults: ResearchResult[] = [
        {
          id: "research-1",
          title: "AI Content Generation Best Practices 2024",
          snippet: "Latest trends in AI-powered content creation, including prompt engineering techniques and quality optimization strategies for marketing teams.",
          url: "https://example.com/ai-content-2024",
          source: "Tech Insights"
        },
        {
          id: "research-2",
          title: "User Experience Design Principles",
          snippet: "Comprehensive guide to modern UX design principles, focusing on accessibility, usability, and user-centered design methodologies.",
          url: "https://example.com/ux-principles",
          source: "Design Weekly"
        },
        {
          id: "research-3",
          title: "Marketing Automation Strategies",
          snippet: "Advanced marketing automation techniques that increase conversion rates by 40% through personalized customer journeys and targeted messaging.",
          url: "https://example.com/marketing-automation",
          source: "Marketing Pro"
        }
      ]
      setResearchResults(mockResults)
      setIsResearching(false)
    }, 2000)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
      case 'md':
      case 'markdown':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'figma':
        return <Image className="h-4 w-4 text-green-500" />
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FileVideo className="h-4 w-4 text-blue-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const handleSubmit = () => {
    // Combine prompts - main prompt plus any specific resource instructions
    const resourceInstructions = selectedDataSources.map(source => {
      const resourcePrompt = resourcePrompts[source.id]
      return resourcePrompt ? `\n\n${source.name} Instructions: ${resourcePrompt}` : ''
    }).filter(Boolean).join('')

    const combinedPrompt = [
      prompt,
      resourceInstructions
    ].filter(Boolean).join('')

    onSubmit(combinedPrompt, selectedDataSources, selectedResearch)
    
    // Reset form
    setPrompt("")
    setSelectedDataSources([])
    setResourcePrompts({})
    setSelectedResearch([])
    setResearchResults([])
    setResearchQuery("")
    setActiveTab("prompt")
    onOpenChange(false)
  }

  const canSubmit = prompt.trim().length > 0 || selectedDataSources.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[1000px] h-[85vh] max-h-[800px] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Content Editor
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="prompt" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Prompt
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resources
              {selectedDataSources.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {selectedDataSources.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Research
              {selectedResearch.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {selectedResearch.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 mt-4 overflow-hidden">
            <TabsContent value="prompt" className="h-full m-0">
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    What would you like the AI to help you with?
                  </label>
                  <Textarea
                    placeholder="Describe what you want to edit, improve, or create. Be specific about tone, style, length, and any requirements..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                </div>

                {/* Selected Context Summary */}
                {(selectedDataSources.length > 0 || selectedResearch.length > 0) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Selected Context</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedDataSources.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Resources:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedDataSources.map(source => (
                              <Badge key={source.id} variant="outline" className="text-xs">
                                {getDataSourceIcon(source.type)}
                                <span className="ml-1">{source.name}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedResearch.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Research:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedResearch.map(research => (
                              <Badge key={research.id} variant="outline" className="text-xs">
                                <Globe className="h-3 w-3" />
                                <span className="ml-1">{research.title}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="h-full m-0">
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex-shrink-0">
                  <label className="text-sm font-medium mb-2 block">
                    Select and Configure Resources
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Choose data sources and specify what information to extract from each.
                  </p>
                </div>

                <ScrollArea className="flex-1 h-0">
                  <div className="space-y-6 p-1 pr-3">
                    {/* Workflow Data Section */}
                    {availableDataSources.filter(ds => ds.type === "workflow").length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          Workflow Data
                        </h3>
                        <div className="space-y-3">
                          {availableDataSources.filter(ds => ds.type === "workflow").map(source => {
                            const isSelected = selectedDataSources.find(ds => ds.id === source.id)
                            return (
                              <Card 
                                key={source.id} 
                                className={`cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:shadow-sm ${
                                  isSelected 
                                    ? 'ring-2 ring-primary bg-primary/10 border-primary/20' 
                                    : 'hover:border-muted-foreground/20'
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div 
                                      className="flex items-start gap-3"
                                      onClick={() => handleDataSourceToggle(source)}
                                    >
                                      <div className="flex-shrink-0 mt-0.5">
                                        {isSelected ? (
                                          <CheckSquare className="h-5 w-5 text-primary" />
                                        ) : (
                                          <Square className="h-5 w-5 text-muted-foreground" />
                                        )}
                                      </div>
                                      <div className="flex-shrink-0 mt-0.5">
                                        {getDataSourceIcon(source.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-medium ${
                                          isSelected ? 'text-primary' : ''
                                        }`}>{source.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
                                      </div>
                                    </div>
                                    
                                    {isSelected && (
                                      <div>
                                        <label className="text-xs font-medium mb-1 block">
                                          What information should be extracted from this resource?
                                        </label>
                                        <Textarea
                                          placeholder="Extract user details, order information, and status updates"
                                          value={resourcePrompts[source.id] || ""}
                                          onChange={(e) => updateResourcePrompt(source.id, e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-xs min-h-[60px] resize-none"
                                          rows={3}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Documents Section */}
                    {availableDataSources.filter(ds => ds.type === "document").length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-orange-500" />
                          Documents
                        </h3>
                        <div className="space-y-3">
                          {availableDataSources.filter(ds => ds.type === "document").map(source => {
                            const isSelected = selectedDataSources.find(ds => ds.id === source.id)
                            return (
                              <Card 
                                key={source.id} 
                                className={`cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:shadow-sm ${
                                  isSelected 
                                    ? 'ring-2 ring-primary bg-primary/10 border-primary/20' 
                                    : 'hover:border-muted-foreground/20'
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div 
                                      className="flex items-start gap-3"
                                      onClick={() => handleDataSourceToggle(source)}
                                    >
                                      <div className="flex-shrink-0 mt-0.5">
                                        {isSelected ? (
                                          <CheckSquare className="h-5 w-5 text-primary" />
                                        ) : (
                                          <Square className="h-5 w-5 text-muted-foreground" />
                                        )}
                                      </div>
                                      <div className="flex-shrink-0 mt-0.5">
                                        {getDataSourceIcon(source.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-medium ${
                                          isSelected ? 'text-primary' : ''
                                        }`}>{source.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
                                      </div>
                                    </div>
                                    
                                    {isSelected && (
                                      <div>
                                        <label className="text-xs font-medium mb-1 block">
                                          What information should be extracted from this resource?
                                        </label>
                                        <Textarea
                                          placeholder="Extract key insights, use for tone and style, reference for accuracy"
                                          value={resourcePrompts[source.id] || ""}
                                          onChange={(e) => updateResourcePrompt(source.id, e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-xs min-h-[60px] resize-none"
                                          rows={3}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="research" className="h-full m-0">
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex-shrink-0">
                  <label className="text-sm font-medium mb-2 block">
                    Research external information
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Use AI-powered research to gather the latest information and insights.
                  </p>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter research query (e.g., 'latest AI trends 2024', 'UX design best practices')"
                      value={researchQuery}
                      onChange={(e) => setResearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePerplexitySearch()}
                    />
                    <Button 
                      onClick={handlePerplexitySearch}
                      disabled={isResearching || !researchQuery.trim()}
                      size="sm"
                    >
                      {isResearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 h-0">
                  <div className="space-y-3 p-1 pr-3">
                    {researchResults.map(research => (
                      <Card 
                        key={research.id} 
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedResearch.find(r => r.id === research.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleResearchToggle(research)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Globe className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium line-clamp-1">{research.title}</h4>
                                {selectedResearch.find(r => r.id === research.id) && (
                                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{research.snippet}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">{research.source}</Badge>
                                <span className="text-xs text-muted-foreground truncate">{research.url}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {isResearching && (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
                          <p className="text-sm text-muted-foreground">Researching latest information...</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Fixed Footer */}
        <div className="flex items-center justify-between pt-4 border-t flex-shrink-0 bg-background">
          <div className="text-xs text-muted-foreground">
            {selectedDataSources.length + selectedResearch.length > 0 && (
              <>
                {selectedDataSources.length + selectedResearch.length} context source{selectedDataSources.length + selectedResearch.length !== 1 ? 's' : ''} selected
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="min-w-[120px]"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
