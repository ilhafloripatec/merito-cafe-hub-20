
import { useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, ProductVariation } from '@/types/product';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(
    product.variations?.[0]
  );
  const { addItem } = useCart();

  const getPrice = () => {
    if (!selectedVariation) return product.price;
    return selectedVariation.price;
  };

  const handleAddToCart = () => {
    addItem(product, selectedVariation, 1);
  };

  return (
    <Card className={`group product-card overflow-hidden ${featured ? 'ring-2 ring-accent' : ''}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {featured && (
          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
            <Star className="w-3 h-3 mr-1" />
            Destaque
          </Badge>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Últimas unidades
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Esgotado
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background transition-colors"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-playfair font-semibold text-lg text-primary line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {product.variations && product.variations.length > 1 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Peso:
              </label>
              <Select 
                value={selectedVariation?.id} 
                onValueChange={(value) => {
                  const variation = product.variations.find(v => v.id === value);
                  setSelectedVariation(variation);
                }}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Selecione o peso" />
                </SelectTrigger>
                <SelectContent>
                  {product.variations.map((variation) => (
                    <SelectItem key={variation.id} value={variation.id}>
                      {variation.weight} - {formatCurrency(variation.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-accent">
                {formatCurrency(getPrice())}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                Estoque: {selectedVariation?.stock || product.stock}
              </p>
            </div>
          </div>

          <Button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full group"
          >
            <ShoppingCart className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
            {product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
