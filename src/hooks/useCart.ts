import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, ProductVariation } from '@/types/product';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  productId: string;
  variationId?: string;
  quantity: number;
  product: Product;
  variation?: ProductVariation;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, variation?: ProductVariation, quantity?: number) => void;
  removeItem: (productId: string, variationId?: string) => void;
  updateQuantity: (productId: string, variationId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, variation, quantity = 1) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          item => item.productId === product.id && item.variationId === variation?.id
        );

        const updatedItems = [...items];

        if (existingItemIndex >= 0) {
          updatedItems[existingItemIndex].quantity += quantity;
          toast({
            title: "Produto atualizado",
            description: `${product.name} foi atualizado no carrinho`,
          });
        } else {
          const newItem: CartItem = {
            productId: product.id,
            variationId: variation?.id,
            quantity,
            product,
            variation
          };
          updatedItems.push(newItem);
          toast({
            title: "Produto adicionado",
            description: `${product.name} foi adicionado ao carrinho`,
          });
        }
        set({ items: updatedItems });
      },

      removeItem: (productId, variationId) => {
        const updatedItems = get().items.filter(
          item => !(item.productId === productId && item.variationId === variationId)
        );
        set({ items: updatedItems });
        toast({
          title: "Produto removido",
          description: "Produto removido do carrinho.",
          variant: "destructive"
        });
      },

      updateQuantity: (productId, variationId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variationId);
          return;
        }
        const updatedItems = get().items.map(item =>
          item.productId === productId && item.variationId === variationId
            ? { ...item, quantity }
            : item
        );
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [] });
        toast({
          title: "Carrinho limpo",
          description: "Todos os produtos foram removidos.",
        });
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.variation ? item.variation.price : item.product.price;
          return total + (price * item.quantity);
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'merito-cart-storage', // Nome do item no localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
