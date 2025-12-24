import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Receipt, CreditCard, DollarSign, RefreshCw, 
  Download, Loader2, Calendar, CheckCircle, XCircle, Clock, RotateCcw, FileText
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Header from '../components/layout/Header';
import RefundModal from '../components/refunds/RefundModal';

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'bg-amber-100 text-amber-800', label: 'Pending' },
  completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
  failed: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Failed' },
  refunded: { icon: RefreshCw, color: 'bg-blue-100 text-blue-800', label: 'Refunded' }
};

const TYPE_LABELS = {
  booking_payment: 'Booking Payment',
  sale_purchase: 'Purchase',
  escrow_payment: 'Escrow Payment',
  addon_payment: 'Add-on Service',
  refund: 'Refund'
};

export default function PaymentHistory() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundingTransaction, setRefundingTransaction] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('PaymentHistory'));
      return;
    }
    setIsAuthenticated(authenticated);
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Transaction.filter({ user_email: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  const payments = transactions.filter(t => t.transaction_type !== 'refund');
  const refunds = transactions.filter(t => t.transaction_type === 'refund');

  const totalSpent = payments
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalRefunded = refunds
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const handleRequestRefund = (transaction) => {
    setRefundingTransaction(transaction);
    setShowRefundModal(true);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5124]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#FF5124] rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Payment History</h1>
              <p className="text-slate-500">View all your transactions and receipts</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Spent</p>
                    <p className="text-2xl font-bold text-slate-900">${totalSpent.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Transactions</p>
                    <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Refunded</p>
                    <p className="text-2xl font-bold text-slate-900">${totalRefunded.toLocaleString()}</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
              <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
              <TabsTrigger value="refunds">Refunds ({refunds.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF5124]" />
                </div>
              ) : transactions.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-slate-500">No transactions yet</p>
                  </CardContent>
                </Card>
              ) : (
                transactions.map(transaction => (
                  <TransactionCard 
                    key={transaction.id} 
                    transaction={transaction}
                    onRequestRefund={handleRequestRefund}
                    isAdmin={user?.role === 'admin'}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="payments" className="space-y-3">
              {payments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-slate-500">No payments yet</p>
                  </CardContent>
                </Card>
              ) : (
                payments.map(transaction => (
                  <TransactionCard 
                    key={transaction.id} 
                    transaction={transaction}
                    onRequestRefund={handleRequestRefund}
                    isAdmin={user?.role === 'admin'}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="refunds" className="space-y-3">
              {refunds.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-slate-500">No refunds</p>
                  </CardContent>
                </Card>
              ) : (
                refunds.map(transaction => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Refund Modal */}
      {refundingTransaction && (
        <RefundModal
          open={showRefundModal}
          onClose={() => {
            setShowRefundModal(false);
            setRefundingTransaction(null);
          }}
          transaction={refundingTransaction}
          onRefundComplete={() => {
            setShowRefundModal(false);
            setRefundingTransaction(null);
          }}
        />
      )}
    </div>
  );
}

function TransactionCard({ transaction, onRequestRefund, isAdmin }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const statusConfig = STATUS_CONFIG[transaction.status];
  const StatusIcon = statusConfig.icon;

  const canRefund = transaction.status === 'completed' && 
                    transaction.transaction_type !== 'refund' &&
                    !transaction.refund_amount;

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const response = await base44.functions.invoke('generateInvoice', {
        transaction_id: transaction.id
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${transaction.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Invoice downloaded');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-gray-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-slate-900">{transaction.description || TYPE_LABELS[transaction.transaction_type]}</p>
                <Badge className={statusConfig.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(transaction.created_date), 'MMM d, yyyy')}
                </span>
                {transaction.payment_intent_id && (
                  <span className="font-mono">ID: {transaction.payment_intent_id.slice(0, 16)}...</span>
                )}
              </div>
              
              {transaction.refund_amount > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Refunded: ${transaction.refund_amount.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <div>
              <p className={`text-xl font-bold ${transaction.transaction_type === 'refund' ? 'text-green-600' : 'text-slate-900'}`}>
                {transaction.transaction_type === 'refund' ? '+' : ''}${transaction.amount?.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 justify-end mt-1">
                {transaction.receipt_url && (
                  <a 
                    href={transaction.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Receipt
                  </a>
                )}
                <button
                  onClick={handleDownloadInvoice}
                  disabled={isDownloading}
                  className="text-xs text-[#FF5124] hover:text-[#e5481f] flex items-center gap-1"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <FileText className="w-3 h-3" />
                  )}
                  Invoice
                </button>
              </div>
            </div>

            {canRefund && isAdmin && onRequestRefund && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRequestRefund(transaction)}
                className="text-red-600 hover:text-red-700"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}