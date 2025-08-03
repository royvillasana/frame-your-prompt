-- Function to get columns of a table
CREATE OR REPLACE FUNCTION public.get_columns(table_name text)
RETURNS TABLE(column_name text, data_type text) 
LANGUAGE sql 
AS $$
  SELECT 
    columns.column_name::text,
    columns.data_type::text
  FROM 
    information_schema.columns 
  WHERE 
    table_schema = 'public' 
    AND table_name = $1
  ORDER BY 
    ordinal_position;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_columns(text) TO authenticated;
