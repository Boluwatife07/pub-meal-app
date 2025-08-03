import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, TrendingUp, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { MenuManagement } from '@/components/admin/MenuManagement';
import { OrderManagement } from '@/components/admin/OrderManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { QRCodeManagement } from '@/components/admin/QRCodeManagement';
import CustomerInsights from '@/components/admin/CustomerInsights';

const Admin = () => {
  const { signOut } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingCalls: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get orders stats
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', new Date().toISOString().split('T')[0]);

      // Get waiter calls
      const { data: calls } = await supabase
        .from('waiter_calls')
        .select('*')
        .eq('is_resolved', false);

      // Get low stock items
      const { data: lowStock } = await supabase
        .from('menu_items')
        .select('*')
        .lt('stock_quantity', 10);

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue: orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        pendingCalls: calls?.length || 0,
        lowStockItems: lowStock?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading admin dashboard...</h2>
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
              <Settings className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="elegant-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          
          <Card className="elegant-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="elegant-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waiter Calls</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingCalls}</div>
            </CardContent>
          </Card>

          <Card className="elegant-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Features Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="qr">QR Codes</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to the admin dashboard. Use the tabs above to manage your restaurant.
              </p>
              <Button onClick={fetchStats}>Refresh Stats</Button>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <MenuManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="qr" className="space-y-6">
            <QRCodeManagement />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <CustomerInsights />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;