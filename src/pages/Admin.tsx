
// import { useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { Navigate } from 'react-router-dom';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { ProductsManagement } from '@/components/admin/ProductsManagement';
// import { StockManagement } from '@/components/admin/StockManagement';
// import { OrdersManagement } from '@/components/admin/OrdersManagement';
// import { ContactsManagement } from '@/components/admin/ContactsManagement';
// import { Package, ShoppingCart, MessageSquare, BarChart3 } from 'lucide-react';

// export default function Admin() {
//   const { isAdmin, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (!isAdmin) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-primary mb-2">Painel Administrativo</h1>
//         <p className="text-muted-foreground">Gerencie produtos, estoque e pedidos</p>
//       </div>

//       <Tabs defaultValue="products" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="products" className="flex items-center gap-2">
//             <Package className="w-4 h-4" />
//             Produtos
//           </TabsTrigger>
//           <TabsTrigger value="stock" className="flex items-center gap-2">
//             <BarChart3 className="w-4 h-4" />
//             Estoque
//           </TabsTrigger>
//           <TabsTrigger value="orders" className="flex items-center gap-2">
//             <ShoppingCart className="w-4 h-4" />
//             Pedidos
//           </TabsTrigger>
//           <TabsTrigger value="contacts" className="flex items-center gap-2">
//             <MessageSquare className="w-4 h-4" />
//             Contatos
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="products">
//           <Card>
//             <CardHeader>
//               <CardTitle>Gestão de Produtos</CardTitle>
//               <CardDescription>
//                 Adicione, edite e gerencie todos os produtos da loja
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ProductsManagement />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="stock">
//           <Card>
//             <CardHeader>
//               <CardTitle>Controle de Estoque</CardTitle>
//               <CardDescription>
//                 Monitore e ajuste os níveis de estoque dos produtos
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <StockManagement />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="orders">
//           <Card>
//             <CardHeader>
//               <CardTitle>Gerenciamento de Pedidos</CardTitle>
//               <CardDescription>
//                 Visualize e gerencie todos os pedidos realizados
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <OrdersManagement />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="contacts">
//           <Card>
//             <CardHeader>
//               <CardTitle>Mensagens de Contato</CardTitle>
//               <CardDescription>
//                 Visualize e responda às mensagens dos clientes
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ContactsManagement />
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
// src/pages/Admin.tsx
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductsManagement } from '@/components/admin/ProductsManagement';
import { StockManagement } from '@/components/admin/StockManagement';
import { OrdersManagement } from '@/components/admin/OrdersManagement';
import { ContactsManagement } from '@/components/admin/ContactsManagement';
import { Package, ShoppingCart, MessageSquare, BarChart3 } from 'lucide-react';

export default function Admin() {
  const { isAdmin, loading } = useAuth();

  // 🔎 Log para debug
  console.log("🔐 [Admin.tsx] loading:", loading, "isAdmin:", isAdmin);

  // 1. Primeiro, lida com o estado de carregamento
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 2. Depois do carregamento, verifica se é admin
  if (!isAdmin) {
    console.warn("🚫 Usuário não autorizado acessando /admin");
    return <Navigate to="/login" replace />;
  }

  // 3. Se tudo estiver ok, renderiza a página de admin
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie produtos, estoque e pedidos</p>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Contatos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Produtos</CardTitle>
              <CardDescription>
                Adicione, edite e gerencie todos os produtos da loja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Estoque</CardTitle>
              <CardDescription>
                Monitore e ajuste os níveis de estoque dos produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StockManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Pedidos</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os pedidos realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens de Contato</CardTitle>
              <CardDescription>
                Visualize e responda às mensagens dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactsManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
