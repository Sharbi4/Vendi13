import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, Loader2, CheckCircle, AlertCircle, FileSpreadsheet,
  Package, Calendar, DollarSign, Users, MessageSquare, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';

const EXPORT_OPTIONS = [
  {
    id: 'Listing',
    name: 'Listings',
    description: 'All rental and for-sale listings',
    icon: Package,
    color: 'bg-blue-500'
  },
  {
    id: 'Booking',
    name: 'Bookings',
    description: 'Rental booking history',
    icon: Calendar,
    color: 'bg-green-500'
  },
  {
    id: 'Transaction',
    name: 'Transactions',
    description: 'Payment and sales transactions',
    icon: DollarSign,
    color: 'bg-purple-500'
  },
  {
    id: 'User',
    name: 'Users',
    description: 'Registered user accounts',
    icon: Users,
    color: 'bg-amber-500'
  },
  {
    id: 'Conversation',
    name: 'Conversations',
    description: 'Message conversations',
    icon: MessageSquare,
    color: 'bg-pink-500'
  },
  {
    id: 'Review',
    name: 'Reviews',
    description: 'Listing reviews and ratings',
    icon: Star,
    color: 'bg-yellow-500'
  }
];

export default function DataExport() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportingEntity, setExportingEntity] = useState(null);
  const [exportResults, setExportResults] = useState({});

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
    setIsLoading(false);
  };

  const handleExport = async (entityName) => {
    if (!user?.google_sheets_config?.spreadsheet_id) {
      toast.error('Please configure Google Sheets first');
      return;
    }

    setExportingEntity(entityName);
    try {
      const response = await base44.functions.invoke('exportToGoogleSheets', {
        spreadsheetId: user.google_sheets_config.spreadsheet_id,
        sheetName: entityName,
        entityName: entityName,
        filters: entityName === 'Listing' ? { created_by: user.email } : {}
      });

      if (response.data.success) {
        setExportResults(prev => ({
          ...prev,
          [entityName]: {
            success: true,
            count: response.data.recordsExported,
            timestamp: new Date().toISOString()
          }
        }));
        toast.success(`Exported ${response.data.recordsExported} ${entityName} records`);
      } else {
        toast.error(`Export failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message || 'Export failed');
    } finally {
      setExportingEntity(null);
    }
  };

  const handleExportAll = async () => {
    if (!user?.google_sheets_config?.spreadsheet_id) {
      toast.error('Please configure Google Sheets first');
      return;
    }

    toast.info('Starting export of all data...');
    
    for (const option of EXPORT_OPTIONS) {
      await handleExport(option.id);
      // Small delay between exports
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    toast.success('All data exported successfully!');
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

  const hasGoogleSheets = user?.google_sheets_config?.enabled && user?.google_sheets_config?.spreadsheet_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Data Export</h1>
            <p className="text-slate-600 mt-1">Export your app data to Google Sheets</p>
          </div>

          {/* Setup Required Alert */}
          {!hasGoogleSheets && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Google Sheets integration is required to export data.{' '}
                <Link to={createPageUrl('GoogleSheetsSettings')} className="font-medium underline">
                  Set it up now
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {hasGoogleSheets && (
            <>
              {/* Quick Actions */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex gap-3">
                  <Button
                    onClick={handleExportAll}
                    disabled={!!exportingEntity}
                    className="bg-[#FF5124] hover:bg-[#e5481f]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${user.google_sheets_config.spreadsheet_id}`, '_blank')}
                  >
                    Open Spreadsheet
                  </Button>
                </CardContent>
              </Card>

              {/* Export Options Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {EXPORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const result = exportResults[option.id];
                  const isExporting = exportingEntity === option.id;

                  return (
                    <Card key={option.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          {result?.success && (
                            <Badge className="bg-green-100 text-green-800 border-0">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Exported
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-slate-900 mb-1">{option.name}</h3>
                        <p className="text-sm text-slate-600 mb-4">{option.description}</p>

                        {result?.success && (
                          <div className="mb-3 p-2 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-700">
                              {result.count} records • {new Date(result.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        )}

                        <Button
                          onClick={() => handleExport(option.id)}
                          disabled={isExporting || !!exportingEntity}
                          className="w-full"
                          variant="outline"
                        >
                          {isExporting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Exporting...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Each entity type is exported to a separate sheet in your spreadsheet
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Existing data in sheets will be replaced with fresh data on each export
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Column headers are automatically generated from your entity fields
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      Up to 1,000 records per entity are exported
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}