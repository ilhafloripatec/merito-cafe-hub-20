import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const useViaCep = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = async (cep: string): Promise<ViaCepResponse | null> => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      toast({
        title: "CEP Inválido",
        description: "O CEP deve conter 8 dígitos.",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!response.ok) {
        throw new Error('Não foi possível buscar o CEP.');
      }
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        toast({
          title: "CEP não encontrado",
          description: "Por favor, verifique o CEP digitado.",
          variant: "destructive"
        });
        return null;
      }

      return data;
    } catch (err: any) {
      setError(err.message || 'Erro ao consultar CEP');
      toast({
        title: "Erro na Busca",
        description: "Não foi possível buscar o endereço, tente novamente.",
        variant: "destructive"
      });
      console.error('Erro ao consultar ViaCEP:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchAddress,
    isLoading,
    error,
  };
};
