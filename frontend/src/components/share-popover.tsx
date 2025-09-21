"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Share, 
  Copy, 
  Link, 
  Mail, 
  MessageSquare,
  Users,
  Eye,
  Edit,
  Lock,
  Globe,
  QrCode,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface SharePopoverProps {
  templateId?: string
  templateName?: string
  isTemplate?: boolean
  isPublished?: boolean
}

export function SharePopover({ templateId, templateName, isTemplate = false, isPublished = false }: SharePopoverProps) {
  const { user, getAuthToken } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishStatus, setPublishStatus] = useState(isPublished)
  const [shareSettings, setShareSettings] = useState({
    allowEdit: false,
    requireAuth: true,
    allowComments: true
  })

  const shareUrl = `${window.location.origin}/share/pin/${templateId || 'template-123'}`
  const embedCode = `<iframe src="${shareUrl}/embed" width="100%" height="600"></iframe>`

  // Update publish status when prop changes
  useEffect(() => {
    setPublishStatus(isPublished)
  }, [isPublished])

  const toggleSetting = (key: keyof typeof shareSettings) => {
    setShareSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handlePublishToggle = async () => {
    if (!user || !templateId) return

    setIsPublishing(true)
    try {
      const token = await getAuthToken()
      const endpoint = publishStatus ? 'unpublish' : 'publish'
      
      const response = await fetch(`http://localhost:8000/api/pins/${templateId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} pin`)
      }

      const newStatus = !publishStatus
      setPublishStatus(newStatus)
      
      toast.success(newStatus ? 'Pin published successfully!' : 'Pin unpublished successfully!')
    } catch (error) {
      console.error(`Error ${publishStatus ? 'unpublishing' : 'publishing'} pin:`, error)
      toast.error(`Failed to ${publishStatus ? 'unpublish' : 'publish'} pin`)
    } finally {
      setIsPublishing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (err) {
      console.error("Failed to copy:", err)
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this ${isTemplate ? 'template' : 'block'}: ${templateName || 'Untitled'}`)
    const body = encodeURIComponent(`I wanted to share this ${isTemplate ? 'template' : 'block'} with you:\n\n${shareUrl}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3 bg-white hover:bg-gray-50 text-black text-sm cursor-pointer border border-gray-200">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 max-h-[90vh] flex flex-col" align="end">
        <div className="p-4 border-b flex-shrink-0">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Share className="h-4 w-4" />
            Share {isTemplate ? "Template" : "Block"}
          </h4>
          {templateName && (
            <p className="text-xs text-muted-foreground mt-1">{templateName}</p>
          )}
          {publishStatus && (
            <Badge variant="secondary" className="mt-2 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Published
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0 max-h-[70vh]">
          {/* Share Link */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Link className="h-3 h-3" />
              SHARE LINK
            </h5>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={shareUrl}
                  readOnly
                  className="text-xs font-mono"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(shareUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={shareViaEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Slack
                </Button>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Publish Status */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Upload className="h-3 h-3" />
              PUBLISH STATUS
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Make public</span>
                </div>
                <Switch 
                  checked={publishStatus}
                  onCheckedChange={handlePublishToggle}
                  disabled={isPublishing}
                />
              </div>
              {isPublishing && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {publishStatus ? 'Unpublishing...' : 'Publishing...'}
                </div>
              )}
              {!publishStatus && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                        Private Pin
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        This pin is only visible to you. Enable public viewing to share it with others.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Users className="h-3 h-3" />
              PERMISSIONS
            </h5>
            <div className="space-y-3">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Allow editing</span>
                </div>
                <Switch 
                  checked={shareSettings.allowEdit}
                  onCheckedChange={() => toggleSetting('allowEdit')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Require sign-in</span>
                </div>
                <Switch 
                  checked={shareSettings.requireAuth}
                  onCheckedChange={() => toggleSetting('requireAuth')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Allow comments</span>
                </div>
                <Switch 
                  checked={shareSettings.allowComments}
                  onCheckedChange={() => toggleSetting('allowComments')}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Embed Code */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Globe className="h-3 h-3" />
              EMBED
            </h5>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input 
                  value={embedCode}
                  readOnly
                  className="text-xs font-mono"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(embedCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Embed this {isTemplate ? 'template' : 'block'} in your website or documentation.
              </p>
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
