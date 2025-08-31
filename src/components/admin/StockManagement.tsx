
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, RotateCcw, AlertTriangle, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StockMovement {
  id: string;
  variation_id: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  previous_stock: number;
  current_stock: number;
  reason?: string;
  created_at: string;
}

export function StockManagement() {
  const { products, loading: productsLoading } = useProducts();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [movementData, setMovementData] = useState({
    type: 'entrada' as 'entrada' | 'saida' | 'ajuste',
    quantity: '',
    reason: ''
  });

  useEffect(() => {
    fetchStockMovements();
  }, []);

  const fetchStockMovements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Map the data to ensure proper types
      const mappedMovements: StockMovement[] = (data || []).map(movement => ({
        ...movement,
        type: movement.type as 'entrada' | 'saida' | 'ajuste'
      }));
      
      setMovements(mappedMovements);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar movimentações de estoque.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockMovement = async () => {
    if (!selectedVariation || !movementData.quantity) {
      toast({
        title: "Erro",
        description: "Selecione uma variação e informe a quantidade.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Get current stock
      const { data: variation, error: variationError } = await supabase
        .from('product_variations')
        .select('stock')
        .eq('id', selectedVariation)
        .single();

      if (variationError) throw variationError;

      const currentStock = variation.stock;
      const quantity = parseInt(movementData.quantity);
      let newStock = currentStock;

      switch (movementData.type) {
        case 'entrada':
          newStock = currentStock + quantity;
          break;
        case 'saida':
          newStock = Math.max(0, currentStock - quantity);
          break;
        case 'ajuste':
          newStock = quantity;
          break;
      }

      // Update stock
      const { error: updateError } = await supabase
        .from('product_variations')
        .update({ stock: newStock })
        .eq('id', selectedVariation);

      if (updateError) throw updateError;

      // Record movement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          variation_id: selectedVariation,
          type: movementData.type,
          quantity: quantity,
          previous_stock: currentStock,
          current_stock: newStock,
          reason: movementData.reason
        });

      if (movementError) throw movementError;

      toast({
        title: "Estoque atualizado!",
        description: "A movimentação foi registrada com sucesso."
      });

      setIsDialogOpen(false);
      setMovementData({ type: 'entrada', quantity: '', reason: '' });
      setSelectedVariation('');
      fetchStockMovements();

    } catch (error: any) {
      console.error('Error updating stock:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar estoque.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Sem estoque', variant: 'destructive' as const };
    if (stock <= minStock) return { label: 'Estoque baixo', variant: 'secondary' as const };
    return { label: 'Disponível', variant: 'default' as const };
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada': return <Plus className="w-4 h-4 text-green-600" />;
      case 'saida': return <Minus className="w-4 h-4 text-red-600" />;
      case 'ajuste': return <RotateCcw className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'entrada': return 'Entrada';
      case 'saida': return 'Saída';
      case 'ajuste': return 'Ajuste';
      default: return type;
    }
  };

  if (productsLoading) {
    return <div className="flex justify-center p-8">Carregando produtos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Controle de Estoque</h2>
          <p className="text-muted-foreground">Gerencie o estoque dos produtos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Package className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Movimentação de Estoque</DialogTitle>
              <DialogDescription>
                Registre entrada, saída ou ajuste de estoque
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Produto/Variação</label>
                <Select value={selectedVariation} onValueChange={setSelectedVariation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => 
                      product.variations.map(variation => (
                        <SelectItem key={variation.id} value={variation.id}>
                          {product.name} - {variation.weight} (Estoque: {variation.stock})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={movementData.type} onValueChange={(value: 'entrada' | 'saida' | 'ajuste') => setMovementData({...movementData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                      <SelectItem value="ajuste">Ajuste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Quantidade</label>
                  <Input
                    type="number"
                    value={movementData.quantity}
                    onChange={(e) => setMovementData({...movementData, quantity: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Motivo</label>
                <Input
                  value={movementData.reason}
                  onChange={(e) => setMovementData({...movementData, reason: e.target.value})}
                  placeholder="Descreva o motivo da movimentação"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleStockMovement} disabled={loading}>
                {loading ? 'Processando...' : 'Registrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral do Estoque</CardTitle>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product =>
                product.variations.map(variation => {
                  const status = getStockStatus(variation.stock, variation.min_stock);
                  return (
                    <TableRow key={variation.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{variation.weight}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {variation.stock <= variation.min_stock && (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                          {variation.stock}
                        </div>
                      </TableCell>
                      <TableCell>{variation.min_stock}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Estoque Anterior</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMovementIcon(movement.type)}
                      {getMovementLabel(movement.type)}
                    </div>
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{movement.previous_stock}</TableCell>
                  <TableCell>{movement.current_stock}</TableCell>
                  <TableCell>{movement.reason || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {movements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma movimentação encontrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
