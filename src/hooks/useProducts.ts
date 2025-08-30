
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category_id: string;
  grind_type?: 'grãos' | 'fina' | 'média' | 'grossa';
  images: string[];
  meta_title?: string;
  meta_description?: string;
  slug: string;
  status: 'ativo' | 'inativo';
  featured: boolean;
  tags: string[];
  created_at: string;
  category?: {
    name: string;
    slug: string;
  };
  variations: ProductVariation[];
}

export interface ProductVariation {
  id: string;
  product_id: string;
  weight: string;
  price: number;
  stock: number;
  min_stock: number;
  created_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name, slug),
          variations:product_variations(*)
        `)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Produto criado com sucesso!",
        description: `${productData.name} foi adicionado ao catálogo.`
      });

      await fetchProducts();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Produto atualizado com sucesso!",
        description: `${productData.name} foi atualizado.`
      });

      await fetchProducts();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Produto excluído com sucesso!",
        description: "O produto foi removido do catálogo."
      });

      await fetchProducts();
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
}
