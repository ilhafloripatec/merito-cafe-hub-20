
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Plus, Minus, Search, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProductVariation {
  id: string;
  weight: string;
  price: number;
  stock: number;
  min_stock: number;
  product_id: string;
  products?: {
    name: string;
  };
}

interface StockMovementData {
  id: string;
  variation_id: string;
  type: 'entrada' | 'saida' | 'venda' | 'perda' | 'ajuste';
  quantity: number;
  previous_stock: number;
  current_stock: number;
  reason: string;
  created_at: string;
}

export function StockManagement() {
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [movements, setMovements] = useState<StockMovementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [movementForm, setMovementForm] = useState({
    type: '',
    quantity: '',
    reason: ''
  });

  useEffect(() => {
    fetchVariations();
    fetchMovements();
  }, []);

  const fetchVariations = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select(`
          *,
          products(name)
        `)
        .order('stock', { ascending: true });

      if (error) throw error;
      setVariations(data || []);
    } catch (error) {
      console.error('Error fetching variations:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar variações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  };

  const handleStockUpdate = async () => {
    if (!selectedVariation || !movementForm.type || !movementForm.quantity) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const quantity = parseInt(movementForm.quantity);
      let newStock = selectedVariation.stock;

      if (movementForm.type === 'entrada') {
        newStock += quantity;
      } else {
        newStock -= quantity;
      }

      if (newStock < 0) {
        toast({
          title: "Erro",
          description: "Estoque não pode ficar negativo.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar estoque
      const { error: updateError } = await supabase
        .from('product_variations')
        .update({ stock: newStock })
        .eq('id', selectedVariation.id);

      if (updateError) throw updateError;

      // Registrar movimento
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          variation_id: selectedVariation.id,
          type: movementForm.type as 'entrada' | 'saida' | 'ajuste',
          quantity,
          previous_stock: selectedVariation.stock,
          current_stock: newStock,
          reason: movementForm.reason || `Movimentação de ${movementForm.type}`
        });

      if (movementError) throw movementError;

      // Atualizar estado local
      setVariations(variations.map(v => 
        v.id === selectedVariation.id ? { ...v, stock: newStock } : v
      ));

      toast({
        title: "Estoque atualizado",
        description: "Movimentação registrada com sucesso."
      });

      setIsDialogOpen(false);
      setMovementForm({ type: '', quantity: '', reason: '' });
      fetchMovements();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar estoque.",
        variant: "destructive"
      });
    }
  };

  const filteredVariations = variations.filter(variation =>
    variation.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variation.weight.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockVariations = variations.filter(v => v.stock <= v.min_stock);

  if (loading) {
    return <div className="flex justify-center p-8">Carregando estoque...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Alertas de Estoque Baixo */}
      {lowStockVariations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Estoque Baixo ({lowStockVariations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockVariations.map(variation => (
                <div key={variation.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="font-medium">
                    {variation.products?.name} - {variation.weight}
                  </span>
                  <Badge variant="destructive">
                    {variation.stock} unidades
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles */}
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
      </div>

      {/* Tabela de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Controle de Estoque ({filteredVariations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Variação</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVariations.map((variation) => (
                <TableRow key={variation.id}>
                  <TableCell className="font-medium">
                    {variation.products?.name}
                  </TableCell>
                  <TableCell>{variation.weight}</TableCell>
                  <TableCell>
                    <span className={variation.stock <= variation.min_stock ? 'text-red-600 font-semibold' : ''}>
                      {variation.stock}
                    </span>
                  </TableCell>
                  <TableCell>{variation.min_stock}</TableCell>
                  <TableCell>
                    <Badge variant={variation.stock <= variation.min_stock ? 'destructive' : 'default'}>
                      {variation.stock <= variation.min_stock ? 'Estoque Baixo' : 'Normal'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedVariation(variation)}
                        >
                          Movimentar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Movimentar Estoque - {selectedVariation?.products?.name} ({selectedVariation?.weight})
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Estoque Atual: {selectedVariation?.stock} unidades</Label>
                          </div>
                          <div>
                            <Label htmlFor="type">Tipo de Movimento</Label>
                            <Select value={movementForm.type} onValueChange={(value) => setMovementForm({...movementForm, type: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="entrada">Entrada</SelectItem>
                                <SelectItem value="saida">Saída</SelectItem>
                                <SelectItem value="ajuste">Ajuste</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="quantity">Quantidade</Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={movementForm.quantity}
                              onChange={(e) => setMovementForm({...movementForm, quantity: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reason">Motivo</Label>
                            <Input
                              id="reason"
                              value={movementForm.reason}
                              onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})}
                              placeholder="Descreva o motivo da movimentação"
                            />
                          </div>
                          <Button onClick={handleStockUpdate} className="w-full">
                            Confirmar Movimentação
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredVariations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma variação encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
