
-- Add indexes to improve query performance for analytics
CREATE INDEX IF NOT EXISTS idx_expenses_user_created_at ON public.expenses (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_category_created_at ON public.expenses (category_id, created_at);

-- Create a function to get monthly spending summary with built-in RLS
CREATE OR REPLACE FUNCTION public.get_monthly_spending_summary(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  category_id UUID,
  category_name TEXT,
  category_color TEXT,
  month TIMESTAMP WITH TIME ZONE,
  total_spent NUMERIC,
  transaction_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.user_id,
    e.category_id,
    bc.name as category_name,
    bc.color as category_color,
    DATE_TRUNC('month', e.created_at) as month,
    SUM(e.amount) as total_spent,
    COUNT(*) as transaction_count
  FROM public.expenses e
  JOIN public.budget_categories bc ON e.category_id = bc.id
  WHERE e.user_id = auth.uid()
    AND (start_date IS NULL OR e.created_at >= start_date)
    AND (end_date IS NULL OR e.created_at <= end_date)
  GROUP BY e.user_id, e.category_id, bc.name, bc.color, DATE_TRUNC('month', e.created_at)
  ORDER BY month DESC, total_spent DESC;
END;
$$;
