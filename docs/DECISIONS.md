# Architecture Decisions

## ADR-001: React + Vite During MVP

Decision: Archives VI will use React + Vite during the MVP stage.

Reasoning:

- Fast local development.
- Simple build pipeline.
- Lower migration overhead while the product direction is still forming.
- Good fit for a portfolio-stage front-end application.

Status: Superseded by ADR-008

## ADR-002: Defer Next.js Migration

Decision: Next.js migration will happen only after the Home MVP is complete.

Reasoning:

- The project needs stable UI primitives and product structure first.
- Premature migration would add routing, SSR and asset concerns before the
  product surface is defined.
- A future migration remains valuable for SEO, case pages and server-rendered
  content.

Status: Superseded by ADR-008 (migration brought forward by the project owner)

## ADR-003: Styled Components as Official Styling Solution

Decision: Styled Components is the official styling approach.

Reasoning:

- The project already has a typed theme and global style setup.
- Component-scoped styling fits the design system direction.
- Theme tokens can be consumed directly in components.

Status: Accepted

## ADR-004: `src/components` as Official Components Directory

Decision: `src/components` is the official directory for layout, feature and UI
components.

Reasoning:

- Keeps the application structure clear.
- Separates official components from generated legacy UI under
  `src/app/components/ui`.
- Supports future migration while preserving reusable components.

Status: Accepted

## ADR-005: Design System Before New Pages

Decision: UI primitives will be created before building new pages.

Reasoning:

- Reduces duplicated styling.
- Improves consistency.
- Makes future Home and Cases work faster.
- Supports portfolio-quality engineering documentation.

Status: Accepted

## ADR-006: Keep Generated Legacy UI Temporarily

Decision: Generated legacy UI folders will remain untouched until removal is
planned explicitly.

Reasoning:

- Avoids accidental regressions.
- Preserves imported references while the official system is stabilized.
- Allows cleanup to happen as a dedicated technical debt task.

Status: Accepted

## ADR-007: Conventional Commits

Decision: The project follows Conventional Commits.

Reasoning:

- Improves history readability.
- Supports changelog generation.
- Communicates intent clearly in portfolio review.

Status: Accepted

## ADR-008: Migrate to Next.js App Router

Decision: Archives VI moves from React + Vite to Next.js with the App Router,
TypeScript in strict mode and Styled Components. This supersedes ADR-001 and
ADR-002.

Justification:

- The project owner asked for the migration before building the next pages.
  ADR-002's trigger ("Home MVP complete") was not met, so this is an explicit
  exception and not the planned path.
- The trigger that matters for routing is now present: the next work is case
  pages, which need file-based routing and server-rendered HTML for SEO.
- Doing the migration before more pages exist keeps the cost low: only the
  Home (one route) moves.

Consequences:

- React is upgraded from 18.3.1 to 19.2.9. The Next.js App Router is built on
  React 19, and running React 18 would mean mixing two major versions of React.
- Styled Components needs an SSR registry (`src/app/registry.tsx`) and a
  client provider (`src/app/providers.tsx`). Its `@types` package is removed,
  because Styled Components 6 ships its own types.
- Components that use Styled Components are `'use client'`.
- Vite, Tailwind (the Vite plugin, PostCSS config and CSS entry files) and the
  `figma:asset` resolver are removed. Tailwind is not used by the official
  code; see ADR-006 for the legacy folder.
- The Next.js version is 16.4.0 (stable, requires Node.js 20.9 or later).

Status: Accepted

## ADR-009: Investigation Status Mapping

Decision: the investigation cards show the visible category (Em andamento,
Resolvidas, Sem fontes), mapped explicitly from the internal `Case.status` values
in `src/lib/investigacao.ts`. The planned listing `/investigacoes` will use the same
mapping for its tabs. The detail page uses a separate state
(`EstadoInvestigacao`) and a separate flag (`encerradaPeloAutor`) in
`src/types/InvestigacaoDetalhe.ts`.

Reasoning:

- Closing an investigation is an author action. It must not be read as proof,
  so it is never mapped to "Resolvidas".
- The internal statuses are kept unchanged, so existing data and types stay valid.
- `community` and `classified` have no documented meaning yet. They map to
  `null`: the record keeps its internal label. When the listing is built, these
  records must not appear in the category tabs.

Status: Accepted. Pending: the meaning and category of `community` and `classified`
(needs product approval). The listing `/investigacoes` is not built yet.

