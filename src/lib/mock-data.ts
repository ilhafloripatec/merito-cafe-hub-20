
import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Blend Manhã',
    description: 'Notas de chocolate e caramelo, acidez equilibrada. Perfeito para começar o dia com energia e sabor.',
    price: 45.00,
    category: 'Blends',
    image: '/src/assets/blend-manha.jpg',
    variations: [
      { id: '1-250', name: '250g', weight: '250g', price: 45.00, stock: 25 },
      { id: '1-500', name: '500g', weight: '500g', price: 81.00, stock: 18 },
      { id: '1-1kg', name: '1kg', weight: '1kg', price: 117.00, stock: 12 }
    ],
    status: 'active',
    featured: true,
    tags: ['manhã', 'chocolate', 'caramelo', 'equilibrado'],
    stock: 55
  },
  {
    id: '2',
    name: 'Blend Noturno',
    description: 'Encorpado, notas de cacau e especiarias. Ideal para momentos especiais e pausas relaxantes.',
    price: 52.00,
    category: 'Blends',
    image: '/src/assets/blend-noturno.jpg',
    variations: [
      { id: '2-250', name: '250g', weight: '250g', price: 52.00, stock: 22 },
      { id: '2-500', name: '500g', weight: '500g', price: 93.60, stock: 15 },
      { id: '2-1kg', name: '1kg', weight: '1kg', price: 135.20, stock: 8 }
    ],
    status: 'active',
    featured: true,
    tags: ['noturno', 'cacau', 'especiarias', 'encorpado'],
    stock: 45
  },
  {
    id: '3',
    name: 'Premium Gold',
    description: 'Grãos selecionados, notas frutadas e florais. Nossa seleção especial para paladares refinados.',
    price: 68.00,
    category: 'Premium',
    image: '/src/assets/premium-gold.jpg',
    variations: [
      { id: '3-250', name: '250g', weight: '250g', price: 68.00, stock: 15 },
      { id: '3-500', name: '500g', weight: '500g', price: 122.40, stock: 10 },
      { id: '3-1kg', name: '1kg', weight: '1kg', price: 176.80, stock: 5 }
    ],
    status: 'active',
    featured: true,
    tags: ['premium', 'frutado', 'floral', 'selecionado'],
    stock: 30
  },
  {
    id: '4',
    name: 'Café do Produtor',
    description: 'Direto do produtor, torra média, notas cítricas e doçura natural. Edição limitada.',
    price: 58.00,
    category: 'Especiais',
    image: '/src/assets/blend-manha.jpg',
    variations: [
      { id: '4-250', name: '250g', weight: '250g', price: 58.00, stock: 12 },
      { id: '4-500', name: '500g', weight: '500g', price: 104.40, stock: 8 }
    ],
    status: 'active',
    featured: false,
    tags: ['produtor', 'cítrico', 'natural', 'limitado'],
    stock: 20
  },
  {
    id: '5',
    name: 'Descafeinado Suave',
    description: 'Processo swiss water, mantém todo sabor sem cafeína. Perfeito para qualquer hora.',
    price: 49.00,
    category: 'Especiais',
    image: '/src/assets/blend-noturno.jpg',
    variations: [
      { id: '5-250', name: '250g', weight: '250g', price: 49.00, stock: 20 },
      { id: '5-500', name: '500g', weight: '500g', price: 88.20, stock: 15 }
    ],
    status: 'active',
    featured: false,
    tags: ['descafeinado', 'suave', 'swiss-water'],
    stock: 35
  },
  {
    id: '6',
    name: 'Bourbon Amarelo',
    description: 'Varietal puro, notas de mel e amêndoas, corpo sedoso. Para verdadeiros apreciadores.',
    price: 75.00,
    category: 'Premium',
    image: '/src/assets/premium-gold.jpg',
    variations: [
      { id: '6-250', name: '250g', weight: '250g', price: 75.00, stock: 8 },
      { id: '6-500', name: '500g', weight: '500g', price: 135.00, stock: 5 }
    ],
    status: 'active',
    featured: true,
    tags: ['bourbon', 'mel', 'amêndoas', 'sedoso'],
    stock: 13
  }
];

export const mockCategories = [
  { id: 'all', name: 'Todos', count: mockProducts.length },
  { id: 'blends', name: 'Blends', count: mockProducts.filter(p => p.category === 'Blends').length },
  { id: 'premium', name: 'Premium', count: mockProducts.filter(p => p.category === 'Premium').length },
  { id: 'especiais', name: 'Especiais', count: mockProducts.filter(p => p.category === 'Especiais').length }
];

export const mockShippingOptions = [
  { id: 'pac', name: 'PAC', price: 12.50, days: '8 a 12 dias úteis' },
  { id: 'sedex', name: 'SEDEX', price: 18.90, days: '3 a 5 dias úteis' },
  { id: 'express', name: 'Express', price: 25.00, days: '1 a 2 dias úteis' }
];
