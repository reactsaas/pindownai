"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Database, Settings, ChevronRight, Eye, Copy, FileText, Image, Link, Brain, Sparkles, Trash2, Search } from "lucide-react"

interface DataEntry {
  id: number
  data: Record<string, any>
}

interface Integration {
  id: number
  name: string
  type: string
  status: "connected" | "disconnected"
  lastSync: string
  datasets: string[]
}

interface ExtractedDataSource {
  id: number
  name: string
  sourceDocument: string
  extractedAt: string
  dataType: "text" | "structured" | "mixed"
  status: "processing" | "completed" | "failed"
  data: {
    content?: any
    images?: Array<{
      url: string
      caption: string
      extractedText?: string
    }>
    links?: Array<{
      url: string
      title: string
      description?: string
    }>
  }
}

interface PerplexityResearchDataSource {
  id: number
  name: string
  query: string
  researchedAt: string
  status: "processing" | "completed" | "failed"
  data: {
    summary?: string
    sources?: Array<{
      url: string
      title: string
      snippet: string
    }>
    insights?: string[]
  }
}

interface TemplateDataSourcesProps {
  receivedDataEntries: DataEntry[]
  integrationsData: Integration[]
  extractedDataSources: ExtractedDataSource[]
  perplexityResearchDataSources: PerplexityResearchDataSource[]
  expandedEntries: Set<number>
  onToggleExpanded: (id: number) => void
  onAddReceivedData?: () => void
  onAddExtractedData?: () => void
  onAddPerplexityResearchData?: () => void
  onAddIntegrationData?: () => void
  onDeleteReceivedData?: (id: number) => void
  onDeleteExtractedData?: (id: number) => void
  onDeletePerplexityResearchData?: (id: number) => void
  onDeleteIntegrationData?: (id: number) => void
}

