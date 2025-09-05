"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Github, Share, Upload } from "lucide-react"

interface TopBarProps {
  workflowId?: string
  searchQuery?: string
  onSearchChange?: (query: string) => void
  selectedVersion?: string
  onVersionChange?: (version: string) => void
}

export function TopBar({
  workflowId,
  searchQuery = "",
  onSearchChange,
  selectedVersion = "v1.3",
  onVersionChange,
}: TopBarProps) {
  return (
    <div className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-end px-8 py-3 top-bar">

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        {/* Version dropdown */}
        <Select value={selectedVersion} onValueChange={onVersionChange}>
          <SelectTrigger className="w-16 h-7 text-xs bg-muted/50 border-muted-foreground/20 hover:bg-muted">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="v1.3">v1.3</SelectItem>
            <SelectItem value="v1.2">v1.2</SelectItem>
            <SelectItem value="v1.1">v1.1</SelectItem>
            <SelectItem value="v1.0">v1.0</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 bg-muted/50 hover:bg-muted">
          <Settings className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 bg-muted/50 hover:bg-muted">
          <Github className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" className="h-9 px-3 bg-muted/50 hover:bg-muted text-sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>

        <Button
          size="sm"
          className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
        >
          <Upload className="h-4 w-4 mr-2" />
          Publish
        </Button>

        <div className="ml-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="bg-destructive text-destructive-foreground text-xs font-medium">
              WF
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}
