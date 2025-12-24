import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Authenticate user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transaction_id } = await req.json();

        if (!transaction_id) {
            return Response.json({ error: 'transaction_id required' }, { status: 400 });
        }

        // Fetch transaction
        const transactions = await base44.entities.Transaction.filter({ id: transaction_id });
        
        if (transactions.length === 0) {
            return Response.json({ error: 'Transaction not found' }, { status: 404 });
        }

        const transaction = transactions[0];

        // Verify user owns this transaction
        if (transaction.user_email !== user.email && user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch related listing if available
        let listing = null;
        if (transaction.metadata?.listing_id) {
            const listings = await base44.entities.Listing.filter({ id: transaction.metadata.listing_id });
            if (listings.length > 0) {
                listing = listings[0];
            }
        }

        // Generate PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 20;

        // Header
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Company Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Vendibook Inc.', 20, yPos);
        yPos += 5;
        doc.text('Food Service Marketplace', 20, yPos);
        yPos += 10;

        // Invoice Details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Invoice Details', 20, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice #: ${transaction.id.slice(0, 8).toUpperCase()}`, 20, yPos);
        yPos += 5;
        doc.text(`Transaction ID: ${transaction.payment_intent_id || 'N/A'}`, 20, yPos);
        yPos += 5;
        doc.text(`Date: ${new Date(transaction.created_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`, 20, yPos);
        yPos += 5;
        doc.text(`Status: ${transaction.status.toUpperCase()}`, 20, yPos);
        yPos += 15;

        // Bill To
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 20, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(transaction.user_email, 20, yPos);
        yPos += 20;

        // Transaction Details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Transaction Details', 20, yPos);
        yPos += 7;

        // Draw table header
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Description', 25, yPos);
        doc.text('Amount', pageWidth - 45, yPos);
        yPos += 10;

        // Table rows
        doc.setFont('helvetica', 'normal');
        
        // Main description
        const description = transaction.description || getTransactionTypeLabel(transaction.transaction_type);
        doc.text(description, 25, yPos);
        doc.text(`$${transaction.amount.toFixed(2)}`, pageWidth - 45, yPos);
        yPos += 7;

        if (listing) {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`Listing: ${listing.title}`, 25, yPos);
            yPos += 5;
            doc.text(`Location: ${listing.public_location_label}`, 25, yPos);
            yPos += 10;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
        }

        // Add metadata details if available
        if (transaction.metadata) {
            if (transaction.metadata.start_date && transaction.metadata.end_date) {
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.text(`Rental Period: ${transaction.metadata.start_date} to ${transaction.metadata.end_date}`, 25, yPos);
                yPos += 10;
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(10);
            }
        }

        // Total line
        yPos += 5;
        doc.setLineWidth(0.5);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 7;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Total Amount:', pageWidth - 80, yPos);
        doc.text(`$${transaction.amount.toFixed(2)}`, pageWidth - 45, yPos, { align: 'right' });
        yPos += 15;

        // Payment Info
        if (transaction.status === 'completed') {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 128, 0);
            doc.text('✓ PAID', 20, yPos);
            doc.setTextColor(0, 0, 0);
            
            if (transaction.payment_method) {
                doc.text(`Payment Method: ${transaction.payment_method}`, 50, yPos);
            }
            yPos += 10;
        }

        // Footer
        yPos = doc.internal.pageSize.getHeight() - 30;
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
        doc.text('For support, contact support@vendibook.com', pageWidth / 2, yPos, { align: 'center' });
        
        if (transaction.receipt_url) {
            yPos += 5;
            doc.text('Stripe Receipt: ' + transaction.receipt_url, pageWidth / 2, yPos, { align: 'center' });
        }

        // Generate PDF
        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=invoice-${transaction.id.slice(0, 8)}.pdf`
            }
        });

    } catch (error) {
        console.error('Invoice generation error:', error);
        return Response.json({ 
            error: 'Failed to generate invoice',
            details: error.message 
        }, { status: 500 });
    }
});

function getTransactionTypeLabel(type) {
    const labels = {
        booking_payment: 'Booking Payment',
        sale_purchase: 'Purchase',
        escrow_payment: 'Escrow Payment',
        addon_payment: 'Add-on Service',
        refund: 'Refund'
    };
    return labels[type] || type;
}