
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-6">
            Adicione alguns produtos deliciosos ao seu carrinho
          </p>
          <Link to="/produtos">
            <Button>Continuar comprando</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Meu Carrinho ({getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'})</h1>
            <Button variant="outline" onClick={clearCart}>
              Limpar carrinho
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => {
              const variationPrice = item.variation 
                ? item.product.price + (item.product.price * item.variation.priceModifier) 
                : item.product.price;

              return (
                <Card key={`${item.productId}-${item.variationId}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        {item.variation && (
                          <p className="text-sm text-muted-foreground">
                            {item.variation.name} - {item.variation.weight}
                          </p>
                        )}
                        <p className="text-sm font-medium text-primary">
                          {formatCurrency(variationPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.variationId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.variationId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(variationPrice * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.productId, item.variationId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>Calculado no checkout</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Finalizar compra
              </Button>
              <Link to="/produtos">
                <Button variant="outline" className="w-full">
                  Continuar comprando
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
