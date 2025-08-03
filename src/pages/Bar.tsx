import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Wine, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  table_number: number;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    menu_item: {
      name: string;
      category: string;
    };
  }[];
}

const Bar = () => {
  const { signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDrinks: 0,
    pendingOrders: 0,
    preparingOrders: 0,
  });

  useEffect(() => {
    fetchOrders();
    setupRealtimeSubscription();
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
            menu_item:menu_items (
              name,
              category
            )
          )
        `)
        .in('status', ['pending', 'preparing', 'ready'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Filter for drink orders only
      const drinkOrders = data?.map(order => ({
        ...order,
        order_items: order.order_items.filter(item => 
          item.menu_item.category === 'drinks'
        )
      })).filter(order => order.order_items.length > 0) || [];

      setOrders(drinkOrders);
      
      // Calculate stats
      const pending = drinkOrders.filter(o => o.status === 'pending').length;
      const preparing = drinkOrders.filter(o => o.status === 'preparing').length;
      const totalDrinks = drinkOrders.reduce((sum, order) => 
        sum + order.order_items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );

      setStats({
        totalDrinks,
        pendingOrders: pending,
        preparingOrders: preparing,
      });
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

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('bar-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'preparing' | 'ready' | 'completed') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order updated",
        description: `Order status changed to ${newStatus}`,
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const orderTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 min ago';
    return `${diffInMinutes} mins ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading bar orders...</h2>
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wine className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Bar Dashboard</h1>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="elegant-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
          
          <Card className="elegant-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preparing</CardTitle>
              <Wine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.preparingOrders}</div>
            </CardContent>
          </Card>

          <Card className="elegant-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Drinks Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDrinks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending ({orders.filter(o => o.status === 'pending').length})</TabsTrigger>
            <TabsTrigger value="preparing">Preparing ({orders.filter(o => o.status === 'preparing').length})</TabsTrigger>
            <TabsTrigger value="ready">Ready ({orders.filter(o => o.status === 'ready').length})</TabsTrigger>
          </TabsList>

          {['pending', 'preparing', 'ready'].map(status => (
            <TabsContent key={status} value={status}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.filter(order => order.status === status).map(order => (
                  <Card key={order.id} className="elegant-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Table {order.table_number}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id.slice(0, 8)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {order.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getTimeAgo(order.created_at)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {order.order_items.map(item => (
                          <div key={item.id} className="flex justify-between items-center">
                            <span className="text-sm">{item.menu_item.name}</span>
                            <Badge variant="outline">x{item.quantity}</Badge>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="flex-1"
                            size="sm"
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="flex-1"
                            size="sm"
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="flex-1"
                            size="sm"
                            variant="outline"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {orders.filter(order => order.status === status).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No {status} orders</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Bar;