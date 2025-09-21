"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PinsList } from "@/components/pins-list"
import { AddPinModal } from "@/components/add-pin-modal"
import { useAuth } from "@/lib/auth-context"
import { usePins } from "@/lib/pins-context"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Pin {
  id: string
  user_id: string
  wid: string | null
  data_type: string
  content: string
  metadata: {
    title: string
    description: string
    tags: string[]
    workflow_sources: string[]
    created_at: string
    is_public: boolean
  }
  permissions: {
    is_public: boolean
    created_by: string
  }
}

interface PinsResponse {
  success: boolean
  data: {
    pins: Pin[]
    total: number
  }
}

export default function PinsPage() {
  const router = useRouter()
  const { user, getAuthToken } = useAuth()
  const { setPinsCount } = usePins()
  const [pins, setPins] = useState<Pin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Fetch user's pins
  const fetchPins = async (showLoading: boolean = true) => {
    if (!user) return

    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)
      
      const token = await getAuthToken()
      const response = await fetch('http://localhost:8000/api/pins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch pins: ${response.statusText}`)
      }

      const data: PinsResponse = await response.json()
      setPins(data.data.pins)
      // Update global pin count with actual count from API
      const count = data.data.pins.length
      setPinsCount(count)
    } catch (err) {
      console.error('Error fetching pins:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch pins')
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Fetch pins on component mount
  useEffect(() => {
    fetchPins()
  }, [user])

  // Handle creating a new pin
  const handleCreatePin = async (pinData: {
    name: string
    description: string
    template: string
    type: string
    tags: string[]
  }) => {
    if (!user) return

    try {
      const token = await getAuthToken()
      const response = await fetch('http://localhost:8000/api/pins/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data_type: 'markdown',
          metadata: {
            title: pinData.name,
            description: pinData.description,
            tags: pinData.tags,
            is_public: false
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create pin: ${response.statusText}`)
      }

      // Refresh pins list
      await fetchPins()
      // Increment global pin count (we know we added 1)
      setPinsCount(prev => prev + 1)
    } catch (err) {
      console.error('Error creating pin:', err)
      setError(err instanceof Error ? err.message : 'Failed to create pin')
    }
  }

  // Handle deleting a pin
  const handleDeletePin = async (pinId: string) => {
    if (!user) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete pin: ${response.statusText}`)
      }

      // Refresh pins list to ensure consistency (without loading skeleton)
      await fetchPins(false)
      // Decrement global pin count (we know we removed 1)
      setPinsCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error deleting pin:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete pin')
    }
  }

  // Handle renaming a pin
  const handleRenamePin = async (pinId: string, newName: string) => {
    if (!user) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metadata: {
            title: newName
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to rename pin: ${response.statusText}`)
      }

      // Refresh pins list to ensure consistency (without loading skeleton)
      await fetchPins(false)
      // No need to update count for rename (count stays the same)
    } catch (err) {
      console.error('Error renaming pin:', err)
      setError(err instanceof Error ? err.message : 'Failed to rename pin')
    }
  }

  // Handle updating pin description
  const handleUpdateDescription = async (pinId: string, newDescription: string) => {
    if (!user) return

    try {
      const token = await getAuthToken()
      const response = await fetch(`http://localhost:8000/api/pins/${pinId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metadata: {
            description: newDescription
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to update description: ${response.statusText}`)
      }

      // Refresh pins list to ensure consistency (without loading skeleton)
      await fetchPins(false)
      // No need to update count for description update (count stays the same)
    } catch (err) {
      console.error('Error updating description:', err)
      setError(err instanceof Error ? err.message : 'Failed to update description')
    }
  }

  // Convert API pins to component format
  const formattedPins = pins.map(pin => ({
    id: pin.id,
    name: pin.metadata.title,
    description: pin.metadata.description,
    lastModified: new Date(pin.metadata.created_at).toLocaleDateString(),
    blocksCount: 0 // TODO: Get actual blocks count when we implement blocks
  }))

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Your Pins</h1>
              <p className="text-muted-foreground">
                Loading your pins...
              </p>
            </div>
            <div className="h-10 w-24 bg-muted animate-pulse rounded-md"></div>
          </div>
        </div>

        {/* Loading Skeletons */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add Pin Skeleton */}
            <div className="border-2 border-dashed border-muted-foreground/30 bg-muted/10 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-12 h-12 bg-muted/30 rounded-full mb-4 animate-pulse"></div>
              <div className="w-32 h-4 bg-muted/30 rounded mb-2 animate-pulse"></div>
              <div className="w-24 h-3 bg-muted/30 rounded animate-pulse"></div>
            </div>
            
            {/* Pin Card Skeletons */}
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted/30 rounded-full"></div>
                    <div className="w-16 h-5 bg-muted/30 rounded"></div>
                  </div>
                  <div className="w-6 h-6 bg-muted/30 rounded"></div>
                </div>
                
                <div className="w-3/4 h-5 bg-muted/30 rounded mb-3"></div>
                <div className="w-full h-3 bg-muted/30 rounded mb-2"></div>
                <div className="w-2/3 h-3 bg-muted/30 rounded mb-4"></div>
                
                <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-md">
                  <div className="w-3 h-3 bg-muted/30 rounded"></div>
                  <div className="w-24 h-3 bg-muted/30 rounded flex-1"></div>
                  <div className="w-6 h-6 bg-muted/30 rounded"></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-muted/30 rounded"></div>
                    <div className="w-12 h-3 bg-muted/30 rounded"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-muted/30 rounded"></div>
                    <div className="w-16 h-3 bg-muted/30 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchPins()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Pins</h1>
            <p className="text-muted-foreground">
              {pins.length} {pins.length === 1 ? 'pin' : 'pins'} total
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Pin
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <PinsList
          templates={formattedPins}
          onTemplateSelect={(pinId) => {
            // Navigate to pin detail page using the pin ID as slug
            router.push(`/pins/${pinId}`)
          }}
          onCopyTemplateId={(pinId) => {
            navigator.clipboard.writeText(pinId)
            // TODO: Show toast notification
          }}
          onAddPin={() => setIsAddModalOpen(true)}
          onDeletePin={handleDeletePin}
          onRenamePin={handleRenamePin}
          onUpdateDescription={handleUpdateDescription}
        />
      </div>

      <AddPinModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleCreatePin}
      />
    </div>
  )
}




