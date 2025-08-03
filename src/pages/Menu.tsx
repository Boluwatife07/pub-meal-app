import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Plus, Minus, Bell, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getMenuItemImage } from '@/utils/menuImages';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
  stock_quantity: number;
  dietary_info: any;
  prep_time_minutes: number;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

const Menu = () => {
  const navigate = useNavigate();
  const { cart, tableNumber, setTableNumber, addToCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [dietaryFilter, setDietaryFilter] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [customerSessionId] = useState(() => 
    localStorage.getItem('customerSessionId') || 
    (() => {
      const id = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('customerSessionId', id);
      return id;
    })()
  );

  // Check for table number in URL params (from QR code scan)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    if (tableParam) {
      setTableNumber(tableParam);
      // Show a toast to confirm table number was set
      toast({
        title: "Table Number Set",
        description: `Welcome to Table ${tableParam}! Your orders will be automatically associated with this table.`,
      });
    }
  }, [setTableNumber]);

  useEffect(() => {
    fetchMenuItems();
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_favorites')
        .select('menu_item_id')
        .eq('customer_session_id', customerSessionId);

      if (error) throw error;
      setFavorites(new Set(data.map(fav => fav.menu_item_id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .gt('stock_quantity', 0) // Only show items with stock
        .order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openItemDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setNotes('');
    setIsDialogOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    // Check stock availability
    if (selectedItem.stock_quantity < quantity) {
      toast({
        title: "Insufficient stock",
        description: `Only ${selectedItem.stock_quantity} items available`,
        variant: "destructive",
      });
      return;
    }

    addToCart(selectedItem, quantity, notes.trim() || undefined);

    toast({
      title: "Added to cart",
      description: `${selectedItem.name} x${quantity} added to cart`,
    });

    setIsDialogOpen(false);
  };

  const toggleFavorite = async (menuItemId: string) => {
    try {
      if (favorites.has(menuItemId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('customer_favorites')
          .delete()
          .eq('customer_session_id', customerSessionId)
          .eq('menu_item_id', menuItemId);

        if (error) throw error;
        
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(menuItemId);
          return newFavorites;
        });

        toast({
          title: "Removed from favorites",
          description: "Item removed from your favorites",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('customer_favorites')
          .insert({
            customer_session_id: customerSessionId,
            menu_item_id: menuItemId
          });

        if (error) throw error;
        
        setFavorites(prev => new Set([...prev, menuItemId]));

        toast({
          title: "Added to favorites",
          description: "Item added to your favorites",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const callWaiter = async () => {
    try {
      const { error } = await supabase
        .from('waiter_calls')
        .insert({
          table_number: tableNumber ? parseInt(tableNumber) : null,
          message: 'Silent call for assistance'
        });

      if (error) throw error;

      // Notify admin
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            type: 'waiter_call',
            tableNumber: tableNumber ? parseInt(tableNumber) : null,
            message: 'Silent call for assistance'
          }
        });
      } catch (notifyError) {
        console.error('Error notifying admin:', notifyError);
        // Don't fail the waiter call if notification fails
      }

      toast({
        title: "Waiter called",
        description: "A waiter will be with you shortly",
      });
    } catch (error) {
      console.error('Error calling waiter:', error);
      toast({
        title: "Error",
        description: "Failed to call waiter",
        variant: "destructive",
      });
    }
  };

  const filterItemsByCategory = (category: string) => {
    let filtered = menuItems.filter(item => item.category === category);
    
    if (dietaryFilter === 'favorites') {
      filtered = filtered.filter(item => favorites.has(item.id));
    } else if (dietaryFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.dietary_info && 
        item.dietary_info[dietaryFilter] === true
      );
    }
    
    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-cream">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-3 border-primary border-t-transparent rounded-full mx-auto"></div>
          <h2 className="text-xl font-semibold gradient-text">Loading our delicious menu...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cream to-light-grey">
      {/* Enhanced Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border/50 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="slide-in">
              <h1 className="text-3xl font-bold gradient-text">Restaurant Menu</h1>
              <p className="text-muted-foreground mt-1">Fine dining experience</p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <Button 
                variant="outline" 
                onClick={callWaiter}
                className="elegant-card border-elegant-gold/50 hover:bg-elegant-gold/10 hidden sm:flex"
                size="sm"
              >
                <Bell className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Call Waiter</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={callWaiter}
                className="elegant-card border-elegant-gold/50 hover:bg-elegant-gold/10 sm:hidden"
                size="sm"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => navigate('/cart')}
                className="elegant-button relative flex-shrink-0"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Cart</span>
                <span className="sm:hidden">({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span className="hidden sm:inline"> ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-elegant-gold text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          {/* Dietary Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={dietaryFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDietaryFilter('all')}
              className="text-xs"
            >
              All Items
            </Button>
            <Button
              variant={dietaryFilter === 'favorites' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDietaryFilter('favorites')}
              className="text-xs"
            >
              ❤️ Favorites
            </Button>
            <Button
              variant={dietaryFilter === 'vegetarian' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDietaryFilter('vegetarian')}
              className="text-xs"
            >
              🌱 Vegetarian
            </Button>
            <Button
              variant={dietaryFilter === 'vegan' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDietaryFilter('vegan')}
              className="text-xs"
            >
              🌿 Vegan
            </Button>
            <Button
              variant={dietaryFilter === 'gluten_free' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDietaryFilter('gluten_free')}
              className="text-xs"
            >
              🌾 Gluten-Free
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="breakfast" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-1">
            <TabsTrigger 
              value="breakfast" 
              className="data-[state=active]:bg-elegant-gold/20 data-[state=active]:text-charcoal transition-all duration-300"
            >
              Breakfast
            </TabsTrigger>
            <TabsTrigger 
              value="lunch" 
              className="data-[state=active]:bg-elegant-gold/20 data-[state=active]:text-charcoal transition-all duration-300"
            >
              Lunch
            </TabsTrigger>
            <TabsTrigger 
              value="dessert" 
              className="data-[state=active]:bg-elegant-gold/20 data-[state=active]:text-charcoal transition-all duration-300"
            >
              Desserts
            </TabsTrigger>
            <TabsTrigger 
              value="drinks" 
              className="data-[state=active]:bg-elegant-gold/20 data-[state=active]:text-charcoal transition-all duration-300"
            >
              Drinks
            </TabsTrigger>
          </TabsList>

          {['breakfast', 'lunch', 'dessert', 'drinks'].map((category) => (
            <TabsContent key={category} value={category} className="fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filterItemsByCategory(category).map((item, index) => {
                  const itemImage = getMenuItemImage(item.name);
                  return (
                    <Card 
                      key={item.id} 
                      className={`food-card cursor-pointer stagger-animation stagger-${(index % 6) + 1}`}
                      onClick={() => openItemDialog(item)}
                    >
                      <div className="relative">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={item.name}
                            className="food-image"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                            <span className="text-muted-foreground">No image</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id);
                            }}
                            className="p-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full"
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                favorites.has(item.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-gray-600'
                              }`} 
                            />
                          </Button>
                        </div>
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Badge 
                            variant={item.is_available ? "default" : "secondary"}
                            className={item.is_available ? "bg-elegant-gold text-primary" : ""}
                          >
                            {item.category}
                          </Badge>
                          {item.stock_quantity <= 5 && item.stock_quantity > 0 && (
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                        {!item.is_available && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive" className="text-sm">
                              Unavailable
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-3">
                        <div className="space-y-2">
                          <CardTitle className="text-lg font-semibold leading-tight">
                            {item.name}
                          </CardTitle>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>🕐 {item.prep_time_minutes || 15} min</span>
                            <span>📦 {item.stock_quantity} left</span>
                            {item.dietary_info?.vegetarian && <span>🌱</span>}
                            {item.dietary_info?.vegan && <span>🌿</span>}
                            {item.dietary_info?.gluten_free && <span>🌾</span>}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold gradient-text">
                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                          </span>
                          <Button 
                            size="sm"
                            className="elegant-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openItemDialog(item);
                            }}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Item Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                <DialogDescription>{selectedItem.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                  {getMenuItemImage(selectedItem.name) ? (
                    <img src={getMenuItemImage(selectedItem.name)} alt={selectedItem.name} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <span className="text-muted-foreground">No image</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${selectedItem.price.toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(selectedItem.stock_quantity, quantity + 1))}
                      disabled={quantity >= selectedItem.stock_quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests, dietary restrictions, or cooking preferences..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddToCart} className="w-full elegant-button">
                  Add to Cart - ${(selectedItem.price * quantity).toFixed(2)}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;