import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, DollarSign, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  table_number: number | null;
  status: string;
  total_amount: number;
  created_at: string;
  customer_notes: string | null;
  estimated_ready_time: string | null;
  actual_ready_time: string | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    menu_item_id: string;
    menu_items: {
      name: string;
      prep_time_minutes: number;
    };
  }[];
}

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            menu_item_id,
            menu_items (
              name,
              prep_time_minutes
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order status:', { orderId, newStatus });
      
      const updateData: any = { status: newStatus };
      
      // Set actual ready time when marking as ready or completed
      if (newStatus === 'ready' || newStatus === 'completed') {
        updateData.actual_ready_time = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Update successful:', data);
      
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: `Failed to update order status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getEstimatedTime = (order: Order) => {
    if (!order.estimated_ready_time) return 'Not set';
    const readyTime = new Date(order.estimated_ready_time);
    const now = new Date();
    const diffMs = readyTime.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return "Ready now!";
    return `${diffMins} minutes`;
  };

  const isOrderLate = (order: Order) => {
    if (!order.estimated_ready_time || order.status === 'completed') return false;
    return new Date() > new Date(order.estimated_ready_time);
  };

  const getTotalPrepTime = (order: Order) => {
    return Math.max(...order.order_items.map(item => item.menu_items.prep_time_minutes || 15));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <div className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders}>Refresh</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className={`${isOrderLate(order) ? 'border-red-500 bg-red-50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Order #{order.id.slice(0, 8)}
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    {isOrderLate(order) && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                    {order.table_number && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Table {order.table_number}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${order.total_amount}
                    </span>
                    <span>Prep: {getTotalPrepTime(order)} min</span>
                  </div>
                  {order.estimated_ready_time && (
                    <div className={`text-xs ${isOrderLate(order) ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                      Est: {getEstimatedTime(order)}
                    </div>
                  )}
                  {order.actual_ready_time && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Completed: {new Date(order.actual_ready_time).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <Select
                  value={order.status}
                  onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium">Items:</h4>
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.menu_items.name}</span>
                    <span>${(item.quantity * item.unit_price).toFixed(2)}</span>
                  </div>
                ))}
                {order.customer_notes && (
                  <div className="mt-4 p-2 bg-muted rounded text-sm">
                    <strong>Notes:</strong> {order.customer_notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};