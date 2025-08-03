-- Make table_number optional for waiter calls (for general assistance)
ALTER TABLE waiter_calls ALTER COLUMN table_number DROP NOT NULL;

-- Add stock tracking trigger to reduce stock when orders are placed
CREATE OR REPLACE FUNCTION reduce_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Reduce stock for each ordered item
  UPDATE menu_items 
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.menu_item_id;
  
  -- Check if stock went negative and warn
  IF EXISTS (
    SELECT 1 FROM menu_items 
    WHERE id = NEW.menu_item_id AND stock_quantity < 0
  ) THEN
    -- Reset to 0 if it went negative
    UPDATE menu_items 
    SET stock_quantity = 0, is_available = false
    WHERE id = NEW.menu_item_id AND stock_quantity < 0;
  END IF;
  
  -- Mark as unavailable if stock is 0
  UPDATE menu_items 
  SET is_available = false
  WHERE id = NEW.menu_item_id AND stock_quantity = 0;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock reduction
CREATE TRIGGER reduce_stock_trigger
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION reduce_stock_on_order();

-- Add customer feedback table
CREATE TABLE public.order_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on feedback table
ALTER TABLE public.order_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can create feedback
CREATE POLICY "Anyone can create feedback" 
ON public.order_feedback 
FOR INSERT 
WITH CHECK (true);

-- Staff can view all feedback
CREATE POLICY "Staff can view feedback" 
ON public.order_feedback 
FOR SELECT 
USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'kitchen'::user_role, 'bar'::user_role]));

-- Add table for customer favorites
CREATE TABLE public.customer_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_session_id TEXT NOT NULL, -- Using session ID since no auth
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(customer_session_id, menu_item_id)
);

-- Enable RLS on favorites table
ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;

-- Anyone can manage their own favorites
CREATE POLICY "Anyone can manage favorites" 
ON public.customer_favorites 
FOR ALL
USING (true)
WITH CHECK (true);

-- Add dietary preferences to menu items
ALTER TABLE menu_items ADD COLUMN dietary_info JSONB DEFAULT '{}';

-- Add estimated preparation time
ALTER TABLE menu_items ADD COLUMN prep_time_minutes INTEGER DEFAULT 15;

-- Add order status tracking with estimated time
ALTER TABLE orders ADD COLUMN estimated_ready_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN actual_ready_time TIMESTAMP WITH TIME ZONE;