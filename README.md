# AnimeFinder — Neko Gallery

Primeira entrega da disciplina **Programação Web Fullstack**: uma SPA em React para descobrir títulos de anime por nome ou característica, pesquisar imagens e GIFs, e salvar uma coleção de favoritos no navegador.

Este projeto toma como referência o `Projeto1-main.zip` desenvolvido anteriormente pelo aluno. Mantém a Nekos.best para imagens e GIFs, o Hook escolhido (`useRef`) e a biblioteca de formulários (React Hook Form). O catálogo AniList complementa a aplicação para encontrar títulos por nome, tags e gêneros.

## Executar

Requer **Node.js 22.12 ou superior** e npm.

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://127.0.0.1:5173`.

```bash
npm run lint     # Verificar o código
npm test         # Verificar contratos da API e armazenamento
npm run build    # Gerar a versão de produção em dist/
npm run preview  # Visualizar a versão de produção
```

O projeto precisa de internet para consultar as APIs e carregar as mídias. Não requer chave, login, banco de dados ou servidor próprio. O CSS usa fontes do Google Fonts, com fontes locais de substituição caso o serviço esteja indisponível.

## Funcionalidades

- **Animes:** catálogo com busca de título (`Frieren`) ou palavras-chave (`Yandere`, `Isekai`, `Tsundere`), sugestões dinâmicas e paginação. A busca automática identifica tags e gêneros conhecidos; o seletor permite escolher explicitamente nome ou palavra-chave.
- Cartões de anime com capa, ano, episódios, nota, sinopse, gêneros e tags, conforme os dados disponíveis no AniList.
- **GIFs & imagens → Pesquisar:** título de anime para GIFs ou nome de artista para imagens. É possível usar todas as categorias ou escolher uma reação, como `hug` ou `pat`.
- **GIFs & imagens → Aleatório:** geração aleatória por tipo e categoria, com quantidade inteira de 1 a 20, validada pelo React Hook Form.
- Categorias de mídia obtidas dinamicamente da Nekos.best.
- Botão **Ver GIFs** nos animes: abre a galeria com o título preenchido e executa a pesquisa.
- GIFs com nome do anime, categoria, resolução, abertura do arquivo e cópia do link para compartilhar manualmente.
- Favoritos de animes, GIFs e imagens na mesma coleção, com persistência em `localStorage`.
- Alternância entre os modos sem recarregar a página, preservando os filtros e resultados durante a navegação.
- Estados de carregamento, galeria vazia, erro de conexão e nova tentativa de carregar categorias.
- Layout responsivo, controles rotulados, navegação por teclado e indicação de erros.

Os favoritos ficam apenas no navegador utilizado. Não são sincronizados entre dispositivos. Se o armazenamento estiver bloqueado ou cheio, o aplicativo informa que os favoritos duram apenas a sessão. Os arquivos de mídia continuam hospedados na API.

A busca por características utiliza tags e gêneros do AniList, não interpretação livre de frases. Alguns gêneros em português, como `ação`, `comédia` e `terror`, têm tradução para os termos do catálogo. Na galeria, a Nekos.best pode retornar correspondências aproximadas: a aplicação consulta até 20 mídias e mantém apenas as que correspondem ao nome e à categoria, limitadas à quantidade escolhida. Nem todo anime ou reação existe nessa API. Por exemplo, `Frieren + pat` retornou uma mídia no teste; `Frieren + hug` não retornou correspondências naquele momento. Resultados de busca podem ser menores que a quantidade selecionada ou vazios.

## Atendimento aos requisitos

| Requisito | Implementação |
| --- | --- |
| React.js e SPA | Uma única `index.html`; React atualiza os componentes com estado, sem redirecionamento entre telas. |
| AJAX e API JSON aberta | `fetch` assíncrono na Nekos.best e requisições GraphQL com JSON ao AniList, nos serviços. |
| Hook da lista | `useRef` em `SearchForm.jsx` para focar o seletor de categoria; também guarda o pedido em andamento em `App.jsx`. |
| Biblioteca externa | React Hook Form nos formulários de catálogo e galeria, para registrar campos e validar as buscas. |
| Aplicação integrada | O catálogo leva à busca de GIFs do título selecionado; animes e mídias compartilham a coleção de favoritos. |
| Documentação das ferramentas | Tecnologias descritas neste README e declaração de apoio de IA abaixo. |
| Responsabilidades dos integrantes | A equipe deve registrar os nomes e as responsabilidades reais antes da entrega. |
| GitHub público e commits | Repositório AnimeFinder, branch `Develop`; cada integrante deve registrar suas contribuições reais. |
| Apresentação | Demonstração das buscas, GIFs, favoritos e código na data definida pela disciplina. |

