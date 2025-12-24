import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, Bell, BellOff, Trash2, Edit, MapPin, 
  Calendar, DollarSign, MoreVertical, Bookmark,
  Star, Filter, Loader2
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function SavedSearches({ user }) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingSearch, setEditingSearch] = useState(null);
  const queryClient = useQueryClient();

  const { data: savedSearches = [], isLoading } = useQuery({
    queryKey: ['saved-searches', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.SavedSearch.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedSearch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SavedSearch.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const handleToggleNotifications = (search) => {
    updateMutation.mutate({
      id: search.id,
      data: { notifications_enabled: !search.notifications_enabled }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this saved search?')) {
      deleteMutation.mutate(id);
    }
  };

  const executeSearch = (search) => {
    const params = new URLSearchParams(search.search_params);
    window.location.href = `${createPageUrl('SearchResults')}?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
      </div>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved searches yet</h3>
        <p className="text-slate-500 mb-4">
          Save your searches to get notified when new listings match your criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedSearches.map((search) => (
        <Card key={search.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FF5124]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-[#FF5124]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">
                      {search.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {search.mode === 'rent' ? 'For Rent' : 'For Sale'}
                      </Badge>
                      {search.category && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {search.category.replace('_', ' ')}
                        </Badge>
                      )}
                      {search.match_count > 0 && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {search.match_count} matches
                        </Badge>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => executeSearch(search)}>
                        <Search className="w-4 h-4 mr-2" />
                        Run search
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleNotifications(search)}>
                        {search.notifications_enabled ? (
                          <>
                            <BellOff className="w-4 h-4 mr-2" />
                            Turn off alerts
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 mr-2" />
                            Turn on alerts
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(search.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Search Criteria Summary */}
                <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-4">
                  {search.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {search.location}
                    </span>
                  )}
                  {search.search_params?.min_price && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${search.search_params.min_price}–${search.search_params.max_price || '∞'}
                    </span>
                  )}
                  {search.search_params?.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(search.search_params.start_date).toLocaleDateString()}
                    </span>
                  )}
                  {search.search_params?.amenities?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" />
                      {search.search_params.amenities.length} amenities
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => executeSearch(search)}
                    className="bg-[#FF5124] hover:bg-[#e5481f] text-sm h-9"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    View Results
                  </Button>

                  <div className="flex items-center gap-2">
                    {search.notifications_enabled ? (
                      <Bell className="w-4 h-4 text-green-600" />
                    ) : (
                      <BellOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-xs text-slate-500">
                      {search.notifications_enabled ? 'Alerts on' : 'Alerts off'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SaveSearchButton({ searchParams, searchName }) {
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState(searchName || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.entities.SavedSearch.create({
        name,
        search_params: searchParams,
        mode: searchParams.mode || 'rent',
        category: searchParams.category || null,
        location: searchParams.location || null,
        notifications_enabled: notificationsEnabled,
        match_count: 0,
      });

      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      setShowDialog(false);
      setName('');
    } catch (error) {
      console.error('Error saving search:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
        className="rounded-full flex items-center gap-2"
      >
        <Bookmark className="w-4 h-4" />
        Save Search
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save This Search</DialogTitle>
            <DialogDescription>
              Get notified when new listings match your criteria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="search-name">Search Name *</Label>
              <Input
                id="search-name"
                placeholder="e.g., Food Trucks in Phoenix"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-medium">Email Notifications</Label>
                <p className="text-xs text-slate-500">Get alerts for new matches</p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {/* Search Preview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Search Criteria:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(searchParams).map(([key, value]) => {
                  if (!value || key === 'mode') return null;
                  return (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || isSaving}
              className="bg-[#FF5124] hover:bg-[#e5481f]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Search
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}