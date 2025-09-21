'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { X, Plus, Pin } from 'lucide-react';
import { Pinboard, CreatePinboardRequest, UpdatePinboardRequest } from '../types/pinboard';
import { usePinboard } from '../lib/pinboard-context';
import { PinSelectionModal } from './pin-selection-modal';

interface PinboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  pinboard?: Pinboard; // If provided, we're editing; if not, we're creating
}

export const PinboardModal: React.FC<PinboardModalProps> = ({ 
  isOpen, 
  onClose, 
  pinboard 
}) => {
  const { createPinboard, updatePinboard, loading } = usePinboard();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false,
    tags: [] as string[],
    pins: [] as string[], // Add pins to form data
  });
  
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPinSelectionOpen, setIsPinSelectionOpen] = useState(false);

  // Reset form when modal opens/closes or pinboard changes
  useEffect(() => {
    if (isOpen) {
      if (pinboard) {
        setFormData({
          name: pinboard.name,
          description: pinboard.description || '',
          is_public: pinboard.is_public,
          tags: pinboard.tags || [],
          pins: pinboard.pins || [],
        });
      } else {
        setFormData({
          name: '',
          description: '',
          is_public: false,
          tags: [],
          pins: [],
        });
      }
      setNewTag('');
      setIsSubmitting(false);
    }
  }, [isOpen, pinboard]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handlePinSelectionChange = (selectedPinIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      pins: selectedPinIds
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data: CreatePinboardRequest | UpdatePinboardRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        is_public: formData.is_public,
        tags: formData.tags,
        pins: formData.pins,
      };

      if (pinboard) {
        await updatePinboard(pinboard.id, data as UpdatePinboardRequest);
      } else {
        await createPinboard(data as CreatePinboardRequest);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save pinboard:', error);
      // Error handling is managed by the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {pinboard ? 'Edit Pinboard' : 'Create New Pinboard'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter pinboard name"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter pinboard description"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => handleInputChange('is_public', checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="is_public">Make this pinboard public</Label>
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                size="sm"
                variant="outline"
                disabled={isSubmitting || !newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Display existing tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      size="sm"
                      variant="ghost"
                      className="h-auto p-0 ml-1"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Pins Section */}
          <div className="space-y-2">
            <Label>Pins</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formData.pins.length} pin{formData.pins.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPinSelectionOpen(true)}
                disabled={isSubmitting}
              >
                <Pin className="h-4 w-4 mr-2" />
                {formData.pins.length > 0 ? 'Edit Selection' : 'Select Pins'}
              </Button>
            </div>
            
            {/* Display selected pin count */}
            {formData.pins.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {formData.pins.length} pin{formData.pins.length !== 1 ? 's' : ''} will be added to this pinboard
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? 'Saving...' : pinboard ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>

        {/* Pin Selection Modal */}
        <PinSelectionModal
          isOpen={isPinSelectionOpen}
          onClose={() => setIsPinSelectionOpen(false)}
          selectedPins={formData.pins}
          onSelectionChange={handlePinSelectionChange}
          title={pinboard ? 'Edit Pin Selection' : 'Select Pins for Pinboard'}
        />
      </DialogContent>
    </Dialog>
  );
};
