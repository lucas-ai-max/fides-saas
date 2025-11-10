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
  private readonly API_BASE_URL = import.meta.env.VITE_LITURGIA_API_URL;
  private cache: Map<string, { data: SantoDoDia; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  // Banco de dados de histórias completas dos santos
  private readonly HISTORIAS_SANTOS: Record<string, { historia: string; oracao?: string }> = {
    "são leão magno": {
      historia: "Nasceu em Roma por volta do ano 400. Foi eleito Papa em 440 e governou a Igreja por 21 anos. Destacou-se como defensor da fé católica contra as heresias da época, especialmente o nestorianismo e o eutiquianismo. Sua doutrina sobre as duas naturezas de Cristo foi fundamental no Concílio de Calcedônia (451). Foi grande pregador e seus sermões são considerados obras-primas da literatura latina cristã. Defendeu Roma da invasão dos hunos em 452, persuadindo Átila a não atacar a cidade. Morreu em 461 e foi declarado Doutor da Igreja.",
      oracao: "Ó Deus, que não permitistes que as portas do inferno prevalecessem contra vossa Igreja, edificada sobre a rocha apostólica, concedei-nos, por intercessão de São Leão Magno, permanecer firmes na verdade e gozar de contínua paz. Por Cristo, nosso Senhor. Amém."
    },
    "são martinho de tours": {
      historia: "Nasceu em 316 na Hungria. Foi soldado romano e converteu-se ao cristianismo. É famoso pelo episódio em que cortou sua capa militar ao meio para dar metade a um mendigo no inverno. Cristo lhe apareceu vestido com aquela metade da capa. Tornou-se monge e depois bispo de Tours na França. Foi grande evangelizador e fundador de mosteiros. É padroeiro da França, dos soldados e alfaiates. Morreu em 397.",
      oracao: "São Martinho, que partilhastes vossa capa com um pobre vendo nele o próprio Cristo, ensinai-nos a caridade verdadeira e a compaixão pelos necessitados. Amém."
    },
    "são francisco de assis": {
      historia: "Nasceu em 1182 em Assis, Itália. Filho de comerciante rico, renunciou à herança para viver em pobreza radical seguindo Cristo. Fundou a Ordem Franciscana em 1209. Recebeu os estigmas de Cristo no Monte Alverne. Compôs o Cântico das Criaturas, louvando a Deus pela criação. É padroeiro da ecologia e dos animais. Morreu em 1226.",
      oracao: "Senhor, fazei de mim um instrumento de vossa paz. Onde houver ódio, que eu leve o amor. Onde houver ofensa, que eu leve o perdão. Onde houver discórdia, que eu leve a união. Amém."
    },
    "santa teresa de ávila": {
      historia: "Nasceu em 1515 na Espanha. Reformou a Ordem Carmelita, fundando os Carmelitas Descalços em 1562. Grande mística e escritora, suas obras 'Castelo Interior' e 'Caminho de Perfeição' são clássicos da espiritualidade cristã. Teve experiências místicas profundas, incluindo a transverberação do coração. Foi proclamada Doutora da Igreja em 1970, primeira mulher a receber esse título. Morreu em 1582.",
      oracao: "Santa Teresa, mestra da oração, ensinai-nos a buscar a Deus no interior de nossas almas e a viver em união constante com Ele. Amém."
    },
    "são vicente de paulo": {
      historia: "Nasceu em 1581 na França. Fundou a Congregação da Missão (Vicentinos) e as Filhas da Caridade com Santa Luísa de Marillac. Dedicou toda sua vida aos pobres, doentes, escravos e abandonados. Organizou hospitais, orfanatos, seminários e obras de caridade. É padroeiro universal das obras de caridade. Morreu em 1660.",
      oracao: "São Vicente de Paulo, pai dos pobres, ensinai-nos a ver Cristo nos necessitados e a servi-los com amor verdadeiro e desinteressado. Amém."
    }
  };

  async buscarSantoDoDia(data?: Date): Promise<SantoDoDia> {
    const dataAlvo = data || new Date();
    const cacheKey = this.formatarDataCache(dataAlvo);

    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('📦 Santo do cache');
      return cached.data;
    }

    console.log('🔍 Buscando santo da CNBB...');

    try {
      const santo = await this.buscarDaAPI(dataAlvo);

      // Salvar no cache
      this.cache.set(cacheKey, {
        data: santo,
        timestamp: Date.now(),
      });

      console.log('✅ Santo carregado:', santo.nome);
      return santo;
    } catch (error) {
      console.error('❌ Erro ao buscar santo:', error);

      // Tentar cache expirado
      if (cached) {
        console.log('⚠️ Usando cache expirado');
        return cached.data;
      }

      // Fallback
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
    const endpoint = `${this.API_BASE_URL}/liturgia`;

    if (ehHoje) {
      // GET para hoje
      response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
    } else {
      // POST para data específica
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          ano: data.getFullYear().toString(),
          mes: String(data.getMonth() + 1).padStart(2, '0'),
          dia: String(data.getDate()).padStart(2, '0'),
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const dados = await response.json();
    return this.normalizarDados(dados, data);
  }

  private normalizarDados(dados: any, data: Date): SantoDoDia {
    // Extrair santo do campo "liturgia"
    // Exemplo: "São Leão Magno, papa e doutor da Igreja, Memória"
    let nome = 'Santo do Dia';
    let titulo = '';
    let historia = '';
    let oracao: string | undefined;

    if (dados.liturgia) {
      const textoLiturgia = dados.liturgia as string;
      console.log('📖 Liturgia:', textoLiturgia);

      // Remover tipos litúrgicos do final (Memória, Festa, Solenidade, etc)
      const semTipo = textoLiturgia
        .replace(/,?\s*(Memória|Festa|Solenidade|Comemoração|Tempo Comum|Tempo Pascal|Advento|Quaresma|semana).*$/i, '')
        .trim();

      // Separar nome do título por vírgula
      const partes = semTipo.split(',').map(p => p.trim());

      if (partes.length >= 1) {
        nome = partes[0]; // "São Leão Magno"
      }

      if (partes.length >= 2) {
        titulo = partes.slice(1).join(', '); // "papa e doutor da Igreja"
        // Capitalizar primeira letra
        titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);
      }

      // Buscar história completa no banco de dados
      const nomeLower = nome.toLowerCase();
      const dadosCompletos = this.HISTORIAS_SANTOS[nomeLower];

      if (dadosCompletos) {
        historia = dadosCompletos.historia;
        oracao = dadosCompletos.oracao;
        console.log('✅ História completa encontrada para:', nome);
      } else {
        // História genérica quando não temos dados específicos
        historia = `${nome} é celebrado hoje pela Igreja Católica. ${
          titulo ? `Foi ${titulo.toLowerCase()} e` : 'Sua vida'
        } é um exemplo de fé, dedicação e amor a Deus. Que seu testemunho nos inspire a buscar a santidade em nossa vida diária.`;
        console.log('⚠️ Usando história genérica para:', nome);
      }

      // Tentar usar oração da liturgia se não tiver oração específica
      if (!oracao && dados.oracoes?.coleta) {
        oracao = dados.oracoes.coleta;
      }
    } else {
      // Fallback se não encontrar dados
      nome = 'Santo do Dia';
      titulo = 'Celebração Litúrgica';
      historia = 'A Igreja Católica celebra hoje a memória de um santo cujo exemplo de vida nos inspira a buscar a santidade. Que possamos seguir seus passos no caminho da fé.';
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
      oracao,
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
      titulo: 'Celebração da Igreja',
      historia:
        'A Igreja Católica celebra hoje a memória de um santo cujo exemplo de vida nos inspira a buscar a santidade. Cada santo é um testemunho vivo do amor de Deus e da graça que transforma vidas. Que possamos seguir seus passos no caminho da fé e alcançar a vida eterna.',
      oracao:
        'Senhor, pela intercessão dos vossos santos, concedei-nos a graça de vivermos segundo vossa vontade e alcançarmos a vida eterna. Por Cristo, nosso Senhor. Amém.',
      fonte: 'Igreja Católica',
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
