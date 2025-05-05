import proj4 from 'proj4';

// Configuração dos sistemas de coordenadas utilizando a biblioteca proj4
// Esta configuração define os sistemas EPSG:4326 e EPSG:31983 para serem usados na aplicação.

// EPSG:4326
// - Sistema de coordenadas geográficas baseado no WGS84 (latitude e longitude).
// - Utilizado amplamente em sistemas de navegação GPS e mapas globais.

// EPSG:31983
// - Sistema de coordenadas projetadas baseado no UTM (Universal Transverse Mercator), zona 23 sul.
// - Utilizado no Brasil para representar coordenadas em metros, adequado para medições locais.

proj4.defs([
  [
    'EPSG:4326', // Identificador do sistema de coordenadas
    '+proj=longlat +datum=WGS84 +no_defs' // Definição do sistema baseado em WGS84
  ],
  [
    'EPSG:31983', // Identificador do sistema de coordenadas
    '+proj=utm +zone=23 +south +datum=WGS84 +units=m +no_defs' // Definição do sistema UTM, zona 23 sul
  ]
]);

// Exporta a configuração do proj4 para ser utilizada em outras partes da aplicação
export default proj4;