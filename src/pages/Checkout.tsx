
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

  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
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
      
      // Verificar se o usuário está autenticado
      console.log('[Checkout LOG] Verificando autenticação. User ID:', user?.id || 'Usuário não autenticado');
      
      const orderPayload = {
        order_number: orderNumber,
        user_id: user?.id || null,
        status: 'pendente' as const,
        subtotal: Number(subtotal.toFixed(2)),
        shipping: Number(shippingFee.toFixed(2)),
        total: Number(total.toFixed(2)),
        payment_method: formData.paymentMethod,
        shipping_address: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          street: formData.street,
          number: formData.number,
          complement: formData.complement || '',
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode
        }
      };

      console.log('[Checkout LOG] Payload do pedido preparado:', JSON.stringify(orderPayload, null, 2));
      console.log('[Checkout LOG] ---> FAZENDO CHAMADA PARA SUPABASE: Inserir em "orders"...');
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select()
        .single();

      console.log('[Checkout LOG] Resposta do Supabase para inserção do pedido:');
      console.log('[Checkout LOG] - Data:', order);
      console.log('[Checkout LOG] - Error:', orderError);

      if (orderError) {
        console.error('[Checkout LOG] ERRO DETALHADO ao inserir na tabela "orders":', {
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
          code: orderError.code
        });
        throw new Error(`Erro ao criar pedido: ${orderError.message}`);
      }

      if (!order) {
        console.error('[Checkout LOG] ERRO: Pedido não foi retornado após inserção');
        throw new Error('Pedido não foi criado corretamente');
      }

      console.log('[Checkout LOG] ✅ Pedido criado com sucesso na tabela "orders":', order);

      // Verificar se temos produtos válidos antes de tentar inserir os itens
      const validItems = items.filter(item => {
        const hasValidProductId = item.productId && isValidUUID(item.productId);
        const hasValidVariationId = !item.variationId || isValidUUID(item.variationId);
        
        console.log('[Checkout LOG] Verificando item:', {
          productId: item.productId,
          variationId: item.variationId,
          hasValidProductId,
          hasValidVariationId
        });
        
        return hasValidProductId && hasValidVariationId;
      });

      if (validItems.length === 0) {
        console.error('[Checkout LOG] ERRO: Nenhum item válido encontrado no carrinho');
        throw new Error('Os produtos no carrinho não possuem IDs válidos. Por favor, remova os itens e adicione novamente.');
      }

      // Preparar itens do pedido apenas com IDs válidos
      const orderItems = validItems.map(item => {
        const itemData = {
          order_id: order.id,
          product_id: item.productId,
          variation_id: item.variationId || null,
          quantity: item.quantity,
          unit_price: Number((item.variation ? item.variation.price : item.product.price).toFixed(2)),
          grind_type: null
        };
        console.log('[Checkout LOG] Item preparado:', itemData);
        return itemData;
      });
      
      console.log('[Checkout LOG] Total de itens válidos para inserir:', orderItems.length);
      console.log('[Checkout LOG] ---> FAZENDO CHAMADA PARA SUPABASE: Inserir em "order_items"...');
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      console.log('[Checkout LOG] Resposta do Supabase para inserção dos itens:');
      console.log('[Checkout LOG] - Data:', itemsData);
      console.log('[Checkout LOG] - Error:', itemsError);

      if (itemsError) {
        console.error('[Checkout LOG] ERRO DETALHADO ao inserir na tabela "order_items":', {
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint,
          code: itemsError.code
        });
        throw new Error(`Erro ao criar itens do pedido: ${itemsError.message}`);
      }
      
      console.log('[Checkout LOG] ✅ Itens do pedido criados com sucesso.');

      toast({
        title: "Pedido realizado com sucesso!",
        description: `Seu pedido #${orderNumber} foi criado e está sendo processado.`
      });

      console.log('[Checkout LOG] Limpando carrinho...');
      clearCart();
      
      console.log('[Checkout LOG] Redirecionando para home em 2 segundos...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      console.error('[Checkout LOG] ERRO CAPTURADO no bloco CATCH:', error);
      console.error('[Checkout LOG] Stack trace:', error.stack);
      
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
        
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
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
