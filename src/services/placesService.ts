interface LocalizacaoUsuario {
  latitude: number;
  longitude: number;
  precisao?: number;
}

interface IgrejaCatolica {
  id: string;
  nome: string;
  endereco: string;
  distancia?: number;
  distanciaFormatada?: string;
  latitude: number;
  longitude: number;
  denominacao?: string;
  website?: string;
  telefone?: string;
  horarios?: string;
  descricao?: string;
  paroquia?: string;
}

class PlacesService {
  private readonly RAIO_BUSCA = 10000; // 10km em metros
  private cache: Map<string, { data: IgrejaCatolica[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

  /**
   * Obtém localização atual do usuário
   */
  async obterLocalizacaoUsuario(): Promise<LocalizacaoUsuario> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }

      console.log('📍 Solicitando permissão de localização...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const localizacao: LocalizacaoUsuario = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            precisao: position.coords.accuracy,
          };
          console.log('✅ Localização obtida:', localizacao);
          resolve(localizacao);
        },
        (error) => {
          console.error('❌ Erro ao obter localização:', error);
          let mensagem = 'Não foi possível obter sua localização';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensagem = 'Permissão de localização negada. Ative nas configurações do navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              mensagem = 'Localização indisponível no momento.';
              break;
            case error.TIMEOUT:
              mensagem = 'Tempo esgotado ao tentar obter localização.';
              break;
          }

