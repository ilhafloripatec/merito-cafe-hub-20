import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from './cors.ts';

// O Deno (ambiente das Edge Functions) usa importações de URL
// Adicione 'resend' ao seu arquivo import_map.json se ainda não estiver lá
// senão, use a URL completa como abaixo
import { Resend } from 'npm:resend';

// Função para formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

serve(async (req) => {
  // Tratamento para requisição pre-flight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderData, items, formData } = await req.json();
    
    // Pegue a chave da API do Resend das variáveis de ambiente do seu projeto Supabase
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Construir a lista de itens para o e-mail
    const itemsHtml = items.map((item: any) => {
      const price = item.variation ? item.variation.price : item.product.price;
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${item.product.name}
            ${item.variation ? `<br><small>${item.variation.weight}</small>` : ''}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(price * item.quantity)}</td>
        </tr>
      `;
    }).join('');
    
    // Template do E-mail
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Olá, ${formData.name}!</h2>
        <p>Seu pedido <strong>#${orderData.order_number}</strong> foi recebido e está em análise.</p>
        <p>Enviaremos uma nova notificação assim que ele for confirmado e enviado. Obrigado por comprar na Mérito Cafés Especiais!</p>
        
        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Resumo do Pedido</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Produto</th>
              <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Qtd.</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px;">
            <p>Subtotal: <strong>${formatCurrency(orderData.subtotal)}</strong></p>
            <p>Frete: <strong>${formatCurrency(orderData.shipping)}</strong></p>
            <p style="font-size: 1.2em;">Total: <strong>${formatCurrency(orderData.total)}</strong></p>
        </div>

        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px;">Endereço de Entrega</h3>
        <p>
            ${formData.street}, ${formData.number}<br>
            ${formData.complement ? `${formData.complement}<br>` : ''}
            ${formData.neighborhood}, ${formData.city} - ${formData.state}<br>
            CEP: ${formData.zipCode}
        </p>

        <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
            Se tiver alguma dúvida, responda a este e-mail.
        </p>
      </div>
    `;

    // Enviar o e-mail
    await resend.emails.send({
      from: 'seu-email@seudominio.com', // TROCAR: Use um e-mail de um domínio verificado no Resend
      to: formData.email,
      subject: `Confirmação do Pedido #${orderData.order_number}`,
      html: emailHtml,
    });

    return new Response(JSON.stringify({ message: 'Email enviado com sucesso!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
