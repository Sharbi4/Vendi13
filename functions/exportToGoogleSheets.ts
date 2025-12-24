import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spreadsheetId, sheetName, entityName, filters = {} } = await req.json();

    if (!spreadsheetId || !entityName) {
      return Response.json({ 
        error: 'Missing required fields: spreadsheetId, entityName' 
      }, { status: 400 });
    }

    // Get Google Sheets access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    if (!accessToken) {
      return Response.json({
        error: 'Google Sheets not connected'
      }, { status: 403 });
    }

    // Fetch entity data
    let data;
    try {
      data = await base44.asServiceRole.entities[entityName].filter(filters, '-created_date', 1000);
    } catch (error) {
      return Response.json({
        error: `Failed to fetch ${entityName} data`,
        details: error.message
      }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return Response.json({
        error: 'No data found to export'
      }, { status: 404 });
    }

    // Convert data to rows format
    const headers = Object.keys(data[0]);
    const rows = [headers];
    
    data.forEach(item => {
      const row = headers.map(key => {
        const value = item[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      });
      rows.push(row);
    });

    // Clear existing content and write new data
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName || entityName}!A:Z:clear`;
    
    await fetch(clearUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    // Write new data
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName || entityName}!A1?valueInputOption=RAW`;
    
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Sheets API error:', error);
      return Response.json({
        error: 'Failed to export to Google Sheets',
        details: error
      }, { status: response.status });
    }

    const result = await response.json();

    return Response.json({
      success: true,
      recordsExported: data.length,
      updatedRange: result.updatedRange,
      updatedRows: result.updatedRows,
      updatedColumns: result.updatedColumns
    });

  } catch (error) {
    console.error('Export to Google Sheets error:', error);
    return Response.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
});