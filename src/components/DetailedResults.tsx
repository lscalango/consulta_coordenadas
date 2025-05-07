import React from 'react';

interface DetailedResultsProps {
  selectedLayer: string | null;
  setSelectedLayer: (layerName: string | null) => void;
  queryResults: { layerName: string; attributes: Record<string, string> | null }[];
  coordinates: { lat: string; lon: string };
}

const DetailedResults: React.FC<DetailedResultsProps> = ({
  selectedLayer,
  setSelectedLayer,
  queryResults,
  coordinates,
}) => {
  const result = queryResults.find((r) => r.layerName === selectedLayer);

  if (!result || !result.attributes) {
    return (
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-lg font-bold mb-4">Detalhes da Camada</h2>
        <p>Nenhum detalhe disponível para a camada selecionada.</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setSelectedLayer(null)}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">Detalhes da Camada: {selectedLayer}</h2>
      <ul>
        {Object.entries(result.attributes).map(([key, value]) => (
          <li key={key} className="mb-2">
            <strong>{key}:</strong>{' '}
            {typeof value === 'string' && value.startsWith('http') ? (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {value}
              </a>
            ) : (
              value || 'N/A'
            )}
          </li>
        ))}
      </ul>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setSelectedLayer(null)}
      >
        Voltar
      </button>
    </div>
  );
};

export default DetailedResults;