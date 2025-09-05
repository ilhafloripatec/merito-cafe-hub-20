// 
import { useState, useMemo } from 'react';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useProductAttributes } from '@/hooks/useProductAttributes';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Search, Package2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { MultiSelectCombobox, Option } from '../ui/multi-select-combobox';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

export function ProductsManagement() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { attributes } = useProductAttributes();
  
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
    selectedAttributeValues: [] as string[]
  });

  const attributeOptions = useMemo((): Option[] => {
    return attributes.flatMap(attr => 
      attr.values.map(val => ({
        value: val.id,
        label: val.value,
        group: attr.name
      }))
    );
  }, [attributes]);

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
      selectedAttributeValues: []
    });
    setEditingProduct(null);
  };

  const handleOpenDialog = async (product?: Product) => {
    if (product) {
      setEditingProduct(product);

      // Buscar atributos associados ao produto
      const { data: associatedAttrs, error } = await supabase
        .from('product_attributes_values_products')
        .select('product_attribute_value_id')
        .eq('product_id', product.id);

      if (error) {
        toast({ title: "Erro", description: "Falha ao buscar atributos do produto.", variant: "destructive" });
      }

      const selectedAttributeValues = associatedAttrs?.map(a => a.product_attribute_value_id) || [];
      
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.base_price?.toString() || '',
        category_id: product.category_id || '',
        status: product.status || 'ativo',
        featured: product.featured || false,
        tags: product.tags?.join(', ') || '',
        images: product.images?.join(', ') || '',
        selectedAttributeValues
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const syncProductAttributes = async (productId: string, newAttributeValueIds: string[]) => {
    // 1. Buscar associações atuais
    const { data: currentLinks, error: fetchError } = await supabase
      .from('product_attributes_values_products')
      .select('product_attribute_value_id')
      .eq('product_id', productId);

    if (fetchError) throw fetchError;
    const currentAttributeValueIds = currentLinks.map(link => link.product_attribute_value_id);

    // 2. Determinar o que adicionar e remover
    const toAdd = newAttributeValueIds.filter(id => !currentAttributeValueIds.includes(id));
    const toRemove = currentAttributeValueIds.filter(id => !newAttributeValueIds.includes(id));

    // 3. Executar operações
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('product_attributes_values_products')
        .delete()
        .eq('product_id', productId)
        .in('product_attribute_value_id', toRemove);
      if (deleteError) throw deleteError;
    }

    if (toAdd.length > 0) {
      const linksToInsert = toAdd.map(valueId => ({
        product_id: productId,
        product_attribute_value_id: valueId,
      }));
      const { error: insertError } = await supabase
        .from('product_attributes_values_products')
        .insert(linksToInsert);
      if (insertError) throw insertError;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
        toast({ title: "Erro de Validação", description: "Selecione uma categoria.", variant: "destructive" });
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

      let savedProduct: Product | null = null;
      if (editingProduct) {
        const { data, error } = await updateProduct(editingProduct.id, productData);
        if (error) throw error;
        savedProduct = data;
      } else {
        const { data, error } = await createProduct(productData);
        if (error) throw error;
        savedProduct = data;
      }

      if (savedProduct) {
        await syncProductAttributes(savedProduct.id, formData.selectedAttributeValues);
        toast({ title: "Sucesso!", description: "Produto e atributos salvos com sucesso." });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({ title: "Erro", description: "Ocorreu um erro ao salvar o produto.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto? A ação não pode ser desfeita.')) {
      try {
        await deleteProduct(productId);
        toast({
          title: "Produto excluído!",
          description: "O produto foi removido com sucesso."
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

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}><Plus className="w-4 h-4 mr-2" />Novo Produto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              <DialogDescription>Preencha os detalhes do produto abaixo.</DialogDescription>
            </DialogHeader>
            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    {/* Campos Principais */}
                    <Card>
                        <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                             <div>
                                <Label htmlFor="price">Preço Base</Label>
                                <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                            </div>
                            <div>
                                <Label htmlFor="category">Categoria</Label>
                                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={formData.status} onValueChange={(value: 'ativo' | 'inativo') => setFormData({ ...formData, status: value })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ativo">Ativo</SelectItem>
                                        <SelectItem value="inativo">Inativo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })} />
                                <Label htmlFor="featured">Produto em destaque?</Label>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Atributos do Produto */}
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Package2 className="h-4 w-4" />Atributos</CardTitle></CardHeader>
                        <CardContent>
                            <MultiSelectCombobox
                                options={attributeOptions}
                                selectedValues={formData.selectedAttributeValues}
                                onChange={(selected) => setFormData({...formData, selectedAttributeValues: selected})}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                    {/* Descrição, Tags e Imagens */}
                    <Card>
                        <CardHeader><CardTitle>Detalhes Adicionais</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} />
                            </div>
                             <div>
                                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                                <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
                            </div>
                             <div>
                                <Label htmlFor="images">URLs das Imagens (separadas por vírgula)</Label>
                                <Textarea id="images" value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} rows={3} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" form="product-form" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
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
    </div>
  );
}

