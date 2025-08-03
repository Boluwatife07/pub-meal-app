import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Star, TrendingUp, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FeedbackData {
  id: string;
  rating: number;
  feedback_text: string;
  created_at: string;
  order: {
    id: string;
    table_number: number | null;
    total_amount: number;
  };
}

interface Analytics {
  totalOrders: number;
  averageRating: number;
  totalRevenue: number;
  popularItems: Array<{
    name: string;
    count: number;
  }>;
}

const CustomerInsights = () => {
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('order_feedback')
        .select(`
          *,
          order:orders (
            id,
            table_number,
            total_amount
          )
        `)
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;
      setFeedback(feedbackData || []);

      // Fetch analytics
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          order_items (
            quantity,
            menu_item:menu_items (
              name
            )
          )
        `);

      if (ordersError) throw ordersError;

      // Calculate analytics
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const averageRating = feedbackData?.length > 0 
        ? feedbackData.reduce((sum, fb) => sum + fb.rating, 0) / feedbackData.length 
        : 0;

      // Calculate popular items
      const itemCounts: { [key: string]: number } = {};
      ordersData?.forEach(order => {
        order.order_items.forEach(item => {
          const itemName = item.menu_item.name;
          itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
        });
      });

      const popularItems = Object.entries(itemCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setAnalytics({
        totalOrders,
        averageRating,
        totalRevenue,
        popularItems
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load customer insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading customer insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Customer Insights</h2>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
                    <div className="flex">
                      {getRatingStars(Math.round(analytics.averageRating))}
                    </div>
                  </div>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Feedback Count</p>
                  <p className="text-2xl font-bold">{feedback.length}</p>
                </div>
                <Heart className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">Customer Feedback</TabsTrigger>
          <TabsTrigger value="popular">Popular Items</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Recent Customer Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedback.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No feedback received yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((fb) => (
                    <div key={fb.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {getRatingStars(fb.rating)}
                            </div>
                            <Badge variant="outline">
                              Order #{fb.order.id.slice(0, 8)}
                            </Badge>
                            {fb.order.table_number && (
                              <Badge variant="secondary">
                                Table {fb.order.table_number}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(fb.created_at).toLocaleDateString()} • 
                            ${fb.order.total_amount.toFixed(2)} order
                          </p>
                        </div>
                      </div>
                      {fb.feedback_text && (
                        <p className="text-sm">{fb.feedback_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Most Popular Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics?.popularItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No order data available yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics?.popularItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <Badge variant="outline">
                        {item.count} orders
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerInsights;