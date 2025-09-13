import { useState } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Download, 
  Search, 
  QrCode,
  Receipt,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  IndianRupee,
  FileText,
  Share2
} from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';

interface PaymentRecord {
  id: string;
  paymentId: string;
  eventId: string;
  eventTitle: string;
  eventType: 'hackathon' | 'workshop' | 'conference' | 'quiz';
  amount: number;
  currency: string;
  status: 'successful' | 'pending' | 'failed' | 'refunded' | 'disputed';
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  lastFourDigits?: string;
  transactionDate: string;
  description: string;
  receiptUrl: string;
  qrCode: string;
  registrationId: string;
  refundAmount?: number;
  refundDate?: string;
  processingFee: number;
  tax: number;
  subtotal: number;
}

export default function PaymentHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Hardcoded payment history data
  const paymentHistory: PaymentRecord[] = [
    {
      id: 'pay-1',
      paymentId: 'PAY-AI2024-789ABC',
      eventId: 'event-1',
      eventTitle: 'AI Innovation Summit 2024',
      eventType: 'conference',
      amount: 299.00,
      currency: 'USD',
      status: 'successful',
      paymentMethod: 'credit_card',
      lastFourDigits: '4321',
      transactionDate: '2023-12-01T10:30:00Z',
      description: 'Conference registration - AI Innovation Summit 2024',
      receiptUrl: '/receipts/receipt-ai-summit-2024.pdf',
      qrCode: 'PAY-QR-AI2024-789ABC',
      registrationId: 'REG-AI2024-USER789',
      processingFee: 8.97,
      tax: 23.92,
      subtotal: 266.11,
    },
    {
      id: 'pay-2',
      paymentId: 'PAY-REACT-456DEF',
      eventId: 'event-2',
      eventTitle: 'React Advanced Workshop',
      eventType: 'workshop',
      amount: 149.00,
      currency: 'USD',
      status: 'successful',
      paymentMethod: 'credit_card',
      lastFourDigits: '1234',
      transactionDate: '2024-01-10T15:45:00Z',
      description: 'Workshop registration - React Advanced techniques',
      receiptUrl: '/receipts/receipt-react-workshop-2024.pdf',
      qrCode: 'PAY-QR-REACT-456DEF',
      registrationId: 'REG-REACT-USER456',
      processingFee: 4.47,
      tax: 11.92,
      subtotal: 132.61,
    },
    {
      id: 'pay-3',
      paymentId: 'PAY-HACK-123GHI',
      eventId: 'event-3',
      eventTitle: 'Global Hackathon 2024',
      eventType: 'hackathon',
      amount: 0.00,
      currency: 'USD',
      status: 'successful',
      paymentMethod: 'credit_card',
      transactionDate: '2024-01-05T12:20:00Z',
      description: 'Free event registration - Global Hackathon 2024',
      receiptUrl: '/receipts/receipt-hackathon-2024.pdf',
      qrCode: 'PAY-QR-HACK-123GHI',
      registrationId: 'REG-HACK-USER123',
      processingFee: 0,
      tax: 0,
      subtotal: 0,
    },
    {
      id: 'pay-4',
      paymentId: 'PAY-QUIZ-789JKL',
      eventId: 'event-4',
      eventTitle: 'JavaScript Quiz Championship',
      eventType: 'quiz',
      amount: 25.00,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'credit_card',
      lastFourDigits: '5678',
      transactionDate: '2024-02-01T09:15:00Z',
      description: 'Quiz championship entry fee - JavaScript Quiz',
      receiptUrl: '/receipts/receipt-js-quiz-2024.pdf',
      qrCode: 'PAY-QR-QUIZ-789JKL',
      registrationId: 'REG-QUIZ-WAIT789',
      processingFee: 0.75,
      tax: 2.00,
      subtotal: 22.25,
    },
    {
      id: 'pay-5',
      paymentId: 'PAY-UX-345MNO',
      eventId: 'event-5',
      eventTitle: 'UX Design Bootcamp',
      eventType: 'workshop',
      amount: 499.00,
      currency: 'USD',
      status: 'successful',
      paymentMethod: 'credit_card',
      lastFourDigits: '9876',
      transactionDate: '2023-11-01T11:30:00Z',
      description: 'Bootcamp registration - UX Design intensive course',
      receiptUrl: '/receipts/receipt-ux-bootcamp-2023.pdf',
      qrCode: 'PAY-QR-UX-345MNO',
      registrationId: 'REG-UX-USER345',
      processingFee: 14.97,
      tax: 39.92,
      subtotal: 444.11,
    },
    {
      id: 'pay-6',
      paymentId: 'PAY-REF-567PQR',
      eventId: 'event-cancelled',
      eventTitle: 'Cancelled Design Conference 2023',
      eventType: 'conference',
      amount: 199.00,
      currency: 'USD',
      status: 'refunded',
      paymentMethod: 'credit_card',
      lastFourDigits: '2468',
      transactionDate: '2023-10-15T14:20:00Z',
      description: 'Conference registration - Design Conference (REFUNDED)',
      receiptUrl: '/receipts/receipt-design-conf-refund.pdf',
      qrCode: 'PAY-QR-REF-567PQR',
      registrationId: 'REG-CANCELLED-567',
      refundAmount: 199.00,
      refundDate: '2023-10-20T10:00:00Z',
      processingFee: 5.97,
      tax: 15.92,
      subtotal: 177.11,
    }
  ];

  const filteredPayments = paymentHistory.filter(payment => {
    const matchesSearch = payment.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'successful' && payment.status === 'successful') ||
                      (activeTab === 'pending' && payment.status === 'pending') ||
                      (activeTab === 'refunded' && payment.status === 'refunded');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful': return 'text-chart-4 bg-chart-4/10 border-chart-4';
      case 'pending': return 'text-orange-500 bg-orange-500/10 border-orange-500';
      case 'failed': return 'text-destructive bg-destructive/10 border-destructive';
      case 'refunded': return 'text-blue-500 bg-blue-500/10 border-blue-500';
      case 'disputed': return 'text-purple-500 bg-purple-500/10 border-purple-500';
      default: return 'text-muted-foreground bg-muted border-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <RefreshCw className="w-4 h-4" />;
      case 'disputed': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return '💳';
      case 'paypal':
        return '🅿️';
      case 'bank_transfer':
        return '🏦';
      default:
        return '💰';
    }
  };

  const generatePaymentQRUrl = (qrCode: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
  };

  const downloadReceipt = (payment: PaymentRecord) => {
    // Simulate receipt download
    toast({
      title: "Receipt Downloaded",
      description: `Receipt for ${payment.eventTitle} has been downloaded.`,
    });
  };

  const downloadQRCode = (payment: PaymentRecord) => {
    const link = document.createElement('a');
    link.href = generatePaymentQRUrl(payment.qrCode);
    link.download = `payment-qr-${payment.paymentId}.png`;
    link.click();
    
    toast({
      title: "QR Code Downloaded",
      description: `Payment QR code has been downloaded.`,
    });
  };

  const sharePayment = (payment: PaymentRecord) => {
    const shareText = `Payment confirmation for ${payment.eventTitle} - Amount: $${payment.amount} - Payment ID: ${payment.paymentId}`;
    navigator.clipboard.writeText(shareText);
    toast({
      title: "Payment Details Shared",
      description: "Payment details copied to clipboard.",
    });
  };

  // Calculate totals
  const totalSpent = paymentHistory.filter(p => p.status === 'successful').reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = paymentHistory.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.refundAmount || 0), 0);
  const pendingAmount = paymentHistory.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Payment <span className="gradient-text">History</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Track all your event payments, download receipts, and manage your billing information
            </p>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-chart-4 mb-1">${totalSpent.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-500 mb-1">${totalRefunded.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total Refunded</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-500 mb-1">${pendingAmount.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card className="glass-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary mb-1">{paymentHistory.length}</div>
                <div className="text-sm text-muted-foreground">Total Transactions</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments by event or payment ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="successful">Successful</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 glass-card">
              <TabsTrigger value="all">All Payments ({paymentHistory.length})</TabsTrigger>
              <TabsTrigger value="successful">
                Successful ({paymentHistory.filter(p => p.status === 'successful').length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({paymentHistory.filter(p => p.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="refunded">
                Refunded ({paymentHistory.filter(p => p.status === 'refunded').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {filteredPayments.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No Payments Found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters.'
                        : 'You haven\'t made any payments yet.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredPayments.map((payment) => (
                    <Card key={payment.id} className="glass-card hover-lift">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Payment Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold">{payment.eventTitle}</h3>
                                  <Badge variant="outline" className="capitalize">
                                    {payment.eventType}
                                  </Badge>
                                  <Badge className={getStatusColor(payment.status)}>
                                    {getStatusIcon(payment.status)}
                                    <span className="ml-1">{payment.status.toUpperCase()}</span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{payment.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">${payment.amount.toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">{payment.currency}</div>
                              </div>
                            </div>

                            {/* Payment Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                <div className="text-lg mb-1">{getPaymentMethodIcon(payment.paymentMethod)}</div>
                                <div className="text-sm text-muted-foreground mb-1">Payment Method</div>
                                <div className="font-medium capitalize text-xs">
                                  {payment.paymentMethod.replace('_', ' ')}
                                  {payment.lastFourDigits && ` •••• ${payment.lastFourDigits}`}
                                </div>
                              </div>
                              
                              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                <div className="text-lg mb-1">📅</div>
                                <div className="text-sm text-muted-foreground mb-1">Date</div>
                                <div className="font-medium text-xs">
                                  {new Date(payment.transactionDate).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                <div className="text-lg mb-1">🆔</div>
                                <div className="text-sm text-muted-foreground mb-1">Payment ID</div>
                                <div className="font-mono text-xs">{payment.paymentId}</div>
                              </div>
                              
                              <div className="text-center p-3 bg-secondary/30 rounded-lg">
                                <div className="text-lg mb-1">🎫</div>
                                <div className="text-sm text-muted-foreground mb-1">Registration</div>
                                <div className="font-mono text-xs">{payment.registrationId}</div>
                              </div>
                            </div>

                            {/* Payment Breakdown */}
                            {payment.amount > 0 && (
                              <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                                <h4 className="font-medium mb-3">Payment Breakdown</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${payment.subtotal.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>${payment.tax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Processing Fee:</span>
                                    <span>${payment.processingFee.toFixed(2)}</span>
                                  </div>
                                  <div className="border-t pt-2 font-medium flex justify-between">
                                    <span>Total:</span>
                                    <span>${payment.amount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Refund Info */}
                            {payment.status === 'refunded' && payment.refundAmount && (
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 text-blue-600 mb-2">
                                  <RefreshCw className="w-4 h-4" />
                                  <span className="font-medium">Refund Information</span>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Refund Amount:</span>
                                    <span className="font-medium">${payment.refundAmount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Refund Date:</span>
                                    <span>{payment.refundDate && new Date(payment.refundDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadReceipt(payment)}
                              >
                                <Receipt className="w-4 h-4 mr-2" />
                                Receipt
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadQRCode(payment)}
                              >
                                <QrCode className="w-4 h-4 mr-2" />
                                QR Code
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => sharePayment(payment)}
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>

                          {/* QR Code Preview */}
                          <div className="lg:w-48 flex flex-col items-center gap-3">
                            <div className="text-sm font-medium text-center">Payment QR Code</div>
                            <img
                              src={generatePaymentQRUrl(payment.qrCode)}
                              alt={`QR Code for payment ${payment.paymentId}`}
                              className="w-32 h-32 border rounded-lg"
                            />
                            <div className="text-xs text-center text-muted-foreground">
                              Scan for payment verification
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}