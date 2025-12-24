import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, sheetName, data } = await req.json();

    if (!spreadsheetId || !data) {
      return Response.json({ 
        error: 'Missing required fields: spreadsheetId, data' 
      }, { status: 400 });
    }

    // Get Google Sheets access token from app connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    if (!accessToken) {
      return Response.json({
        error: 'Google Sheets not connected. Please authorize in your account settings.'
      }, { status: 403 });
    }

    // Convert data object to array of values
    const values = Array.isArray(data) ? data : [Object.values(data)];

    // Append data to Google Sheet
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName || 'Sheet1'}!A:Z:append?valueInputOption=RAW`;
    
    const response = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: values
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Sheets API error:', error);
      return Response.json({
        error: 'Failed to write to Google Sheets',
        details: error
      }, { status: response.status });
    }

    const result = await response.json();

    return Response.json({
      success: true,
      updatedRange: result.updates.updatedRange,
      updatedRows: result.updates.updatedRows,
      updatedColumns: result.updates.updatedColumns
    });

  } catch (error) {
    console.error('Sync to Google Sheets error:', error);
    return Response.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
});