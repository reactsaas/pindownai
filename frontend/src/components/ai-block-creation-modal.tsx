"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Sparkles, 
  FileText, 
  Database, 
  Globe,
  Loader2, 
  Check,
  CheckSquare,
  Square,
  Eye,
  Zap,
  Type,
  Hash,
  List,
  Table,
  AlertCircle,
  Image,
  GitBranch
} from "lucide-react"

interface DataSource {
  id: string
  name: string
  type: "workflow" | "integration" | "document"
  description: string
  datasets?: string[]
  status?: "connected" | "disconnected"
}

interface BlockType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  example: string
}

interface AIBlockCreationModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateBlock: (blockData: {
    name: string
    type: string
    prompt: string
    selectedDataSources: DataSource[]
    generatedTemplate: string
  }) => void
}

const blockTypes: BlockType[] = [
  {
    id: "markdown",
    name: "Markdown",
    description: "Paragraphs and formatted text content",
    icon: <FileText className="h-4 w-4" />,
    example: "**User:** {{user_name}}\n**Email:** {{user_email}}"
  },
  {
    id: "mermaid",
    name: "Mermaid Diagram",
    description: "Flowcharts, sequence diagrams, and other diagrams",
    icon: <GitBranch className="h-4 w-4" />,
    example: "```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n```"
  },
  {
    id: "conditional",
    name: "Conditional",
    description: "Content that shows based on conditions",
    icon: <AlertCircle className="h-4 w-4" />,
    example: "{{#if success}}\n✅ **Status:** Success\n{{else}}\n❌ **Status:** Failed\n{{/if}}"
  },
  {
    id: "image",
    name: "Image",
    description: "Images and media content",
    icon: <Image className="h-4 w-4" />,
    example: "![{{alt_text}}]({{image_url}})\n\n*{{caption}}*"
  },
  {
    id: "image-steps",
    name: "Image Steps",
    description: "Step-by-step instructions with images",
    icon: <List className="h-4 w-4" />,
    example: "## {{title}}\n\n{{#each steps}}\n### Step {{step_number}}: {{step_title}}\n\n![Step {{step_number}}]({{step_image_url}})\n\n{{step_description}}\n\n{{/each}}"
  }
]

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
  },
  {
    id: "marketing-guide",
    name: "Marketing Guidelines.pdf",
    type: "document",
    description: "Marketing strategy and content guidelines"
  },
  {
    id: "product-specs",
    name: "Product Specifications.docx",
    type: "document",
    description: "Detailed product features and specifications"
  }
]

