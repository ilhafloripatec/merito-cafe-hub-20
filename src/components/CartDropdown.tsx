import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';

interface CartDropdownProps {
  open: boolean;
  onClose: () => void;
}

export function CartDropdown({ open, onClose }: CartDropdownProps) {
  const { items, updateQuantity, removeItem, getTotal } = useCart();

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 z-50">
      <Card className="p-4 shadow-lg border bg-background">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Carrinho</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Seu carrinho está vazio</p>
            <Button 
              asChild 
              className="mt-4" 
              onClick={onClose}
            >
              <Link to="/produtos">Ver Produtos</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variationId}`} className="flex items-center space-x-3">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    {item.variation && (
                      <p className="text-xs text-muted-foreground">{item.variation.weight}</p>
                    )}
                    <p className="text-sm font-semibold text-accent">
                      {formatCurrency(
                        item.variation 
                          ? item.product.price + (item.product.price * item.variation.priceModifier)
                          : item.product.price
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.productId, item.variationId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.productId, item.variationId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeItem(item.productId, item.variationId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-accent">
                  {formatCurrency(getTotal())}
                </span>
              </div>
              
              <div className="space-y-2">
                <Button 
                  asChild 
                  className="w-full" 
                  onClick={onClose}
                >
                  <Link to="/carrinho">Ver Carrinho</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full" 
                  onClick={onClose}
                >
                  <Link to="/checkout">Finalizar Compra</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}