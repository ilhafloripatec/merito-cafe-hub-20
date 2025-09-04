import { Link } from 'react-router-dom';
import { Coffee, Star, Truck, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SupabaseProductCard } from '@/components/SupabaseProductCard';
import { useProducts } from '@/hooks/useProducts';
import MeritoLogo from '@/assets/merito-logo.jpg';

export default function Home() {
  const { products, loading } = useProducts();
  const featuredProducts = products?.filter(product => product.featured && product.status === 'ativo').slice(0, 3) || [];

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center coffee-pattern">
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="container mx-auto px-4 relative z-10 text-center py-20">
          <div className="animate-fade-in">
            <h1 className="font-playfair font-bold text-5xl md:text-7xl text-primary-foreground mb-6">
              MÉRITO
              <br />
              <span className="text-3xl md:text-5xl text-cream">CAFÉS ESPECIAIS</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8 text-primary-foreground">
              <p className="flex items-center gap-2 text-lg">
                <Coffee className="w-6 h-6 animate-pulse" />
                Você merece um café especial!
              </p>
            </div>
            <p className="text-primary-foreground/90 mb-2 text-lg">
              Torrefação e comercialização de cafés especiais
            </p>
            <p className="text-primary-foreground/70 mb-8 flex items-center justify-center gap-2">
              <i className="ri-map-pin-line"></i> Lajeado, RS 🇧🇷
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/produtos">
                  <Star className="w-5 h-5 mr-2" />
                  Ver Produtos
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                <a href="https://www.instagram.com/merito.cafesespeciais/" target="_blank">
                  <i className="ri-instagram-line mr-2"></i>
                  Siga no Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-primary-foreground animate-bounce">
          <ArrowRight className="w-6 h-6 rotate-90" />
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-primary mb-6">
                Nossa História
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                A Mérito Cafés Especiais nasceu da paixão por entregar experiências únicas através de cada xícara. 
                Localizada em Lajeado, RS, nossa torrefação artesanal busca realçar os melhores sabores e aromas 
                de grãos cuidadosamente selecionados.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Acreditamos que cada pessoa merece desfrutar de um café excepcional, e é por isso que nos dedicamos 
                a oferecer apenas o melhor, desde a origem até a sua mesa.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center p-4 bg-secondary">
                  <CardContent className="p-0">
                    <i className="ri-plant-line text-3xl text-accent mb-2 block"></i>
                    <h3 className="font-semibold text-primary">Origem Selecionada</h3>
                  </CardContent>
                </Card>
                <Card className="text-center p-4 bg-secondary">
                  <CardContent className="p-0">
                    <i className="ri-fire-line text-3xl text-accent mb-2 block"></i>
                    <h3 className="font-semibold text-primary">Torra Artesanal</h3>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="relative">
              <img 
                src={MeritoLogo} 
                alt="Mérito Cafés Especiais" 
                className="rounded-2xl shadow-2xl w-full aspect-square object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground p-6 rounded-xl shadow-lg">
                <p className="font-playfair text-2xl font-bold">100%</p>
                <p className="text-sm">Especial</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-primary mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada blend é cuidadosamente desenvolvido para proporcionar uma experiência sensorial única
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <SupabaseProductCard key={product.id} product={product} featured />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-muted-foreground">Nenhum produto em destaque encontrado.</p>
              </div>
            )}
          </div>
          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/produtos">
                Ver Todos os Produtos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-primary mb-4">
              Por que escolher a Mérito?
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <CardContent className="p-0">
                <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-primary mb-2">Qualidade Premium</h3>
                <p className="text-muted-foreground text-sm">
                  Grãos selecionados e torra artesanal para garantir a melhor experiência
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="p-0">
                <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-primary mb-2">Entrega Rápida</h3>
                <p className="text-muted-foreground text-sm">
                  Enviamos para todo o Brasil com opções de frete expresso
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="p-0">
                <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-primary mb-2">Compra Segura</h3>
                <p className="text-muted-foreground text-sm">
                  Pagamento seguro e atendimento personalizado
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="p-0">
                <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-primary mb-2">Satisfação Garantida</h3>
                <p className="text-muted-foreground text-sm">
                  Se não ficar satisfeito, devolvemos seu dinheiro
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-playfair text-4xl font-bold mb-4">
            Pronto para experimentar?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Descubra por que nossos clientes escolhem a Mérito para seus momentos especiais.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link to="/produtos">
              Explorar Produtos
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}