
import { useState, useMemo } from 'react';
import { Search, Filter, Grid, List, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SupabaseProductCard } from '@/components/SupabaseProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useProductAttributes } from '@/hooks/useProductAttributes';

export default function Products() {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { attributes, loading: attributesLoading } = useProductAttributes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Get price range from products
  const maxPrice = useMemo(() => {
    if (!products || products.length === 0) return 200;
    return Math.max(...products.map(p => p.base_price));
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = products.filter(product => product.status === 'ativo');

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.base_price >= priceRange[0] && product.base_price <= priceRange[1]
    );

    // Filter by attributes
    Object.entries(selectedAttributes).forEach(([attributeId, valueIds]) => {
      if (valueIds.length > 0) {
        // Esta funcionalidade será implementada quando tivermos a relação produto-atributo
        // Por enquanto, mantemos todos os produtos
      }
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.base_price - b.base_price;
        case 'price-high':
          return b.base_price - a.base_price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, priceRange, selectedAttributes]);

  const getCategoryOptions = () => {
    const allOption = { id: 'all', name: 'Todas as categorias', count: products?.length || 0 };
    const categoryOptions = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      count: products?.filter(p => p.category_id === cat.id && p.status === 'ativo').length || 0
    }));
    return [allOption, ...categoryOptions];
  };

  const handleAttributeChange = (attributeId: string, valueId: string, checked: boolean) => {
    setSelectedAttributes(prev => {
      const current = prev[attributeId] || [];
      if (checked) {
        return { ...prev, [attributeId]: [...current, valueId] };
      } else {
        return { ...prev, [attributeId]: current.filter(id => id !== valueId) };
      }
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, maxPrice]);
    setSelectedAttributes({});
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || 
    priceRange[0] > 0 || priceRange[1] < maxPrice || 
    Object.values(selectedAttributes).some(values => values.length > 0);

  if (productsLoading || categoriesLoading || attributesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-playfair text-4xl font-bold text-primary mb-2">
          Nossos Cafés Especiais
        </h1>
        <p className="text-muted-foreground">
          Descubra nossa seleção de cafés especiais, torrados artesanalmente em Lajeado, RS.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar cafés..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:w-48"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtros Avançados
          </Button>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome A-Z</SelectItem>
              <SelectItem value="price-low">Menor preço</SelectItem>
              <SelectItem value="price-high">Maior preço</SelectItem>
              <SelectItem value="featured">Destaques</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent className="space-y-4">
            <Card className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Categoria</h3>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategoryOptions().map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">Faixa de Preço</h3>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={maxPrice}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>R$ {priceRange[0]}</span>
                      <span>R$ {priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Attributes Filters */}
                {attributes.map((attribute) => (
                  <div key={attribute.id}>
                    <h3 className="font-semibold mb-3">{attribute.name}</h3>
                    <div className="space-y-2">
                      {attribute.values.slice(0, 5).map((value) => (
                        <div key={value.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${attribute.id}-${value.id}`}
                            checked={(selectedAttributes[attribute.id] || []).includes(value.id)}
                            onCheckedChange={(checked) => 
                              handleAttributeChange(attribute.id, value.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`${attribute.id}-${value.id}`}
                            className="text-sm text-muted-foreground cursor-pointer"
                          >
                            {value.value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full"
                    disabled={!hasActiveFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Busca: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                Categoria: {categories.find(c => c.id === selectedCategory)?.name}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <Badge variant="secondary" className="gap-1">
                Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
                <button
                  onClick={() => setPriceRange([0, maxPrice])}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {Object.entries(selectedAttributes).map(([attributeId, valueIds]) => 
              valueIds.map((valueId) => {
                const attribute = attributes.find(a => a.id === attributeId);
                const value = attribute?.values.find(v => v.id === valueId);
                return (
                  <Badge key={`${attributeId}-${valueId}`} variant="secondary" className="gap-1">
                    {attribute?.name}: {value?.value}
                    <button
                      onClick={() => handleAttributeChange(attributeId, valueId, false)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          {filteredAndSortedProducts.length} produto{filteredAndSortedProducts.length !== 1 ? 's' : ''} encontrado{filteredAndSortedProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Products Grid/List */}
      {filteredAndSortedProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <CardContent className="p-0">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou buscar por outros termos.
            </p>
            <Button
              onClick={clearAllFilters}
              variant="outline"
            >
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredAndSortedProducts.map((product) => (
            <SupabaseProductCard 
              key={product.id} 
              product={product} 
              featured={product.featured || false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
