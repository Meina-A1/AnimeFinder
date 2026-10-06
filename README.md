<div align="center">
  <img src="public/favicon.svg" alt="Ícone do Nekofinder" width="72" height="72" />
  <h1>Nekofinder</h1>
  <p>Seu cantinho para descobrir animes, explorar GIFs e guardar favoritos.</p>
  <p>
    <img src="https://img.shields.io/badge/React-19-149ECA?logo=react&amp;logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8-7650B8?logo=vite&amp;logoColor=white" alt="Vite 8" />
    <a href="LICENSE"><img src="https://img.shields.io/badge/Licen%C3%A7a-MIT-7650B8" alt="Licença MIT" /></a>
    <a href="https://github.com/Meina-A1/AnimeFinder/actions/workflows/deploy-pages.yml"><img src="https://github.com/Meina-A1/AnimeFinder/actions/workflows/deploy-pages.yml/badge.svg?branch=main" alt="Publicação no GitHub Pages" /></a>
  </p>
  <p>
    <a href="https://meina-a1.github.io/AnimeFinder/"><strong>Acessar o site</strong></a>
    &nbsp;·&nbsp;
    <a href="https://github.com/Meina-A1/AnimeFinder">Repositório</a>
    &nbsp;·&nbsp;
    <a href="#executar-localmente">Executar localmente</a>
  </p>
</div>

---

## Sobre o projeto

O **Nekofinder** é uma aplicação React para encontrar animes pelo título, gênero ou tag, explorar imagens e GIFs e reunir suas descobertas em uma coleção de favoritos. A navegação acontece em uma única página, sem recarregamentos entre as telas.

Desenvolvido para o **Projeto 1 de Programação Web Fullstack**, o projeto implementa o frontend e integra duas APIs públicas: AniList e Nekos.best.

## O que você pode fazer

| Área | Funcionalidades |
| --- | --- |
| **Animes** | Busca por título, gênero ou tag, sugestões e paginação. Cartões com capa, sinopse, ano, episódios e nota, quando disponíveis. |
| **GIFs & imagens** | Busca de GIFs pelo anime e de imagens pelo artista. Geração aleatória por categoria, com até 20 mídias por busca. |
| **Favoritos** | Coleção de animes, GIFs e imagens salva no navegador com `localStorage`. |
| **Integração** | O botão **Ver GIFs** pesquisa as mídias do anime selecionado. Os cartões permitem abrir o GIF e copiar seu link. |

O layout se adapta a diferentes tamanhos de tela e inclui navegação por teclado, rótulos nos controles e mensagens de carregamento, erro e resultado vazio.

### Experimente

1. Na aba **Animes**, pesquise um título como `Naruto` ou uma tag como `Isekai`.
2. Use **Ver GIFs** em um resultado ou abra **GIFs & imagens** para pesquisar e explorar categorias como `hug` e `pat`.
3. Clique no coração de um cartão e encontre os itens salvos em **Favoritos**.

## Tecnologias e React

| Tecnologia | Uso no projeto |
| --- | --- |
| **React e React DOM** | Componentes, estados e navegação da aplicação. |
| **Vite** | Servidor de desenvolvimento e geração do build. |
| **React Hook Form** | Registro dos campos e validação dos formulários de busca. |
| **Fetch API** | Requisições assíncronas às APIs e tratamento das respostas JSON. |
| **CSS e SVG** | Estilos responsivos, identidade visual e ícones. |
| **ESLint e Node.js Test Runner** | Verificação do código e testes dos serviços e favoritos. |

### Hook escolhido: `useRef`

Em [SearchForm.jsx](src/components/SearchForm.jsx), `useRef` mantém a referência do seletor de categoria. Quando a galeria está ativa e as categorias estão disponíveis, um `useEffect` usa essa referência para focar o controle.

Em [App.jsx](src/App.jsx) e [AnimeExplorer.jsx](src/components/AnimeExplorer.jsx), o mesmo hook guarda o `AbortController` da busca em andamento, permitindo cancelar a requisição anterior ao iniciar outra. Alterar uma referência não provoca uma nova renderização.

