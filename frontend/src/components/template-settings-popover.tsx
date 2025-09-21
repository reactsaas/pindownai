"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Palette, 
  Code, 
  Zap, 
  Bell, 
  Users, 
  Lock,
  Download,
  Upload,
  FileText,
  Eye,
  Archive
} from "lucide-react"

interface TemplateSettingsPopoverProps {
  templateId?: string
  isTemplate?: boolean
}

export function TemplateSettingsPopover({ templateId, isTemplate = false }: TemplateSettingsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({
    autoSave: true,
    livePreview: true,
    syntaxHighlight: true,
    notifications: false,
    collaboration: true,
    publicAccess: false
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 bg-muted/50 hover:bg-muted cursor-pointer">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-[80vh] flex flex-col" align="end">
        <div className="p-4 border-b flex-shrink-0">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {isTemplate ? "Template Settings" : "Block Settings"}
          </h4>
          {templateId && (
            <p className="text-xs text-muted-foreground mt-1">ID: {templateId}</p>
          )}
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Editor Settings */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Code className="h-3 h-3" />
              EDITOR
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Auto-save</span>
                </div>
                <Switch 
                  checked={settings.autoSave}
                  onCheckedChange={() => toggleSetting('autoSave')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Live preview</span>
                </div>
                <Switch 
                  checked={settings.livePreview}
                  onCheckedChange={() => toggleSetting('livePreview')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Syntax highlight</span>
                </div>
                <Switch 
                  checked={settings.syntaxHighlight}
                  onCheckedChange={() => toggleSetting('syntaxHighlight')}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Collaboration Settings */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Users className="h-3 h-3" />
              COLLABORATION
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Notifications</span>
                </div>
                <Switch 
                  checked={settings.notifications}
                  onCheckedChange={() => toggleSetting('notifications')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Team editing</span>
                </div>
                <Switch 
                  checked={settings.collaboration}
                  onCheckedChange={() => toggleSetting('collaboration')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Public access</span>
                </div>
                <Switch 
                  checked={settings.publicAccess}
                  onCheckedChange={() => toggleSetting('publicAccess')}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <FileText className="h-3 h-3" />
              ACTIONS
            </h5>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                <Download className="h-4 w-4 mr-2" />
                Export template
              </Button>
              
              <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                <Upload className="h-4 w-4 mr-2" />
                Import blocks
              </Button>
              
              <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                <Archive className="h-4 w-4 mr-2" />
                Archive template
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-muted/20 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
