import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin/system access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Fetch all confirmed/active bookings
    const allBookings = await base44.asServiceRole.entities.Booking.filter({
      status: { $in: ['confirmed', 'active'] }
    }, '-start_date', 500);

    const results = {
      reminders_sent_24h: 0,
      reminders_sent_7d: 0,
      errors: []
    };

    for (const booking of allBookings) {
      try {
        const startDate = new Date(booking.start_date);
        const daysUntilStart = Math.floor((startDate - now) / (1000 * 60 * 60 * 24));

        // Fetch listing details
        const listing = await base44.asServiceRole.entities.Listing.filter({ id: booking.listing_id });
        if (!listing || listing.length === 0) continue;
        
        const listingData = listing[0];
        const hostEmail = listingData.created_by;

        // Fetch user preferences
        const guestUser = await base44.asServiceRole.entities.User.filter({ email: booking.guest_email });
        const hostUser = await base44.asServiceRole.entities.User.filter({ email: hostEmail });

        const guestPrefs = guestUser[0]?.reminder_preferences || { enabled: true, guest_reminders_enabled: true, send_24h_reminder: true, send_7d_reminder: true };
        const hostPrefs = hostUser[0]?.reminder_preferences || { enabled: true, host_reminders_enabled: true, send_24h_reminder: true, send_7d_reminder: true };

        // Check for 24-hour reminder
        if (daysUntilStart <= 1 && daysUntilStart >= 0 && !booking.reminder_sent_24h) {
          // Send to guest
          if (guestPrefs.enabled && guestPrefs.guest_reminders_enabled && guestPrefs.send_24h_reminder && booking.guest_email) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: booking.guest_email,
              from_name: 'Vendibook',
              subject: '🔔 Reminder: Your booking starts tomorrow!',
              body: `
Hi ${booking.guest_name || 'there'},

This is a friendly reminder that your booking starts tomorrow!

📦 Listing: ${listingData.title}
📅 Start Date: ${new Date(booking.start_date).toLocaleDateString()}
📅 End Date: ${new Date(booking.end_date).toLocaleDateString()}
📍 Location: ${listingData.public_location_label || 'See listing for details'}

${booking.delivery_requested ? '🚚 Delivery Address: ' + booking.delivery_address : '📍 Pickup Instructions: ' + (listingData.pickup_instructions || 'Contact host for details')}

${booking.special_requests ? '📝 Your Special Requests: ' + booking.special_requests : ''}

Need to contact the host? Reply to this email or visit your booking details on Vendibook.

Safe travels!
The Vendibook Team
              `.trim()
            });
          }

          // Send to host
          if (hostPrefs.enabled && hostPrefs.host_reminders_enabled && hostPrefs.send_24h_reminder && hostEmail) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: hostEmail,
              from_name: 'Vendibook',
              subject: '🔔 Reminder: Booking starts tomorrow',
              body: `
Hi there,

You have a booking starting tomorrow!

👤 Guest: ${booking.guest_name || booking.guest_email}
📦 Listing: ${listingData.title}
📅 Start Date: ${new Date(booking.start_date).toLocaleDateString()}
📅 End Date: ${new Date(booking.end_date).toLocaleDateString()}

${booking.delivery_requested ? '🚚 Delivery Required to: ' + booking.delivery_address : '📍 Guest will pick up'}

${booking.special_requests ? '📝 Special Requests: ' + booking.special_requests : ''}

Please ensure everything is ready for your guest.

The Vendibook Team
              `.trim()
            });
          }

          // Mark reminder as sent
          await base44.asServiceRole.entities.Booking.update(booking.id, {
            reminder_sent_24h: true,
            reminder_sent_24h_date: new Date().toISOString()
          });

          results.reminders_sent_24h++;
        }

        // Check for 7-day reminder
        if (daysUntilStart >= 6 && daysUntilStart <= 8 && !booking.reminder_sent_7d) {
          // Send to guest
          if (guestPrefs.enabled && guestPrefs.guest_reminders_enabled && guestPrefs.send_7d_reminder && booking.guest_email) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: booking.guest_email,
              from_name: 'Vendibook',
              subject: '📅 Your booking is coming up in 7 days',
              body: `
Hi ${booking.guest_name || 'there'},

Your booking is just one week away!

📦 Listing: ${listingData.title}
📅 Start Date: ${new Date(booking.start_date).toLocaleDateString()}
📅 End Date: ${new Date(booking.end_date).toLocaleDateString()}
📍 Location: ${listingData.public_location_label || 'See listing for details'}

${booking.delivery_requested ? '🚚 Delivery scheduled to: ' + booking.delivery_address : '📍 Pickup location: ' + listingData.public_location_label}

If you have any questions or need to make changes, please contact the host as soon as possible.

Looking forward to your rental!
The Vendibook Team
              `.trim()
            });
          }

          // Send to host
          if (hostPrefs.enabled && hostPrefs.host_reminders_enabled && hostPrefs.send_7d_reminder && hostEmail) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: hostEmail,
              from_name: 'Vendibook',
              subject: '📅 Upcoming booking in 7 days',
              body: `
Hi there,

You have a booking starting in 7 days!

👤 Guest: ${booking.guest_name || booking.guest_email}
📦 Listing: ${listingData.title}
📅 Start Date: ${new Date(booking.start_date).toLocaleDateString()}
📅 End Date: ${new Date(booking.end_date).toLocaleDateString()}

${booking.delivery_requested ? '🚚 Delivery required' : '📍 Guest will pick up'}

This is a good time to prepare and reach out to your guest if needed.

The Vendibook Team
              `.trim()
            });
          }

          // Mark reminder as sent
          await base44.asServiceRole.entities.Booking.update(booking.id, {
            reminder_sent_7d: true,
            reminder_sent_7d_date: new Date().toISOString()
          });

          results.reminders_sent_7d++;
        }
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        results.errors.push({
          booking_id: booking.id,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Send booking reminders error:', error);
    return Response.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
});