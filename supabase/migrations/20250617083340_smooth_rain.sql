/*
  # Make business_id nullable for simple demo

  1. Changes
    - Make business_id nullable in appointments table
    - Remove business_id requirement for simple demo mode
*/

-- Make business_id nullable so we can insert appointments without it
ALTER TABLE appointments ALTER COLUMN business_id DROP NOT NULL;

-- Create the simple book_appointment function
CREATE OR REPLACE FUNCTION book_appointment(
  p_client_name TEXT,
  p_service TEXT,
  p_appointment_time TIMESTAMPTZ,
  p_client_phone TEXT DEFAULT NULL
) RETURNS JSON AS $$
BEGIN
  -- Just insert directly, no auth checks, no business_id bullshit
  INSERT INTO appointments (
    client_name, 
    service, 
    appointment_time, 
    client_phone, 
    status
  ) VALUES (
    p_client_name, 
    p_service, 
    p_appointment_time, 
    p_client_phone, 
    'pending'
  );
  
  RETURN json_build_object('success', true, 'message', 'Appointment booked successfully');
END;
$$ LANGUAGE plpgsql;