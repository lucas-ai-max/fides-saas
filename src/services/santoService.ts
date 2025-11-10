interface SantoDoDia {
  data: Date;
  dia: string;
  nome: string;
  titulo: string;
  historia: string;
  oracao?: string;
  fonte: string;
}

class SantoService {
  private readonly API_BASE_URL = 'https://liturgia.up.railway.app/v2';
  private cache: Map<string, { data: SantoDoDia; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  async buscarSantoDoDia(data?: Date): Promise<SantoDoDia> {
    const dataAlvo = data || new Date();
    const cacheKey = this.formatarDataCache(dataAlvo);

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Santo do cache');
      return cached.data;
    }

    console.log('🔍 Buscando santo da CNBB...');

    try {
      const santo = await this.buscarDaAPI(dataAlvo);

      this.cache.set(cacheKey, {
        data: santo,
        timestamp: Date.now(),
      });

      console.log('✅ Santo carregado!');
      return santo;
    } catch (error) {
      console.error('❌ Erro ao buscar santo:', error);

      if (cached) {
        console.log('⚠️ Usando cache expirado');
        return cached.data;
      }

      return this.getSantoFallback(dataAlvo);
    }
  }

  private async buscarDaAPI(data: Date): Promise<SantoDoDia> {
    const hoje = new Date();
    const ehHoje =
      data.getDate() === hoje.getDate() &&
      data.getMonth() === hoje.getMonth() &&
      data.getFullYear() === hoje.getFullYear();

    let response: Response;

    if (ehHoje) {
      response = await fetch(`${this.API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
    } else {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      const dataFormatada = `${dia}-${mes}-${ano}`;

      response = await fetch(`${this.API_BASE_URL}/${dataFormatada}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
    }

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const dados = await response.json();
    return this.normalizarDados(dados, data);
  }

  private normalizarDados(dados: any, data: Date): SantoDoDia {
    const santos = dados.santo;
    let nome = 'Santo do Dia';
    let titulo = '';
    let historia = '';
    
    if (Array.isArray(santos) && santos.length > 0) {
      const primeiroSanto = santos[0];
      nome = primeiroSanto.nome || 'Santo do Dia';
      titulo = primeiroSanto.titulo || '';
      historia = primeiroSanto.historia || 'História não disponível no momento.';
    } else if (typeof santos === 'string') {
      nome = santos;
      historia = 'Informação completa não disponível no momento.';
    }

    return {
      data: data,
      dia:
        dados.data ||
        data.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      nome,
      titulo,
      historia,
      oracao: dados.oracoes?.oferendas || dados.oracoes?.comunhao,
      fonte: 'CNBB',
    };
  }

  private getSantoFallback(data: Date): SantoDoDia {
    return {
      data,
      dia: data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      nome: 'Santo do Dia',
      titulo: 'Informação temporariamente indisponível',
      historia:
        'Não foi possível carregar as informações do santo do dia neste momento. Por favor, verifique sua conexão com a internet e tente novamente mais tarde.',
      fonte: 'Sistema',
    };
  }

  private formatarDataCache(data: Date): string {
    return data.toISOString().split('T')[0];
  }

  limparCache(): void {
    this.cache.clear();
    console.log('🧹 Cache de santos limpo');
  }
}

export const santoService = new SantoService();
export type { SantoDoDia };
