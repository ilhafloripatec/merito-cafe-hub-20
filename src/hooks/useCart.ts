
import { useState, useEffect } from 'react';
import { Product, ProductVariation } from '@/types/product';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  productId: string;
  variationId?: string;
  quantity: number;
  product: Product;
  variation?: ProductVariation;
}

const CART_STORAGE_KEY = 'merito-cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, variation?: ProductVariation, quantity: number = 1) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.productId === product.id && item.variationId === variation?.id
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += quantity;
        toast({
          title: "Produto atualizado",
          description: `${product.name} foi atualizado no carrinho`,
        });
        return updatedItems;
      } else {
        // Add new item
        const newItem: CartItem = {
          productId: product.id,
          variationId: variation?.id,
          quantity,
          product,
          variation
        };
        toast({
          title: "Produto adicionado",
          description: `${product.name} foi adicionado ao carrinho`,
        });
        return [...currentItems, newItem];
      }
    });
  };

  const removeItem = (productId: string, variationId?: string) => {
    setItems(currentItems => {
      const updatedItems = currentItems.filter(
        item => !(item.productId === productId && item.variationId === variationId)
      );
      toast({
        title: "Produto removido",
        description: "Produto removido do carrinho",
        variant: "destructive"
      });
      return updatedItems;
    });
  };

  const updateQuantity = (productId: string, variationId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variationId);
      return;
    }

    setItems(currentItems => 
      currentItems.map(item => 
        item.productId === productId && item.variationId === variationId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Carrinho limpo",
      description: "Todos os produtos foram removidos do carrinho",
    });
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      // Use price from Product type (not base_price)
      const basePrice = item.product.price || 0;
      // Use price from ProductVariation type (not priceModifier)
      const variationPrice = item.variation ? item.variation.price : basePrice;
      return total + (variationPrice * item.quantity);
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount
  };
}
