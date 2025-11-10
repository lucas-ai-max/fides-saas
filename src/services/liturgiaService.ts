interface LeituraLiturgica {
  tipo: 'primeira' | 'salmo' | 'segunda' | 'evangelho';
  titulo: string;
  referencia: string;
  texto: string;
}

interface LiturgiaDiaria {
  data: Date;
  dia: string;
  tempo: string;
  cor: 'verde' | 'roxo' | 'branco' | 'vermelho' | 'rosa';
  leituras: LeituraLiturgica[];
  reflexao?: string;
  fonte: string;
}

class LiturgiaService {
  private readonly API_BASE_URL = 'https://liturgia-diaria-api.vercel.app';
  
  private cache: Map<string, { data: LiturgiaDiaria; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 horas

  async buscarLiturgiaDoDia(data?: Date): Promise<LiturgiaDiaria> {
    const dataAlvo = data || new Date();
    const cacheKey = this.formatarDataCache(dataAlvo);

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Usando liturgia do cache');
      return cached.data;
    }

    console.log('🔍 Buscando liturgia da CNBB via API...');

    try {
      let liturgia: LiturgiaDiaria;

      const hoje = new Date();
      const ehHoje = 
        dataAlvo.getDate() === hoje.getDate() &&
        dataAlvo.getMonth() === hoje.getMonth() &&
        dataAlvo.getFullYear() === hoje.getFullYear();

      if (ehHoje) {
        liturgia = await this.buscarLiturgiaGET();
      } else {
        liturgia = await this.buscarLiturgiaPOST(dataAlvo);
      }

      this.cache.set(cacheKey, {
        data: liturgia,
        timestamp: Date.now(),
      });

      console.log('✅ Liturgia carregada com sucesso da CNBB');
      return liturgia;

    } catch (error) {
      console.error('❌ Erro ao buscar liturgia:', error);
      return this.getLiturgiaFallback(dataAlvo);
    }
  }

  private async buscarLiturgiaGET(): Promise<LiturgiaDiaria> {
    const response = await fetch(`${this.API_BASE_URL}/api/liturgia`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const dados = await response.json();
    return this.normalizarDados(dados);
  }

  private async buscarLiturgiaPOST(data: Date): Promise<LiturgiaDiaria> {
    const payload = {
      ano: data.getFullYear().toString(),
      mes: String(data.getMonth() + 1).padStart(2, '0'),
      dia: String(data.getDate()).padStart(2, '0'),
    };

    const response = await fetch(`${this.API_BASE_URL}/api/liturgia`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const dados = await response.json();
    return this.normalizarDados(dados);
  }

  private normalizarDados(dados: any): LiturgiaDiaria {
    const leituras: LeituraLiturgica[] = [];

    if (dados.primeiraLeitura || dados.primeira_leitura) {
      const leitura = dados.primeiraLeitura || dados.primeira_leitura;
      leituras.push({
        tipo: 'primeira',
        titulo: leitura.titulo || 'Primeira Leitura',
        referencia: leitura.referencia || leitura.ref || '',
        texto: leitura.texto || leitura.text || '',
      });
    }

    if (dados.salmo) {
      leituras.push({
        tipo: 'salmo',
        titulo: dados.salmo.titulo || 'Salmo Responsorial',
        referencia: dados.salmo.referencia || dados.salmo.ref || '',
        texto: dados.salmo.texto || dados.salmo.text || '',
      });
    }

    if (dados.segundaLeitura || dados.segunda_leitura) {
      const leitura = dados.segundaLeitura || dados.segunda_leitura;
      leituras.push({
        tipo: 'segunda',
        titulo: leitura.titulo || 'Segunda Leitura',
        referencia: leitura.referencia || leitura.ref || '',
        texto: leitura.texto || leitura.text || '',
      });
    }

    if (dados.evangelho) {
      leituras.push({
        tipo: 'evangelho',
        titulo: dados.evangelho.titulo || 'Evangelho',
        referencia: dados.evangelho.referencia || dados.evangelho.ref || '',
        texto: dados.evangelho.texto || dados.evangelho.text || '',
      });
    }

    const cor = this.determinarCor(dados.cor || dados.corLiturgica || '');

    return {
      data: dados.data ? new Date(dados.data) : new Date(),
      dia: dados.dia || dados.data || new Date().toLocaleDateString('pt-BR'),
      tempo: dados.tempo || dados.tempoLiturgico || dados.liturgia || 'Tempo Comum',
      cor,
      leituras,
      reflexao: dados.reflexao || dados.comentario || undefined,
      fonte: 'CNBB',
    };
  }

  private determinarCor(corTexto: string): 'verde' | 'roxo' | 'branco' | 'vermelho' | 'rosa' {
    const cor = corTexto.toLowerCase();
    
    if (cor.includes('roxo') || cor.includes('roxa') || cor.includes('violet')) return 'roxo';
    if (cor.includes('branco') || cor.includes('branca') || cor.includes('white')) return 'branco';
    if (cor.includes('vermelho') || cor.includes('vermelha') || cor.includes('red')) return 'vermelho';
    if (cor.includes('rosa') || cor.includes('pink')) return 'rosa';
    
    return 'verde';
  }

  private getLiturgiaFallback(data: Date): LiturgiaDiaria {
    return {
      data,
      dia: data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      tempo: 'Liturgia não disponível',
      cor: 'verde',
      leituras: [
        {
          tipo: 'evangelho',
          titulo: 'Evangelho',
          referencia: 'João 3, 16',
          texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
        },
      ],
      reflexao: 'A liturgia diária não está disponível no momento. Por favor, consulte um Missal ou site católico oficial.',
      fonte: 'Fallback',
    };
  }

  private formatarDataCache(data: Date): string {
    return data.toISOString().split('T')[0];
  }

  getNomeCorLiturgica(cor: string): string {
    const cores: Record<string, string> = {
      verde: 'Verde',
      roxo: 'Roxo',
      branco: 'Branco',
      vermelho: 'Vermelho',
      rosa: 'Rosa',
    };
    return cores[cor] || 'Verde';
  }

  getDescricaoCorLiturgica(cor: string): string {
    const descricoes: Record<string, string> = {
      verde: 'Esperança e Tempo Comum',
      roxo: 'Penitência e Preparação',
      branco: 'Alegria e Festa',
      vermelho: 'Espírito Santo e Mártires',
      rosa: 'Alegria na Penitência',
    };
    return descricoes[cor] || 'Tempo Comum';
  }

  getEmojiCor(cor: string): string {
    const emojis: Record<string, string> = {
      verde: '🟢',
      roxo: '🟣',
      branco: '⚪',
      vermelho: '🔴',
      rosa: '🌸',
    };
    return emojis[cor] || '🟢';
  }

  limparCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache de liturgia limpo');
  }
}

export const liturgiaService = new LiturgiaService();
export type { LiturgiaDiaria, LeituraLiturgica };