          reject(new Error(mensagem));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Busca igrejas católicas próximas usando OpenStreetMap
   */
  async buscarIgrejasProximas(
    localizacao?: LocalizacaoUsuario,
    raio?: number
  ): Promise<IgrejaCatolica[]> {
    try {
      const loc = localizacao || (await this.obterLocalizacaoUsuario());
      const raioFinal = raio || this.RAIO_BUSCA;

      // Verificar cache
      const cacheKey = `${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)},${raioFinal}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('📦 Igrejas do cache');
        return cached.data;
      }

      console.log(`🔍 Buscando igrejas no OpenStreetMap (raio: ${(raioFinal / 1000).toFixed(1)}km)...`);
      console.log(`📍 Localização: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`);

      // Buscar usando Overpass API com fallback em cascata
      const igrejas = await this.buscarComFallback(loc, raioFinal);

      // Salvar no cache
      this.cache.set(cacheKey, {
        data: igrejas,
        timestamp: Date.now(),
      });

      console.log(`✅ ${igrejas.length} igrejas encontradas`);
      return igrejas;
    } catch (error) {
      console.error('❌ Erro ao buscar igrejas:', error);
      throw error;
    }
  }

  /**
   * Busca com fallback em cascata (3 níveis)
   */
  private async buscarComFallback(
    localizacao: LocalizacaoUsuario,
    raio: number
  ): Promise<IgrejaCatolica[]> {
    console.log('🔄 Iniciando busca em cascata...');

    // Nível 1: Católicas específicas
    console.log('📌 Tentativa 1: Igrejas católicas específicas');
    let igrejas = await this.buscarNoOpenStreetMap(localizacao, raio, 'catholic');
    
    if (igrejas.length > 0) {
      console.log(`✅ Nível 1: ${igrejas.length} igrejas católicas encontradas`);
      return igrejas;
    }

    // Nível 2: Todas as igrejas cristãs
    console.log('📌 Tentativa 2: Igrejas cristãs (fallback)');
    igrejas = await this.buscarNoOpenStreetMap(localizacao, raio, 'christian');
    
    if (igrejas.length > 0) {
      console.log(`✅ Nível 2: ${igrejas.length} igrejas cristãs encontradas`);
      return igrejas;
    }

    // Nível 3: Todos os locais de culto
    console.log('📌 Tentativa 3: Todos os locais de culto (fallback)');
    igrejas = await this.buscarNoOpenStreetMap(localizacao, raio, 'all');
    
    if (igrejas.length > 0) {
      console.log(`✅ Nível 3: ${igrejas.length} locais de culto encontrados`);
      return igrejas;
    }

    // Nível 4: Busca por palavras-chave no nome
    console.log('📌 Tentativa 4: Busca por palavras-chave');
    igrejas = await this.buscarPorNome(localizacao, raio);
    
    if (igrejas.length > 0) {
      console.log(`✅ Nível 4: ${igrejas.length} igrejas encontradas por nome`);
      return igrejas;
    }

    console.log('⚠️ Nenhuma igreja encontrada em nenhum nível');
    return [];
  }

  /**
   * Busca igrejas usando Overpass API (OpenStreetMap)
   */
  private async buscarNoOpenStreetMap(
    localizacao: LocalizacaoUsuario,
    raio: number,
    nivel: 'catholic' | 'christian' | 'all' = 'catholic'
  ): Promise<IgrejaCatolica[]> {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    let query: string;

    if (nivel === 'catholic') {
      // Busca específica: católicas
      query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="christian"]["denomination"="catholic"](around:${raio},${localizacao.latitude},${localizacao.longitude});
          way["amenity"="place_of_worship"]["religion"="christian"]["denomination"="catholic"](around:${raio},${localizacao.latitude},${localizacao.longitude});
          relation["amenity"="place_of_worship"]["religion"="christian"]["denomination"="catholic"](around:${raio},${localizacao.latitude},${localizacao.longitude});
        );
        out body;
        >;
        out skel qt;
      `;
    } else if (nivel === 'christian') {
      // Busca mais ampla: cristãs
      query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="christian"](around:${raio},${localizacao.latitude},${localizacao.longitude});
          way["amenity"="place_of_worship"]["religion"="christian"](around:${raio},${localizacao.latitude},${localizacao.longitude});
          relation["amenity"="place_of_worship"]["religion"="christian"](around:${raio},${localizacao.latitude},${localizacao.longitude});
        );
        out body;
        >;
        out skel qt;
      `;
    } else {
      // Busca mais ampla: todos os locais de culto
      query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"](around:${raio},${localizacao.latitude},${localizacao.longitude});
          way["amenity"="place_of_worship"](around:${raio},${localizacao.latitude},${localizacao.longitude});
          relation["amenity"="place_of_worship"](around:${raio},${localizacao.latitude},${localizacao.longitude});
        );
        out body;
        >;
        out skel qt;
      `;
    }

    try {
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      console.log(`📊 API retornou ${data.elements?.length || 0} elementos`);

      // Transformar resultados
      const igrejas: IgrejaCatolica[] = [];
      const processedIds = new Set<string>();

      for (const element of data.elements) {
        const elementId = `${element.type}-${element.id}`;
        
        if (processedIds.has(elementId)) continue;
        processedIds.add(elementId);

        if (element.type === 'node' && element.tags && element.lat && element.lon) {
          const igreja = this.transformarElementoOSM(element, localizacao);
          if (igreja) {
            igrejas.push(igreja);
          }
        } else if (element.type === 'way' && element.tags) {
          // Para "way", precisamos calcular o centro
          const center = this.calcularCentroWay(element, data.elements);
          if (center) {
            const igreja = this.transformarElementoOSM(
              { ...element, lat: center.lat, lon: center.lon },
              localizacao
            );
            if (igreja) {
              igrejas.push(igreja);
            }
          }
        }
      }

      // Remover duplicatas por nome e proximidade
      const igrejasUnicas = this.removerDuplicatas(igrejas);

      // Ordenar por distância
      igrejasUnicas.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));

      console.log(`🔍 Após processamento: ${igrejasUnicas.length} igrejas únicas`);

      // Enriquecer com endereços (apenas as 10 mais próximas para não sobrecarregar)
      await this.enriquecerComEnderecos(igrejasUnicas.slice(0, 10));

      return igrejasUnicas;
    } catch (error) {
      console.error('Erro ao buscar no OpenStreetMap:', error);
      throw error;
    }
  }

  /**
   * Transforma elemento do OSM em IgrejaCatolica
   */
  private transformarElementoOSM(
    element: any,
    localizacao: LocalizacaoUsuario
  ): IgrejaCatolica | null {
    if (!element.lat || !element.lon) return null;

    const distancia = this.calcularDistancia(
      localizacao.latitude,
      localizacao.longitude,
      element.lat,
      element.lon
    );

    const tags = element.tags || {};

    // Filtrar apenas por amenity (mais flexível)
    if (tags.amenity !== 'place_of_worship') return null;

    return {
      id: `osm-${element.type}-${element.id}`,
      nome: tags.name || tags['name:pt'] || tags['official_name'] || 'Igreja Católica',
      endereco: this.construirEndereco(tags),
      distancia,
      distanciaFormatada: this.formatarDistancia(distancia),
      latitude: element.lat,
      longitude: element.lon,
      denominacao: tags.denomination || 'Católica Romana',
      website: tags.website || tags['contact:website'],
      telefone: tags.phone || tags['contact:phone'],
      horarios: this.formatarHorarios(tags),
      descricao: tags.description || tags['description:pt'],
      paroquia: tags.parish || tags['operator'],
    };
  }

  /**
   * Calcula centro de um "way" (polígono)
   */
  private calcularCentroWay(way: any, allElements: any[]): { lat: number; lon: number } | null {
    if (!way.nodes || way.nodes.length === 0) return null;

    const nodes = way.nodes
      .map((nodeId: number) => allElements.find((el: any) => el.type === 'node' && el.id === nodeId))
      .filter((n: any) => n && n.lat && n.lon);

    if (nodes.length === 0) return null;

    const sumLat = nodes.reduce((sum: number, node: any) => sum + node.lat, 0);
    const sumLon = nodes.reduce((sum: number, node: any) => sum + node.lon, 0);

    return {
      lat: sumLat / nodes.length,
      lon: sumLon / nodes.length,
    };
  }

  /**
   * Constrói endereço a partir das tags OSM
   */
  private construirEndereco(tags: any): string {
    const partes: string[] = [];

    if (tags['addr:street']) {
      let rua = tags['addr:street'];
      if (tags['addr:housenumber']) {
        rua += `, ${tags['addr:housenumber']}`;
      }
      partes.push(rua);
    }

    if (tags['addr:neighbourhood']) partes.push(tags['addr:neighbourhood']);
    if (tags['addr:suburb']) partes.push(tags['addr:suburb']);
    if (tags['addr:city']) partes.push(tags['addr:city']);
    if (tags['addr:state']) partes.push(tags['addr:state']);
    if (tags['addr:postcode']) partes.push(`CEP ${tags['addr:postcode']}`);

    return partes.length > 0 ? partes.join(', ') : 'Endereço não disponível';
  }

  /**
   * Formata horários de funcionamento
   */
  private formatarHorarios(tags: any): string | undefined {
    if (tags['service_times:sunday']) {
      return `Missas domingo: ${tags['service_times:sunday']}`;
    }
    if (tags['opening_hours']) {
      return tags['opening_hours'];
    }
    if (tags['service_times']) {
      return tags['service_times'];
    }
    return undefined;
  }

  /**
   * Remove igrejas duplicadas
   */
  private removerDuplicatas(igrejas: IgrejaCatolica[]): IgrejaCatolica[] {
    const unicas = new Map<string, IgrejaCatolica>();

    for (const igreja of igrejas) {
      const chave = `${igreja.nome.toLowerCase()}-${igreja.latitude.toFixed(4)}-${igreja.longitude.toFixed(4)}`;
      
      if (!unicas.has(chave)) {
        unicas.set(chave, igreja);
      }
    }

    return Array.from(unicas.values());
  }

  /**
   * Enriquece igrejas com endereços completos via Nominatim
   */
  private async enriquecerComEnderecos(igrejas: IgrejaCatolica[]): Promise<void> {
    const nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

    for (const igreja of igrejas) {
      if (igreja.endereco === 'Endereço não disponível') {
        try {
          const response = await fetch(
            `${nominatimUrl}?format=json&lat=${igreja.latitude}&lon=${igreja.longitude}&addressdetails=1&zoom=18`,
            {
              headers: {
                'User-Agent': 'FidesApp/1.0 (Catholic Church Finder)',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              igreja.endereco = data.display_name;
            }
          }

          // Rate limiting: 1 segundo entre requisições (política Nominatim)
          await new Promise((resolve) => setTimeout(resolve, 1100));
        } catch (error) {
          console.warn('Erro ao buscar endereço para:', igreja.nome, error);
        }
      }
    }
  }

  /**
   * Calcula distância entre dois pontos (Haversine)
   */
  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distância em metros
  }

  /**
   * Formata distância para exibição
   */
  private formatarDistancia(metros: number): string {
    if (metros < 1000) {
      return `${Math.round(metros)} m`;
    }
    return `${(metros / 1000).toFixed(1)} km`;
  }

  /**
   * Abre navegação no Google Maps
   */
  abrirNavegacao(igreja: IgrejaCatolica): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${igreja.latitude},${igreja.longitude}`;
    window.open(url, '_blank');
  }

  /**
   * Abre no OpenStreetMap
   */
  abrirNoMapa(igreja: IgrejaCatolica): void {
    const url = `https://www.openstreetmap.org/?mlat=${igreja.latitude}&mlon=${igreja.longitude}&zoom=18`;
    window.open(url, '_blank');
  }

  /**
   * Compartilhar igreja
   */
  async compartilharIgreja(igreja: IgrejaCatolica): Promise<void> {
    const texto = `⛪ ${igreja.nome}\n📍 ${igreja.endereco}\n🗺️ https://www.google.com/maps/search/?api=1&query=${igreja.latitude},${igreja.longitude}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: igreja.nome,
          text: texto,
        });
      } catch (error) {
        // Usuário cancelou
        console.log('Compartilhamento cancelado');
      }
    } else {
      await navigator.clipboard.writeText(texto);
      return Promise.resolve();
    }
  }

  /**
   * Busca por palavras-chave no nome (fallback final)
   */
  private async buscarPorNome(
    localizacao: LocalizacaoUsuario,
    raio: number
  ): Promise<IgrejaCatolica[]> {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="place_of_worship"]["name"~"igreja|paróquia|catedral|capela|church",i](around:${raio},${localizacao.latitude},${localizacao.longitude});
        way["amenity"="place_of_worship"]["name"~"igreja|paróquia|catedral|capela|church",i](around:${raio},${localizacao.latitude},${localizacao.longitude});
      );
      out body;
      >;
      out skel qt;
    `;

    try {
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📊 Busca por nome retornou ${data.elements?.length || 0} elementos`);

      const igrejas: IgrejaCatolica[] = [];
      const processedIds = new Set<string>();

      for (const element of data.elements) {
        const elementId = `${element.type}-${element.id}`;
        
        if (processedIds.has(elementId)) continue;
        processedIds.add(elementId);

        if (element.type === 'node' && element.tags && element.lat && element.lon) {
          const igreja = this.transformarElementoOSM(element, localizacao);
          if (igreja) {
            igrejas.push(igreja);
          }
        } else if (element.type === 'way' && element.tags) {
          const center = this.calcularCentroWay(element, data.elements);
          if (center) {
            const igreja = this.transformarElementoOSM(
              { ...element, lat: center.lat, lon: center.lon },
              localizacao
            );
            if (igreja) {
              igrejas.push(igreja);
            }
          }
        }
      }

      const igrejasUnicas = this.removerDuplicatas(igrejas);
      igrejasUnicas.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
      await this.enriquecerComEnderecos(igrejasUnicas.slice(0, 10));

      return igrejasUnicas;
    } catch (error) {
      console.error('Erro ao buscar por nome:', error);
      return [];
    }
  }

  limparCache(): void {
    this.cache.clear();
    console.log('🧹 Cache de lugares limpo');
  }
}

export const placesService = new PlacesService();
export type { IgrejaCatolica, LocalizacaoUsuario };
