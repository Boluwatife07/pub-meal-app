-- Add many more menu items to populate the restaurant menu

-- Additional Breakfast Items
INSERT INTO menu_items (name, description, price, category, dietary_info, prep_time_minutes, stock_quantity) VALUES
('Blueberry Pancakes', 'Fluffy pancakes with fresh blueberries and maple syrup', 14.00, 'breakfast', '{"vegetarian": true}', 12, 25),
('Eggs Benedict', 'English muffin with poached eggs and hollandaise sauce', 19.00, 'breakfast', '{}', 18, 20),
('Granola Bowl', 'House-made granola with yogurt, berries, and honey', 12.00, 'breakfast', '{"vegetarian": true, "gluten_free": true}', 5, 30),
('Breakfast Burrito', 'Scrambled eggs, bacon, cheese, and potatoes wrapped in a flour tortilla', 15.00, 'breakfast', '{}', 15, 20),
('Smoked Salmon Bagel', 'Everything bagel with cream cheese, smoked salmon, and capers', 17.00, 'breakfast', '{}', 8, 15),
('Steel Cut Oatmeal', 'Creamy oatmeal with seasonal fruits and nuts', 11.00, 'breakfast', '{"vegetarian": true, "vegan": true, "gluten_free": true}', 10, 25),
('Belgian Waffles', 'Crispy waffles with whipped cream and fresh strawberries', 16.00, 'breakfast', '{"vegetarian": true}', 12, 20),
('Breakfast Sandwich', 'Fried egg, bacon, and cheese on brioche bun', 13.00, 'breakfast', '{}', 10, 25);

-- Additional Lunch Items
INSERT INTO menu_items (name, description, price, category, dietary_info, prep_time_minutes, stock_quantity) VALUES
('Grilled Chicken Caesar', 'Grilled chicken breast over romaine with Caesar dressing', 22.00, 'lunch', '{"gluten_free": true}', 15, 30),
('Pasta Carbonara', 'Spaghetti with pancetta, eggs, parmesan, and black pepper', 24.00, 'lunch', '{}', 18, 25),
('Ribeye Steak', 'Grass-fed ribeye with roasted vegetables and red wine jus', 45.00, 'lunch', '{"gluten_free": true}', 25, 12),
('Fish Tacos', 'Beer-battered fish with cabbage slaw and chipotle mayo', 19.00, 'lunch', '{}', 12, 20),
('Quinoa Buddha Bowl', 'Quinoa with roasted vegetables, chickpeas, and tahini dressing', 18.00, 'lunch', '{"vegetarian": true, "vegan": true, "gluten_free": true}', 15, 25),
('Mushroom Burger', 'House-made mushroom patty with avocado and sprouts', 21.00, 'lunch', '{"vegetarian": true, "vegan": true}', 18, 15),
('Lobster Roll', 'Fresh lobster meat with celery and mayo on brioche roll', 38.00, 'lunch', '{}', 12, 8),
('Thai Curry Bowl', 'Coconut curry with vegetables and jasmine rice', 20.00, 'lunch', '{"vegetarian": true, "vegan": true, "gluten_free": true}', 20, 20),
('BBQ Pulled Pork', 'Slow-cooked pulled pork with coleslaw and fries', 23.00, 'lunch', '{}', 15, 18),
('Mediterranean Wrap', 'Hummus, grilled vegetables, and feta in spinach tortilla', 16.00, 'lunch', '{"vegetarian": true}', 10, 25);

-- Additional Dessert Items
INSERT INTO menu_items (name, description, price, category, dietary_info, prep_time_minutes, stock_quantity) VALUES
('Chocolate Lava Cake', 'Warm chocolate cake with molten center and vanilla ice cream', 13.00, 'dessert', '{"vegetarian": true}', 15, 20),
('Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers', 11.00, 'dessert', '{"vegetarian": true}', 5, 18),
('New York Cheesecake', 'Rich cheesecake with graham cracker crust and berry compote', 12.00, 'dessert', '{"vegetarian": true}', 8, 15),
('Apple Pie', 'Traditional apple pie with cinnamon and vanilla ice cream', 10.00, 'dessert', '{"vegetarian": true}', 10, 20),
('Panna Cotta', 'Silky vanilla panna cotta with seasonal fruit', 9.00, 'dessert', '{"vegetarian": true, "gluten_free": true}', 5, 22),
('Chocolate Brownie', 'Fudgy brownie with walnuts and chocolate sauce', 8.00, 'dessert', '{"vegetarian": true}', 8, 25),
('Lemon Tart', 'Tangy lemon curd in buttery pastry shell', 11.00, 'dessert', '{"vegetarian": true}', 12, 16),
('Ice Cream Sundae', 'Three scoops with hot fudge, whipped cream, and cherry', 9.00, 'dessert', '{"vegetarian": true, "gluten_free": true}', 5, 30);

-- Additional Drink Items
INSERT INTO menu_items (name, description, price, category, dietary_info, prep_time_minutes, stock_quantity) VALUES
('Craft Cocktail', 'Seasonal cocktail crafted by our mixologist', 16.00, 'drinks', '{}', 8, 100),
('Fresh Orange Juice', 'Freshly squeezed orange juice', 6.00, 'drinks', '{"vegetarian": true, "vegan": true, "gluten_free": true}', 3, 50),
('Espresso Martini', 'Vodka, coffee liqueur, and fresh espresso', 17.00, 'drinks', '{}', 5, 100),
('House Red Wine', 'Carefully selected red wine by the glass', 12.00, 'drinks', '{"vegetarian": true, "vegan": true, "gluten_free": true}', 2, 80),
('House White Wine', 'Carefully selected white wine by the glass', 12.00, 'drinks', '{"vegetarian": true, "vegan": true, "gluten_free": true}', 2, 80),
('Craft Beer Selection', 'Rotating selection of local craft beers', 8.00, 'drinks', '{}', 2, 60),
('Mocktail', 'Non-alcoholic signature cocktail', 9.00, 'drinks', '{"vegetarian": true, "vegan": true, "gluten_free": true}', 5, 100),
('Artisan Coffee', 'Single-origin coffee brewed to perfection', 5.00, 'drinks', '{"vegetarian": true, "vegan": true, "gluten_free": true}', 4, 100),
('Green Smoothie', 'Spinach, banana, mango, and coconut water', 8.00, 'drinks', '{"vegetarian": true, "vegan": true, "gluten_free": true}', 5, 40),
('Iced Tea', 'House-brewed iced tea with lemon', 4.00, 'drinks', '{"vegetarian": true, "vegan": true, "gluten_free": true}', 2, 100);