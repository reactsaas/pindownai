'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Search, Check, X, GripVertical } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { Pinboard } from '../types/pinboard';

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

interface PinboardPinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pinboard: Pinboard;
  onSave: (updatedPinboard: Pinboard) => void;
}

export const PinboardPinsModal: React.FC<PinboardPinsModalProps> = ({
  isOpen,
  onClose,
  pinboard,
  onSave
}) => {
  const { user, getAuthToken } = useAuth();
  const [availablePins, setAvailablePins] = useState<Pin[]>([]);
  const [selectedPins, setSelectedPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load user's pins and current pinboard pins when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchUserPins();
    }
  }, [isOpen, user]);

  const fetchUserPins = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch('http://127.0.0.1:8000/api/pins?limit=100', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch pins: ${response.statusText}`);
      }

      const data = await response.json();
      const allPins = data.data.pins || [];
      setAvailablePins(allPins);

      // Find and set selected pins based on pinboard.pins array
      const currentSelectedPins = allPins.filter((pin: Pin) => 
        pinboard.pins.includes(pin.id)
      );
      setSelectedPins(currentSelectedPins);
    } catch (error) {
      console.error('Error fetching pins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter available pins based on search query and exclude already selected ones
  const filteredAvailablePins = availablePins.filter(pin => {
    const matchesSearch = (pin.metadata.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (pin.metadata.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (pin.metadata.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
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
    try {
      const updatedPinboard = {
        ...pinboard,
        pins: selectedPins.map(pin => pin.id)
      };
      
      await onSave(updatedPinboard);
      onClose();
    } catch (error) {
      console.error('Error saving pinboard:', error);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Pins in "{pinboard.name}"</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search available pins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedPins.length} pins selected
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Left Column - Available Pins */}
          <div className="flex-1 flex flex-col min-w-0">
            <h3 className="font-medium text-sm mb-3">Available Pins</h3>
            <div className="flex-1 overflow-y-auto space-y-2 border rounded-lg p-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading pins...</p>
                  </div>
                </div>
              ) : filteredAvailablePins.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No pins found matching your search' : 'No available pins'}
                  </p>
                </div>
              ) : (
                filteredAvailablePins.map((pin) => (
                  <Card key={pin.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-1">{getFileIcon(pin.data_type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{pin.metadata.title || 'Untitled'}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {pin.metadata.description || 'No description'}
                          </p>
                          {pin.metadata.tags && pin.metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pin.metadata.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddPin(pin)}
                          className="shrink-0"
                        >
                          Add
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
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="selected-pins">
                {(provided) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 overflow-y-auto space-y-2 border rounded-lg p-3"
                  >
                    {selectedPins.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No pins selected</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add pins from the left column
                        </p>
                      </div>
                    ) : (
                      selectedPins.map((pin, index) => (
                        <Draggable key={pin.id} draggableId={pin.id} index={index}>
                          {(provided, snapshot) => {
                            const content = (
                              <Card 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="hover:shadow-sm transition-shadow"
                                style={provided.draggableProps.style}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-3" {...provided.dragHandleProps}>
                                    <GripVertical className="w-4 h-4 text-muted-foreground mt-1 cursor-grab" />
                                    <span className="text-lg mt-1">{getFileIcon(pin.data_type)}</span>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm truncate">{pin.metadata.title || 'Untitled'}</h4>
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {pin.metadata.description || 'No description'}
                                      </p>
                                      {pin.metadata.tags && pin.metadata.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {pin.metadata.tags.slice(0, 2).map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemovePin(pin.id);
                                      }}
                                      className="shrink-0 text-destructive hover:text-destructive"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            );

                            return snapshot.isDragging ? createPortal(content, document.body) : content;
                          }}
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

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedPins.length} pins selected for this pinboard
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
