import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit, createRateLimitResponse } from './utils/rateLimiter.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Rate limiting: Prevent email spam - 20 emails per hour
        const rateLimit = await checkRateLimit(req, base44, {
            maxRequests: 5,
            windowMs: 3600000, // 1 hour
            authenticatedMaxRequests: 20
        });
        
        if (!rateLimit.allowed) {
            return createRateLimitResponse(rateLimit);
        }
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { recipient_email, type, data } = await req.json();

        if (!recipient_email || !type) {
            return Response.json({ 
                error: 'recipient_email and type required' 
            }, { status: 400 });
        }

        // Fetch recipient user info
        const users = await base44.asServiceRole.entities.User.filter({ email: recipient_email });
        const recipient = users[0];

        if (!recipient) {
            return Response.json({ error: 'Recipient not found' }, { status: 404 });
        }

        // Build email content based on notification type
        let subject = '';
        let body = '';
        const appUrl = Deno.env.get('APP_URL') || 'https://vendibook.com';

        switch (type) {
            case 'new_message':
                subject = `New message from ${data.sender_name}`;
                body = `
                    <h2>You have a new message on Vendibook</h2>
                    <p><strong>${data.sender_name}</strong> sent you a message about <strong>${data.listing_title}</strong></p>
                    <p>${data.message_preview}</p>
                    <br>
                    <a href="${appUrl}/Dashboard" style="background-color: #FF5124; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Message</a>
                    <br><br>
                    <p style="color: #666; font-size: 12px;">Don't want these emails? Update your notification preferences in your account settings.</p>
                `;
                break;

            case 'booking_request':
                subject = `New booking request for ${data.listing_title}`;
                body = `
                    <h2>You have a new booking request!</h2>
                    <p><strong>${data.guest_name}</strong> wants to book <strong>${data.listing_title}</strong></p>
                    <ul>
                        <li>Dates: ${data.dates}</li>
                        <li>Total: $${data.amount}</li>
                    </ul>
                    <br>
                    <a href="${appUrl}/Dashboard" style="background-color: #FF5124; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Review Request</a>
                `;
                break;

            case 'booking_confirmed':
                subject = `Your booking is confirmed!`;
                body = `
                    <h2>Booking Confirmed</h2>
                    <p>Great news! Your booking for <strong>${data.listing_title}</strong> has been confirmed.</p>
                    <ul>
                        <li>Dates: ${data.dates}</li>
                        <li>Total: $${data.amount}</li>
                    </ul>
                    <br>
                    <a href="${appUrl}/MyBookings" style="background-color: #FF5124; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Booking Details</a>
                `;
                break;

            case 'new_review':
                subject = `New review for ${data.listing_title}`;
                body = `
                    <h2>You received a new review!</h2>
                    <p><strong>${data.reviewer_name}</strong> left a ${data.rating}-star review for <strong>${data.listing_title}</strong></p>
                    <p>"${data.review_text}"</p>
                    <br>
                    <a href="${appUrl}/Dashboard" style="background-color: #FF5124; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Review</a>
                `;
                break;

            default:
                return Response.json({ error: 'Invalid notification type' }, { status: 400 });
        }

        // Send email using Core integration
        await base44.asServiceRole.integrations.Core.SendEmail({
            from_name: 'Vendibook',
            to: recipient_email,
            subject,
            body
        });

        return Response.json({ 
            success: true,
            message: 'Email notification sent'
        });

    } catch (error) {
        console.error('Send email notification error:', error);
        return Response.json({ 
            error: 'Failed to send email notification',
            details: error.message 
        }, { status: 500 });
    }
});