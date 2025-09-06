"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  FileText,
  BarChart3,
  Settings,
  Pin,
  Database,
  HelpCircle,
  ChevronRight,
  ScrollText,
  MessageSquare,
  FolderOpen,
  Key,
  Grid3X3,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

interface Workflow {
  id: string
  name: string
  status: "active" | "inactive"
  lastUpdate: string
}

interface NavigationSidebarProps {
  workflows: Workflow[]
  selectedWorkflow: Workflow
  onSelectWorkflow: (workflow: Workflow) => void
  currentPage: string
  onPageChange: (page: string) => void
  searchQuery: string
  className?: string
}

export function NavigationSidebar({
  workflows,
  selectedWorkflow,
  onSelectWorkflow,
  currentPage,
  onPageChange,
  searchQuery,
  className = "",
}: NavigationSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState("workflows")

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const navigationSections = [
    {
      id: "workflows",
      title: "PINS",
      items: [
        { id: "pins", name: "Pins", icon: Pin, count: 12, route: "/pins" },
        { id: "pinboard", name: "Pinboard", icon: Grid3X3, count: 8, route: "/pinboard" },
        { id: "research", name: "Research", icon: BookOpen, count: 23, route: "/research" },
        { id: "prompts", name: "Prompts", icon: MessageSquare, count: 24, route: "/prompts" },
        { id: "documents", name: "Documents", icon: FolderOpen, count: 156, route: "/documents" },
        { id: "integrations", name: "Integrations", icon: Database, count: 8, route: "/integrations" },
      ],
    },
    {
      id: "monitoring",
      title: "MONITORING",
      items: [
        { id: "analytics", name: "Analytics", icon: BarChart3, count: null, route: "/analytics" },
        { id: "logs", name: "Logs", icon: ScrollText, count: 247, route: "/logs" },
      ],
    },
    {
      id: "settings",
      title: "SETTINGS",
      items: [
        { id: "api-keys", name: "API Keys", icon: Key, count: null, route: "/api-keys" },
        { id: "config", name: "Configuration", icon: Settings, count: null, route: "/config" },
        { id: "help", name: "Help Center", icon: HelpCircle, count: null, route: "/help" },
      ],
    },
  ]

  return (
    <div className={`w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full ${className}`}>
      {/* Pindown.ai branding header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push("/")}
          >
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Pin className="w-4 h-4 text-sidebar-primary-foreground rotate-45" />
            </div>
            <span className="font-semibold text-sidebar-foreground">pindown.ai</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto pt-4 sidebar-scroll">
        {navigationSections.map((section) => (
          <div key={section.id} className="p-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{section.title}</h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-8 px-2 text-sm font-normal",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    pathname === item.route &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  onClick={() => {
                    setActiveSection(item.id)
                    router.push(item.route)
                  }}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.count !== null && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        ))}

        {/* Current Workflows List - Always shown */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-sidebar-foreground">Current Pins</h4>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
            <div className="space-y-1">
              {filteredWorkflows.map((workflow) => (
                <Button
                  key={workflow.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-2 text-left",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    selectedWorkflow.id === workflow.id && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                  onClick={() => onSelectWorkflow(workflow)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        workflow.status === "active" ? "bg-green-500" : "bg-gray-500",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{workflow.name}</div>
                      <div className="text-xs text-muted-foreground">{workflow.id}</div>
                    </div>
                    <Badge variant={workflow.status === "active" ? "default" : "secondary"} className="text-xs">
                      {workflow.status}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
        </div>
      </div>
    </div>
  )
}
