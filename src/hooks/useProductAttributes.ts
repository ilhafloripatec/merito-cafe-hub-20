import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductAttribute {
  id: string;
  name: string;
  slug: string;
  type: string;
  created_at: string;
  values: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  id: string;
  attribute_id: string;
  value: string;
  slug: string;
  created_at: string;
}

export interface ProductAttributeVariation {
  id: string;
  product_id: string;
  attribute_id: string;
  attribute_value_id: string;
  variation_id?: string;
  created_at: string;
}

export function useProductAttributes() {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      
      // Buscar atributos
      const { data: attributesData, error: attributesError } = await supabase
        .from('product_attributes')
        .select('*')
        .order('name');

      if (attributesError) throw attributesError;

      // Buscar valores dos atributos
      const { data: valuesData, error: valuesError } = await supabase
        .from('product_attribute_values')
        .select('*')
        .order('value');

      if (valuesError) throw valuesError;

      // Agrupar valores por atributo
      const attributesWithValues = attributesData.map(attr => ({
        ...attr,
        values: valuesData.filter(value => value.attribute_id === attr.id)
      }));

      setAttributes(attributesWithValues);
    } catch (error) {
      console.error('Erro ao carregar atributos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAttribute = async (attributeData: { name: string; slug: string; type: string }) => {
    try {
      const { data, error } = await supabase
        .from('product_attributes')
        .insert([attributeData])
        .select()
        .single();

      if (error) throw error;
      await fetchAttributes();
      return data;
    } catch (error) {
      console.error('Erro ao criar atributo:', error);
      throw error;
    }
  };

  const createAttributeValue = async (valueData: { attribute_id: string; value: string; slug: string }) => {
    try {
      const { data, error } = await supabase
        .from('product_attribute_values')
        .insert([valueData])
        .select()
        .single();

      if (error) throw error;
      await fetchAttributes();
      return data;
    } catch (error) {
      console.error('Erro ao criar valor do atributo:', error);
      throw error;
    }
  };

  const createProductAttributeVariation = async (variationData: Omit<ProductAttributeVariation, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('product_attribute_variations')
        .insert([variationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar variação de atributo:', error);
      throw error;
    }
  };

  const getProductAttributeVariations = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_attribute_variations')
        .select(`
          *,
          attribute:product_attributes(*),
          value:product_attribute_values(*)
        `)
        .eq('product_id', productId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao carregar variações de atributos do produto:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  return {
    attributes,
    loading,
    fetchAttributes,
    createAttribute,
    createAttributeValue,
    createProductAttributeVariation,
    getProductAttributeVariations
  };
}