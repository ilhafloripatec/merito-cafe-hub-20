
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ShoppingBag, CreditCard, MapPin, User } from 'lucide-react';

interface CheckoutForm {
  // Dados pessoais
  name: string;
  email: string;
  phone: string;
  // Endereço
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  // Pagamento
  paymentMethod: string;
}

export default function Checkout() {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    name: '',
    email: user?.email || '',
    phone: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: ''
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrinho');
    }
  }, [items, navigate]);

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const generateOrderNumber = () => {
    return `PED${Date.now().toString().slice(-8)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.phone || !form.street || !form.number || 
        !form.neighborhood || !form.city || !form.state || !form.zipCode || !form.paymentMethod) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const orderNumber = generateOrderNumber();
      const subtotal = getTotal();
      const shipping = 15; // Taxa de frete fixa
      const total = subtotal + shipping;

      // Criar o pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          order_number: orderNumber,
          status: 'pendente',
          subtotal,
          shipping,
          total,
          payment_method: form.paymentMethod,
          shipping_address: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            street: form.street,
            number: form.number,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
            zipCode: form.zipCode
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar os itens do pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variation_id: item.variationId || null,
        quantity: item.quantity,
        unit_price: item.variation ? item.variation.price : item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Limpar carrinho
      clearCart();

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${orderNumber} foi criado. Você receberá um e-mail com os detalhes.`,
      });

      navigate('/');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar o pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    value={form.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="00000-000"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      value={form.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={form.number}
                      onChange={(e) => handleInputChange('number', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={form.complement}
                    onChange={(e) => handleInputChange('complement', e.target.value)}
                    placeholder="Apartamento, bloco, etc."
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={form.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Select value={form.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        <SelectItem value="PR">Paraná</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forma de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={form.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                    <SelectItem value="boleto">Boleto Bancário</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Resumo do Pedido */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => {
                  const price = item.variation ? item.variation.price : item.product.price;
                  return (
                    <div key={`${item.productId}-${item.variationId}`} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        {item.variation && (
                          <p className="text-xs text-muted-foreground">{item.variation.weight}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>{formatCurrency(15)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(getTotal() + 15)}</span>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Finalizar Pedido'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
