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
  private readonly API_BASE_URL = 'https://liturgia.up.railway.app/v2';
  
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
    const response = await fetch(`${this.API_BASE_URL}/`, {
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
    // Formatar data como DD-MM-YYYY
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const dataFormatada = `${dia}-${mes}-${ano}`;

    const response = await fetch(`${this.API_BASE_URL}/${dataFormatada}`, {
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

  private normalizarDados(dados: any): LiturgiaDiaria {
    const leituras: LeituraLiturgica[] = [];

    // A API retorna leituras como arrays, pegamos o primeiro elemento
    if (dados.leituras?.primeiraLeitura && dados.leituras.primeiraLeitura.length > 0) {
      const leitura = dados.leituras.primeiraLeitura[0];
      leituras.push({
        tipo: 'primeira',
        titulo: leitura.titulo || 'Primeira Leitura',
        referencia: leitura.referencia || '',
        texto: leitura.texto || '',
      });
    }

    if (dados.leituras?.salmo && dados.leituras.salmo.length > 0) {
      const salmo = dados.leituras.salmo[0];
      const textoSalmo = salmo.refrao 
        ? `Refrão: ${salmo.refrao}\n\n${salmo.texto || ''}`
        : salmo.texto || '';
      
      leituras.push({
        tipo: 'salmo',
        titulo: 'Salmo Responsorial',
        referencia: salmo.referencia || '',
        texto: textoSalmo,
      });
    }

    if (dados.leituras?.segundaLeitura && dados.leituras.segundaLeitura.length > 0) {
      const leitura = dados.leituras.segundaLeitura[0];
      leituras.push({
        tipo: 'segunda',
        titulo: leitura.titulo || 'Segunda Leitura',
        referencia: leitura.referencia || '',
        texto: leitura.texto || '',
      });
    }

    if (dados.leituras?.evangelho && dados.leituras.evangelho.length > 0) {
      const leitura = dados.leituras.evangelho[0];
      leituras.push({
        tipo: 'evangelho',
        titulo: leitura.titulo || 'Evangelho',
        referencia: leitura.referencia || '',
        texto: leitura.texto || '',
      });
    }

    const cor = this.determinarCor(dados.cor || '');

    return {
      data: dados.data ? this.parseDataBrasileira(dados.data) : new Date(),
      dia: dados.data || new Date().toLocaleDateString('pt-BR'),
      tempo: dados.liturgia || 'Tempo Comum',
      cor,
      leituras,
      reflexao: dados.oracoes?.coleta || undefined,
      fonte: 'CNBB',
    };
  }

  private parseDataBrasileira(dataStr: string): Date {
    // Converte data do formato DD/MM/YYYY para Date
    const partes = dataStr.split('/');
    if (partes.length === 3) {
      const dia = parseInt(partes[0]);
      const mes = parseInt(partes[1]) - 1; // Mês começa em 0
      const ano = parseInt(partes[2]);
      return new Date(ano, mes, dia);
    }
    return new Date();
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
