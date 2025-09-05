"use client"

import { useState } from "react"
import {
  Database,
  Webhook,
  Mail,
  MessageSquare,
  CreditCard,
  Cloud,
  Shield,
  Zap,
  ExternalLink,
  Plus,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  category: string
  status: "connected" | "available" | "coming-soon"
  popular: boolean
}

export function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const integrations: Integration[] = [
    {
      id: "supabase",
      name: "Supabase",
      description: "Open source Firebase alternative with PostgreSQL database",
      icon: Database,
      category: "database",
      status: "connected",
      popular: true,
    },
    {
      id: "webhook",
      name: "Webhooks",
      description: "Receive real-time data from external services",
      icon: Webhook,
      category: "api",
      status: "connected",
      popular: true,
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      description: "Email delivery and marketing platform",
      icon: Mail,
      category: "communication",
      status: "available",
      popular: true,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Team communication and collaboration",
      icon: MessageSquare,
      category: "communication",
      status: "available",
      popular: true,
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Payment processing and billing",
      icon: CreditCard,
      category: "payment",
      status: "available",
      popular: true,
    },
    {
      id: "aws",
      name: "AWS S3",
      description: "Cloud storage and file management",
      icon: Cloud,
      category: "storage",
      status: "available",
      popular: false,
    },
    {
      id: "auth0",
      name: "Auth0",
      description: "Identity and access management",
      icon: Shield,
      category: "auth",
      status: "coming-soon",
      popular: false,
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Automation between apps and services",
      icon: Zap,
      category: "automation",
      status: "coming-soon",
      popular: true,
    },
  ]

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "database", name: "Database" },
    { id: "api", name: "API & Webhooks" },
    { id: "communication", name: "Communication" },
    { id: "payment", name: "Payment" },
    { id: "storage", name: "Storage" },
    { id: "auth", name: "Authentication" },
    { id: "automation", name: "Automation" },
  ]

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "available":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "coming-soon":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected"
      case "available":
        return "Available"
      case "coming-soon":
        return "Coming Soon"
      default:
        return status
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Integrations</h1>
              <p className="text-muted-foreground">Connect your workflows with external services and APIs</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Request Integration
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-xs"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Popular Integrations */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-foreground mb-4">Popular Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredIntegrations
              .filter((integration) => integration.popular)
              .map((integration) => (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <integration.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">{integration.name}</CardTitle>
                          <Badge variant="outline" className={`text-xs mt-1 ${getStatusColor(integration.status)}`}>
                            {integration.status === "connected" && <Check className="w-3 h-3 mr-1" />}
                            {getStatusText(integration.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs mb-3">{integration.description}</CardDescription>
                    <Button
                      size="sm"
                      variant={integration.status === "connected" ? "outline" : "default"}
                      className="w-full text-xs"
                      disabled={integration.status === "coming-soon"}
                    >
                      {integration.status === "connected"
                        ? "Configure"
                        : integration.status === "coming-soon"
                          ? "Coming Soon"
                          : "Connect"}
                      {integration.status !== "coming-soon" && <ExternalLink className="w-3 h-3 ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* All Integrations */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4">All Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <integration.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">{integration.name}</CardTitle>
                        <Badge variant="outline" className={`text-xs mt-1 ${getStatusColor(integration.status)}`}>
                          {integration.status === "connected" && <Check className="w-3 h-3 mr-1" />}
                          {getStatusText(integration.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs mb-3">{integration.description}</CardDescription>
                  <Button
                    size="sm"
                    variant={integration.status === "connected" ? "outline" : "default"}
                    className="w-full text-xs"
                    disabled={integration.status === "coming-soon"}
                  >
                    {integration.status === "connected"
                      ? "Configure"
                      : integration.status === "coming-soon"
                        ? "Coming Soon"
                        : "Connect"}
                    {integration.status !== "coming-soon" && <ExternalLink className="w-3 h-3 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}




