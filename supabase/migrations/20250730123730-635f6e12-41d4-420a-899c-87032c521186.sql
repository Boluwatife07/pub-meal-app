-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'kitchen', 'bar');

-- Create enum for menu item types
CREATE TYPE public.menu_item_type AS ENUM ('breakfast', 'lunch', 'dessert', 'drinks');

-- Create enum for order statuses
CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'ready', 'completed');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'kitchen',
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category menu_item_type NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  customer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waiter_calls table for silent waiter requests
CREATE TABLE public.waiter_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER NOT NULL,
  message TEXT DEFAULT 'Silent call for assistance',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all profiles" 
ON public.profiles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create RLS policies for menu_items (publicly readable for customers)
CREATE POLICY "Menu items are viewable by everyone" 
ON public.menu_items FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage menu items" 
ON public.menu_items FOR ALL 
USING (public.get_user_role() = 'admin');

-- Create RLS policies for orders
CREATE POLICY "Staff can view all orders" 
ON public.orders FOR SELECT 
USING (
  public.get_user_role() IN ('admin', 'kitchen', 'bar') OR
  auth.uid() IS NULL -- Allow public access for customer orders
);

CREATE POLICY "Anyone can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Staff can update orders" 
ON public.orders FOR UPDATE 
USING (public.get_user_role() IN ('admin', 'kitchen', 'bar'));

-- Create RLS policies for order_items
CREATE POLICY "Order items follow order policies" 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_id AND (
      public.get_user_role() IN ('admin', 'kitchen', 'bar') OR
      auth.uid() IS NULL
    )
  )
);

CREATE POLICY "Anyone can create order items" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for waiter_calls
CREATE POLICY "Staff can view waiter calls" 
ON public.waiter_calls FOR SELECT 
USING (public.get_user_role() IN ('admin', 'kitchen', 'bar'));

CREATE POLICY "Anyone can create waiter calls" 
ON public.waiter_calls FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Staff can update waiter calls" 
ON public.waiter_calls FOR UPDATE 
USING (public.get_user_role() IN ('admin', 'kitchen', 'bar'));

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    'kitchen', -- Default role
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category, stock_quantity) VALUES
('Truffle Risotto', 'Creamy arborio rice with black truffle shavings and parmesan', 28.00, 'lunch', 50),
('Pan-Seared Salmon', 'Atlantic salmon with herb butter and seasonal vegetables', 32.00, 'lunch', 30),
('Avocado Toast', 'Multigrain bread with smashed avocado, poached egg, and microgreens', 16.00, 'breakfast', 25),
('French Omelette', 'Classic three-egg omelette with herbs and gruyere cheese', 18.00, 'breakfast', 40),
('Chocolate Soufflé', 'Warm chocolate soufflé with vanilla ice cream', 14.00, 'dessert', 20),
('Crème Brûlée', 'Classic vanilla custard with caramelized sugar', 12.00, 'dessert', 15),
('Craft Old Fashioned', 'Premium bourbon with house-made bitters and orange peel', 15.00, 'drinks', 100),
('Sommelier Wine Selection', 'Curated glass of red or white wine by our sommelier', 18.00, 'drinks', 50);

-- Enable realtime for orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_items REPLICA IDENTITY FULL;
ALTER TABLE public.waiter_calls REPLICA IDENTITY FULL;