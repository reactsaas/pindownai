"use client"

import { useState } from "react"
import { Search, Filter, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const logs = [
    {
      id: 1,
      timestamp: "2024-01-15 22:29:42",
      level: "info",
      message: "Workflow executed successfully",
      workflowId: "wf-001",
      duration: "1.2s",
    },
    {
      id: 2,
      timestamp: "2024-01-15 22:29:38",
      level: "error",
      message: "Failed to connect to external API",
      workflowId: "wf-002",
      duration: "5.1s",
    },
    {
      id: 3,
      timestamp: "2024-01-15 22:29:35",
      level: "warning",
      message: "Rate limit approaching for SendGrid integration",
      workflowId: "wf-003",
      duration: "0.8s",
    },
    {
      id: 4,
      timestamp: "2024-01-15 22:29:30",
      level: "info",
      message: "User authentication completed",
      workflowId: "wf-001",
      duration: "0.3s",
    },
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "info":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Logs</h1>
              <p className="text-muted-foreground">Monitor workflow execution and system events</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Badge variant="outline" className={`text-xs ${getLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{log.message}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{log.timestamp}</span>
                      <span>Workflow: {log.workflowId}</span>
                      <span>Duration: {log.duration}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}




