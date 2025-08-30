
-- Criar enum para tipos de moagem
CREATE TYPE grind_type_enum AS ENUM ('grãos', 'fina', 'média', 'grossa');

-- Criar enum para status de produtos
CREATE TYPE product_status_enum AS ENUM ('ativo', 'inativo');

-- Criar enum para status de pedidos
CREATE TYPE order_status_enum AS ENUM ('pendente', 'confirmado', 'enviado', 'entregue', 'cancelado');

-- Criar enum para status de contatos
CREATE TYPE contact_status_enum AS ENUM ('novo', 'respondido');

-- Criar enum para tipos de movimentação de estoque
CREATE TYPE stock_movement_type_enum AS ENUM ('entrada', 'saida', 'venda', 'perda', 'ajuste');

-- Tabela de perfis de usuário (estende auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  grind_type grind_type_enum,
  images TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  slug TEXT NOT NULL UNIQUE,
  status product_status_enum DEFAULT 'ativo',
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de variações de produto
CREATE TABLE public.product_variations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  weight TEXT CHECK (weight IN ('250g', '500g', '1kg')),
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, weight)
);

-- Tabela de endereços
CREATE TABLE public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  order_number TEXT NOT NULL UNIQUE,
  status order_status_enum DEFAULT 'pendente',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variation_id UUID REFERENCES product_variations(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  grind_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de movimentações de estoque
CREATE TABLE public.stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variation_id UUID REFERENCES product_variations(id),
  type stock_movement_type_enum,
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  current_stock INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de contatos
CREATE TABLE public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status contact_status_enum DEFAULT 'novo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para categories (público para leitura, admin para escrita)
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para products (público para leitura, admin para escrita)
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Only admins can modify products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para product_variations (público para leitura, admin para escrita)
CREATE POLICY "Product variations are publicly readable" ON public.product_variations FOR SELECT USING (true);
CREATE POLICY "Only admins can modify product variations" ON public.product_variations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para addresses (usuário pode gerenciar próprios endereços)
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Políticas para orders (usuário pode ver próprios pedidos, admin pode ver todos)
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para order_items (baseado no acesso aos pedidos)
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create order items for own orders" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para stock_movements (apenas admin)
CREATE POLICY "Only admins can manage stock movements" ON public.stock_movements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Políticas para contacts (público para inserir, admin para ver)
CREATE POLICY "Anyone can create contacts" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view contacts" ON public.contacts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name');
  RETURN NEW;
END;
$$;

-- Trigger para executar a função quando usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir algumas categorias padrão
INSERT INTO public.categories (name, slug) VALUES
('Cafés Especiais', 'cafes-especiais'),
('Blends', 'blends'),
('Descafeinados', 'descafeinados'),
('Orgânicos', 'organicos');

-- Criar um usuário admin padrão (você pode alterar depois)
-- Nota: Este será criado quando um usuário se registrar com o email especificado
