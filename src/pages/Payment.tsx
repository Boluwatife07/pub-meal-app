import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, Smartphone, Banknote, QrCode } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Payment = () => {
  const navigate = useNavigate();
  const { cart, getTotalAmount, tableNumber, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);

  const totalAmount = getTotalAmount();
  const tax = totalAmount * 0.1;
  const finalTotal = totalAmount + tax;

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // After successful payment, create the actual order
      const totalAmount = getTotalAmount();
      
      // Calculate estimated ready time based on prep times
      const maxPrepTime = Math.max(...cart.map(item => item.menuItem.prep_time_minutes || 15));
      const estimatedReadyTime = new Date();
      estimatedReadyTime.setMinutes(estimatedReadyTime.getMinutes() + maxPrepTime + 5);

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_number: tableNumber ? parseInt(tableNumber) : null,
          total_amount: finalTotal,
          status: 'pending',
          estimated_ready_time: estimatedReadyTime.toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price,
        subtotal: item.menuItem.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Payment Successful!",
        description: "Your order has been placed and will be prepared shortly.",
      });
      
      clearCart();
      setProcessing(false);
      navigate(`/order/${orderData.id}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove non-digits and add spaces every 4 digits
    const digits = value.replace(/\D/g, '');
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    // Format as MM/YY
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/cart')}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Payment</h1>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Table {tableNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.menuItem.name}</span>
                  <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you'd like to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="card" id="card" />
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="card" className="flex-1">Credit / Debit Card</Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="digital" id="digital" />
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="digital" className="flex-1">Digital Wallet (Apple Pay, Google Pay)</Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="qr" id="qr" />
                  <QrCode className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="qr" className="flex-1">QR Code Payment</Label>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="cash" id="cash" />
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="cash" className="flex-1">Pay at Table (Cash/Card)</Label>
                </div>
              </RadioGroup>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Digital Wallet */}
              {paymentMethod === 'digital' && (
                <div className="mt-6 space-y-4">
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Click "Pay Now" to use your device's digital wallet</p>
                  </div>
                </div>
              )}

              {/* QR Code Payment */}
              {paymentMethod === 'qr' && (
                <div className="mt-6 space-y-4">
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">A QR code will be generated after clicking "Pay Now"</p>
                  </div>
                </div>
              )}

              {/* Cash Payment */}
              {paymentMethod === 'cash' && (
                <div className="mt-6 space-y-4">
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Banknote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Your order will be sent to the kitchen. Pay when the waiter brings your bill.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pay Button */}
          <Button 
            onClick={handlePayment} 
            className="w-full h-12 text-lg"
            disabled={processing || cart.length === 0}
          >
            {processing ? (
              "Processing..."
            ) : (
              `Pay $${finalTotal.toFixed(2)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Payment;