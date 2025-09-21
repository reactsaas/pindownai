'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Search, Check } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

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

interface PinSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPins: string[]; // Array of pin IDs
  onSelectionChange: (selectedPinIds: string[]) => void;
  title?: string;
}

export const PinSelectionModal: React.FC<PinSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedPins,
  onSelectionChange,
  title = "Select Pins"
}) => {
  const { user, getAuthToken } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelectedPins, setLocalSelectedPins] = useState<string[]>(selectedPins);

  // Load user's pins when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchUserPins();
    }
  }, [isOpen, user]);

  // Update local selection when prop changes
  useEffect(() => {
    setLocalSelectedPins(selectedPins);
  }, [selectedPins]);

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
      setPins(data.data.pins || []);
    } catch (error) {
      console.error('Error fetching pins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter pins based on search query
  const filteredPins = pins.filter(pin => {
    const matchesSearch = pin.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pin.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pin.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handlePinToggle = (pinId: string) => {
    const newSelection = localSelectedPins.includes(pinId)
      ? localSelectedPins.filter(id => id !== pinId)
      : [...localSelectedPins, pinId];
    
    setLocalSelectedPins(newSelection);
  };

  const handleSelectAll = () => {
    const allPinIds = filteredPins.map(pin => pin.id);
    setLocalSelectedPins(allPinIds);
  };

  const handleDeselectAll = () => {
    setLocalSelectedPins([]);
  };

  const handleConfirm = () => {
    onSelectionChange(localSelectedPins);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedPins(selectedPins); // Reset to original selection
    onClose();
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
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Search and Controls */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search pins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </div>
        </div>

        {/* Selected Count */}
        <div className="flex items-center justify-between py-2">
          <p className="text-sm text-muted-foreground">
            {localSelectedPins.length} of {filteredPins.length} pins selected
          </p>
        </div>

        {/* Pins List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading pins...</p>
              </div>
            </div>
          ) : filteredPins.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'No pins found matching your search' : 'No pins available'}
              </p>
            </div>
          ) : (
            filteredPins.map((pin) => (
              <Card key={pin.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={localSelectedPins.includes(pin.id)}
                      onCheckedChange={() => handlePinToggle(pin.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-lg">{getFileIcon(pin.data_type)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{pin.metadata.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {pin.metadata.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {pin.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {pin.metadata.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {pin.metadata.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{pin.metadata.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{pin.data_type}</span>
                        <span>{new Date(pin.metadata.created_at).toLocaleDateString()}</span>
                        {pin.metadata.is_public && (
                          <Badge variant="outline" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {localSelectedPins.length} pins selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              <Check className="w-4 h-4 mr-2" />
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
