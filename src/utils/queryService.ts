import { getToken } from './getToken';

// Função para consultar um serviço de mapas
// Esta função realiza uma consulta a um serviço de mapas, verificando se há interseções
// em uma área de tolerância ao redor de um ponto fornecido.
export const queryService = async (
  serviceUrl: string, // URL do serviço de mapas
  serviceName: string, // Nome da camada ou serviço sendo consultado
  x: number, // Coordenada X (em EPSG:31983)
  y: number, // Coordenada Y (em EPSG:31983)
  protected_ = false, // Indica se o serviço é protegido e requer autenticação
  credentials?: { username: string; password: string }, // Credenciais para serviços protegidos
  type: string = 'arcgis' // Adicione um parâmetro para identificar o tipo do serviço
) => {
  if (type === 'wms') {
    // Lógica para consultar serviços WMS
    const params = new URLSearchParams({
      service: 'WMS',
      request: 'GetFeatureInfo',
      version: '1.3.0',
      layers: '0', // Substitua pelo nome da camada, se necessário
      query_layers: '0', // Substitua pelo nome da camada, se necessário
      info_format: 'application/json',
      i: '50', // Coordenada X do clique no mapa (ajuste conforme necessário)
      j: '50', // Coordenada Y do clique no mapa (ajuste conforme necessário)
      crs: 'EPSG:31983',
      bbox: `${x - 3},${y - 3},${x + 3},${y + 3}`, // Define a área de consulta
      width: '101', // Largura do mapa em pixels
      height: '101', // Altura do mapa em pixels
    });

    const response = await fetch(`${serviceUrl}?${params.toString()}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Erro ao consultar o serviço WMS');
    }

    return {
      attributes: data.features?.[0]?.properties || null,
      hasIntersection: data.features?.length > 0,
      layerName: serviceName,
    };
  }

  // Lógica existente para serviços ArcGIS
  const tolerance = 3; // metros

  const envelope = {
    xmin: x - tolerance, // Coordenada mínima X
    ymin: y - tolerance, // Coordenada mínima Y
    xmax: x + tolerance, // Coordenada máxima X
    ymax: y + tolerance, // Coordenada máxima Y
    spatialReference: { wkid: 31983 } // Sistema de coordenadas EPSG:31983
  };

  const params = new URLSearchParams({
    geometry: JSON.stringify(envelope), // Geometria da área de consulta (envelope)
    geometryType: 'esriGeometryEnvelope', // Tipo de geometria (envelope)
    spatialRel: 'esriSpatialRelIntersects', // Relação espacial (interseção)
    outFields: '*', // Retorna todos os campos disponíveis
    returnGeometry: 'false', // Não retorna a geometria das feições
    f: 'json' // Formato da resposta (JSON)
  });

  if (protected_ && credentials) {
    params.append('token', await getToken(serviceUrl, credentials));
  }

  const response = await fetch(`${serviceUrl}/query?${params.toString()}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'Erro ao consultar o serviço');
  }

  return {
    attributes: data.features?.[0]?.attributes || null,
    hasIntersection: data.features?.length > 0,
    layerName: serviceName
  };
};