import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { checkRateLimit, createRateLimitResponse } from './utils/rateLimiter.js';
import { handleCorsPreFlight, addCorsHeaders } from './utils/corsHandler.js';
import { validateRequest, createValidationErrorResponse } from './utils/requestValidator.js';

Deno.serve(async (req) => {
    try {
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
            return handleCorsPreFlight(req);
        }
        
        // Validate request
        const validation = await validateRequest(req, {
            maxSize: 1 * 1024 * 1024, // 1 MB max
            requireJson: true
        });
        
        if (!validation.valid) {
            const errorResponse = createValidationErrorResponse(validation);
            return addCorsHeaders(errorResponse, req);
        }
        
        const base44 = createClientFromRequest(req);
        
        // Rate limiting: Prevent spam - 30 messages per minute
        const rateLimit = await checkRateLimit(req, base44, {
            maxRequests: 10,
            windowMs: 60000,
            authenticatedMaxRequests: 30
        });
        
        if (!rateLimit.allowed) {
            return addCorsHeaders(createRateLimitResponse(rateLimit), req);
        }
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = validation.body;
        let { conversation_id, message_text, attachments = [] } = body;

        if (!conversation_id || !message_text) {
            return Response.json({ 
                error: 'conversation_id and message_text required' 
            }, { status: 400 });
        }
        
        // Input validation and sanitization
        if (typeof conversation_id !== 'string' || conversation_id.length > 100) {
            return Response.json({ error: 'Invalid conversation_id' }, { status: 400 });
        }
        
        if (typeof message_text !== 'string' || message_text.trim().length === 0) {
            return Response.json({ error: 'Invalid message_text' }, { status: 400 });
        }
        
        // Sanitize message text - limit length and remove dangerous content
        message_text = message_text.trim().substring(0, 5000);
        
        // Validate attachments array
        if (!Array.isArray(attachments)) {
            attachments = [];
        }
        
        // Validate attachment URLs (only allow https URLs)
        attachments = attachments.filter(url => {
            if (typeof url !== 'string') return false;
            try {
                const parsed = new URL(url);
                return parsed.protocol === 'https:';
            } catch {
                return false;
            }
        }).slice(0, 5); // Max 5 attachments

        // Get conversation to find recipient
        const conversations = await base44.entities.Conversation.filter({ id: conversation_id });
        if (conversations.length === 0) {
            return Response.json({ error: 'Conversation not found' }, { status: 404 });
        }
        
        const conversation = conversations[0];
        
        // Verify user is part of conversation
        if (conversation.host_email !== user.email && conversation.guest_email !== user.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Create message
        const message = await base44.entities.Message.create({
            conversation_id,
            sender_email: user.email,
            sender_name: user.full_name,
            message_text,
            attachments,
            read: false
        });

        // Update conversation
        const recipientEmail = conversation.host_email === user.email 
            ? conversation.guest_email 
            : conversation.host_email;
            
        const updateData = {
            last_message: message_text.substring(0, 100),
            last_message_date: new Date().toISOString()
        };

        if (conversation.host_email === user.email) {
            updateData.unread_count_guest = (conversation.unread_count_guest || 0) + 1;
        } else {
            updateData.unread_count_host = (conversation.unread_count_host || 0) + 1;
        }

        await base44.entities.Conversation.update(conversation_id, updateData);

        // Create notification for recipient
        await base44.entities.Notification.create({
            user_email: recipientEmail,
            type: 'message',
            title: 'New Message',
            message: `${user.full_name} sent you a message`,
            reference_id: conversation_id,
            link: `/messages?conversation=${conversation_id}`,
            read: false
        });

        // Send email notification asynchronously (don't wait for it)
        try {
            fetch(`${Deno.env.get('APP_URL') || 'https://vendibook.com'}/api/sendEmailNotification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.get('Authorization')
                },
                body: JSON.stringify({
                    recipient_email: recipientEmail,
                    type: 'new_message',
                    data: {
                        sender_name: user.full_name,
                        listing_title: conversation.listing_title,
                        message_preview: message_text.substring(0, 100)
                    }
                })
            }).catch(err => console.error('Failed to send email notification:', err));
        } catch (err) {
            console.error('Email notification error:', err);
        }

        const successResponse = Response.json({ 
            success: true,
            message 
        });
        
        return addCorsHeaders(successResponse, req);

    } catch (error) {
        console.error('Send message error:', error);
        const errorResponse = Response.json({ 
            error: 'Failed to send message',
            details: error.message 
        }, { status: 500 });
        
        return addCorsHeaders(errorResponse, req);
    }
});