## ADR-010: Demonstrative Data and No Persistence Before Authentication

Decision: all content under `src/mocks/` is demonstrative and labeled as such in
code. Actions that need an account (follow, add evidence, vote, comment) are shown
disabled, with a link to `/entrar`. No session, API, local storage or fake persistence
is simulated. Closing an investigation is not in the interface yet; when it is added,
it must follow the same rule and be authorized on the server.

Reasoning:

- There is no backend, authentication or database yet. A simulated save would look real.
- Authorization for closing an investigation must be checked on the server, and that layer does not exist yet.
- Keeping the boundary explicit lets the data layer (`src/lib/data.ts`) be replaced without rewriting pages.

Exceções aprovadas (2026-10-16):

- `/criar` cria somente teorias, com prévia e envio simulado. A mensagem de sucesso
  declara que nada foi publicado nem salvo, e que o envio real depende de backend e conta.
- `/entrar` e `/criar-conta` são formulários demonstrativos: validam no cliente e mostram
  um aviso de que nenhuma sessão ou conta foi criada, porque o backend não existe.
  Não há sessão, cookie, armazenamento, redirecionamento para área logada nem requisição.

Interpretação: a regra de não simular envio ou login existe para evitar que uma simulação
pareça real. Essas demonstrações são rotuladas como tal e não gravam nada, por isso são
permitidas como exceção. Confirmação pendente do usuário, ver `docs/page-specs/EXECUTION_PLAN.md`, seção 9.

Status: Accepted

## ADR-011: Publication and Investigation Routes

Decision: publications (`Publicacao`) live at `/publicacao/[slug]`. Investigations
(`Case`, with optional detail in `InvestigacaoDetalhe`) live at `/investigacoes/[slug]`.
Navigation items are defined once in `src/constants/routes.ts`; items without a
functional route are marked with `href: null` and rendered without a link.

Open point: `Publicacao.tipo` accepts `"investigacao"` (`src/types/Publicacao.ts`), so
investigation-type content currently exists in both models. Evidence in the mocks:
three publications with `tipo: "investigacao"` cover the same subjects as three
`Case` records (sinal da Frequência 99.1 / `leonida-radio-loop`, bunker nos pântanos /
`everglades-bunker-rumor`, código dos adesivos da loja de penhores / `pawn-shop-sticker-code`),
with different ids and no link between them. This overlap is not decided yet and needs
product approval.

Reasoning:

- The two models have different structures (publications have no status;
  investigations have a state, evidence and synthesis), so one page would hide the difference.
- A single source for routes and navigation avoids broken links when a route is added.

Status: Accepted. Pending: the listing `/investigacoes` (the Home "Ver mais" and the
"Mistérios" navigation item point to it), and the decision on the overlap described above.

Decisões complementares (aprovadas em 2026-10-15):

- Modelos separados: `Publicacao` e `Case` continuam distintos. Publicações com `tipo: "investigacao"` continuam em `/publicacoes`, sem entrar na listagem de investigações.
- Vínculo futuro: um campo opcional `caseId` poderá relacionar uma publicação a uma investigação quando houver correspondência real. Ainda não existe nos tipos nem nos mocks.
- Aba "Todas" da listagem `/investigacoes`: inclui todos os registros `Case`, inclusive `community` e `classified`, com os rótulos existentes. Não há abas adicionais. Os status continuam mapeados como no ADR-009.
- `src/data/cases.ts` é mantido por enquanto, sem uso, até uma revisão específica.

## ADR-012: Navigation Entries for Explorar, Criadores and Criar

Decision (aprovada em 2026-10-16):

- `/explorar` integra a navegação principal (`MAIN_NAV` em `src/constants/routes.ts`), depois de "Teorias".
- `/criadores` e `/criar` são ações de texto no cabeçalho desktop, ao lado de "Buscar" e "Entrar". Abaixo de 768 px essas duas ações não aparecem: a barra inferior cobre `/criar`.
- A página ativa é calculada por segmento de caminho (`isRotaAtiva` em `src/lib/navegacao.ts`). Assim `/criar` não fica ativo em `/criar-conta` nem em `/criadores`.

Reasoning:

- Explorar, criadores e criação de teorias são pontos de entrada da descoberta e da participação. Sem link visível, só são alcançados pela URL ou por blocos da Home.
- Uma única regra de página ativa evita marcações indevidas em rotas com prefixo comum.

