import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, ExternalLink, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/layout/Header';

export default function GoogleSheetsSettings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    
    // Load saved spreadsheet ID
    if (userData.google_sheets_config?.spreadsheet_id) {
      setSpreadsheetId(userData.google_sheets_config.spreadsheet_id);
    }
    
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({
        google_sheets_config: {
          spreadsheet_id: spreadsheetId,
          enabled: true
        }
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!spreadsheetId) {
      toast.error('Please enter a spreadsheet ID first');
      return;
    }

    setIsTesting(true);
    try {
      const response = await base44.functions.invoke('syncToGoogleSheets', {
        spreadsheetId,
        sheetName: 'Test',
        data: [['Test', 'Connection', 'Success', new Date().toISOString()]]
      });

      if (response.data.success) {
        toast.success('Connection successful! Test data added to your sheet.');
      } else {
        toast.error('Connection failed. Please check your spreadsheet ID.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to test connection');
    } finally {
      setIsTesting(false);
    }
  };

  const copyTemplateUrl = () => {
    navigator.clipboard.writeText('https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/copy');
    toast.success('Template URL copied to clipboard');
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Google Sheets Integration</h1>
            <p className="text-slate-600 mt-1">Automatically sync form submissions to your Google Sheets</p>
          </div>

          {/* Connection Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Connected to Google Sheets
              </CardTitle>
              <CardDescription>
                Your account is authorized to access Google Sheets
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Setup Instructions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="bg-[#FF5124] text-white flex-shrink-0 mt-1">1</Badge>
                  <div>
                    <p className="font-medium text-slate-900">Create a Google Sheet</p>
                    <p className="text-sm text-slate-600">
                      Create a new Google Sheet with sheets named "Bookings" and "Sales"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="bg-[#FF5124] text-white flex-shrink-0 mt-1">2</Badge>
                  <div>
                    <p className="font-medium text-slate-900">Add Column Headers</p>
                    <div className="text-sm text-slate-600 mt-1">
                      <p className="font-medium mb-1">Bookings sheet headers:</p>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded block">
                        Timestamp | Booking ID | Listing | Guest Name | Email | Phone | Start Date | End Date | Days | Amount | Status | Delivery | Notes
                      </code>
                      <p className="font-medium mt-3 mb-1">Sales sheet headers:</p>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded block">
                        Timestamp | Transaction ID | Listing | Buyer Name | Email | Phone | Amount | Status | Delivery | Notes
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="bg-[#FF5124] text-white flex-shrink-0 mt-1">3</Badge>
                  <div>
                    <p className="font-medium text-slate-900">Get Spreadsheet ID</p>
                    <p className="text-sm text-slate-600">
                      Copy the ID from your Google Sheet URL:
                    </p>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded block mt-1">
                      https://docs.google.com/spreadsheets/d/<span className="text-[#FF5124] font-bold">SPREADSHEET_ID</span>/edit
                    </code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="bg-[#FF5124] text-white flex-shrink-0 mt-1">4</Badge>
                  <div>
                    <p className="font-medium text-slate-900">Paste ID Below</p>
                    <p className="text-sm text-slate-600">
                      Enter the spreadsheet ID and test the connection
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Make sure your Google Sheet is accessible. The app will write data using your authorized Google account.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Spreadsheet Configuration</CardTitle>
              <CardDescription>
                Configure which Google Sheet to sync data to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="spreadsheet-id">Spreadsheet ID *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="spreadsheet-id"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={!spreadsheetId || isTesting}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  The unique identifier from your Google Sheets URL
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={!spreadsheetId || isSaving}
                  className="bg-[#FF5124] hover:bg-[#e5481f]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank')}
                  disabled={!spreadsheetId}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Sheet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* What Gets Synced */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>What Gets Synced</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  New booking submissions (after payment confirmation)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Sale purchases (after successful transaction)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Real-time sync - data appears immediately in your sheet
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}