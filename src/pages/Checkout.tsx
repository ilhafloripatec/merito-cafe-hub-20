import React, { useState } from 'react';
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    console.log('[Checkout LOG] Executando validação do formulário...');
    const requiredFields = {
        name: 'Nome Completo',
        email: 'Email',
        phone: 'Telefone',
        street: 'Rua',
        number: 'Número',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado',
        zipCode: 'CEP'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field as keyof typeof formData]) {
            console.log(`[Checkout LOG] Falha na validação: Campo '${label}' está vazio.`);
            toast({
                title: "Campo obrigatório",
                description: `O campo "${label}" precisa ser preenchido.`,
                variant: "destructive"
            });
            return false;
        }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.log('[Checkout LOG] Falha na validação: Email inválido.');
      toast({
        title: "Erro no formulário",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return false;
    }

    console.log('[Checkout LOG] Validação do formulário passou.');
    return true;
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `MRT${timestamp}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Checkout LOG] Botão Finalizar Pedido clicado. Iniciando handleSubmit.');
    
    if (!validateForm()) {
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de finalizar o pedido.",
        variant: "destructive"
      });
      navigate('/produtos');
      return;
    }
    
    console.log('[Checkout LOG] Mudando estado para loading: true');
    setLoading(true);
    
    try {
      console.log('[Checkout LOG] Entrando no bloco TRY para criar o pedido.');
      const orderNumber = generateOrderNumber();
      console.log('[Checkout LOG] Número do pedido gerado:', orderNumber);
      
      const orderPayload = {
        order_number: orderNumber,
        user_id: user?.id || null,
        status: 'pendente' as const,
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
      };

      console.log('[Checkout LOG] Payload do pedido pronto:', orderPayload);
      console.log('[Checkout LOG] ---> FAZENDO CHAMADA PARA SUPABASE: Inserir em "orders"...');
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      if (orderError) {
        console.error('[Checkout LOG] Erro ao inserir na tabela "orders":', orderError);
        throw orderError;
      }

      console.log('[Checkout LOG] Pedido criado com sucesso na tabela "orders":', order);

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variation_id: item.variationId || null,
        quantity: item.quantity,
        unit_price: item.variation ? item.variation.price : item.product.price,
        grind_type: null
      }));
      
      console.log('[Checkout LOG] Itens do pedido prontos para inserir:', orderItems);
      console.log('[Checkout LOG] ---> FAZENDO CHAMADA PARA SUPABASE: Inserir em "order_items"...');
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('[Checkout LOG] Erro ao inserir na tabela "order_items":', itemsError);
        throw itemsError;
      }
      
      console.log('[Checkout LOG] Itens do pedido criados com sucesso.');

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${orderNumber} foi criado.`
      });

      clearCart();
      
      setTimeout(() => navigate('/'), 2000);
      
    } catch (error: any) {
      console.error('[Checkout LOG] Erro capturado no bloco CATCH:', error);
      toast({
        title: "Erro ao finalizar pedido",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      console.log('[Checkout LOG] Entrando no bloco FINALLY. Mudando estado para loading: false');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold">Seu carrinho está vazio.</h1>
            <p className="text-muted-foreground">Continue comprando para finalizar o pedido.</p>
            <Button onClick={() => navigate('/produtos')} className="mt-4">Ver produtos</Button>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Finalizar Pedido</h1>
        
        {/* A tag <form> agora envolve toda a grade */}
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          {/* Coluna do Formulário */}
          <div className="lg:col-span-2 space-y-6">
              {/* Dados Pessoais */}
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

              {/* Endereço de Entrega */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* ... campos de endereço ... */}
                  <div>
                    <label className="text-sm font-medium">CEP *</label>
                    <Input value={formData.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} placeholder="00000-000" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Rua *</label>
                      <Input value={formData.street} onChange={(e) => handleInputChange('street', e.target.value)} placeholder="Nome da rua" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Número *</label>
                      <Input value={formData.number} onChange={(e) => handleInputChange('number', e.target.value)} placeholder="123" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Complemento</label>
                    <Input value={formData.complement} onChange={(e) => handleInputChange('complement', e.target.value)} placeholder="Apartamento, bloco, etc" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Bairro *</label>
                      <Input value={formData.neighborhood} onChange={(e) => handleInputChange('neighborhood', e.target.value)} placeholder="Nome do bairro" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cidade *</label>
                      <Input value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} placeholder="Nome da cidade" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Estado *</label>
                      <Input value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} placeholder="RS" required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Forma de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                      <SelectItem value="boleto">Boleto Bancário</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
          </div>

          {/* Coluna do Resumo do Pedido */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ... itens do resumo ... */}
                {items.map((item) => {
                    const price = item.variation ? item.variation.price : item.product.price;
                    return (
                        <div key={`${item.productId}-${item.variationId}`} className="flex justify-between text-sm">
                            <div className="flex-1">
                                <p className="font-medium">{item.product.name}</p>
                                {item.variation && <p className="text-muted-foreground">{item.variation.weight}</p>}
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
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Frete</span><span>{formatCurrency(shippingFee)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatCurrency(total)}</span></div>
                </div>

                {/* Este botão agora é do tipo "submit" e está dentro do formulário */}
                <Button 
                  type="submit"
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Finalizar Pedido'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}