Status: Accepted. Pendente: `/criadores` ainda não tem entrada na barra inferior mobile. Nenhuma decisão foi tomada sobre isso.

## ADR-013: No Artificial Link Between Publication and Investigation

Decision (aprovada em 2026-10-16): a publicação `letreiro-praia-trailer` não é vinculada à investigação `simbolos-vice-city` por enquanto. Não se criam associações entre publicações e investigações apenas para preencher a interface.

Reasoning:

- A correspondência entre os conteúdos não é clara: a investigação trata de uma rede de símbolos, e a publicação, de uma aparição dupla de um letreiro.
- Uma associação falsa induziria o leitor a acreditar em uma relação que não foi investigada.

Status: Accepted, por enquanto. O campo opcional de vínculo previsto no ADR-011 não foi criado. Qualquer vínculo futuro exige correspondência real e nova decisão.

## ADR-014: Real HTTP 404 for Missing Routes

Decision (aprovada em 2026-10-16):

- Rotas inexistentes devem responder HTTP 404 real. Uma página "Página não encontrada" servida com HTTP 200 (soft 404) não é considerada solução definitiva.
- A correção será feita em um lote separado e verificada em build de produção, com teste do status HTTP real.
- Ela vale para os casos conhecidos: `/perfil/[usuario]`, `/investigacoes/[slug]` e `/publicacao/[slug]`.

Reasoning:

- Um status 200 faz mecanismos de busca e ferramentas de verificação indexarem páginas inexistentes.
- A página em português já existe; falta o status correto.

Status: Accepted. Implementada no lote 2 (2026-10-16), verificada em build de produção.

Implementação (lote 2):

- `/perfil/[usuario]`, `/investigacoes/[slug]` e `/publicacao/[slug]` exportam `dynamicParams = false` e `generateStaticParams`, com as listas dos mocks (`getCriadores()`, `getInvestigacoes()` e `getPublicacoes()`). Um identificador fora dessas listas recebe HTTP 404 do roteador, antes do streaming.
- Página de não encontrado da raiz (`src/app/not-found.tsx`), em português, com o mesmo conteúdo da página do grupo `(site)` (`PaginaNaoEncontrada`). Ela é usada pelo roteador. Desde o lote 3B, renderiza o shell compartilhado do site (`src/components/layout/SiteShell.tsx`), com cabeçalho, navegação, rodapé e barra mobile. O layout `(site)` usa o mesmo componente.
- Trade-off aceito enquanto os dados forem mocks: um perfil, investigação ou publicação novos exigem novo build. Com uma API, a geração de parâmetros deve ser trocada por leitura da API, e a decisão de `dynamicParams` deve ser revisitada.
- Verificação: `curl -i` em produção. Casos válidos responderam 200 com o conteúdo do registro. Casos inexistentes responderam 404, com a página em português.

## ADR-015: Investigation Management Area and Backend Priority

Decision (aprovada em 2026-10-16):

- A futura interface de gerenciamento de uma investigação ficará dentro da própria página da investigação. Ela será visível somente ao responsável autenticado pela investigação. Não é implementada agora.
- Backend, banco de dados e autenticação real ficam fora do escopo até que o frontend esteja concluído e validado.
- Ações demonstrativas não são convertidas em operações reais.

Reasoning:

- Manter o gerenciamento junto da investigação evita uma área administrativa separada antes de existir controle de acesso.
- Validar o frontend primeiro reduz o retrabalho de contratos de dados.

Status: Accepted.

## ADR-016: Temporary Divergence in Evidence #001

Decision (aprovada em 2026-10-16): a descrição e a imagem da evidência #001 de `simbolos-vice-city` são mantidas como estão, apesar da divergência registrada: a descrição fala de um traçado em um muro, e a imagem anexada é uma vista noturna de cidade.

Reasoning:

- A correção depende de uma imagem compatível, que ainda não foi fornecida.
- Alterar a evidência neste momento ampliaria o escopo de um lote que não trata de conteúdo.

Status: Accepted, em caráter temporário. Deve ser revisto quando houver imagem compatível.


## ADR-017: Profile Tabs Selected on the Client

Decision (aprovada em 2026-10-17): as abas de `/perfil/[usuario]` (Visão geral, Investigações, Teorias e publicações, Conquistas) são escolhidas no cliente, a partir de `?aba=`. A página continua gerada estaticamente, e o servidor não lê `searchParams`.

Reasoning:

