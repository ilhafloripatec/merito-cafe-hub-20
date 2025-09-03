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
INSERT INTO public.product_attributes (name, slug, type) VALUES
('Tipo', 'tipo', 'select'),
('Peso', 'peso', 'select');

-- Inserir valores para o atributo Tipo (obter o ID do atributo Tipo primeiro)
INSERT INTO public.product_attribute_values (attribute_id, value, slug) 
SELECT id, 'Grãos', 'graos' FROM public.product_attributes WHERE slug = 'tipo'
UNION ALL
SELECT id, 'Moagem Média', 'moagem-media' FROM public.product_attributes WHERE slug = 'tipo'
UNION ALL
SELECT id, 'Moagem Grossa', 'moagem-grossa' FROM public.product_attributes WHERE slug = 'tipo';

-- Inserir valores para o atributo Peso
INSERT INTO public.product_attribute_values (attribute_id, value, slug) 
SELECT id, '250g', '250g' FROM public.product_attributes WHERE slug = 'peso'
UNION ALL
SELECT id, '500g', '500g' FROM public.product_attributes WHERE slug = 'peso'
UNION ALL
SELECT id, '1kg', '1kg' FROM public.product_attributes WHERE slug = 'peso';