Esta entrega implementa a camada **frontend**, conforme o Projeto 1. Um backend poderá ser desenvolvido quando a disciplina solicitar as próximas etapas.

## Ferramentas de apoio e uso de IA

Foram utilizados React, React DOM, Vite, React Hook Form, Fetch API, localStorage, ESLint, Node.js, npm e Git/GitHub. O visual usa CSS próprio, ícones SVG e fontes do Google Fonts.

O **OpenAI Codex** foi utilizado como apoio para analisar o projeto anterior, implementar componentes, buscas, favoritos e estilos, integrar as APIs, preparar a documentação e executar verificações técnicas. A equipe deve revisar e compreender o código para a apresentação, além de registrar as atividades que cada integrante realmente realizou.

## APIs

### AniList — catálogo de animes

Endpoint: `POST https://graphql.anilist.co`

As consultas GraphQL são enviadas como JSON com `query` e `variables`. Não são usadas mutações nem autenticação. `GenreCollection` e `MediaTagCollection` fornecem gêneros e sugestões. `Page.media` busca apenas animes, usando `search` para títulos e `tag` ou `genre` para características. Os resultados têm 12 itens por página, com indicação de próxima página. Dados classificados como adultos e tags de spoiler não são exibidos.

Referências oficiais: [introdução](https://docs.anilist.co/guide/introduction), [consulta de mídias](https://github.com/AniList/docs/blob/master/docs/guide/graphql/queries/media.md) e [limitação de requisições](https://docs.anilist.co/guide/rate-limiting). As sinopses e as tags podem estar em inglês.

### Nekos.best — imagens e GIFs

Base: `https://nekos.best/api/v2`

| Endpoint | Uso |
| --- | --- |
| `GET /endpoints` | Lista categorias e formatos. |
| `GET /{categoria}?amount={quantidade}` | Retorna mídias aleatórias e seus metadados. |
| `GET /search?query={texto}&type={tipo}&amount={quantidade}` | Busca artistas (`type=1`) ou animes (`type=2`), com filtro opcional `category`. |

Documentação oficial: [introdução](https://docs.nekos.best/getting-started/introduction), [endpoints](https://docs.nekos.best/getting-started/api-endpoints.html) e [referência](https://docs.nekos.best/getting-started/api-reference.html).

As chamadas são feitas diretamente pelo navegador, que envia seu próprio `User-Agent`. As fontes originais são links externos abertos em nova aba; o fluxo interno continua sendo uma SPA. O limite de 20 resultados vem da API. O serviço pode estar indisponível ou limitar chamadas; o aplicativo mostra um erro e permite uma nova busca.

## Estrutura

```text
src/
  App.jsx                 # Estados, busca e navegação da SPA
  main.jsx                # Montagem do React
  styles.css              # Visual e responsividade
  components/
    SearchForm.jsx        # Formulário, validação e useRef
    Gallery.jsx           # Listagem, carregamento e estado vazio
    ImageCard.jsx         # Mídia, créditos e botão de favorito
    AnimeExplorer.jsx     # Busca de títulos, tags, sugestões e paginação
    AnimeCard.jsx         # Capa, metadados, favoritos e acesso aos GIFs
    Icon.jsx              # Ícones SVG pequenos
  services/
    nekoApi.js            # AJAX, validação de respostas e API
    animeApi.js           # Catálogo GraphQL, tags e busca de animes
    favorites.js          # Leitura e gravação dos favoritos
tests/
  animeApi.test.js         # Consultas, filtros e respostas do catálogo
  services.test.js         # Mídias e armazenamento de favoritos
```

A pasta `docs/` contém anotações locais de apoio e está excluída do Git, assim como dependências, builds, caches e arquivos ZIP. O código, os testes e o `package-lock.json` fazem parte do repositório.

## Repositório e próximos commits

O código está na branch [Develop do AnimeFinder](https://github.com/Meina-A1/AnimeFinder/tree/Develop). Para obter uma cópia:

```bash
git clone --branch Develop https://github.com/Meina-A1/AnimeFinder.git
cd AnimeFinder
npm install
npm run dev
```

Para enviar novas alterações a partir de uma cópia já configurada:

```bash
git status
git add .
git commit -m "feat: descrever a alteração realizada"
git push origin Develop
```

Antes da entrega, registre neste README os integrantes e as responsabilidades. Cada pessoa deve fazer commits reais das atividades que realizar, ao longo do desenvolvimento. Não é possível comprovar cadência de desenvolvimento ou responsabilidade individual apenas pela existência dos arquivos. A apresentação na data estipulada pela disciplina continua obrigatória.
