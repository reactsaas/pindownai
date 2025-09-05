"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Globe, 
  Shield, 
  Clock,
  Tag,
  AlertCircle,
  CheckCircle,
  Rocket,
  Eye,
  Users,
  Zap
} from "lucide-react"

interface PublishPopoverProps {
  templateId?: string
  templateName?: string
  isTemplate?: boolean
  isPublished?: boolean
}

export function PublishPopover({ templateId, templateName, isTemplate = false, isPublished = false }: PublishPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [publishSettings, setPublishSettings] = useState({
    visibility: "private", // private, public, unlisted
    autoUpdate: true,
    allowForks: true,
    requireApproval: false,
    enableAnalytics: true
  })
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>(["automation", "template"])
  const [version, setVersion] = useState("1.0.0")

  const toggleSetting = (key: keyof typeof publishSettings) => {
    setPublishSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag])
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handlePublish = () => {
    // Handle publish logic here
    console.log("Publishing with settings:", {
      publishSettings,
      description,
      tags,
      version
    })
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium cursor-pointer"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isPublished ? "Update" : "Publish"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 max-h-[80vh] flex flex-col" align="end">
        <div className="p-4 border-b flex-shrink-0">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {isPublished ? "Update" : "Publish"} {isTemplate ? "Template" : "Block"}
          </h4>
          {templateName && (
            <p className="text-xs text-muted-foreground mt-1">{templateName}</p>
          )}
          {isPublished && (
            <Badge variant="secondary" className="mt-2 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Published
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Basic Info */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Rocket className="h-3 h-3" />
              PUBLICATION
            </h5>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Visibility</label>
                <Select value={publishSettings.visibility} onValueChange={(value) => 
                  setPublishSettings(prev => ({ ...prev, visibility: value }))
                }>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Private - Only you
                      </div>
                    </SelectItem>
                    <SelectItem value="unlisted">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Unlisted - Anyone with link
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public - Everyone
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Version</label>
                <Input 
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                  className="h-8 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Description</label>
                <Textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this template does and how to use it..."
                  className="text-sm min-h-[60px] resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Tag className="h-3 h-3" />
              TAGS
            </h5>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-xs cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <Input 
                placeholder="Add tag (press Enter)"
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTag(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Users className="h-3 h-3" />
              SETTINGS
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Auto-update</span>
                </div>
                <Switch 
                  checked={publishSettings.autoUpdate}
                  onCheckedChange={() => toggleSetting('autoUpdate')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Allow forks</span>
                </div>
                <Switch 
                  checked={publishSettings.allowForks}
                  onCheckedChange={() => toggleSetting('allowForks')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Require approval</span>
                </div>
                <Switch 
                  checked={publishSettings.requireApproval}
                  onCheckedChange={() => toggleSetting('requireApproval')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Enable analytics</span>
                </div>
                <Switch 
                  checked={publishSettings.enableAnalytics}
                  onCheckedChange={() => toggleSetting('enableAnalytics')}
                />
              </div>
            </div>
          </div>

          {/* Warning for public */}
          {publishSettings.visibility === "public" && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                    Public Publication
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    This {isTemplate ? 'template' : 'block'} will be visible to everyone and searchable in the public gallery.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/20 flex-shrink-0">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handlePublish}
            >
              <Rocket className="h-4 w-4 mr-2" />
              {isPublished ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
