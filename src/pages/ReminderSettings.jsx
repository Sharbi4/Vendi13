import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, CheckCircle, Loader2, Calendar, Mail } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/layout/Header';

export default function ReminderSettings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const [preferences, setPreferences] = useState({
    enabled: true,
    send_24h_reminder: true,
    send_7d_reminder: true,
    guest_reminders_enabled: true,
    host_reminders_enabled: true
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin();
      return;
    }
    const userData = await base44.auth.me();
    setUser(userData);
    
    // Load existing preferences
    if (userData.reminder_preferences) {
      setPreferences(userData.reminder_preferences);
    }
    
    setIsLoading(false);
  };

  const saveMutation = useMutation({
    mutationFn: async (prefs) => {
      return await base44.auth.updateMe({
        reminder_preferences: prefs
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Reminder preferences saved');
    },
    onError: (error) => {
      toast.error('Failed to save preferences');
      console.error(error);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Booking Reminders</h1>
            <p className="text-slate-600 mt-1">Configure when you want to receive booking reminders</p>
          </div>

          <Alert className="mb-6">
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Reminders help you stay on top of your bookings and ensure smooth experiences for both guests and hosts.
            </AlertDescription>
          </Alert>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Reminders
              </CardTitle>
              <CardDescription>
                Get notified via email about upcoming bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <Label htmlFor="enabled" className="text-base font-medium">
                    Enable All Reminders
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">
                    Turn all booking reminders on or off
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={preferences.enabled}
                  onCheckedChange={(checked) => updatePreference('enabled', checked)}
                />
              </div>

              {preferences.enabled && (
                <>
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-slate-900">Reminder Timing</h3>
                    
                    {/* 7-Day Reminder */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <Label htmlFor="send_7d_reminder" className="text-base">
                            7 Days Before
                          </Label>
                          <p className="text-sm text-slate-500 mt-1">
                            Reminder sent one week before the booking starts
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="send_7d_reminder"
                        checked={preferences.send_7d_reminder}
                        onCheckedChange={(checked) => updatePreference('send_7d_reminder', checked)}
                      />
                    </div>

                    {/* 24-Hour Reminder */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <Label htmlFor="send_24h_reminder" className="text-base">
                            24 Hours Before
                          </Label>
                          <p className="text-sm text-slate-500 mt-1">
                            Reminder sent the day before the booking starts
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="send_24h_reminder"
                        checked={preferences.send_24h_reminder}
                        onCheckedChange={(checked) => updatePreference('send_24h_reminder', checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-slate-900">Role-Based Reminders</h3>
                    
                    {/* Guest Reminders */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="guest_reminders_enabled" className="text-base">
                          Reminders as Guest
                        </Label>
                        <p className="text-sm text-slate-500 mt-1">
                          Receive reminders for bookings you've made
                        </p>
                      </div>
                      <Switch
                        id="guest_reminders_enabled"
                        checked={preferences.guest_reminders_enabled}
                        onCheckedChange={(checked) => updatePreference('guest_reminders_enabled', checked)}
                      />
                    </div>

                    {/* Host Reminders */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="host_reminders_enabled" className="text-base">
                          Reminders as Host
                        </Label>
                        <p className="text-sm text-slate-500 mt-1">
                          Receive reminders for bookings on your listings
                        </p>
                      </div>
                      <Switch
                        id="host_reminders_enabled"
                        checked={preferences.host_reminders_enabled}
                        onCheckedChange={(checked) => updatePreference('host_reminders_enabled', checked)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-[#FF5124] hover:bg-[#e5481f]"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>

          {/* Info Card */}
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-2">How Reminders Work</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Reminders are automatically sent based on your preferences</li>
                    <li>Both guests and hosts receive appropriate notifications</li>
                    <li>You can disable reminders at any time</li>
                    <li>Reminders include booking details and important information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}