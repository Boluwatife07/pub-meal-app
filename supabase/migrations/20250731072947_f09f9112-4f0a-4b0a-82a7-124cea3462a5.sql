-- Fix function search path issue for security
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;