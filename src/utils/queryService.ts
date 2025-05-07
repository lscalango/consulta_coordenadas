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
    ymax: y + tolerance, // Coordenada máxima Y
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