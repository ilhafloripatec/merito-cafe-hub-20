import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface OrderItem {
  id: string;
  product_id: string;
  variation_id: string;
  quantity: number;
  unit_price: number;
  grind_type: string;
  product: {
    name: string;
    images: string[];
  };
  variation: {
    weight: string;
  };
}

interface OrderDetailsDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: any;
}

export function OrderDetailsDialog({ orderId, open, onOpenChange, order }: OrderDetailsDialogProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId && open) {
      fetchOrderItems();
    }
  }, [orderId, open]);

  const fetchOrderItems = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(name, images),
          variation:product_variations(weight)
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar itens do pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'secondary';
      case 'confirmado': return 'default';
      case 'enviado': return 'outline';
      case 'entregue': return 'default';
      case 'cancelado': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'confirmado': return 'Confirmado';
      case 'enviado': return 'Enviado';
      case 'entregue': return 'Entregue';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido #{order.order_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Pedido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Informações Gerais</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Cliente:</span> {order.customer_name}</p>
                <p><span className="font-medium">Data:</span> {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </p>
                <p><span className="font-medium">Pagamento:</span> {order.payment_method || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Valores</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Subtotal:</span> {formatCurrency(order.subtotal)}</p>
                <p><span className="font-medium">Frete:</span> {formatCurrency(order.shipping || 0)}</p>
                <p className="font-semibold text-lg">
                  <span>Total:</span> {formatCurrency(order.total)}
                </p>
              </div>
            </div>
          </div>

          {/* Endereço de Entrega */}
          {order.shipping_address && (
            <div>
              <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p>{order.shipping_address.street}, {order.shipping_address.number}</p>
                {order.shipping_address.complement && <p>{order.shipping_address.complement}</p>}
                <p>{order.shipping_address.neighborhood}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                <p>CEP: {order.shipping_address.zip_code}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Itens do Pedido */}
          <div>
            <h3 className="font-semibold mb-4">Itens do Pedido</h3>
            {loading ? (
              <div className="text-center py-4">Carregando itens...</div>
            ) : orderItems.length > 0 ? (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product?.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product?.name}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Peso: {item.variation?.weight}</p>
                        {item.grind_type && <p>Moagem: {item.grind_type}</p>}
                        <p>Quantidade: {item.quantity}x</p>
                        <p>Preço unitário: {formatCurrency(item.unit_price)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum item encontrado.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}