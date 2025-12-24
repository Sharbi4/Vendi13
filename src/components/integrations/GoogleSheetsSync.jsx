import { base44 } from '@/api/base44Client';

/**
 * Syncs data to Google Sheets
 * @param {string} spreadsheetId - The Google Sheets spreadsheet ID
 * @param {string} sheetName - The sheet name (default: 'Sheet1')
 * @param {object|array} data - Data to sync (object or array of values)
 * @returns {Promise<object>} Result of the sync operation
 */
export async function syncToGoogleSheets(spreadsheetId, sheetName, data) {
  try {
    const response = await base44.functions.invoke('syncToGoogleSheets', {
      spreadsheetId,
      sheetName,
      data
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Google Sheets sync error:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync to Google Sheets'
    };
  }
}

/**
 * Format booking data for Google Sheets
 */
export function formatBookingForSheets(booking, listing) {
  return [
    new Date().toISOString(),
    booking.id,
    listing?.title || 'N/A',
    booking.guest_name,
    booking.guest_email,
    booking.guest_phone || 'N/A',
    booking.start_date,
    booking.end_date,
    booking.total_days,
    `$${booking.total_amount}`,
    booking.status,
    booking.delivery_requested ? 'Yes' : 'No',
    booking.special_requests || 'N/A'
  ];
}

/**
 * Format sale purchase data for Google Sheets
 */
export function formatSaleForSheets(transaction, listing, buyerInfo) {
  return [
    new Date().toISOString(),
    transaction.id,
    listing?.title || 'N/A',
    buyerInfo.name,
    buyerInfo.email,
    buyerInfo.phone || 'N/A',
    `$${transaction.amount}`,
    transaction.status,
    transaction.delivery_method || 'N/A',
    buyerInfo.notes || 'N/A'
  ];
}

/**
 * React hook for Google Sheets integration
 */
export function useGoogleSheetsSync() {
  const syncBooking = async (booking, listing, spreadsheetId) => {
    if (!spreadsheetId) return { success: false, error: 'No spreadsheet ID configured' };
    
    const data = formatBookingForSheets(booking, listing);
    return await syncToGoogleSheets(spreadsheetId, 'Bookings', data);
  };

  const syncSale = async (transaction, listing, buyerInfo, spreadsheetId) => {
    if (!spreadsheetId) return { success: false, error: 'No spreadsheet ID configured' };
    
    const data = formatSaleForSheets(transaction, listing, buyerInfo);
    return await syncToGoogleSheets(spreadsheetId, 'Sales', data);
  };

  return { syncBooking, syncSale, syncToGoogleSheets };
}