
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Sobre a Mérito</h1>
          <p className="text-xl text-muted-foreground">
            Café de qualidade superior, torrado com paixão e dedicação
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Nossa História</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Fundada em 2020, a Mérito nasceu da paixão por café de qualidade excepcional. 
              Começamos como uma pequena torrefação artesanal e hoje somos reconhecidos 
              por oferecer alguns dos melhores cafés especiais do Brasil.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Nosso compromisso é com a qualidade, desde a seleção dos grãos até a entrega 
              do produto final. Trabalhamos diretamente com produtores locais, garantindo 
              práticas sustentáveis e comércio justo.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-3">Nossa Missão</h3>
              <p className="text-muted-foreground">
                Proporcionar experiências únicas através de cafés especiais de alta qualidade, 
                conectando pessoas e momentos especiais.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-3">Nossa Visão</h3>
              <p className="text-muted-foreground">
                Ser referência nacional em cafés especiais, reconhecida pela excelência 
                e inovação em todos os nossos produtos.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Processo de Torrefação</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Nosso processo de torrefação é cuidadosamente controlado para realçar as 
              características únicas de cada origem. Utilizamos equipamentos de última 
              geração e técnicas artesanais para garantir a perfeição em cada lote.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌱</span>
                </div>
                <h4 className="font-semibold mb-2">Seleção</h4>
                <p className="text-sm text-muted-foreground">
                  Grãos selecionados de produtores parceiros
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔥</span>
                </div>
                <h4 className="font-semibold mb-2">Torrefação</h4>
                <p className="text-sm text-muted-foreground">
                  Torrefação artesanal controlada
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📦</span>
                </div>
                <h4 className="font-semibold mb-2">Embalagem</h4>
                <p className="text-sm text-muted-foreground">
                  Embalagem que preserva o frescor
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Certificações e Prêmios</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">🏆 Prêmio Qualidade do Café 2023</h4>
                <p className="text-sm text-muted-foreground">
                  Reconhecimento pela excelência na torrefação artesanal
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🌿 Certificação Orgânica</h4>
                <p className="text-sm text-muted-foreground">
                  Linha de produtos orgânicos certificados
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🤝 Comércio Justo</h4>
                <p className="text-sm text-muted-foreground">
                  Parceria direta com produtores locais
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">♻️ Sustentabilidade</h4>
                <p className="text-sm text-muted-foreground">
                  Práticas sustentáveis em toda cadeia produtiva
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
