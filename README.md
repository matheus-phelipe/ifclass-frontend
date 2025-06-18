
# 📚 IFClass Frontend: Interface do Usuário

## 📖 Sobre o Projeto

O **IFClass Frontend** é a interface do usuário do sistema IFClass, responsável por todas as interações visuais e lógicas do lado do cliente. Ele se conecta ao backend para gerenciar dados e proporcionar uma experiência intuitiva e eficiente para os usuários do sistema de gestão de campus.

### 🔑 Principais Módulos

- **Dashboard Interativo:** Página inicial com informações personalizadas, como *Próxima Aula* e *Avisos da Coordenação*.
- **Gerenciamento de Salas:** Interface para criar, editar e excluir blocos e salas, com **planta baixa interativa** que permite posicionamento visual e redimensionamento, com funcionalidades de pan e zoom.
- **Gerenciamento de Usuários:** Tela completa para administrar usuários, incluindo busca, adição, remoção e gestão de permissões.
- **Design Coeso:** Tema visual moderno e consistente em todas as telas para garantir ótima usabilidade e estética.

## 🛠️ Tecnologias Utilizadas

- **Angular CLI:** v17.x 
- **Angular:** Framework para construção de Single Page Applications (SPAs).
- **TypeScript:** Superconjunto tipado de JavaScript.
- **HTML5 / CSS3 (SCSS):** Estrutura e estilização.
- **Bootstrap 5:** Framework CSS para desenvolvimento responsivo.
- **ngx-panzoom:** Biblioteca Angular para funcionalidades de pan e zoom em SVG (planta baixa).
- **Angular HttpClient:** Módulo para comunicação com a API do backend.

## ✅ Pré-requisitos

Para rodar o frontend localmente, você precisará de:

- **Node.js** (versão 18.x ou superior)
- **npm** (já incluso no Node.js)
- Um editor de código (ex: VS Code)
- (Opcional) **Git** para clonar o repositório

## 🚀 Configuração e Execução

Siga os passos abaixo para executar o IFClass Frontend localmente:

### 1️⃣ Clonar o Repositório

```bash
git clone https://github.com/matheus-phelipe/ifclass-frontend.git
cd ifclass/frontend
```

**Importante:** Certifique-se de estar no diretório `ifclass/frontend`.

### 2️⃣ Instalar Dependências

Dentro do diretório `frontend`, instale todas as dependências do Node.js:

```bash
npm install
```

### 3️⃣ Configurar Conexão com o Backend

O frontend precisa saber onde o backend está rodando. Por padrão, ele busca `http://localhost:8080`.

Se o seu backend estiver em outra URL ou porta, edite o arquivo de ambiente:

- Abra:  
  `ifclass-frontend/proxy.conf.json`
  
- Ajuste o `target` para o endereço correto do seu backend. Exemplo:

```ts
{
  "/api": {
    "target": "http://192.168.18.6:8080", //ou a url do seu backend
    "secure": false,
    "changeOrigin": true
  }
}
```

### 4️⃣ Rodar o Aplicativo

Após instalar as dependências e configurar a URL da API, inicie o servidor de desenvolvimento do Angular:

```bash
ng serve --open
```

Este comando irá:

- Compilar o projeto.
- Iniciar um servidor em `http://localhost:4200`.
- Abrir automaticamente o aplicativo no navegador.
- Recarregar automaticamente ao salvar alterações.

## 🏗️ Build para Produção

Para gerar uma versão otimizada para implantação em ambiente de produção:

```bash
ng build --configuration production
```

Os arquivos estáticos serão criados na pasta `dist/frontend/`  
(ou `dist/<nome_do_seu_projeto_angular>`).

## ⚖️ Licença

Este projeto frontend está sob a licença **[MIT License / Apache 2.0 / Sua Licença Aqui]**.

> ✨ **Contribuições são bem-vindas!**  
> Para reportar bugs ou sugerir melhorias, abra uma *issue* ou envie um *pull request*.
