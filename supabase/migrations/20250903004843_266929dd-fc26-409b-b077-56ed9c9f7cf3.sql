-- Criar tabela de atributos de produtos
CREATE TABLE public.product_attributes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'select', -- select, color, text, etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de valores dos atributos
CREATE TABLE public.product_attribute_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attribute_id UUID NOT NULL,
  value TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(attribute_id, slug)
);

-- Criar tabela de relacionamento produto-atributo-valor
CREATE TABLE public.product_attribute_variations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  attribute_id UUID NOT NULL,
  attribute_value_id UUID NOT NULL,
  variation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, attribute_id, variation_id)
);

-- Habilitar RLS
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_variations ENABLE ROW LEVEL SECURITY;

-- Políticas para product_attributes
CREATE POLICY "Product attributes are publicly readable" 
ON public.product_attributes 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify product attributes" 
ON public.product_attributes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

-- Políticas para product_attribute_values
CREATE POLICY "Product attribute values are publicly readable" 
ON public.product_attribute_values 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify product attribute values" 
ON public.product_attribute_values 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

-- Políticas para product_attribute_variations
CREATE POLICY "Product attribute variations are publicly readable" 
ON public.product_attribute_variations 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify product attribute variations" 
ON public.product_attribute_variations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() AND profiles.is_admin = true
));

-- Inserir atributos padrão para cafés
INSERT INTO public.product_attributes (id, name, slug, type) VALUES
('attr-001', 'Tipo', 'tipo', 'select'),
('attr-002', 'Peso', 'peso', 'select');

-- Inserir valores para o atributo Tipo
INSERT INTO public.product_attribute_values (id, attribute_id, value, slug) VALUES
('attr-val-001', 'attr-001', 'Grãos', 'graos'),
('attr-val-002', 'attr-001', 'Moagem Média', 'moagem-media'),
('attr-val-003', 'attr-001', 'Moagem Grossa', 'moagem-grossa');

-- Inserir valores para o atributo Peso
INSERT INTO public.product_attribute_values (id, attribute_id, value, slug) VALUES
('attr-val-004', 'attr-002', '250g', '250g'),
('attr-val-005', 'attr-002', '500g', '500g'),
('attr-val-006', 'attr-002', '1kg', '1kg');