import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export function CartSidebar() {
  const { items, updateQuantity, removeItem, getTotal, getItemCount } = useCart();
  const [open, setOpen] = useState(false);

  const itemCount = getItemCount();
  const total = getTotal();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingBag className="h-4 w-4" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Itens do carrinho */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Seu carrinho está vazio</p>
                <Button asChild className="mt-4" onClick={() => setOpen(false)}>
                  <Link to="/produtos">Ver Produtos</Link>
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const productImage = item.product.image;
                const productName = item.product.name;
                const weight = item.variation?.weight || 'Peso padrão';
                const price = item.variation?.price || item.product.price;
                
                return (
                  <div key={`${item.productId}-${item.variationId}`} className="flex gap-3 p-3 border rounded-lg">
                    {productImage && (
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{productName}</h4>
                      <p className="text-sm text-muted-foreground">{weight}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.variationId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.productId, item.variationId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeItem(item.productId, item.variationId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(price * item.quantity)}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(price)} cada</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Resumo e checkout */}
          {items.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button asChild className="w-full" onClick={() => setOpen(false)}>
                  <Link to="/carrinho">Ver Carrinho</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                  <Link to="/checkout">Finalizar Compra</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}