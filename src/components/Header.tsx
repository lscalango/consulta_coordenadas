import React from 'react';

// Interface para definir as propriedades esperadas pelo componente Header
interface HeaderProps {
  menuOpen: boolean; 
  setMenuOpen: (open: boolean) => void; 
}

// Este componente é responsável por exibir o cabeçalho da aplicação.
// Ele inclui o logotipo, o título da aplicação e um menu de navegação.
const Header: React.FC<HeaderProps> = ({ menuOpen, setMenuOpen }) => {
  return (
    <header className="bg-customBlue text-white py-4 shadow-md">
      <div className="container mx-auto flex flex-col items-center px-4">
        {/* Logotipo da instituição */}
        <div className="mb-2">
          <img
            src="logos/icon.png" // Caminho para o logotipo
            alt="Logo da Instituição" 
            className="h-16 w-auto" 
          />
        </div>

        {/* Título da aplicação */}
        <h1 className="text-xl font-bold text-center">
          SECRETARIA DE ESTADO DA PROTEÇÃO URBANÍSTICA DO DISTRITO FEDERAL - DF LEGAL
        </h1>

        {/* Botão para abrir/fechar o menu no modo responsivo */}
        <button
          className="md:hidden text-white focus:outline-none mt-4"
          onClick={() => setMenuOpen(!menuOpen)} 
        >
          {/* Ícone do botão (hambúrguer) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7" // Desenho do ícone
            />
          </svg>
        </button>

        {/* Menu de navegação */}
        <nav
          className={`${
            menuOpen ? 'block' : 'hidden' 
          } md:flex flex-col md:flex-row gap-4 md:gap-6 items-center w-full md:w-auto mt-4`}
        >
          {/* Link para a página inicial */}
          <a
            href="https://www.dflegal.df.gov.br/"
            className="block md:inline-block hover:underline text-white font-medium text-sm"
          >
            Página Inicial
          </a>

          {/* Link para a página "Sobre" */}
          <a
            href="/sobre"
            className="block md:inline-block hover:underline text-white font-medium text-sm"
          >
            Sobre
          </a>

          {/* Link para a página "Contato" */}
          <a
            href="/contato"
            className="block md:inline-block hover:underline text-white font-medium text-sm"
          >
            Contato
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;