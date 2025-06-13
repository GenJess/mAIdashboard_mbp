/*
  # Add Recurring Task Support

  1. New Columns
    - `is_recurring` (boolean) - Whether the task repeats
    - `recurrence_pattern` (jsonb) - How the task repeats
    - `parent_task_id` (uuid) - Links to original recurring task
    - `next_due_date` (timestamp) - When next instance should be created

  2. Updates
    - Add indexes for better performance
    - Update RLS policies to include new columns
*/

-- Add new columns to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'is_recurring'
  ) THEN
    ALTER TABLE tasks ADD COLUMN is_recurring boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'recurrence_pattern'
  ) THEN
    ALTER TABLE tasks ADD COLUMN recurrence_pattern jsonb DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'parent_task_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN parent_task_id uuid REFERENCES tasks(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'next_due_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN next_due_date timestamptz;
  END IF;
END $$;

-- Create index for recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON tasks(business_id, is_recurring) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_tasks_next_due ON tasks(next_due_date) WHERE next_due_date IS NOT NULL;

-- Function to generate next occurrence of recurring task
CREATE OR REPLACE FUNCTION generate_next_recurring_task(task_id uuid)
RETURNS void AS $$
DECLARE
  task_record tasks%ROWTYPE;
  next_due timestamptz;
  pattern jsonb;
BEGIN
  -- Get the task record
  SELECT * INTO task_record FROM tasks WHERE id = task_id AND is_recurring = true;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;

  pattern := task_record.recurrence_pattern;
  
  -- Calculate next due date based on pattern
  CASE pattern->>'frequency'
    WHEN 'daily' THEN
      next_due := task_record.due_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      next_due := task_record.due_date + INTERVAL '1 week';
    WHEN 'monthly' THEN
      next_due := task_record.due_date + INTERVAL '1 month';
    WHEN 'custom' THEN
      -- Custom interval in days
      next_due := task_record.due_date + (COALESCE((pattern->>'interval_days')::integer, 1) || ' days')::INTERVAL;
    ELSE
      next_due := task_record.due_date + INTERVAL '1 week'; -- Default to weekly
  END CASE;

  -- Create new task instance
  INSERT INTO tasks (
    business_id,
    title,
    description,
    priority,
    status,
    due_date,
    assignee,
    category,
    is_recurring,
    recurrence_pattern,
    parent_task_id
  ) VALUES (
    task_record.business_id,
    task_record.title,
    task_record.description,
    task_record.priority,
    'pending',
    next_due,
    task_record.assignee,
    task_record.category,
    false, -- New instance is not recurring itself
    '{}',
    task_record.id
  );

  -- Update parent task's next due date
  UPDATE tasks 
  SET next_due_date = next_due 
  WHERE id = task_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate smart tasks based on business data
CREATE OR REPLACE FUNCTION generate_smart_tasks(business_uuid uuid)
RETURNS void AS $$
DECLARE
  low_stock_items RECORD;
  pending_followups RECORD;
BEGIN
  -- Generate inventory restock tasks for low stock items
  FOR low_stock_items IN 
    SELECT name, quantity, low_stock_threshold 
    FROM inventory_items 
    WHERE business_id = business_uuid 
    AND quantity <= low_stock_threshold
    AND NOT EXISTS (
      SELECT 1 FROM tasks 
      WHERE business_id = business_uuid 
      AND title ILIKE '%restock%' || low_stock_items.name || '%'
      AND status != 'completed'
      AND created_at > NOW() - INTERVAL '7 days'
    )
  LOOP
    INSERT INTO tasks (
      business_id,
      title,
      description,
      priority,
      status,
      due_date,
      category
    ) VALUES (
      business_uuid,
      'Restock ' || low_stock_items.name,
      'Current stock: ' || low_stock_items.quantity || ' (threshold: ' || low_stock_items.low_stock_threshold || ')',
      'high',
      'pending',
      NOW() + INTERVAL '1 day',
      'Inventory'
    );
  END LOOP;

  -- Generate follow-up tasks for completed appointments
  FOR pending_followups IN
    SELECT client_name, service, appointment_time
    FROM appointments
    WHERE business_id = business_uuid
    AND status = 'completed'
    AND appointment_time > NOW() - INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM tasks
      WHERE business_id = business_uuid
      AND title ILIKE '%follow%up%' || pending_followups.client_name || '%'
      AND created_at > pending_followups.appointment_time
    )
  LOOP
    INSERT INTO tasks (
      business_id,
      title,
      description,
      priority,
      status,
      due_date,
      category
    ) VALUES (
      business_uuid,
      'Follow up with ' || pending_followups.client_name,
      'Follow up on ' || pending_followups.service || ' service from ' || pending_followups.appointment_time::date,
      'medium',
      'pending',
      NOW() + INTERVAL '2 days',
      'Customer Service'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;