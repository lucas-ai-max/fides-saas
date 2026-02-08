interface SantoDoDia {
  data: Date;
  dia: string;
  nome: string;
  titulo: string;
  historia: string;
  oracao?: string;
  imagem?: string;
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
    let nome = 'Santo do Dia';
    let titulo = '';
    let historia = '';

    // Extrair nome e título do campo "liturgia"
    if (dados.liturgia && typeof dados.liturgia === 'string') {
      const textoLiturgia = dados.liturgia;

      // Remover tipos litúrgicos do final (Memória, Festa, Solenidade, etc)
      const semTipo = textoLiturgia
        .replace(/,?\s*(Memória|Festa|Solenidade|Comemoração|Tempo Comum|Tempo Pascal|Advento|Quaresma|semana).*$/i, '')
        .trim();

      // Separar nome do título por vírgula
      const partes = semTipo.split(',').map(p => p.trim());

      if (partes.length >= 1) {
        nome = partes[0];
      }

      if (partes.length >= 2) {
        titulo = partes.slice(1).join(', ');
        // Capitalizar primeira letra do título
        titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);
      }

      // História: APENAS se a API fornecer no campo específico
      if (dados.historia && typeof dados.historia === 'string') {
        historia = dados.historia;
      } else {
        // Mensagem honesta quando a API não fornece biografia
        historia = `${nome} é celebrado hoje pela Igreja Católica. Para conhecer a vida e obra deste santo, consulte fontes oficiais como Vatican News, livros de hagiografia ou o site da CNBB.`;
      }
    } else {
      // Fallback quando não há campo liturgia
      nome = 'Santo do Dia';
      titulo = 'Celebração Litúrgica';
      historia = 'Informação não disponível na API da CNBB no momento. Por favor, tente novamente mais tarde ou consulte fontes oficiais.';
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
      oracao: dados.oracoes?.coleta || dados.oracoes?.oferendas || dados.oracoes?.comunhao,
      imagem: dados.imagem || undefined, // API probably doesn't have it, but we add it to type
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
