"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { NavigationSidebar } from "@/components/navigation-sidebar"
import { AuthProvider } from "@/lib/auth-context"
import { PinsProvider } from "@/lib/pins-context"
import { PinboardProvider } from "@/lib/pinboard-context"

// Mock data for workflows - this should come from a context or API
const mockWorkflows = [
  { id: "wf-001", name: "Server Monitoring", status: "active" as const, lastUpdate: "2 min ago" },
  { id: "wf-002", name: "User Onboarding", status: "active" as const, lastUpdate: "5 min ago" },
  { id: "wf-003", name: "Payment Processing", status: "inactive" as const, lastUpdate: "1 hour ago" },
  { id: "wf-004", name: "Email Campaign", status: "active" as const, lastUpdate: "10 min ago" },
  { id: "wf-005", name: "Database Backup", status: "active" as const, lastUpdate: "15 min ago" },
  { id: "wf-006", name: "Security Scan", status: "inactive" as const, lastUpdate: "2 hours ago" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [selectedWorkflow, setSelectedWorkflow] = useState(mockWorkflows[0])
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <AuthProvider requireAuth={true}>
      <PinsProvider>
        <PinboardProvider>
        <div className="h-screen bg-background overflow-hidden">
        {/* Mobile header with hamburger menu */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <h1 className="text-lg font-semibold">pindown.ai</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2"
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Content Container */}
        <div className="flex h-full lg:h-screen">
          {/* Desktop Sidebar */}
          <NavigationSidebar
            workflows={mockWorkflows}
            selectedWorkflow={selectedWorkflow}
            onSelectWorkflow={setSelectedWorkflow}
            currentPage="pins"
            onPageChange={() => {}}
            searchQuery=""
            className="hidden lg:flex"
            onMobileNavigation={() => {}}
          />

          {/* Mobile backdrop */}
          {isMobileSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Mobile Sidebar */}
          <div 
            className={`
              lg:hidden fixed top-0 bottom-0 left-0 z-50
              transform transition-transform duration-300 ease-in-out
              ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <NavigationSidebar
              workflows={mockWorkflows}
              selectedWorkflow={selectedWorkflow}
              onSelectWorkflow={(workflow) => {
                setSelectedWorkflow(workflow)
                setIsMobileSidebarOpen(false)
              }}
              currentPage="pins"
              onPageChange={() => setIsMobileSidebarOpen(false)}
              searchQuery=""
              onMobileNavigation={() => setIsMobileSidebarOpen(false)}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {children}
          </div>
        </div>
      </div>
        </PinboardProvider>
      </PinsProvider>
    </AuthProvider>
  )
}
