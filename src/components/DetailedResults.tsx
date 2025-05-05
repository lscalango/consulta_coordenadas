import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map } from 'leaflet';

// Define as propriedades esperadas pelo componente DetailedResults
interface DetailedResultsProps {
  selectedLayer: string | null; // Nome da camada selecionada
  setSelectedLayer: (layerName: string | null) => void; // Função para redefinir a camada selecionada
  queryResults: Array<{
    layerName: string; // Nome da camada
    attributes: { [key: string]: any } | null; // Atributos da feição
  }>;
  coordinates: { lat: string; lon: string }; // Coordenadas geográficas (latitude e longitude)
}

// Componente para exibir os detalhes de uma feição selecionada
const DetailedResults: React.FC<DetailedResultsProps> = ({
  selectedLayer,
  setSelectedLayer,
  queryResults,
  coordinates,
}) => {
  // Se nenhuma camada estiver selecionada, não renderiza nada
  if (!selectedLayer) return null;

  // Busca os resultados da camada selecionada
  const result = queryResults.find(r => r.layerName === selectedLayer);
  // Se não houver atributos para a camada selecionada, não renderiza nada
  if (!result?.attributes) return null;

  // Filtra os atributos para exibir apenas aqueles que possuem valores válidos
  const attributes = Object.entries(result.attributes)
    .filter(([key, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      label: key, // Nome do atributo
      value: value.toString(), // Valor do atributo convertido para string
    }));

  // Define o centro do mapa com base nas coordenadas fornecidas
  const center: [number, number] = [parseFloat(coordinates.lat), parseFloat(coordinates.lon)];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Título da seção */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalhes da Feição</h2>

      {/* Mapa interativo exibindo a localização */}
      <div className="mb-4">
        <MapContainer
          zoom={15}
          style={{ height: '300px', width: '100%' }}
          center={center} // Set the center directly using the center prop
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup>{selectedLayer}</Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Tabela de atributos da feição */}
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left py-3 px-4 font-semibold text-gray-600 border-b">Atributo</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600 border-b">Valor</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((attr, index) => (
            <tr key={index}>
              <td className="py-3 px-4 border-b">{attr.label}</td>
              <td className="py-3 px-4 border-b">{attr.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botão para voltar à lista de resultados */}
      <button
        onClick={() => setSelectedLayer(null)} // Redefine a camada selecionada para null
        className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        Voltar
      </button>
    </div>
  );
};

export default DetailedResults;