export function AIBlockCreationModal({ isOpen, onOpenChange, onCreateBlock }: AIBlockCreationModalProps) {
  const [blockName, setBlockName] = useState("")
  const [selectedBlockType, setSelectedBlockType] = useState<string>("")
  const [prompt, setPrompt] = useState("")
  const [selectedDataSources, setSelectedDataSources] = useState<DataSource[]>([])
  const [resourcePrompts, setResourcePrompts] = useState<Record<string, string>>({})
  const [generatedTemplate, setGeneratedTemplate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

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

  // Group data sources by type
  const workflowSources = availableDataSources.filter(ds => ds.type === "workflow")
  const documentSources = availableDataSources.filter(ds => ds.type === "document")

  const generateTemplate = async () => {
    if (!blockName.trim() || !selectedBlockType || !prompt.trim()) return
    
    setIsGenerating(true)
    
    // Mock AI generation - replace with actual AI API call
    setTimeout(() => {
      const selectedType = blockTypes.find(bt => bt.id === selectedBlockType)
      const baseTemplate = selectedType?.example || ""
      
      // Create a more sophisticated template based on the prompt and selected data sources
      let aiGeneratedTemplate = baseTemplate
      
      if (prompt.toLowerCase().includes("user")) {
        aiGeneratedTemplate = "# {{user_name}}'s {{block_title}}\n\n**Email:** {{user_email}}\n**Status:** {{user_status}}\n\n{{user_description}}"
      } else if (prompt.toLowerCase().includes("order") || prompt.toLowerCase().includes("purchase")) {
        aiGeneratedTemplate = "## Order Details\n\n**Order ID:** {{order_id}}\n**Amount:** ${{amount}}\n**Status:** {{order_status}}\n**Date:** {{order_date}}"
      } else if (prompt.toLowerCase().includes("mermaid") || prompt.toLowerCase().includes("diagram") || prompt.toLowerCase().includes("flow")) {
        aiGeneratedTemplate = "```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n    C --> E[End]\n    D --> E\n```"
      } else {
        // Generic template based on block type and prompt
        aiGeneratedTemplate = `# {{${blockName.toLowerCase().replace(/\s+/g, '_')}_title}}\n\n${baseTemplate}\n\n*Generated for: ${prompt}*`
      }
      
      setGeneratedTemplate(aiGeneratedTemplate)
      setIsGenerating(false)
      setActiveTab("preview")
    }, 2000)
  }

  const handleCreate = () => {
    if (!blockName.trim() || !selectedBlockType) return

    // If we already have a generated template, go to preview
    if (generatedTemplate.trim()) {
      setActiveTab("preview")
      return
    }

    // If we have a prompt, generate template
    if (prompt.trim()) {
      setIsGenerating(true)
      setActiveTab("preview")
      
      // Generate template
      setTimeout(() => {
        let templateToUse = generatedTemplate
        if (!templateToUse.trim()) {
          const selectedType = blockTypes.find(bt => bt.id === selectedBlockType)
          templateToUse = selectedType?.example || `# {{title}}\n\n${prompt}`
        }
        
        setGeneratedTemplate(templateToUse)
        setIsGenerating(false)
      }, 2000)
    } else {
      // No prompt provided, create with basic template and confirm immediately
      const selectedType = blockTypes.find(bt => bt.id === selectedBlockType)
      const basicTemplate = selectedType?.example || `# ${blockName}\n\nAdd your content here...`
      
      setGeneratedTemplate(basicTemplate)
      handleConfirmCreate()
    }
  }

  const handleConfirmCreate = () => {
    onCreateBlock({
      name: blockName,
      type: selectedBlockType,
      prompt,
      selectedDataSources,
      generatedTemplate
    })
    
    // Reset form
    setBlockName("")
    setSelectedBlockType("")
    setPrompt("")
    setSelectedDataSources([])
    setResourcePrompts({})
    setGeneratedTemplate("")
    setActiveTab("basic")
    onOpenChange(false)
  }

  const canGenerate = blockName.trim().length > 0 && selectedBlockType && prompt.trim().length > 0
  const canCreate = blockName.trim().length > 0 && selectedBlockType // Allow creation with just basic info
  const canProceedToGenerate = canGenerate && (selectedDataSources.length === 0 || selectedDataSources.every(ds => resourcePrompts[ds.id]?.trim()))

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[1000px] h-[85vh] max-h-[800px] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Create New Block
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Resources
              {selectedDataSources.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {selectedDataSources.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
              {generatedTemplate && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  ✓
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 mt-4 overflow-hidden">
            <TabsContent value="basic" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="space-y-6 p-1 pr-3">
                {/* Main Fields Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Block Details</h3>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Block Name
                    </label>
                    <Input
                      placeholder="e.g., User Profile Card, Order Summary, Data Table"
                      value={blockName}
                      onChange={(e) => setBlockName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Block Type
                    </label>
                    <Select value={selectedBlockType} onValueChange={setSelectedBlockType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a block type" />
                      </SelectTrigger>
                      <SelectContent>
                        {blockTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              <div>
                                <div className="font-medium">{type.name}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* AI Generation Section */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">AI Template Generation</h3>
                    <Badge variant="outline" className="text-xs text-muted-foreground">Optional</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Let AI generate a template for you, or create the block with a basic template and edit it later.
                  </p>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Describe what this block should do
                    </label>
                    <Textarea
                      placeholder="Describe what content this block should display, what data it should use, how it should be formatted, etc. Be specific about the structure and content you want."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={generateTemplate}
                      disabled={!canProceedToGenerate || isGenerating}
                      className="min-w-[140px]"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Selected Resources Summary */}
                {selectedDataSources.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Selected Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedDataSources.map(source => (
                          <Badge key={source.id} variant="outline" className="text-xs">
                            {getDataSourceIcon(source.type)}
                            <span className="ml-1">{source.name}</span>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    {canCreate ? "Ready to create block" : "Fill in the required fields to continue"}
                    {canCreate && !prompt.trim() && " (AI generation is optional)"}
                  </div>
                  <div className="flex gap-2">
                    {selectedDataSources.length > 0 && (
                      <Button 
                        onClick={() => setActiveTab("resources")}
                        disabled={!canCreate}
                        variant="outline"
                      >
                        Configure Resources
                      </Button>
                    )}
                  </div>
                </div>
                </div>
              </ScrollArea>
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
                    {workflowSources.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          Workflow Data
                        </h3>
                        <div className="space-y-3">
                          {workflowSources.map(source => {
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
                    {documentSources.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-orange-500" />
                          Documents
                        </h3>
                        <div className="space-y-3">
                          {documentSources.map(source => {
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
                                          placeholder="Extract key insights, statistics, or specific sections from the document"
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

                {selectedDataSources.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="text-xs text-muted-foreground text-center">
                      {selectedDataSources.every(ds => resourcePrompts[ds.id]?.trim()) 
                        ? `${selectedDataSources.length} resource${selectedDataSources.length !== 1 ? 's' : ''} configured` 
                        : `${selectedDataSources.length} resource${selectedDataSources.length !== 1 ? 's' : ''} selected - configure all to continue`
                      }
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview" className="h-full m-0">
              <div className="space-y-4 h-full flex flex-col">
                {generatedTemplate ? (
                  <>
                    <div className="flex-shrink-0">
                      <label className="text-sm font-medium mb-2 block">
                        Generated Template Preview
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Review the AI-generated markdown template. You can edit it directly or regenerate with different parameters.
                      </p>
                    </div>

                    <Card className="flex-1 min-h-0">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {blockName || "Untitled Block"}
                          <Badge variant="secondary" className="text-xs">{selectedBlockType}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-full overflow-hidden">
                        <ScrollArea className="h-full">
                          <Textarea
                            value={generatedTemplate}
                            onChange={(e) => setGeneratedTemplate(e.target.value)}
                            className="min-h-[200px] font-mono text-xs resize-none border-0 p-0 bg-transparent"
                            placeholder="Generated template will appear here..."
                          />
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <div className="flex justify-start pt-4 border-t">
                      <Button 
                        variant="outline"
                        onClick={generateTemplate}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                          <h3 className="text-sm font-medium mb-2">Generating Template</h3>
                          <p className="text-xs text-muted-foreground mb-4">
                            AI is creating your block template based on your specifications...
                          </p>
                        </>
                      ) : (
                        <>
                          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-sm font-medium mb-2">No Template Generated Yet</h3>
                          <p className="text-xs text-muted-foreground mb-4">
                            Complete the basic information and click "Create Block" to generate a template.
                          </p>
                          <Button 
                            onClick={() => setActiveTab("basic")}
                            variant="outline"
                            size="sm"
                          >
                            Go to Basic Info
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Fixed Footer */}
        <div className="flex items-center justify-between pt-4 border-t flex-shrink-0 bg-background">
          <div className="text-xs text-muted-foreground">
            {selectedDataSources.length > 0 && (
              <>
                {selectedDataSources.length} data source{selectedDataSources.length !== 1 ? 's' : ''} selected
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={activeTab === "preview" && generatedTemplate ? handleConfirmCreate : handleCreate}
              disabled={!canCreate || isGenerating}
              className="min-w-[120px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : activeTab === "preview" && generatedTemplate ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm & Create
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Block
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
