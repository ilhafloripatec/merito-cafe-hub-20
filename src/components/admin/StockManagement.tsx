
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Package, Plus, Minus, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StockItem {
  id: string;
  product_name: string;
  variation_weight: string;
  current_stock: number;
  min_stock: number;
  price: number;
}

interface StockMovement {
  id: string;
  variation_id: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  previous_stock: number;
  current_stock: number;
  reason: string;
  created_at: string;
}

export function StockManagement() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<StockItem | null>(null);
  const [movementData, setMovementData] = useState({
    type: 'entrada' as 'entrada' | 'saida' | 'ajuste',
    quantity: '',
    reason: ''
  });

  useEffect(() => {
    fetchStockData();
    fetchStockMovements();
  }, []);

  const fetchStockData = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variations')
        .select(`
          id,
          weight,
          stock,
          min_stock,
          price,
          products!inner(name)
        `)
        .order('stock', { ascending: true });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        product_name: item.products.name,
        variation_weight: item.weight,
        current_stock: item.stock,
        min_stock: item.min_stock,
        price: item.price
      })) || [];

      setStockItems(formattedData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de estoque.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setStockMovements(data || []);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    }
  };

  const handleStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVariation) return;

    try {
      const quantity = parseInt(movementData.quantity);
      let newStock = selectedVariation.current_stock;

      if (movementData.type === 'entrada') {
        newStock += quantity;
      } else if (movementData.type === 'saida') {
        newStock -= quantity;
      } else {
        newStock = quantity; // ajuste direto
      }

      if (newStock < 0) {
        toast({
          title: "Erro",
          description: "O estoque não pode ser negativo.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar o estoque
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
          type: movementData.type,
          quantity: quantity,
          previous_stock: selectedVariation.current_stock,
          current_stock: newStock,
          reason: movementData.reason
        });

      if (movementError) throw movementError;

      toast({
        title: "Sucesso",
        description: "Movimento de estoque registrado com sucesso."
      });

      setIsDialogOpen(false);
      setMovementData({ type: 'entrada', quantity: '', reason: '' });
      setSelectedVariation(null);
      
      // Recarregar dados
      fetchStockData();
      fetchStockMovements();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar estoque.",
        variant: "destructive"
      });
    }
  };

  const filteredItems = stockItems.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.variation_weight.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = stockItems.filter(item => item.current_stock <= item.min_stock);

  if (loading) {
    return <div className="flex justify-center p-8">Carregando dados de estoque...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Alertas de estoque baixo */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Estoque Baixo ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="font-medium">{item.product_name} - {item.variation_weight}</span>
                  <Badge variant="destructive">
                    {item.current_stock} restantes
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Controle de Estoque
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
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell>{item.variation_weight}</TableCell>
                  <TableCell>{item.current_stock}</TableCell>
                  <TableCell>{item.min_stock}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        item.current_stock === 0 
                          ? 'destructive' 
                          : item.current_stock <= item.min_stock 
                            ? 'secondary' 
                            : 'default'
                      }
                    >
                      {item.current_stock === 0 
                        ? 'Esgotado' 
                        : item.current_stock <= item.min_stock 
                          ? 'Baixo' 
                          : 'Normal'
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={isDialogOpen && selectedVariation?.id === item.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) setSelectedVariation(item);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Ajustar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Movimento de Estoque</DialogTitle>
                          <DialogDescription>
                            Registrar entrada, saída ou ajuste para {item.product_name} - {item.variation_weight}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleStockMovement} className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Tipo de Movimento</label>
                            <Select 
                              value={movementData.type} 
                              onValueChange={(value: 'entrada' | 'saida' | 'ajuste') => setMovementData({ ...movementData, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="entrada">
                                  <div className="flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-green-500" />
                                    Entrada
                                  </div>
                                </SelectItem>
                                <SelectItem value="saida">
                                  <div className="flex items-center gap-2">
                                    <Minus className="w-4 h-4 text-red-500" />
                                    Saída
                                  </div>
                                </SelectItem>
                                <SelectItem value="ajuste">Ajuste Manual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Quantidade</label>
                            <Input
                              type="number"
                              value={movementData.quantity}
                              onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value })}
                              required
                              min="1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Estoque atual: {selectedVariation?.current_stock}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Motivo</label>
                            <Input
                              value={movementData.reason}
                              onChange={(e) => setMovementData({ ...movementData, reason: e.target.value })}
                              placeholder="Ex: Reposição, Venda, Correção"
                              required
                            />
                          </div>

                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit">
                              Registrar Movimento
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Histórico de movimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Movimentações</CardTitle>
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
              {stockMovements.slice(0, 10).map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        movement.type === 'entrada' ? 'default' : 
                        movement.type === 'saida' ? 'destructive' : 'secondary'
                      }
                    >
                      {movement.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{movement.previous_stock}</TableCell>
                  <TableCell>{movement.current_stock}</TableCell>
                  <TableCell>{movement.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
