-- Fix RLS policies for orders table to allow status updates by admins
CREATE POLICY "Admins can update order status" ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);