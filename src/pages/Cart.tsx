import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, ArrowLeft, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getMenuItemImage } from '@/utils/menuImages';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, tableNumber, updateCartQuantity, getTotalAmount, clearCart } = useCart();


  const submitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      const totalAmount = getTotalAmount();
      
      // Calculate estimated ready time based on prep times
      const maxPrepTime = Math.max(...cart.map(item => item.menuItem.prep_time_minutes || 15));
      const estimatedReadyTime = new Date();
      estimatedReadyTime.setMinutes(estimatedReadyTime.getMinutes() + maxPrepTime + 5); // Add 5min buffer

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_number: tableNumber ? parseInt(tableNumber) : null,
          total_amount: totalAmount,
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
        title: "Order submitted",
        description: `Order #${orderData.id.slice(0, 8)} submitted successfully!`,
      });

      clearCart();
      navigate(`/order/${orderData.id}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error",
        description: "Failed to submit order",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream to-light-grey">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/menu')}
              className="elegant-card border-elegant-gold/50 hover:bg-elegant-gold/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
            <div className="slide-in">
              <h1 className="text-3xl font-bold gradient-text">Your Cart</h1>
              <p className="text-muted-foreground mt-1">
                {cart.length > 0 
                  ? `${cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart` 
                  : 'Your cart is empty'
                }
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Your cart is empty</h2>
              <p className="text-muted-foreground">Add some delicious items from our menu</p>
            </div>
            <Button 
              onClick={() => navigate('/menu')}
              className="elegant-button"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
              {cart.map(item => {
                const itemImage = getMenuItemImage(item.menuItem.name);
                return (
                  <Card key={item.menuItem.id} className="elegant-card slide-in">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          {itemImage ? (
                            <img 
                              src={itemImage} 
                              alt={item.menuItem.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold">{item.menuItem.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.menuItem.description}</p>
                            {item.notes && (
                              <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-2 mt-1">
                                Note: {item.notes}
                              </p>
                            )}
                            <p className="text-sm font-medium">${item.menuItem.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg gradient-text">
                                ${(item.menuItem.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="elegant-card sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${getTotalAmount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (included)</span>
                      <span>$0.00</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="gradient-text">${getTotalAmount().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {tableNumber && (
                    <div className="p-3 bg-elegant-gold/10 rounded-lg border border-elegant-gold/20">
                      <p className="text-sm font-medium">Table Number: {tableNumber}</p>
                    </div>
                  )}

                  <Button 
                    onClick={() => navigate('/payment')} 
                    className="w-full elegant-button"
                    size="lg"
                    // disabled={!tableNumber}
                  >
                    Proceed to Payment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;