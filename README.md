# 🍔 UaiFood Frontend

Este é o front-end da aplicação **UaiFood**, uma plataforma de delivery de comida desenvolvida para facilitar a conexão entre o restaurante e seus clientes. O projeto oferece uma interface moderna, responsiva e interativa para realização de pedidos, gestão de perfil e administração do cardápio.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando as tecnologias mais modernas do ecossistema React:

  * **Core:** [React](https://react.dev/) (v18), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
  * **Estilização:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) (Componentes de UI)
  * **Roteamento:** [React Router DOM](https://reactrouter.com/)
  * **Gerenciamento de Requisições:** [Axios](https://axios-http.com/)
  * **Formulários e Validação:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
  * **Tempo Real:** [Socket.io Client](https://socket.io/) (para notificações e atualizações de pedidos)
  * **Ícones:** [Lucide React](https://lucide.dev/)

## ✨ Funcionalidades

### 👤 Para Clientes

  * **Catálogo de Produtos:** Navegação por categorias (Lanches, Bebidas, Sobremesas, etc.) e visualização de detalhes dos itens.
  * **Carrinho de Compras:** Adição de itens, ajuste de quantidades e remoção de produtos.
  * **Checkout:** Finalização de pedidos com escolha de endereço e método de pagamento (Pix, Cartão, Dinheiro).
  * **Autenticação:** Login e Cadastro de novos usuários.
  * **Perfil:** Gerenciamento de dados pessoais e múltiplos endereços de entrega.
  * **Histórico de Pedidos:** Visualização dos pedidos anteriores e seus status.
  * **Notificações:** Recebimento de atualizações em tempo real sobre o andamento do pedido.

### 🛡️ Para Administradores

  * **Dashboard Admin:** Acesso restrito para usuários com permissão de administrador.
  * **Gestão de Categorias:** Criação, edição e exclusão de categorias do cardápio.
  * **Gestão de Itens:** Cadastro de novos pratos, edição de preços, descrições e disponibilidade.
  * **Gestão de Pedidos:** Visualização de todos os pedidos e atualização de status (Pendente, Confirmado, Entregue, Cancelado).

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

  * [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
  * Um gerenciador de pacotes (NPM, Yarn ou Bun)

## 🔧 Como Rodar o Projeto

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/uaifood-frontend.git
    cd uaifood-frontend
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configuração de Variáveis de Ambiente:**

    Crie um arquivo `.env` na raiz do projeto com base no exemplo abaixo e configure a URL da sua API (Backend):

    ```env
    VITE_API_BASE_URL=http://localhost:3000
    ```

4.  **Execute o projeto em modo de desenvolvimento:**

    ```bash
    npm run dev
    # ou
    yarn dev
    ```

    O aplicativo estará disponível em `http://localhost:5173`.

## 📂 Estrutura do Projeto

A estrutura de pastas segue um padrão organizado para facilitar a manutenção:

  * `src/api`: Configurações do Axios e funções para chamadas à API.
  * `src/components`: Componentes reutilizáveis (Botões, Inputs, Dialogs, Header, Footer, etc.).
  * `src/contexts`: Contextos do React (AuthContext, CartContext).
  * `src/hooks`: Hooks personalizados (useAuth, useToast, etc.).
  * `src/pages`: Páginas da aplicação (Menu, Login, Carrinho, Admin, etc.).
  * `src/types`: Definições de tipos TypeScript (User, Order, Item, etc.).
  * `src/integrations`: Configurações de serviços externos (Socket.io).

## 🤝 Contribuição

Contribuições são bem-vindas\! Sinta-se à vontade para abrir *issues* ou enviar *pull requests* com melhorias e correções.

-----

Desenvolvido por @igsem123
