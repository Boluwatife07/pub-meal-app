import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';

interface Order {
  id: string;
  table_number: number | null;
  status: string;
  total_amount: number;
  created_at: string;
  estimated_ready_time: string | null;
  order_items: Array<{
    quantity: number;
    unit_price: number;
    menu_item: {
      name: string;
      description: string;
    };
  }>;
}

const OrderTracking = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ rating: 0, text: '' });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      // Set up real-time subscription for order updates
      const subscription = supabase
        .channel('order-updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        }, handleOrderUpdate)
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      console.log('Fetching order with ID:', orderId);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            menu_item:menu_items (
              name,
              description
            )
          )
        `)
        .eq('id', orderId)
        .single();

      console.log('Order data received:', data);
      console.log('Error if any:', error);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (data) {
        setOrder(data);
        console.log('Order set successfully');
      } else {
        console.log('No order data received');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleOrderUpdate = (payload: any) => {
    if (payload.new) {
      setOrder(prev => prev ? { ...prev, ...payload.new } : null);
      
      // Show notification for status changes
      if (payload.new.status !== payload.old.status) {
        toast({
          title: "Order Status Updated",
          description: `Your order is now ${payload.new.status}`,
        });
      }
    }
  };

  const submitFeedback = async () => {
    if (!order || feedback.rating === 0) return;

    try {
      const { error } = await supabase
        .from('order_feedback')
        .insert({
          order_id: order.id,
          rating: feedback.rating,
          feedback_text: feedback.text || null
        });

      if (error) throw error;

      setFeedbackSubmitted(true);
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstimatedTime = () => {
    if (!order?.estimated_ready_time) return null;
    const readyTime = new Date(order.estimated_ready_time);
    const now = new Date();
    const diffMs = readyTime.getTime() - now.getTime();
    const diffMins = Math.max(0, Math.round(diffMs / (1000 * 60)));
    
    if (diffMins === 0) return "Ready now!";
    return `${diffMins} minutes remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-cream">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-3 border-primary border-t-transparent rounded-full mx-auto"></div>
          <h2 className="text-xl font-semibold gradient-text">Loading order details...</h2>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-cream">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Order not found</h2>
          <Button onClick={() => navigate('/menu')} className="elegant-button">
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold gradient-text">Order Tracking</h1>
              <p className="text-muted-foreground mt-1">Order #{order.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Status */}
          <Card className="elegant-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Status</span>
                <Badge className={`${getStatusColor(order.status)} border`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.table_number && (
                <div>
                  <span className="font-medium">Table Number: </span>
                  <span>{order.table_number}</span>
                </div>
              )}
              <div>
                <span className="font-medium">Order Time: </span>
                <span>{new Date(order.created_at).toLocaleTimeString()}</span>
              </div>
              {getEstimatedTime() && (
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                  <Clock className="h-5 w-5" />
                  {getEstimatedTime()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="elegant-card">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.menu_item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.menu_item.description}</p>
                    <p className="text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.unit_price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="gradient-text">${order.total_amount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Section */}
          {order.status === 'completed' && (
            <Card className="elegant-card">
              <CardHeader>
                <CardTitle>Rate Your Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!feedbackSubmitted ? (
                  <>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          variant="ghost"
                          size="sm"
                          onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                          className="p-2"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= feedback.rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        </Button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Tell us about your experience (optional)"
                      value={feedback.text}
                      onChange={(e) => setFeedback(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={3}
                    />
                    <Button 
                      onClick={submitFeedback}
                      disabled={feedback.rating === 0}
                      className="w-full elegant-button"
                    >
                      Submit Feedback
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-lg font-semibold text-green-600">Thank you for your feedback!</p>
                    <p className="text-muted-foreground">We appreciate your input.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderTracking;