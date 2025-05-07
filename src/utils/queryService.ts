import { getToken } from './getToken';
import proj4 from 'proj4';

const proj4326 = 'EPSG:4326';
const proj31983 = '+proj=utm +zone=23 +south +datum=WGS84 +units=m +no_defs';

// Função para consultar um serviço de mapas
// Esta função realiza uma consulta a um serviço de mapas, verificando se há interseções
// em uma área de tolerância ao redor de um ponto fornecido.
export const queryService = async (
  serviceUrl: string, // URL do serviço de mapas
  serviceName: string, // Nome da camada ou serviço sendo consultado
  x: number, // Coordenada X (em EPSG:31983)
  y: number, // Coordenada Y (em EPSG:31983)
  protected_ = false, // Indica se o serviço é protegido e requer autenticação
  credentials?: { username: string; password: string } // Credenciais para serviços protegidos
) => {
  // Define a tolerância de 3 metros no sistema de coordenadas EPSG:31983
  const tolerance = 3; // metros

  // Cria uma geometria de envelope (retângulo) ao redor do ponto
  // O envelope é usado para definir a área de consulta
  const envelope = {
    xmin: x - tolerance, // Coordenada mínima X
    ymin: y - tolerance, // Coordenada mínima Y
    xmax: x + tolerance, // Coordenada máxima X
    ymax: y + tolerance, // Sistema de coordenadas EPSG:31983
    spatialReference: { wkid: 31983 } // Sistema de coordenadas EPSG:31983
  };

  // Parâmetros da consulta ao serviço
  const params = new URLSearchParams({
    geometry: JSON.stringify(envelope), // Geometria da área de consulta (envelope)
    geometryType: 'esriGeometryEnvelope', // Tipo de geometria (envelope)
    spatialRel: 'esriSpatialRelIntersects', // Relação espacial (interseção)
    outFields: '*', // Retorna todos os campos disponíveis
    returnGeometry: 'false', // Não retorna a geometria das feições
    f: 'json' // Formato da resposta (JSON)
  });

  // Adiciona o token de autenticação se o serviço for protegido
  if (protected_ && credentials) {
    params.append('token', await getToken(serviceUrl, credentials));
  }

  // Realiza a solicitação ao serviço de mapas
  const response = await fetch(`${serviceUrl}/query?${params}`);

  // Converte a resposta para JSON
  const data = await response.json();

  // Verifica se houve erro na consulta
  if (data.error) {
    throw new Error(data.error.message || 'Erro ao consultar o serviço'); // Lança um erro caso a consulta falhe
  }

  // Retorna os resultados da consulta
  return {
    attributes: data.features?.[0]?.attributes || null, // Atributos da primeira feição encontrada (se houver)
    hasIntersection: data.features?.length > 0, // Indica se houve interseção com a área de consulta
    layerName: serviceName // Nome da camada consultada
  };
};

// Função para consultar um serviço de mapas XML (WMS ou WFS)
export const queryXMLService = async (
  url: string,
  type: 'WMS' | 'WFS',
  x: number, // Coordenada X (EPSG:31983)
  y: number  // Coordenada Y (EPSG:31983)
) => {
  try {
    // Transformar coordenadas de EPSG:31983 para EPSG:4326
    const [lon, lat] = proj4('EPSG:31983', 'EPSG:4326', [x, y]);

    let requestUrl = '';
    if (type === 'WMS') {
      const tolerance = 0.0001; // Tolerância em graus (aproximadamente 11 metros)
      const xmin = lon - tolerance;
      const ymin = lat - tolerance;
      const xmax = lon + tolerance;
      const ymax = lat + tolerance;

      const width = 101;
      const height = 101;
      const i = Math.floor(width / 2);
      const j = Math.floor(height / 2);

      requestUrl = `${url}?service=WMS&request=GetFeatureInfo&version=1.3.0&layers=0&query_layers=0&info_format=application/xml&crs=EPSG:4326&bbox=${xmin},${ymin},${xmax},${ymax}&width=${width}&height=${height}&i=${i}&j=${j}`;
    } else if (type === 'WFS') {
      requestUrl = `${url}?service=WFS&request=GetFeature&version=2.0.0&typename=0&outputFormat=application/xml&bbox=${lon},${lat},${lon},${lat},EPSG:4326`;
    }

    console.log('URL da requisição:', requestUrl);

    const response = await fetch(requestUrl);
    const text = await response.text();

    console.log('Resposta do serviço (XML):', text);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'application/xml');

    // Log da estrutura do XML
    console.log('Estrutura do XML:', xmlDoc);

    // Verificar se há elementos FeatureMember
    const features = xmlDoc.getElementsByTagName('FeatureMember');
    if (features.length > 0) {
      console.log('FeatureMember encontrado:', features);
      return {
        attributes: features,
        hasIntersection: true,
      };
    }

    // Verificar outros elementos, como "Layer"
    const layers = xmlDoc.getElementsByTagName('Layer');
    if (layers.length > 0) {
      console.log('Camadas encontradas:', layers);
      return {
        attributes: layers,
        hasIntersection: true,
      };
    }

    console.warn('Nenhum dado relevante encontrado na resposta do serviço.');
    return {
      attributes: null,
      hasIntersection: false,
    };
  } catch (error) {
    console.error(`Erro ao consultar o serviço ${type}:`, error);
    throw error;
  }
};