- Ler `searchParams` no servidor torna a rota dinâmica. Com `dynamicParams = false`, um perfil inexistente passou a responder HTTP 200 (verificado na etapa 4). Isso desfaz o ADR-014, então a leitura foi removida.
- `FilterTabs` navega por link e não troca o painel no cliente; por isso foi criado um componente pequeno (`src/components/perfil/AbasPerfil.tsx`), com o padrão ARIA de abas (`tablist`, `tab`, `tabpanel`).
- O conteúdo das quatro abas é montado no servidor e passado ao componente. Só o painel ativo entra no DOM, o que evita `id` duplicado no título "Publicações".
- Clique em uma aba usa `history.pushState`, então voltar e avançar percorrem as abas. Não se usa `replaceState`, porque a troca de aba deve ser uma etapa do histórico.
- A sincronização de leitura usa `useSyncExternalStore` sobre `window.location.search`, com `popstate` e um evento próprio disparado após `pushState` (que não emite `popstate`). Não se usa `useSearchParams`, porque ele exige Suspense e impediria o HTML estático com a aba padrão.
- Setas, Home e End movem só o foco. Enter e Espaço ativam a aba. Assim, uma tecla repetida não empilha entradas no histórico.
- Um clique na aba já ativa, com a URL já correta, não faz nada. Valores desconhecidos em `?aba=` mostram a Visão geral; ao clicar em uma aba, a URL passa a ter o valor válido.
- Trade-off aceito: no primeiro carregamento de uma URL com `?aba=` válido, o HTML estático mostra a Visão geral por um instante até a hidratação. A troca de aba não faz requisição nova ao servidor.

Status: Accepted. Implementada na etapa 4 de `docs/features/perfil-social.md` (2026-10-17), verificada em build de produção.

## ADR-018: Profile Social Decisions (Featured Investigation, Tag Catalog, Conditional Sidebar)

Decision (aprovada em 2026-10-17), registrada em `docs/features/perfil-social.md`, seção "Decisões registradas":

1. **Investigação em destaque (híbrida)**: até haver autenticação e persistência, o destaque é um fallback determinístico (investigações criadas pelo membro antes das de participação; depois `atualizadoEm` mais recente; desempate por `id`). O membro não escolhe a investigação nesta fase, e a interface não diz que escolheu. Sem investigação elegível, o bloco não aparece.
2. **Catálogo controlado de tags temáticas**: investigações e publicações usarão o mesmo catálogo fechado (OVNIs e extraterrestres; Criaturas e lendas; Easter eggs e segredos; Símbolos e mensagens; Áudio e transmissões; Locais e mapas; Crimes e acontecimentos; Teorias e conexões). Tags não são patentes, especializações nem distintivos, e não há XP, conquistas, votação ou progressão nesta decisão.
3. **Sidebar condicional**: a sidebar do perfil aparece somente com conteúdo do perfil (reconhecimento e membros relacionados). Sem conteúdo, o layout usa a largura total, sem coluna vazia. A sidebar global de tópicos e atualizações não é usada no perfil.

Reasoning:

- Sem autenticação, uma escolha manual seria simulada. O fallback determinístico usa somente dados existentes.
- Um catálogo único evita categorias duplicadas entre investigações e publicações. Ele serve, no futuro, como contexto para elegibilidade de especializações, cujos critérios continuam privados.
- Uma sidebar com conteúdo global no perfil não diz respeito ao membro, e uma coluna vazia desperdiça espaço.

Status: Accepted, com estado de implementação por item:

- Item 1: a regra está em `investigacaoEmDestaque` (etapa 1) e o bloco foi implementado na etapa 5 do plano. Verificado em produção.
- Item 2: implementado na etapa 10 do plano (2026-10-17), com autorização. O catálogo está em `src/constants/tagsTematicas.ts`, e `Publicacao.tags` usa os ids do catálogo. O texto livre anterior ficou em `Publicacao.termos`, sem perda. Nenhuma investigação tem tags (não há dados). A atribuição dos temas foi feita por correspondência com o nome e precisa de revisão do produto. Auditoria da etapa 11: removidas duas associações duvidosas (`letreiro` e `código` → Símbolos e mensagens); os termos continuam em `termos`. Tags não aparecem em nenhuma página de perfil.
- Item 3: implementado na etapa 7 (`ContentGrid` sem sidebar; perfil sem sidebar, porque ainda não há conteúdo próprio para ela).
