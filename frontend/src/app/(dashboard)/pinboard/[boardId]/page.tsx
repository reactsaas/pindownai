"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Grid3X3, Search, Check, X, GripVertical, Plus, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { SharePopover } from "@/components/share-popover"
import { useAuth } from "@/lib/auth-context"
import { usePinboard } from "@/lib/pinboard-context"
import { Pinboard } from "@/types/pinboard"

interface Pin {
  id: string;
  user_id: string;
  wid: string | null;
  data_type: string;
  content: string;
  metadata: {
    title: string;
    description: string;
    tags: string[];
    workflow_sources: string[];
    created_at: string;
    is_public: boolean;
  };
  permissions: {
    is_public: boolean;
    created_by: string;
  };
}

export default function PinboardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const boardId = params.boardId as string
  const { user, getAuthToken } = useAuth()
  const { pinboards, updatePinboard } = usePinboard()
  
  const [pinboard, setPinboard] = useState<Pinboard | null>(null)
  const [availablePins, setAvailablePins] = useState<Pin[]>([])
  const [selectedPins, setSelectedPins] = useState<Pin[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Find pinboard from context or fetch directly
  useEffect(() => {
    const findOrFetchPinboard = async () => {
      if (pinboards && pinboards.length > 0 && boardId) {
        const foundPinboard = pinboards.find(pb => pb.id === boardId)
        if (foundPinboard) {
          setPinboard(foundPinboard)
          setLoading(false)
        } else {
          // Pinboard not found in context, try to fetch it directly
          try {
            const token = await getAuthToken()
            const response = await fetch(`http://localhost:8000/api/pinboards/${boardId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })

            if (response.ok) {
              const data = await response.json()
              setPinboard(data.data)
            } else {
              setError('Pinboard not found')
            }
            setLoading(false)
          } catch (err) {
            console.error('Error fetching pinboard:', err)
            setError('Failed to load pinboard')
            setLoading(false)
          }
        }
      } else if (boardId && user) {
        // Context not loaded yet, fetch pinboard directly
        try {
          const token = await getAuthToken()
          const response = await fetch(`http://localhost:8000/api/pinboards/${boardId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            setPinboard(data.data)
          } else {
            setError('Pinboard not found')
          }
          setLoading(false)
        } catch (err) {
          console.error('Error fetching pinboard:', err)
          setError('Failed to load pinboard')
          setLoading(false)
        }
      }
    }

    findOrFetchPinboard()
  }, [pinboards, boardId, user])

  // Fetch available pins
  const fetchAvailablePins = async () => {
    if (!user) return

    try {
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

      const data = await response.json()
      setAvailablePins(data.data.pins)
    } catch (err) {
      console.error('Error fetching pins:', err)
      setError('Failed to fetch pins')
    }
  }

  // Initialize selected pins from pinboard
  useEffect(() => {
    if (pinboard && availablePins.length > 0) {
      const selectedPinsData = availablePins.filter(pin => 
        pinboard.pins.includes(pin.id)
      )
      setSelectedPins(selectedPinsData)
    }
  }, [pinboard, availablePins])

  useEffect(() => {
    if (user) {
      fetchAvailablePins()
    }
  }, [user])

  useEffect(() => {
    if (pinboard && availablePins.length > 0) {
      setLoading(false)
    }
  }, [pinboard, availablePins])

  const handleBack = () => {
    router.push("/pinboard")
  }

  const filteredAvailablePins = availablePins.filter(pin => {
    const matchesSearch = pin.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pin.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pin.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const notAlreadySelected = !selectedPins.some(selected => selected.id === pin.id);
    
    return matchesSearch && notAlreadySelected;
  });

  const handleAddPin = (pin: Pin) => {
    setSelectedPins(prev => [...prev, pin]);
  };

  const handleRemovePin = (pinId: string) => {
    setSelectedPins(prev => prev.filter(pin => pin.id !== pinId));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.index === destination.index) return;

    setSelectedPins(prev => {
      const newPins = Array.from(prev);
      const [reorderedPin] = newPins.splice(source.index, 1);
      newPins.splice(destination.index, 0, reorderedPin);

      return newPins;
    });
  };

  const handleSave = async () => {
    if (!pinboard) return

    try {
      setIsSaving(true)
      setSaveSuccess(false)
      
      const updatedPinboard = {
        ...pinboard,
        pins: selectedPins.map(pin => pin.id)
      };
      
      await updatePinboard(pinboard.id, updatedPinboard)
      setSaveSuccess(true)
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Error saving pinboard:', error);
    } finally {
      setIsSaving(false)
    }
  };

  const getFileIcon = (dataType: string) => {
    switch (dataType) {
      case 'markdown': return '📝';
      case 'json': return '📋';
      case 'text': return '📄';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pinboard...</p>
        </div>
      </div>
    )
  }

  if (error || !pinboard) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-muted-foreground mb-4">{error || 'Pinboard not found'}</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pinboards
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border bg-card">
        {/* Mobile: Compact layout */}
        <div className="flex md:hidden flex-col gap-2">
          {/* First row: Back button, title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0 cursor-pointer flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                <Grid3X3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <h2 className="font-semibold truncate text-sm">{pinboard.name}</h2>
              </div>
            </div>
            <SharePopover 
              templateId={pinboard.id}
              templateName={pinboard.name}
              isTemplate={false}
              isPinboard={true}
              isPublished={pinboard.is_public}
            />
          </div>
          
          {/* Second row: Action buttons */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedPins.length} pins selected
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleBack} size="sm">
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" disabled={isSaving}>
                {saveSuccess ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop: Full information display */}
        <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-6 w-6 p-0 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold">{pinboard.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-8">
              <div className="flex items-center gap-1">
                <span>{selectedPins.length} pins selected</span>
              </div>
              {pinboard.description && (
                <span className="text-muted-foreground">{pinboard.description}</span>
              )}
            </div>
          </div>

          {/* Actions - Desktop */}
          <div className="flex items-center gap-4">
            <SharePopover 
              templateId={pinboard.id}
              templateName={pinboard.name}
              isTemplate={false}
              isPinboard={true}
              isPublished={pinboard.is_public}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {saveSuccess ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Two Column Layout */}
          <div className="flex gap-6 min-h-[calc(100vh-300px)]">
            {/* Left Column - Available Pins */}
            <div className="flex-1 flex flex-col min-w-0">
              <h3 className="font-medium text-sm mb-3">Available Pins</h3>
              
              {/* Search - Only for Available Pins */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search pins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-1 border rounded-lg p-2">
                {filteredAvailablePins.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No pins match your search' : 'No available pins to add'}
                    </p>
                  </div>
                ) : (
                  filteredAvailablePins.map((pin) => (
                    <Card key={pin.id} className="cursor-pointer hover:shadow-sm transition-shadow py-0">
                      <CardContent className="p-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm">{getFileIcon(pin.metadata.data_type || 'text')}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs truncate">{pin.metadata.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">{pin.metadata.description}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddPin(pin)}
                            className="flex-shrink-0 h-6 w-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Selected Pins */}
            <div className="flex-1 flex flex-col min-w-0">
              <h3 className="font-medium text-sm mb-3">Selected Pins</h3>
              <div className="flex-1 overflow-y-auto border rounded-lg p-3">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="selected-pins">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {selectedPins.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                              No pins selected yet
                            </p>
                          </div>
                        ) : (
                          selectedPins.map((pin, index) => (
                            <Draggable key={pin.id} draggableId={pin.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`cursor-pointer transition-shadow py-0 ${
                                    snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-sm'
                                  }`}
                                >
                                  <CardContent className="p-1.5">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div {...provided.dragHandleProps} className="cursor-grab">
                                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <span className="text-sm">{getFileIcon(pin.metadata.data_type || 'text')}</span>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-xs truncate">{pin.metadata.title}</h4>
                                          <p className="text-xs text-muted-foreground truncate">{pin.metadata.description}</p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemovePin(pin.id)}
                                        className="flex-shrink-0 h-6 w-6 p-0"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
