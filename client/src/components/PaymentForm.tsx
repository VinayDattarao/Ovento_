import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  IndianRupee,
  Calendar,
  User,
  MapPin,
  Check,
  X,
  AlertCircle
} from "lucide-react";

const paymentSchema = z.object({
  email: z.string().email("Invalid email address"),
  cardNumber: z.string().min(1, "Card number required").transform(val => val.replace(/\s/g, '')),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Month must be 01-12"),
  expiryYear: z.string().regex(/^\d{2}$/, "Year must be 2 digits").refine(val => parseInt(val) >= new Date().getFullYear() % 100, "Card has expired"),
  cvc: z.string().min(1, "CVC required"),
  cardholderName: z.string().min(2, "Cardholder name required").max(50, "Name too long"),
  billingAddress: z.string().min(10, "Please enter complete address").max(200, "Address too long"),
  city: z.string().min(2, "City required").max(50, "City name too long"),
  zipCode: z.string().min(1, "ZIP code required"),
  saveCard: z.boolean().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  eventId: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  initialAmount?: number;
  eventId?: string;
  eventTitle?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PaymentForm({ 
  initialAmount = 99, 
  eventId,
  eventTitle = "Event Registration",
  onSuccess,
  onCancel 
}: PaymentFormProps) {
  const [step, setStep] = useState<'payment' | 'processing' | 'success' | 'error'>('payment');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      email: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: "",
      cardholderName: "",
      billingAddress: "",
      city: "",
      zipCode: "",
      saveCard: false,
      amount: initialAmount,
      eventId: eventId,
    },
  });

  // Create payment intent
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        amount,
        eventId 
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message,
        variant: "destructive",
      });
      setStep('error');
    },
  });

  // Process payment
  const processPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      setStep('processing');
      
      // First create payment intent if not already created
      if (!clientSecret) {
        const intentResponse = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: data.amount,
          eventId: data.eventId 
        });
        const { clientSecret: newClientSecret } = await intentResponse.json();
        setClientSecret(newClientSecret);
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real implementation, this would use Stripe's confirmPayment
      return { success: true };
    },
    onSuccess: () => {
      setStep('success');
      // Don't call onSuccess immediately - stay on success page
    },
    onError: (error: Error) => {
      setStep('error');
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    processPaymentMutation.mutate(data);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const limitedV = v.substring(0, 16); // Limit to max 16 digits
    const parts = [];
    for (let i = 0, len = limitedV.length; i < len; i += 4) {
      parts.push(limitedV.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return limitedV;
    }
  };

  const getCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const cardType = getCardType(form.watch('cardNumber') || '');

  if (step === 'processing') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
          <p className="text-muted-foreground">Please wait while we process your payment securely...</p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-chart-4/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-chart-4" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-chart-4">Payment Successful!</h3>
          <p className="text-muted-foreground mb-4">
            Thank you for your payment. You are now registered for this event!
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <div className="text-sm space-y-1">
              <p><strong>Amount Paid:</strong> ₹{initialAmount}</p>
              <p><strong>Event:</strong> {eventTitle}</p>
              <p><strong>Registration ID:</strong> REG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              <p><strong>QR Code:</strong> QR-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mb-6">
            A confirmation email with your QR code has been sent to your email address.
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              asChild
              className="flex-1"
            >
              <Link href="/events">
                View All Events
              </Link>
            </Button>
            <Button 
              asChild
              className="flex-1"
            >
              <Link href="/event-history">
                View My Events
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'error') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-500">Payment Failed</h3>
          <p className="text-muted-foreground mb-4">
            There was an error processing your payment. Please try again.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('payment')} className="flex-1">
              Try Again
            </Button>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="john@example.com" 
                          {...field}
                          data-testid="input-payment-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="1234 5678 9012 3456"
                            {...field}
                            onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                            maxLength={19}
                            data-testid="input-card-number"
                          />
                          <div className="absolute right-3 top-3 flex space-x-1">
                            {cardType === 'visa' && (
                              <Badge variant="outline" className="text-blue-600">VISA</Badge>
                            )}
                            {cardType === 'mastercard' && (
                              <Badge variant="outline" className="text-red-600">MC</Badge>
                            )}
                            {cardType === 'amex' && (
                              <Badge variant="outline" className="text-green-600">AMEX</Badge>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-expiry-month">
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                {String(i + 1).padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiryYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-expiry-year">
                              <SelectValue placeholder="YY" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = (new Date().getFullYear() + i).toString().slice(-2);
                              return (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVC</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123" 
                            maxLength={3}
                            {...field}
                            data-testid="input-cvc"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="cardholderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field}
                          data-testid="input-cardholder-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Main Street" 
                          {...field}
                          data-testid="input-billing-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="New York" 
                            {...field}
                            data-testid="input-city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="10001" 
                            maxLength={5}
                            {...field}
                            data-testid="input-zip-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="saveCard"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-save-card"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Save card for future payments
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  {onCancel && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onCancel}
                      className="flex-1"
                      data-testid="button-cancel-payment"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={processPaymentMutation.isPending}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-submit-payment"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Pay ₹{initialAmount}
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="h-4 w-4" />
                    Secured by 256-bit SSL encryption
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{eventTitle}</span>
                <span className="text-2xl font-bold text-primary">₹{initialAmount}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Includes: Workshop access, materials, and certificate
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{initialAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing Fee</span>
                <span>₹0.00</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{initialAmount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">What's Included:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-chart-4 flex-shrink-0" />
                  Full event access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-chart-4 flex-shrink-0" />
                  Workshop materials
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-chart-4 flex-shrink-0" />
                  Certificate of completion
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-chart-4 flex-shrink-0" />
                  Networking opportunities
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-chart-4 flex-shrink-0" />
                  Lifetime access to recordings
                </li>
              </ul>
            </div>

            <div className="p-4 bg-chart-4/10 border border-chart-4/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-chart-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-chart-4 mb-1">Refund Policy</p>
                  <p className="text-muted-foreground">
                    Full refund available up to 24 hours before the event starts.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
