import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check subscription status
        if (user.ai_assistant_subscription_status !== 'active' && user.ai_assistant_subscription_status !== 'trialing') {
            return Response.json({ 
                error: 'AI Assistant subscription required',
                subscription_required: true 
            }, { status: 403 });
        }

        const { prompt, context_type, context_data } = await req.json();

        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Build context-aware prompts
        let systemPrompt = 'You are an AI assistant for Vendibook, a marketplace for food trucks, trailers, and equipment rentals.';
        let enhancedPrompt = prompt;

        switch (context_type) {
            case 'guest_inquiry':
                systemPrompt += ' Help the host respond professionally to guest inquiries about their listing.';
                enhancedPrompt = `Guest inquiry: "${prompt}"\n\nListing details: ${JSON.stringify(context_data)}\n\nGenerate a helpful, friendly response for the host.`;
                break;
            
            case 'review_response':
                systemPrompt += ' Help the host write a professional and gracious response to a guest review.';
                enhancedPrompt = `Guest review (${context_data?.rating}/5 stars): "${prompt}"\n\nWrite a thoughtful host response.`;
                break;
            
            case 'listing_description':
                systemPrompt += ' Help create compelling listing descriptions that highlight key features and attract guests.';
                enhancedPrompt = `Generate a listing description for:\n${JSON.stringify(context_data)}\n\nMake it engaging and highlight unique features.`;
                break;
            
            case 'pricing_advice':
                systemPrompt += ' Provide pricing recommendations based on market data and listing features.';
                break;
            
            default:
                systemPrompt += ' Provide helpful advice for managing listings and communicating with guests.';
        }

        // Call LLM integration
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `${systemPrompt}\n\n${enhancedPrompt}`
        });

        return Response.json({ 
            success: true,
            response: response,
            tokens_used: response.length
        });

    } catch (error) {
        console.error('Error getting AI response:', error);
        return Response.json({ 
            error: 'Failed to get AI response',
            details: error.message 
        }, { status: 500 });
    }
});