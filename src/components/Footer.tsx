import React from 'react';

// Componente Footer
// Este componente é responsável por exibir o rodapé da aplicação.
// Ele contém uma nota informativa sobre a tolerância de 3 metros aplicada às consultas.
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-200 text-gray-700 text-center py-4">
      {/* Texto informativo no rodapé */}
      <p className="text-sm">
        Nota: Existe uma tolerância de 3 metros do ponto informado para considerar interferências.
      </p>
    </footer>
  );
};

export default Footer;