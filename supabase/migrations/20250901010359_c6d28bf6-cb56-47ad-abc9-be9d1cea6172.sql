
-- Inserir categorias
INSERT INTO public.categories (id, name, slug) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Blends', 'blends'),
('550e8400-e29b-41d4-a716-446655440002', 'Premium', 'premium'),
('550e8400-e29b-41d4-a716-446655440003', 'Especiais', 'especiais')
ON CONFLICT (slug) DO NOTHING;

-- Inserir produtos
INSERT INTO public.products (id, name, description, base_price, category_id, images, status, featured, tags, slug) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'Blend Manhã', 'Notas de chocolate e caramelo, acidez equilibrada. Perfeito para começar o dia com energia e sabor.', 45.00, '550e8400-e29b-41d4-a716-446655440001', ARRAY['/src/assets/blend-manha.jpg'], 'ativo', true, ARRAY['manhã', 'chocolate', 'caramelo', 'equilibrado'], 'blend-manha'),
('550e8400-e29b-41d4-a716-446655440102', 'Blend Noturno', 'Encorpado, notas de cacau e especiarias. Ideal para momentos especiais e pausas relaxantes.', 52.00, '550e8400-e29b-41d4-a716-446655440001', ARRAY['/src/assets/blend-noturno.jpg'], 'ativo', true, ARRAY['noturno', 'cacau', 'especiarias', 'encorpado'], 'blend-noturno'),
('550e8400-e29b-41d4-a716-446655440103', 'Premium Gold', 'Grãos selecionados, notas frutadas e florais. Nossa seleção especial para paladares refinados.', 68.00, '550e8400-e29b-41d4-a716-446655440002', ARRAY['/src/assets/premium-gold.jpg'], 'ativo', true, ARRAY['premium', 'frutado', 'floral', 'selecionado'], 'premium-gold'),
('550e8400-e29b-41d4-a716-446655440104', 'Café do Produtor', 'Direto do produtor, torra média, notas cítricas e doçura natural. Edição limitada.', 58.00, '550e8400-e29b-41d4-a716-446655440003', ARRAY['/src/assets/blend-manha.jpg'], 'ativo', false, ARRAY['produtor', 'cítrico', 'natural', 'limitado'], 'cafe-do-produtor'),
('550e8400-e29b-41d4-a716-446655440105', 'Descafeinado Suave', 'Processo swiss water, mantém todo sabor sem cafeína. Perfeito para qualquer hora.', 49.00, '550e8400-e29b-41d4-a716-446655440003', ARRAY['/src/assets/blend-noturno.jpg'], 'ativo', false, ARRAY['descafeinado', 'suave', 'swiss-water'], 'descafeinado-suave'),
('550e8400-e29b-41d4-a716-446655440106', 'Bourbon Amarelo', 'Varietal puro, notas de mel e amêndoas, corpo sedoso. Para verdadeiros apreciadores.', 75.00, '550e8400-e29b-41d4-a716-446655440002', ARRAY['/src/assets/premium-gold.jpg'], 'ativo', true, ARRAY['bourbon', 'mel', 'amêndoas', 'sedoso'], 'bourbon-amarelo')
ON CONFLICT (slug) DO NOTHING;

-- Inserir variações dos produtos
INSERT INTO public.product_variations (id, product_id, weight, price, stock, min_stock) VALUES
-- Blend Manhã
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', '250g', 45.00, 25, 5),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440101', '500g', 81.00, 18, 5),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440101', '1kg', 117.00, 12, 5),

-- Blend Noturno
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440102', '250g', 52.00, 22, 5),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440102', '500g', 93.60, 15, 5),
('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440102', '1kg', 135.20, 8, 5),

-- Premium Gold
('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440103', '250g', 68.00, 15, 5),
('550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440103', '500g', 122.40, 10, 5),
('550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440103', '1kg', 176.80, 5, 5),

-- Café do Produtor
('550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440104', '250g', 58.00, 12, 5),
('550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440104', '500g', 104.40, 8, 5),

-- Descafeinado Suave
('550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440105', '250g', 49.00, 20, 5),
('550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440105', '500g', 88.20, 15, 5),

-- Bourbon Amarelo
('550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440106', '250g', 75.00, 8, 5),
('550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440106', '500g', 135.00, 5, 5)
ON CONFLICT (id) DO NOTHING;
