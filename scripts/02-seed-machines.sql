-- Insert the hardcoded machines
INSERT INTO machines (id, name, status) VALUES
  ('washer1', 'Washer 1', 'free'),
  ('washer2', 'Washer 2', 'free'),
  ('washer3', 'Washer 3', 'free'),
  ('washer4', 'Washer 4', 'free'),
  ('dryer1', 'Dryer 1', 'free'),
  ('dryer2', 'Dryer 2', 'free'),
  ('dryer3', 'Dryer 3', 'free'),
  ('dryer4', 'Dryer 4', 'free')
ON CONFLICT (id) DO NOTHING;
