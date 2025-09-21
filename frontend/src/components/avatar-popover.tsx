"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Settings, 
  CreditCard,
  Bell,
  Moon,
  Sun,
  LogOut,
  Crown,
  Zap,
  Shield,
  Mail,
  HelpCircle
} from "lucide-react"
import { useTheme } from "next-themes"

interface AvatarPopoverProps {
  userName?: string
  userEmail?: string
  avatarUrl?: string
  isPro?: boolean
}

export function AvatarPopover({ 
  userName = "Workflow User", 
  userEmail = "user@example.com",
  avatarUrl,
  isPro = false 
}: AvatarPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const { theme, setTheme } = useTheme()

  const userInitials = userName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer">
          <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/20 transition-all">
            <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} />
            <AvatarFallback className="bg-destructive text-destructive-foreground text-xs font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-[80vh] flex flex-col" align="end">
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} />
              <AvatarFallback className="bg-destructive text-destructive-foreground text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm truncate">{userName}</h4>
                {isPro && (
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Account Section */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <User className="h-3 h-3" />
              ACCOUNT
            </h5>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                <User className="h-4 w-4 mr-3" />
                Profile Settings
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                <CreditCard className="h-4 w-4 mr-3" />
                Billing & Plans
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                <Settings className="h-4 w-4 mr-3" />
                Preferences
              </Button>
            </div>
          </div>

          <Separator />

          {/* Quick Settings */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Settings className="h-3 h-3" />
              SETTINGS
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span className="text-sm">Dark mode</span>
                </div>
                <Switch 
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Notifications</span>
                </div>
                <Switch 
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Usage Stats */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Zap className="h-3 h-3" />
              USAGE
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Templates created</span>
                <span className="font-mono">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>AI generations</span>
                <span className="font-mono">84 / 100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '84%' }}></div>
              </div>
              {!isPro && (
                <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                  <Crown className="h-3 w-3 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Support */}
          <div>
            <h5 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <HelpCircle className="h-3 h-3" />
              SUPPORT
            </h5>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                <HelpCircle className="h-4 w-4 mr-3" />
                Help Center
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8 px-2">
                <Mail className="h-4 w-4 mr-3" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-muted/20 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              // Handle logout
              setIsOpen(false)
            }}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}