A aplicação também usa `useState` para atualizar a interface e `useEffect` para carregar dados e controlar efeitos dos componentes.

## APIs utilizadas

| API | Dados e integração |
| --- | --- |
| **[AniList](https://docs.anilist.co/guide/introduction)** | Catálogo de animes, capas, sinopses, gêneros e tags. Consultas GraphQL enviadas por `POST` para `https://graphql.anilist.co`, com corpo e resposta em JSON. |
| **[Nekos.best](https://docs.nekos.best/getting-started/introduction)** | Imagens, GIFs, categorias e metadados. Requisições `GET` para `https://nekos.best/api/v2`. O campo `anime_name` fornece o nome do anime nos cartões de GIFs. |

As integrações estão em [animeApi.js](src/services/animeApi.js) e [nekoApi.js](src/services/nekoApi.js). As consultas utilizadas são públicas e não exigem chave de API nem login.

### Disponibilidade dos dados

- As buscas e mídias dependem de conexão com a internet e da disponibilidade das APIs.
- A pesquisa por características usa os gêneros e as tags do AniList. Sinopses e alguns termos podem estar em inglês.
- Os GIFs disponíveis variam conforme o anime e a reação. Uma busca pode retornar menos itens que o solicitado ou nenhum resultado.
- Os favoritos ficam no navegador em que foram salvos. Se o armazenamento estiver bloqueado, permanecem apenas durante a sessão.

## Executar localmente

**Pré-requisitos:** Node.js **22.12 ou superior**, npm e Git.

```bash
git clone --branch main https://github.com/Meina-A1/AnimeFinder.git
cd AnimeFinder
npm ci
npm run dev
```

Abra o endereço exibido no terminal, normalmente [http://127.0.0.1:5173](http://127.0.0.1:5173).

### Comandos disponíveis

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Iniciar o servidor local. |
| `npm run lint` | Verificar o código com ESLint. |
| `npm test` | Executar os testes dos serviços e favoritos. |
| `npm run build` | Gerar a versão de produção em `dist/`. |
| `npm run preview` | Visualizar o build de produção localmente. |

## Estrutura do projeto

```text
src/
├── App.jsx             # Navegação, buscas e favoritos
├── main.jsx            # Montagem da aplicação
├── styles.css          # Estilos e responsividade
├── components/         # Formulários, catálogo e cartões
└── services/           # Integrações com APIs e armazenamento
tests/                  # Testes dos serviços e favoritos
public/                 # Ícone da aplicação
.github/workflows/      # Publicação no GitHub Pages
```

## Publicação

O site está hospedado no **[GitHub Pages](https://meina-a1.github.io/AnimeFinder/)**. Cada envio à branch `main` executa o [workflow de publicação](.github/workflows/deploy-pages.yml), que verifica o código, executa os testes e gera o build com a base `/AnimeFinder/` antes de publicar.

O andamento e o resultado de cada publicação ficam disponíveis na [aba Actions](https://github.com/Meina-A1/AnimeFinder/actions).

## Informações da entrega

| Item | Informação |
| --- | --- |
| **Disciplina** | Programação Web Fullstack — Projeto 1. |
| **Repositório** | [Meina-A1/AnimeFinder](https://github.com/Meina-A1/AnimeFinder), branch `main`. |
| **Integrantes** | Nomes e responsabilidades ainda não informados. |
| **Hook implementado** | `useRef` para foco de controles e referência das requisições. |
| **APIs JSON** | AniList e Nekos.best. |
| **Biblioteca externa** | React Hook Form. |

### Ferramenta de apoio

O **OpenAI Codex** foi utilizado como apoio na análise do projeto anterior, implementação dos componentes e estilos, integração das APIs, documentação e verificações técnicas.

## Licença

Distribuído sob a [licença MIT](LICENSE). As imagens e os GIFs são fornecidos pelas APIs e pertencem aos respectivos criadores.
