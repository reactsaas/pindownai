"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw
} from "lucide-react"

interface APIKey {
  id: string
  name: string
  provider: string
  key: string
  isValid: boolean
  lastChecked: string
  masked: boolean
  logo: string
  description: string
  docsUrl: string
}

export function APIKeysPage() {
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([
    {
      id: "openai",
      name: "OpenAI",
      provider: "openai",
      key: "",
      isValid: false,
      lastChecked: "Never",
      masked: true,
      logo: "🤖",
      description: "GPT-4, GPT-3.5, DALL-E, and Whisper API access",
      docsUrl: "https://platform.openai.com/api-keys"
    },
    {
      id: "anthropic",
      name: "Anthropic",
      provider: "anthropic",
      key: "",
      isValid: false,
      lastChecked: "Never",
      masked: true,
      logo: "🧠",
      description: "Claude AI models for advanced reasoning and conversation",
      docsUrl: "https://console.anthropic.com/"
    },
    {
      id: "gemini",
      name: "Google Gemini",
      provider: "google",
      key: "",
      isValid: false,
      lastChecked: "Never",
      masked: true,
      logo: "✨",
      description: "Google's multimodal AI for text, image, and code generation",
      docsUrl: "https://makersuite.google.com/app/apikey"
    },
    {
      id: "perplexity",
      name: "Perplexity",
      provider: "perplexity",
      key: "",
      isValid: false,
      lastChecked: "Never",
      masked: true,
      logo: "🔍",
      description: "AI-powered search and research with real-time web access",
      docsUrl: "https://www.perplexity.ai/settings/api"
    }
  ])

  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({})
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({})

  const handleKeyChange = (id: string, value: string) => {
    setTempKeys(prev => ({ ...prev, [id]: value }))
  }

  const handleSaveKey = async (id: string) => {
    const newKey = tempKeys[id] || ""
    
    // Update the key
    setAPIKeys(prev => prev.map(key => 
      key.id === id 
        ? { ...key, key: newKey, lastChecked: "Just now" }
        : key
    ))
    
    setEditingKey(null)
    setTempKeys(prev => {
      const { [id]: _, ...rest } = prev
      return rest
    })

    // Test the key
    await testAPIKey(id)
  }

  const testAPIKey = async (id: string) => {
    setTestingKeys(prev => ({ ...prev, [id]: true }))
    
    // Mock API validation - replace with actual API calls
    setTimeout(() => {
      const key = apiKeys.find(k => k.id === id)
      const isValid = key?.key && key.key.length > 10 // Simple validation
      
      setAPIKeys(prev => prev.map(key => 
        key.id === id 
          ? { ...key, isValid, lastChecked: "Just now" }
          : key
      ))
      
      setTestingKeys(prev => ({ ...prev, [id]: false }))
    }, 1500)
  }

  const handleDeleteKey = (id: string) => {
    setAPIKeys(prev => prev.map(key => 
      key.id === id 
        ? { ...key, key: "", isValid: false, lastChecked: "Never" }
        : key
    ))
    setEditingKey(null)
    setTempKeys(prev => {
      const { [id]: _, ...rest } = prev
      return rest
    })
  }

  const toggleMask = (id: string) => {
    setAPIKeys(prev => prev.map(key => 
      key.id === id 
        ? { ...key, masked: !key.masked }
        : key
    ))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const maskKey = (key: string) => {
    if (!key) return ""
    if (key.length <= 8) return "•".repeat(key.length)
    return key.substring(0, 4) + "•".repeat(key.length - 8) + key.substring(key.length - 4)
  }

  const getStatusColor = (isValid: boolean, hasKey: boolean) => {
    if (!hasKey) return "text-muted-foreground"
    return isValid ? "text-green-500" : "text-red-500"
  }

  const getStatusBadge = (isValid: boolean, hasKey: boolean) => {
    if (!hasKey) return <Badge variant="secondary">Not Set</Badge>
    return isValid 
      ? <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Valid</Badge>
      : <Badge variant="destructive">Invalid</Badge>
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">API Keys</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Key className="h-3 w-3" />
                <span>{apiKeys.filter(k => k.key).length} of {apiKeys.length} keys configured</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>{apiKeys.filter(k => k.isValid).length} valid keys</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => apiKeys.forEach(key => key.key && testAPIKey(key.id))}
              className="h-8"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Test All Keys
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Configure Your API Keys</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add your API keys to enable AI features. Keys are stored securely and only used for API calls.
            </p>
          </div>

          <div className="grid gap-3">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id} className="relative">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-lg">{apiKey.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{apiKey.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          {getStatusBadge(apiKey.isValid, !!apiKey.key)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(apiKey.docsUrl, '_blank')}
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                      <div className="flex-1 relative">
                        <Input
                          type={editingKey === apiKey.id ? "text" : "password"}
                          placeholder={`Enter your ${apiKey.name} API key`}
                          value={editingKey === apiKey.id ? (tempKeys[apiKey.id] ?? apiKey.key) : (apiKey.masked ? maskKey(apiKey.key) : apiKey.key)}
                          onChange={(e) => handleKeyChange(apiKey.id, e.target.value)}
                          onFocus={() => {
                            setEditingKey(apiKey.id)
                            setTempKeys(prev => ({ ...prev, [apiKey.id]: apiKey.key }))
                          }}
                          className="pr-8 h-7 text-xs"
                        />
                        {apiKey.key && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleMask(apiKey.id)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          >
                            {apiKey.masked ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                      
                      {editingKey === apiKey.id ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleSaveKey(apiKey.id)}
                            disabled={!tempKeys[apiKey.id]?.trim()}
                            className="h-7 px-2"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingKey(null)
                              setTempKeys(prev => {
                                const { [apiKey.id]: _, ...rest } = prev
                                return rest
                              })
                            }}
                            className="h-7 px-2 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          {apiKey.key && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => testAPIKey(apiKey.id)}
                                disabled={testingKeys[apiKey.id]}
                                className="h-7 w-7 p-0"
                              >
                                {testingKeys[apiKey.id] ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(apiKey.key)}
                                className="h-7 w-7 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteKey(apiKey.id)}
                                className="text-destructive hover:text-destructive h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {!apiKey.key && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingKey(apiKey.id)
                                setTempKeys(prev => ({ ...prev, [apiKey.id]: "" }))
                              }}
                              className="h-7 px-2 text-xs"
                            >
                              Add Key
                            </Button>
                          )}
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security Notice */}
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Security Notice
                  </h4>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Your API keys are stored locally in your browser and never sent to our servers. 
                    Keep your keys secure and don't share them with others. If you suspect a key has been compromised, 
                    revoke it immediately from the provider's dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}




