import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Check, X, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ADDON_TYPE_ICONS = {
  equipment: '🔧',
  service: '🛎️',
  customization: '✨',
  other: '📦',
};

export default function AddonRequestsCard({ userEmail }) {
  const [selectedAddon, setSelectedAddon] = React.useState(null);
  const [responseData, setResponseData] = React.useState({ host_price: '', host_response: '' });
  const queryClient = useQueryClient();

  const { data: pendingAddons = [], isLoading } = useQuery({
    queryKey: ['addon-requests', userEmail],
    queryFn: async () => {
      const addons = await base44.entities.BookingAddon.filter({ 
        host_email: userEmail,
        status: 'pending'
      }, '-created_date');
      return addons;
    },
  });

  const { data: bookingsMap = {} } = useQuery({
    queryKey: ['bookings-for-addons', pendingAddons],
    queryFn: async () => {
      if (pendingAddons.length === 0) return {};
      const bookingIds = [...new Set(pendingAddons.map(a => a.booking_id))];
      const bookings = await base44.entities.Booking.list();
      const map = {};
      bookings.forEach(b => {
        if (bookingIds.includes(b.id)) {
          map[b.id] = b;
        }
      });
      return map;
    },
    enabled: pendingAddons.length > 0,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ addonId, status, price, response }) => {
      await base44.entities.BookingAddon.update(addonId, {
        status,
        host_price: status === 'approved' ? parseFloat(price) : null,
        host_response: response
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['addon-requests']);
      toast.success('Response sent to guest');
      setSelectedAddon(null);
      setResponseData({ host_price: '', host_response: '' });
    },
  });

  const handleApprove = () => {
    if (!responseData.host_price) {
      toast.error('Please set a price for this add-on');
      return;
    }
    respondMutation.mutate({
      addonId: selectedAddon.id,
      status: 'approved',
      price: responseData.host_price,
      response: responseData.host_response
    });
  };

  const handleDecline = () => {
    respondMutation.mutate({
      addonId: selectedAddon.id,
      status: 'declined',
      price: null,
      response: responseData.host_response || 'Unable to accommodate this request.'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  if (pendingAddons.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add-on Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No pending add-on requests</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add-on Requests
            <Badge className="ml-auto">{pendingAddons.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingAddons.map((addon) => {
            const booking = bookingsMap[addon.booking_id];
            return (
              <Card key={addon.id} className="bg-slate-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{ADDON_TYPE_ICONS[addon.addon_type]}</span>
                        <h4 className="font-medium text-slate-900">{addon.title}</h4>
                        {addon.quantity > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            Qty: {addon.quantity}
                          </Badge>
                        )}
                      </div>
                      
                      {addon.description && (
                        <p className="text-sm text-slate-600 mb-2">{addon.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span>Guest: {addon.guest_email}</span>
                        {addon.requested_price && (
                          <span>• Budget: ${parseFloat(addon.requested_price).toFixed(2)}</span>
                        )}
                        {booking && (
                          <span>• {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}</span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => setSelectedAddon(addon)}
                      className="bg-[#FF5124] hover:bg-[#e5481f]"
                    >
                      Respond
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={!!selectedAddon} onOpenChange={() => setSelectedAddon(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Add-on Request</DialogTitle>
          </DialogHeader>
          
          {selectedAddon && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{ADDON_TYPE_ICONS[selectedAddon.addon_type]}</span>
                  <h4 className="font-medium text-slate-900">{selectedAddon.title}</h4>
                </div>
                {selectedAddon.description && (
                  <p className="text-sm text-slate-600 mb-2">{selectedAddon.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Qty: {selectedAddon.quantity}</span>
                  {selectedAddon.requested_price && (
                    <span>Guest budget: ${parseFloat(selectedAddon.requested_price).toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="host_price">Your Price *</Label>
                <Input
                  id="host_price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={responseData.host_price}
                  onChange={(e) => setResponseData({ ...responseData, host_price: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="host_response">Message to Guest (Optional)</Label>
                <Textarea
                  id="host_response"
                  placeholder="Add any details or notes"
                  value={responseData.host_response}
                  onChange={(e) => setResponseData({ ...responseData, host_response: e.target.value })}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  disabled={respondMutation.isPending}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={respondMutation.isPending || !responseData.host_price}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {respondMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}