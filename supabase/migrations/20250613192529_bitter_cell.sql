/*
  # Seed Demo Data

  This migration adds sample data for demonstration purposes.
  It creates a demo business and populates it with realistic data.
*/

-- Insert demo business (will be created when user signs up)
-- This is handled by the application, not in migration

-- Function to seed data for a business
CREATE OR REPLACE FUNCTION seed_business_data(business_uuid uuid)
RETURNS void AS $$
BEGIN
  -- Insert sample inventory items
  INSERT INTO inventory_items (business_id, name, quantity, unit, low_stock_threshold, cost_per_unit) VALUES
    (business_uuid, 'Bread', 84, 'pieces', 20, 0.50),
    (business_uuid, 'Meat', 45, 'patties', 10, 2.50),
    (business_uuid, 'Cheese', 67, 'slices', 15, 0.75),
    (business_uuid, 'Sauce', 12, 'bottles', 5, 3.00),
    (business_uuid, 'Coffee Beans', 28, 'lbs', 10, 8.00),
    (business_uuid, 'Milk', 15, 'gallons', 5, 4.50),
    (business_uuid, 'Shampoo', 8, 'bottles', 3, 12.00),
    (business_uuid, 'Conditioner', 6, 'bottles', 3, 15.00);

  -- Insert sample menu items
  INSERT INTO menu_items (business_id, name, price, category, ingredients, sold_count) VALUES
    (business_uuid, 'Hot Dog', 8.99, 'Food', '{"bread": 1, "meat": 1, "sauce": 1}', 15),
    (business_uuid, 'Hamburger', 12.99, 'Food', '{"bread": 2, "meat": 2, "cheese": 1, "sauce": 1}', 23),
    (business_uuid, 'Coffee', 4.99, 'Beverage', '{"coffee beans": 1, "milk": 1}', 45),
    (business_uuid, 'Haircut', 25.00, 'Service', '{"shampoo": 1, "conditioner": 1}', 12);

  -- Insert sample appointments
  INSERT INTO appointments (business_id, client_name, client_phone, service, appointment_time, status) VALUES
    (business_uuid, 'John Smith', '(555) 123-4567', 'Haircut & Wash', NOW() + INTERVAL '2 hours', 'confirmed'),
    (business_uuid, 'Sarah Johnson', '(555) 987-6543', 'Color Treatment', NOW() + INTERVAL '4 hours', 'pending'),
    (business_uuid, 'Mike Davis', '(555) 456-7890', 'Beard Trim', NOW() - INTERVAL '1 hour', 'completed'),
    (business_uuid, 'Emma Wilson', '(555) 321-0987', 'Styling', NOW() + INTERVAL '1 day', 'confirmed');

  -- Insert sample tasks
  INSERT INTO tasks (business_id, title, description, priority, status, due_date, assignee, category) VALUES
    (business_uuid, 'Clean equipment', 'Deep clean all styling equipment and tools', 'high', 'pending', NOW() + INTERVAL '2 hours', 'Sarah Johnson', 'Maintenance'),
    (business_uuid, 'Restock inventory', 'Order new shampoo and conditioner supplies', 'medium', 'in-progress', NOW() + INTERVAL '1 day', 'Mike Davis', 'Inventory'),
    (business_uuid, 'Update social media', 'Post daily content and respond to messages', 'low', 'completed', NOW() - INTERVAL '2 hours', 'Emma Wilson', 'Marketing'),
    (business_uuid, 'Client follow-up', 'Call clients from last week for feedback', 'medium', 'pending', NOW() + INTERVAL '4 hours', 'Alex Turner', 'Customer Service');

  -- Insert sample business metrics
  INSERT INTO business_metrics (business_id, metric_name, metric_value, metric_change, date) VALUES
    (business_uuid, 'revenue', '847', 12.5, CURRENT_DATE),
    (business_uuid, 'customers', '34', 8.3, CURRENT_DATE),
    (business_uuid, 'appointments', '28', -2.1, CURRENT_DATE),
    (business_uuid, 'efficiency', '94%', 5.7, CURRENT_DATE),
    (business_uuid, 'leads', '15', 23.4, CURRENT_DATE),
    (business_uuid, 'satisfaction', '4.8/5', 0.2, CURRENT_DATE),
    (business_uuid, 'avgTime', '28min', -3.1, CURRENT_DATE),
    (business_uuid, 'growth', '16.7%', 4.2, CURRENT_DATE);

END;
$$ LANGUAGE plpgsql;