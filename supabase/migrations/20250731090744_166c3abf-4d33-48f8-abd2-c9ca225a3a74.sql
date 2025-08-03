-- Fix the stock management trigger and add missing UPDATE trigger on order_items
-- First, recreate the trigger to ensure it's properly connected
DROP TRIGGER IF EXISTS reduce_stock_trigger ON order_items;

CREATE TRIGGER reduce_stock_trigger
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION reduce_stock_on_order();

-- Add missing policies for order_items UPDATE (needed for status changes)
DROP POLICY IF EXISTS "Staff can update order items" ON order_items;
CREATE POLICY "Staff can update order items"
ON order_items
FOR UPDATE
USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'kitchen'::user_role, 'bar'::user_role]));

-- Ensure the orders table has a proper WITH CHECK for updates
DROP POLICY IF EXISTS "Staff can update orders" ON orders;
CREATE POLICY "Staff can update orders" 
ON orders 
FOR UPDATE 
USING (get_user_role() = ANY (ARRAY['admin'::user_role, 'kitchen'::user_role, 'bar'::user_role]))
WITH CHECK (get_user_role() = ANY (ARRAY['admin'::user_role, 'kitchen'::user_role, 'bar'::user_role]));

-- Test the get_user_role function to make sure it works
SELECT get_user_role();