export function TemplateDataSources({
  receivedDataEntries,
  integrationsData,
  extractedDataSources,
  perplexityResearchDataSources,
  expandedEntries,
  onToggleExpanded,
  onAddReceivedData,
  onAddExtractedData,
  onAddPerplexityResearchData,
  onAddIntegrationData,
  onDeleteReceivedData,
  onDeleteExtractedData,
  onDeletePerplexityResearchData,
  onDeleteIntegrationData
}: TemplateDataSourcesProps) {
  return (
    <div className="h-full relative">
      {/* Header - Absolute positioned */}
      <div className="absolute top-0 left-0 right-0 p-6 pb-4 bg-background border-b z-10">
        <CardTitle className="text-sm font-medium">Template Data Sources</CardTitle>
      </div>

      {/* Scrollable content - Absolute positioned with proper spacing */}
      <div className="absolute top-16 left-0 right-0 bottom-0 overflow-y-auto sidebar-scroll p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Workflow Data
            </h3>
            {onAddReceivedData && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAddReceivedData}
                className="h-7 px-2 text-xs"
              >
                Add Item
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {receivedDataEntries.map((entry) => (
              <Card key={entry.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onToggleExpanded(entry.id)}
                        className="flex-1 flex items-center gap-2 text-left hover:bg-muted/50 rounded p-2 -m-2 transition-colors"
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            expandedEntries.has(entry.id) ? "rotate-90" : ""
                          }`}
                        />
                        <span className="text-sm font-medium">{Object.keys(entry.data).length} fields</span>
                        <span className="text-xs text-muted-foreground">• Click to expand</span>
                      </button>
                      {onDeleteReceivedData && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteReceivedData(entry.id)
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-6 px-2 py-1">
                      <span className="text-xs font-mono text-muted-foreground">wd_{entry.id}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(`wd_${entry.id}`)
                        }}
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {expandedEntries.has(entry.id) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <pre className="text-xs font-mono bg-background/50 p-3 rounded border overflow-x-auto">
                        {JSON.stringify(entry.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Extracted Document Data
            </h3>
            {onAddExtractedData && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAddExtractedData}
                className="h-7 px-2 text-xs"
              >
                Add Item
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {extractedDataSources.map((source) => (
              <Card key={source.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onToggleExpanded(source.id + 1000)} // Offset to avoid conflicts
                        className="flex-1 flex items-center gap-2 text-left hover:bg-muted/50 rounded p-2 -m-2 transition-colors"
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            expandedEntries.has(source.id + 1000) ? "rotate-90" : ""
                          }`}
                        />
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{Object.keys(source.data).length} fields</span>
                        <span className="text-xs text-muted-foreground">• {source.name}</span>
                      </button>
                      {onDeleteExtractedData && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteExtractedData(source.id)
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-6 px-2 py-1">
                      <span className="text-xs font-mono text-muted-foreground">ed_{source.id}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(`ed_${source.id}`)
                        }}
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {expandedEntries.has(source.id + 1000) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      {/* Content Preview */}
                      {source.data.content && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Extracted Content:</p>
                          <div className="bg-background/50 border rounded p-3">
                            <pre className="text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
                              {typeof source.data.content === 'string' 
                                ? source.data.content 
                                : JSON.stringify(source.data.content, null, 2)
                              }
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Images Section */}
                      {source.data.images && source.data.images.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <Image className="w-3 h-3" />
                            Extracted Images ({source.data.images.length})
                          </p>
                          <div className="space-y-2">
                            {source.data.images.slice(0, 3).map((img, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-2 bg-background/50 border rounded">
                                <div className="w-8 h-8 bg-muted/50 rounded flex items-center justify-center">
                                  <Image className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{img.caption}</p>
                                  {img.extractedText && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      Text: {img.extractedText}
                                    </p>
                                  )}
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            {source.data.images.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{source.data.images.length - 3} more images
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Links Section */}
                      {source.data.links && source.data.links.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <Link className="w-3 h-3" />
                            Extracted Links ({source.data.links.length})
                          </p>
                          <div className="space-y-2">
                            {source.data.links.slice(0, 3).map((link, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-2 bg-background/50 border rounded">
                                <Link className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{link.title}</p>
                                  {link.description && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {link.description}
                                    </p>
                                  )}
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            {source.data.links.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{source.data.links.length - 3} more links
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                                             {/* Full JSON View */}
                       <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Full JSON Data:</p>
                        <pre className="text-xs font-mono bg-background/50 p-3 rounded border overflow-x-auto max-h-64 overflow-y-auto">
                          {JSON.stringify(source.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Perplexity Research Data
            </h3>
            {onAddPerplexityResearchData && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAddPerplexityResearchData}
                className="h-7 px-2 text-xs"
              >
                Add Item
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {perplexityResearchDataSources.map((source) => (
              <Card key={source.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onToggleExpanded(source.id + 2000)} // Offset to avoid conflicts
                        className="flex-1 flex items-center gap-2 text-left hover:bg-muted/50 rounded p-2 -m-2 transition-colors"
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            expandedEntries.has(source.id + 2000) ? "rotate-90" : ""
                          }`}
                        />
                        <Search className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">{source.data.sources?.length || 0} sources</span>
                        <span className="text-xs text-muted-foreground">• {source.name}</span>
                      </button>
                      {onDeletePerplexityResearchData && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeletePerplexityResearchData(source.id)
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-6 px-2 py-1">
                      <span className="text-xs font-mono text-muted-foreground">pr_{source.id}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(`pr_${source.id}`)
                        }}
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {expandedEntries.has(source.id + 2000) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      {/* Query */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Research Query:</p>
                        <div className="bg-background/50 border rounded p-3">
                          <p className="text-xs">{source.query}</p>
                        </div>
                      </div>

                      {/* Summary */}
                      {source.data.summary && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Summary:</p>
                          <div className="bg-background/50 border rounded p-3">
                            <p className="text-xs">{source.data.summary}</p>
                          </div>
                        </div>
                      )}

                      {/* Sources */}
                      {source.data.sources && source.data.sources.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Sources ({source.data.sources.length}):</p>
                          <div className="space-y-2">
                            {source.data.sources.slice(0, 3).map((source_item, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-2 bg-background/50 border rounded">
                                <Link className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">{source_item.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{source_item.snippet}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            {source.data.sources.length > 3 && (
                              <p className="text-xs text-muted-foreground">
                                +{source.data.sources.length - 3} more sources
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Full JSON View */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Full JSON Data:</p>
                        <pre className="text-xs font-mono bg-background/50 p-3 rounded border overflow-x-auto max-h-64 overflow-y-auto">
                          {JSON.stringify(source.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Integration Data
            </h3>
            {onAddIntegrationData && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAddIntegrationData}
                className="h-7 px-2 text-xs"
              >
                Add Item
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {integrationsData.map((integration) => (
              <Card key={integration.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onToggleExpanded(integration.id + 3000)} // Offset to avoid conflicts
                        className="flex-1 flex items-center gap-2 text-left hover:bg-muted/50 rounded p-2 -m-2 transition-colors"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            integration.status === "connected" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm font-medium">{integration.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {integration.type} • Last sync: {integration.lastSync}
                        </span>
                      </button>
                      {onDeleteIntegrationData && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteIntegrationData(integration.id)
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-6 px-2 py-1">
                      <span className="text-xs font-mono text-muted-foreground">int_{integration.id}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(`int_${integration.id}`)
                        }}
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {expandedEntries.has(integration.id + 3000) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Available Datasets:</p>
                        <div className="flex flex-wrap gap-2">
                          {integration.datasets.map((dataset) => (
                            <span
                              key={dataset}
                              className="px-2 py-1 bg-background/50 border rounded text-xs font-mono"
                            >
                              {dataset}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
