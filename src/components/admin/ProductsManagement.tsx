import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useProductAttributes } from '@/hooks/useProductAttributes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search, Package2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/hooks/useProducts';
import { AttributesManagement } from './AttributesManagement';
import { ImageUpload } from '@/components/ui/image-upload';

export function ProductsManagement() {
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { attributes, createProductAttributeVariation } = useProductAttributes();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    status: 'ativo' as 'ativo' | 'inativo',
    featured: false,
    tags: '',
    images: '',
    attributes: {} as Record<string, string>
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      status: 'ativo',
      featured: false,
      tags: '',
      images: '',
      attributes: {}
    });
    setEditingProduct(null);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.base_price?.toString() || '',
        category_id: product.category_id || '',
        status: product.status || 'ativo',
        featured: product.featured || false,
        tags: product.tags?.join(', ') || '',
        images: product.images?.join(', ') || '',
        attributes: {}
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id) {
        toast({ title: "Erro de Validação", description: "Por favor, selecione uma categoria para o produto.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.price),
        category_id: formData.category_id,
        status: formData.status,
        featured: formData.featured,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        images: formData.images.split(',').map(img => img.trim()).filter(Boolean),
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      };

      let savedProduct;
      if (editingProduct) {
        savedProduct = await updateProduct(editingProduct.id, productData);
        toast({
          title: "Produto atualizado!",
          description: "O produto foi atualizado com sucesso."
        });
      } else {
        savedProduct = await createProduct(productData);
        toast({
          title: "Produto criado!",
          description: "O produto foi criado com sucesso."
        });
      }

      // Salvar atributos do produto se houver
      if (savedProduct && Object.keys(formData.attributes).length > 0) {
        for (const [attributeId, valueId] of Object.entries(formData.attributes)) {
          if (valueId) {
            await createProductAttributeVariation({
              product_id: savedProduct.id,
              attribute_id: attributeId,
              attribute_value_id: valueId,
            });
          }
        }
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar o produto:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o produto. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(productId);
        toast({
          title: "Produto excluído!",
          description: "O produto foi excluído com sucesso."
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir o produto.",
          variant: "destructive"
        });
      }
    }
  };

  if (productsLoading) {
    return <div className="flex justify-center p-8">Carregando produtos...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="attributes">Atributos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Edite as informações do produto.' : 'Adicione um novo produto ao catálogo.'}
                  </DialogDescription>
                </DialogHeader>
                
                <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Preço</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: 'ativo' | 'inativo') => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Seção de Atributos */}
                  {attributes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package2 className="h-4 w-4" />
                          Atributos do Produto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {attributes.map((attribute) => (
                          <div key={attribute.id}>
                            <Label htmlFor={`attribute-${attribute.id}`}>{attribute.name}</Label>
                            <Select
                              value={formData.attributes[attribute.id] || ""}
                              onValueChange={(value) => 
                                setFormData({
                                  ...formData,
                                  attributes: {
                                    ...formData.attributes,
                                    [attribute.id]: value
                                  }
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Selecione ${attribute.name.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhum</SelectItem>
                                {attribute.values.map((value) => (
                                  <SelectItem key={value.id} value={value.id}>
                                    {value.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  <div>
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="premium, especial, blend"
                    />
                  </div>

                  <div>
                    <Label htmlFor="images">Imagens do Produto</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Adicione até 5 imagens. A primeira será a imagem principal. Arraste e solte ou clique para selecionar.
                    </p>
                    <ImageUpload
                      images={formData.images ? formData.images.split(',').filter(img => img.trim()) : []}
                      onChange={(images) => setFormData({ ...formData, images: images.join(',') })}
                      maxImages={5}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="featured">Produto em destaque</Label>
                  </div>
                </form>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" form="product-form" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : (editingProduct ? 'Salvar' : 'Criar')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produtos ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Destaque</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category?.name || 'Sem categoria'}</TableCell>
                      <TableCell>{formatCurrency(product.base_price || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === 'ativo' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.featured && <Badge variant="outline">Sim</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attributes">
          <AttributesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}