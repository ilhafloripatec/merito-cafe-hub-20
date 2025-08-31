
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
    paymentMethod: 'pix'
  });

  const shippingFee = 15.00;
  const subtotal = getTotal();
  const total = subtotal + shippingFee;

  // Redirecionar apenas se não houver itens no carrinho
  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrinho');
    }
  }, [items.length, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'street', 'number', 'neighborhood', 'city', 'state', 'zipCode'];
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Erro no formulário",
          description: `Campo ${field === 'name' ? 'nome' : field === 'email' ? 'email' : field === 'phone' ? 'telefone' : field === 'street' ? 'rua' : field === 'number' ? 'número' : field === 'neighborhood' ? 'bairro' : field === 'city' ? 'cidade' : field === 'state' ? 'estado' : 'CEP'} é obrigatório.`,
          variant: "destructive"
        });
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Erro no formulário",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `MRT${timestamp}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Iniciando checkout...');
    console.log('Itens no carrinho:', items);
    console.log('Dados do formulário:', formData);
    
    if (!validateForm()) {
      console.log('Validação do formulário falhou');
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Não há itens no carrinho para finalizar o pedido.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const orderNumber = generateOrderNumber();
      console.log('Número do pedido gerado:', orderNumber);
      
      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user?.id || null,
          status: 'pendente',
          subtotal: subtotal,
          shipping: shippingFee,
          total: total,
          payment_method: formData.paymentMethod,
          shipping_address: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            street: formData.street,
            number: formData.number,
            complement: formData.complement,
            neighborhood: formData.neighborhood,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode
          }
        })
        .select()
        .single();

      if (orderError) {
        console.error('Erro ao criar pedido:', orderError);
        throw orderError;
      }

      console.log('Pedido criado com sucesso:', order);

      // Criar itens do pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variation_id: item.variationId || null,
        quantity: item.quantity,
        unit_price: item.variation ? item.variation.price : item.product.price,
        grind_type: null
      }));

      console.log('Itens do pedido a serem criados:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Erro ao criar itens do pedido:', itemsError);
        throw itemsError;
      }

      console.log('Itens do pedido criados com sucesso');

      // Mostrar sucesso
      toast({
        title: "Pedido realizado com sucesso!",
        description: `Pedido #${orderNumber} foi criado. Você receberá detalhes por email.`
      });

      // Limpar carrinho
      clearCart();
      
      // Aguardar um pouco e redirecionar
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao finalizar pedido",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Se não há itens, não renderizar nada (o useEffect vai redirecionar)
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Finalizar Pedido</h1>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome Completo *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefone *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">CEP *</label>
                    <Input
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Rua *</label>
                      <Input
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        placeholder="Nome da rua"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Número *</label>
                      <Input
                        value={formData.number}
                        onChange={(e) => handleInputChange('number', e.target.value)}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Complemento</label>
                    <Input
                      value={formData.complement}
                      onChange={(e) => handleInputChange('complement', e.target.value)}
                      placeholder="Apartamento, bloco, etc"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Bairro *</label>
                      <Input
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                        placeholder="Nome do bairro"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cidade *</label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Nome da cidade"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Estado *</label>
                      <Input
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="RS"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                      <SelectItem value="boleto">Boleto Bancário</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const price = item.variation ? item.variation.price : item.product.price;
                  return (
                    <div key={`${item.productId}-${item.variationId}`} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        {item.variation && (
                          <p className="text-muted-foreground">{item.variation.name} - {item.variation.weight}</p>
                        )}
                        <p className="text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span>{formatCurrency(shippingFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Processando...' : 'Finalizar Pedido'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
