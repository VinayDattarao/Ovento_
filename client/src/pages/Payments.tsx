import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PaymentForm from "@/components/PaymentForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  CreditCard, 
  IndianRupee, 
  TrendingUp, 
  Users, 
  Download,
  Plus,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { formatCurrencyINR } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'registration' | 'sponsorship' | 'subscription';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  eventTitle?: string;
}

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  registrationFees: number;
  sponsorships: number;
  premiumFeatures: number;
}

interface Sponsor {
  id: string;
  name: string;
  tier: 'platinum' | 'gold' | 'silver';
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  logo?: string;
}

export default function Payments() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data - in production this would come from API
  const mockRevenueData: RevenueData = {
    totalRevenue: 248000,
    monthlyRevenue: 89000,
    registrationFees: 168000,
    sponsorships: 72000,
    premiumFeatures: 8000,
  };

  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "registration",
      description: "AI Hackathon Registration",
      amount: 99,
      status: "completed",
      date: "2024-12-10T10:30:00Z",
      eventTitle: "AI Innovation Hackathon 2024"
    },
    {
      id: "2",
      type: "sponsorship",
      description: "Google Platinum Sponsorship",
      amount: 50000,
      status: "completed",
      date: "2024-12-09T14:20:00Z"
    },
    {
      id: "3",
      type: "registration",
      description: "React Workshop Registration",
      amount: 149,
      status: "pending",
      date: "2024-12-08T16:45:00Z",
      eventTitle: "React Masterclass"
    }
  ];

  const mockSponsors: Sponsor[] = [
    {
      id: "1",
      name: "Google",
      tier: "platinum",
      amount: 50000,
      status: "paid"
    },
    {
      id: "2",
      name: "Microsoft",
      tier: "gold",
      amount: 30000,
      status: "paid"
    },
    {
      id: "3",
      name: "Amazon",
      tier: "silver",
      amount: 15000,
      status: "pending"
    }
  ];


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-chart-4/20 text-chart-4';
      case 'pending':
        return 'bg-chart-5/20 text-chart-5';
      case 'failed':
      case 'overdue':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
      case 'overdue':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'gold':
        return 'bg-chart-5/20 text-chart-5 border-chart-5/30';
      case 'silver':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully!",
    });
    queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Secure <span className="gradient-text">Payments</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Integrated payment processing, sponsorship management, and financial analytics
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Sponsors
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <IndianRupee className="h-8 w-8 text-primary" />
                    <Badge variant="secondary" className="text-chart-4">+18.9%</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {formatCurrencyINR(mockRevenueData.totalRevenue)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="h-8 w-8 text-accent" />
                    <Badge variant="secondary" className="text-chart-4">+12.3%</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {formatCurrencyINR(mockRevenueData.monthlyRevenue)}
                  </div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="h-8 w-8 text-chart-3" />
                    <Badge variant="secondary" className="text-chart-4">+8.7%</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {formatCurrencyINR(mockRevenueData.registrationFees)}
                  </div>
                  <p className="text-sm text-muted-foreground">Registration Fees</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Building className="h-8 w-8 text-chart-4" />
                    <Badge variant="secondary" className="text-chart-4">+24.1%</Badge>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {formatCurrencyINR(mockRevenueData.sponsorships)}
                  </div>
                  <p className="text-sm text-muted-foreground">Sponsorships</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Registration Fees</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="font-medium text-sm">68%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sponsorships</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: '29%' }}></div>
                      </div>
                      <span className="font-medium text-sm">29%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Premium Features</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-chart-3 h-2 rounded-full" style={{ width: '3%' }}></div>
                      </div>
                      <span className="font-medium text-sm">3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
                    <DialogTrigger asChild>
                      <Button className="h-20 flex flex-col gap-2">
                        <CreditCard className="h-6 w-6" />
                        Process Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Process Payment</DialogTitle>
                      </DialogHeader>
                      <PaymentForm 
                        onSuccess={handlePaymentSuccess}
                        onCancel={() => setShowPaymentForm(false)}
                      />
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Building className="h-6 w-6" />
                    Add Sponsor
                  </Button>

                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Download className="h-6 w-6" />
                    Export Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          {transaction.type === 'registration' ? (
                            <Users className="h-5 w-5 text-primary" />
                          ) : transaction.type === 'sponsorship' ? (
                            <Building className="h-5 w-5 text-accent" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-chart-3" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)}
                          </p>
                          {transaction.eventTitle && (
                            <p className="text-xs text-muted-foreground">
                              Event: {transaction.eventTitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-chart-4">
                            +{formatCurrencyINR(transaction.amount)}
                          </div>
                          <Badge className={getStatusColor(transaction.status)}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 capitalize">{transaction.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsors" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Sponsor Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Sponsor
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSponsors.map((sponsor) => (
                <Card key={sponsor.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {sponsor.name[0]}
                        </span>
                      </div>
                      <Badge className={getTierColor(sponsor.tier)}>
                        {sponsor.tier.charAt(0).toUpperCase() + sponsor.tier.slice(1)}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{sponsor.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-chart-4 text-xl">
                          {formatCurrencyINR(sponsor.amount)}
                        </div>
                        <Badge className={getStatusColor(sponsor.status)}>
                          {getStatusIcon(sponsor.status)}
                          <span className="ml-1 capitalize">{sponsor.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Payment Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-primary mb-4 mx-auto" />
                    <h3 className="text-xl font-semibold mb-2">Payment Analytics</h3>
                    <p className="text-muted-foreground">
                      Comprehensive payment analytics dashboard coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
