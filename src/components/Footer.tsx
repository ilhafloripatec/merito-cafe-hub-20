import { Link } from 'react-router-dom';
import { Instagram, MapPin, Clock } from 'lucide-react';
import MeritoLogo from '@/assets/merito-logo.jpg';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={MeritoLogo} 
                alt="Mérito Cafés Especiais" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-playfair font-bold text-xl">
                MÉRITO CAFÉS ESPECIAIS
              </span>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Torrefação e comercialização de cafés especiais. 
              Você merece um café especial!
            </p>
            <div className="flex items-center space-x-2 text-primary-foreground/60">
              <MapPin className="h-4 w-4" />
              <span>Lajeado, RS - Brasil</span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>
                <Link to="/produtos" className="hover:text-accent transition-colors">
                  Produtos
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-accent transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-accent transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/termos" className="hover:text-accent transition-colors">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-primary-foreground/80">
                <Clock className="h-4 w-4" />
                <div>
                  <p className="text-sm">Seg a Sex: 8h às 18h</p>
                  <p className="text-sm">Sábado: 8h às 12h</p>
                </div>
              </div>
              <a 
                href="https://www.instagram.com/merito.cafesespeciais/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-foreground/80 hover:text-accent transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span>@merito.cafesespeciais</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p className="text-sm">
            © 2025 Mérito Cafés Especiais. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}