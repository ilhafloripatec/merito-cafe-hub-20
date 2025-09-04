-- Create exchanges table for product return/exchange system
CREATE TABLE exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  type TEXT NOT NULL CHECK (type IN ('troca', 'devolucao')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'aprovado', 'rejeitado', 'processando', 'concluido')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exchange items table
CREATE TABLE exchange_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exchange_id UUID NOT NULL REFERENCES exchanges(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  grind_type TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for exchanges
CREATE POLICY "Users can view own exchanges"
ON exchanges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exchanges"
ON exchanges
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all exchanges"
ON exchanges
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update exchanges"
ON exchanges
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- RLS policies for exchange items
CREATE POLICY "Users can view own exchange items"
ON exchange_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM exchanges
    WHERE exchanges.id = exchange_items.exchange_id 
    AND exchanges.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create exchange items for own exchanges"
ON exchange_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM exchanges
    WHERE exchanges.id = exchange_items.exchange_id 
    AND exchanges.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all exchange items"
ON exchange_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can modify exchange items"
ON exchange_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_exchanges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_exchanges_updated_at
BEFORE UPDATE ON exchanges
FOR EACH ROW
EXECUTE FUNCTION update_exchanges_updated_at();