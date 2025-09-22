"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Filter, 
  Grid3X3,
  MoreHorizontal,
  Eye,
  Share2,
  Edit3,
  Trash2,
  Pin,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PinboardModal } from "@/components/pinboard-modal";
import { usePinboard } from "@/lib/pinboard-context";
import { Pinboard } from "@/types/pinboard";

export default function PinboardPage() {
  const { pinboards, loading, error, deletePinboard, updatePinboard, refreshPinboards } = usePinboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPinboard, setEditingPinboard] = useState<Pinboard | null>(null);

  // Filter pinboards based on search and filter
  const filteredPinboards = pinboards.filter(pinboard => {
    const matchesSearch = pinboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pinboard.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pinboard.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "public" && pinboard.is_public) ||
                         (selectedFilter === "private" && !pinboard.is_public);
    
    return matchesSearch && matchesFilter;
  });

  const handleDeletePinboard = async (pinboardId: string) => {
    if (window.confirm("Are you sure you want to delete this pinboard?")) {
      try {
        await deletePinboard(pinboardId);
      } catch (error) {
        console.error("Failed to delete pinboard:", error);
      }
    }
  };

  const handleEditPinboard = (pinboard: Pinboard) => {
    // Navigate to the pinboard detail page
    window.location.href = `/pinboard/${pinboard.id}`;
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingPinboard(null);
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'template': return <FileText className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'prompt': return <MessageSquare className="w-4 h-4" />;
      case 'workflow': return <Settings className="w-4 h-4" />;
      default: return <Pin className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    return "bg-muted text-muted-foreground"
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading && pinboards.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pinboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border bg-card">
        <div>
          <h1 className="text-2xl font-bold">Pinboards</h1>
          <p className="text-muted-foreground">
            Organize and manage your pin collections
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshPinboards}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search pinboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedFilter("public")}>
              Public
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter("private")}>
              Private
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Pinboards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add Pinboard Item */}
        <Card 
          className="group hover:shadow-sm transition-all duration-200 cursor-pointer border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 bg-muted/5 hover:bg-muted/10"
          onClick={() => setIsAddModalOpen(true)}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-muted/50 transition-colors">
              <Grid3X3 className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-sm mb-1">Create New Pinboard</h3>
            <p className="text-xs text-muted-foreground text-center">
              Organize your pins into collections
            </p>
          </CardContent>
        </Card>
          {filteredPinboards.map((pinboard) => (
            <Card 
              key={pinboard.id} 
              className="group hover:shadow-sm transition-all duration-200 cursor-pointer"
              onClick={() => handleEditPinboard(pinboard)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                      <Grid3X3 className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className={getStatusColor()}>
                      {pinboard.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Pin className="w-3 h-3" />
                      <span>{pinboard.pins.length}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleEditPinboard(pinboard);
                        }}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePinboard(pinboard.id);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold">{pinboard.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                  {pinboard.description || "No description provided"}
                </p>
                
                {/* Tags */}
                {pinboard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pinboard.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {pinboard.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{pinboard.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(pinboard.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{pinboard.pins.length} pins</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      </div>

      {/* Modals */}
      <PinboardModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
      />
      
      {editingPinboard && (
        <PinboardModal
          isOpen={!!editingPinboard}
          onClose={handleCloseModal}
          pinboard={editingPinboard}
        />
      )}

    </div>
  );
}
