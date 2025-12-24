import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        
        if (!RESEND_API_KEY) {
            return Response.json({ 
                error: 'Resend API key not configured' 
            }, { status: 500 });
        }

        // Send welcome email via Resend
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'Vendibook <hello@vendibook.com>',
                to: user.email,
                subject: 'Welcome to Vendibook! 🎉',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                            <!-- Header -->
                            <div style="text-align: center; margin-bottom: 40px;">
                                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6945f8a538d2c013d6228293/fdd825e98_VendibookOfficialFavicon2026.jpg" alt="Vendibook" style="height: 50px; width: auto;">
                            </div>

                            <!-- Main Content -->
                            <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                                <h1 style="color: #0f172a; font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">Welcome to Vendibook, ${user.full_name}!</h1>
                                
                                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                                    We're thrilled to have you join our community of food truck owners, mobile business operators, and equipment providers.
                                </p>

                                <div style="background-color: #f8fafc; border-left: 4px solid #FF5124; padding: 20px; margin: 24px 0; border-radius: 8px;">
                                    <h2 style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">🚀 Get Started</h2>
                                    <ul style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                        <li><strong>Browse Listings:</strong> Find food trucks, trailers, ghost kitchens, or equipment for rent or sale</li>
                                        <li><strong>List Your Assets:</strong> Become a host and start earning by renting out your equipment</li>
                                        <li><strong>Secure Transactions:</strong> All bookings and sales are protected with secure payments</li>
                                        <li><strong>24/7 Support:</strong> Our team is here to help whenever you need us</li>
                                    </ul>
                                </div>

                                <div style="text-align: center; margin: 32px 0;">
                                    <a href="https://vendibook.com" style="display: inline-block; background-color: #FF5124; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                                        Start Exploring
                                    </a>
                                </div>

                                <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 24px;">
                                    <h3 style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">Quick Links:</h3>
                                    <div style="display: grid; gap: 12px;">
                                        <a href="https://vendibook.com/help-center" style="color: #FF5124; text-decoration: none; font-size: 15px;">📚 Help Center</a>
                                        <a href="https://vendibook.com/learn-more" style="color: #FF5124; text-decoration: none; font-size: 15px;">📖 How It Works</a>
                                        <a href="https://vendibook.com/dashboard" style="color: #FF5124; text-decoration: none; font-size: 15px;">🎯 Your Dashboard</a>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="text-align: center; margin-top: 32px; color: #94a3b8; font-size: 14px;">
                                <p style="margin: 0 0 8px 0;">
                                    Need help? Reply to this email or contact us at 
                                    <a href="mailto:support@vendibook.com" style="color: #FF5124; text-decoration: none;">support@vendibook.com</a>
                                </p>
                                <p style="margin: 0;">
                                    © ${new Date().getFullYear()} Vendibook. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', result);
            return Response.json({ 
                error: 'Failed to send email',
                details: result 
            }, { status: 500 });
        }

        return Response.json({ 
            success: true,
            message: 'Welcome email sent successfully',
            email_id: result.id
        });

    } catch (error) {
        console.error('Error sending welcome email:', error);
        return Response.json({ 
            error: 'Failed to send welcome email',
            details: error.message 
        }, { status: 500 });
    }
});