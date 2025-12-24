import { base44 } from '@/api/base44Client';

/**
 * Email Notification Helper
 * 
 * Uses Resend API (configured via RESEND_API_KEY secret) to send transactional emails
 * through the Core.SendEmail integration.
 * 
 * Common use cases:
 * - Booking confirmations
 * - Verification notifications
 * - Payment receipts
 * - Message notifications
 * - Review reminders
 */

export const EmailNotifications = {
  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(booking, listing, guestEmail) {
    try {
      await base44.integrations.Core.SendEmail({
        to: guestEmail,
        subject: `Booking Confirmed: ${listing.title}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/8bbfdae8e_25c425f5-dd2e-45b8-bc8b-2978838cf387_20251220_000850_0000.png" alt="Vendibook" style="max-width: 250px; margin: 20px 0;" />
            <h2>Your booking has been confirmed!</h2>
            <p>Thank you for booking with Vendibook.</p>
            
            <h3>Booking Details:</h3>
            <ul>
              <li><strong>Listing:</strong> ${listing.title}</li>
              <li><strong>Dates:</strong> ${booking.start_date} to ${booking.end_date}</li>
              <li><strong>Total:</strong> $${booking.total_amount}</li>
              <li><strong>Booking ID:</strong> ${booking.id}</li>
            </ul>
            
            <p>You can view your booking details in your dashboard.</p>
            
            <p>Best regards,<br>Vendibook Team</p>
          </div>
        `,
        from_name: 'Vendibook'
      });
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
    }
  },

  /**
   * Send verification status update
   */
  async sendVerificationUpdate(userEmail, listing, status) {
    const statusMessages = {
      verified: 'Your listing has been verified!',
      rejected: 'Your listing verification was not approved',
      pending: 'Your listing is under review'
    };

    try {
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: `Listing Verification Update: ${listing.title}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/8bbfdae8e_25c425f5-dd2e-45b8-bc8b-2978838cf387_20251220_000850_0000.png" alt="Vendibook" style="max-width: 250px; margin: 20px 0;" />
            <h2>${statusMessages[status]}</h2>
            <p><strong>Listing:</strong> ${listing.title}</p>
            ${status === 'verified' ? 
              '<p>Congratulations! Your listing now has a verified badge and will appear higher in search results.</p>' :
              status === 'rejected' ?
              '<p>Please review the feedback and submit updated documentation.</p>' :
              '<p>We are reviewing your verification documents. This typically takes 24-48 hours.</p>'
            }
            <p>Best regards,<br>Vendibook Team</p>
          </div>
        `,
        from_name: 'Vendibook'
      });
    } catch (error) {
      console.error('Failed to send verification update:', error);
    }
  },

  /**
   * Send new message notification
   */
  async sendMessageNotification(recipientEmail, senderName, listingTitle, messagePreview) {
    try {
      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject: `New message from ${senderName}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/8bbfdae8e_25c425f5-dd2e-45b8-bc8b-2978838cf387_20251220_000850_0000.png" alt="Vendibook" style="max-width: 250px; margin: 20px 0;" />
            <h2>You have a new message</h2>
            <p><strong>From:</strong> ${senderName}</p>
            <p><strong>About:</strong> ${listingTitle}</p>
            <p><strong>Message:</strong> ${messagePreview}</p>
            <p>Log in to Vendibook to reply.</p>
            <p>Best regards,<br>Vendibook Team</p>
          </div>
        `,
        from_name: 'Vendibook'
      });
    } catch (error) {
      console.error('Failed to send message notification:', error);
    }
  },

  /**
   * Send identity verification status
   */
  async sendIdentityVerificationUpdate(userEmail, userName, status) {
    const statusMessages = {
      verified: 'Your identity has been verified!',
      failed: 'Identity verification was unsuccessful',
      requires_input: 'Additional information needed for verification'
    };

    try {
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: `Identity Verification Update`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/8bbfdae8e_25c425f5-dd2e-45b8-bc8b-2978838cf387_20251220_000850_0000.png" alt="Vendibook" style="max-width: 250px; margin: 20px 0;" />
            <h2>Hello ${userName},</h2>
            <h3>${statusMessages[status]}</h3>
            ${status === 'verified' ?
              '<p>Your account is now verified. You can now enjoy all premium features and your listings will display a verified badge.</p>' :
              status === 'failed' ?
              '<p>We were unable to verify your identity. Please contact support or try again with different documentation.</p>' :
              '<p>Please check your verification session and provide the requested information.</p>'
            }
            <p>Best regards,<br>Vendibook Team</p>
          </div>
        `,
        from_name: 'Vendibook'
      });
    } catch (error) {
      console.error('Failed to send identity verification update:', error);
    }
  },

  /**
   * Send payout notification
   */
  async sendPayoutNotification(hostEmail, amount, status) {
    try {
      await base44.integrations.Core.SendEmail({
        to: hostEmail,
        subject: `Payout ${status}: $${amount}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/8bbfdae8e_25c425f5-dd2e-45b8-bc8b-2978838cf387_20251220_000850_0000.png" alt="Vendibook" style="max-width: 250px; margin: 20px 0;" />
            <h2>Payout Update</h2>
            <p>Your payout of <strong>$${amount}</strong> is now <strong>${status}</strong>.</p>
            ${status === 'completed' ?
              '<p>The funds should arrive in your account within 2-5 business days.</p>' :
              '<p>You can track your payout status in your dashboard.</p>'
            }
            <p>Best regards,<br>Vendibook Team</p>
          </div>
        `,
        from_name: 'Vendibook'
      });
    } catch (error) {
      console.error('Failed to send payout notification:', error);
    }
  }
};

export default EmailNotifications;