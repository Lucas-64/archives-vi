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

## ADR-019: Demonstrative Patents and Achievements on the Profile

Decision (aprovada pelo produto em 2026-10-17): o perfil exibe, na lateral, a seção "Patente do Investigador" (medalha atual, nome, frase descritiva futura e medalhas das patentes anteriores) e a seção "Conquistas do Investigador" (nomes em rótulos compactos). A aba "Teorias e publicações" ganha um filtro temático recolhível. Os dados são demonstrativos e vivem em `src/mocks/patentes.ts` e `src/mocks/conquistas.ts`.

Reasoning:

- Dar identidade ao investigador sem depender de um sistema de progressão definido.
- A composição fica pronta para receber os dados reais quando as regras existirem: só os mocks e os tipos mudam.

Limites:

- Não há XP, pontuação, progressão automática, desbloqueio, classificação nem cálculo de nível. A medalha e a patente são só dados.
- A medalha é um SVG provisório, colorido por tokens do tema. Não há imagens externas.
- A frase descritiva (`descricao`) é opcional e não tem texto provisório: sem valor, não aparece.
- Os dados são rotulados como demonstrativos na própria seção.

Supersedes: o risco R3 de `docs/features/perfil-social.md` (gamificação antecipada) e a seção "Patente, especializações e distintivos" deixam de ser aplicáveis à exibição demonstrativa. Permanecem em vigor para XP, especializações e qualquer regra de progressão, que continuam fora de escopo.

Também substitui "Membros relacionados" da sidebar, que não tem dados. A lateral passa a mostrar as conquistas do próprio membro, não outros usuários.

Status: Accepted, em caráter demonstrativo. Deve ser revisto quando as regras de patente e os dados reais forem definidos.

## ADR-020: Editorial Mysteries and Community Theories

Decision (aprovada pelo produto em 2026-10-17): a rota `/investigacoes/[slug]` é a página editorial de Mistério, e `/publicacoes` é a área comunitária unificada de Teorias e Investigações. As URLs atuais são mantidas.

- `/investigacoes/[slug]`: cabeçalho editorial, vídeo do YouTube opcional (só o link é guardado, o player é o do YouTube), corpo com a hipótese, argumentos, pergunta central e fontes da teoria, seção de fotografias com as imagens das evidências públicas, e transição para a comunidade.
- `/publicacoes`: lista investigações e publicações em grupos separados, sem vínculo entre eles (ADR-013). A discussão completa de cada investigação fica na rota dedicada `/publicacoes/investigacao/[slug]`: teoria, evidências com sugestões, discussão, localização, histórico e síntese, reutilizando os mesmos componentes. Slug inexistente recebe HTTP 404 real (ADR-014). A forma antiga `?investigacao=slug` é redirecionada na configuração (`next.config.ts`), com 307.
- O item de menu "Teorias" passa a se chamar "Teorias e investigações".

Resolvida na etapa seguinte: a discussão ganhou a rota dedicada `/publicacoes/investigacao/[slug]`, com `dynamicParams = false` e `generateStaticParams`, o que dá HTTP 404 real para slug inexistente, como em `/investigacoes/[slug]`. Não há mais listagem renderizada para discussão inexistente. O aprendizado: qualquer `notFound()` ou `redirect()` dentro de uma página dinâmica do grupo `(site)` responde 200 com erro, porque roda sob o `loading.tsx` do grupo; por isso o redirecionamento da forma antiga foi feito na configuração.

Status: Accepted, com a pendência acima registrada.

## ADR-021: Meu Perfil como área pessoal demonstrativa

Decisão (implementada em 2026-10-17, aguardando revisão do produto): a área pessoal do membro fica em `/meu-perfil`, com oito abas (Visão geral, Investigações, Teorias e publicações, Evidências, Respostas e discussões, Solicitações e conexões, Notificações e Conquistas). Não há login, backend, persistência nem upload real. A página mostra um criador fixo dos mocks (`ID_CRIADOR_DEMONSTRATIVO`, em `src/lib/meuPerfil.ts`) e rotula isso como demonstração.

- Dados reais, derivados dos mocks por funções puras (`src/lib/meuPerfil.ts`): investigações criadas e em que participa, teorias e publicações, evidências enviadas, respostas nas discussões. Evidências usam o estado do domínio: evidência pública = aceita; sugestão pendente, aceita ou recusada conforme o `status` real. Nenhum motivo de recusa e nenhuma data é inventada.
- Dados demonstrativos, marcados como tais: notificações, solicitações e conexões (`src/mocks/meuPerfil.ts`). Responder a solicitações exige conta: a ação fica desabilitada, com link para `/entrar`.
- Edição de nome e bio: validação (nome obrigatório, até 60 caracteres; bio até 240), mensagem de erro por campo e aviso explícito de que nada é salvo. A alteração vale só até recarregar a página.
- Marcar notificação como lida: só muda a tela, com o mesmo aviso de não persistência.
- Patente e conquistas: somente leitura, reutilizando `PatenteInvestigador` e `ConquistasInvestigador` (ADR-019).
- Sem XP, nível, reputação ou regra de progressão. Os dados não existem no domínio.
- Âncoras: só evidência pública tem `#evidencia-{id}`. Sugestão aceita abre a comunidade sem âncora, porque a lista pública não a identifica por id. Respostas abrem `#discussao`.
- As abas usam `?aba=` pelo mesmo mecanismo de ADR-017 (`AbasPerfil` generalizado com lista de abas e parâmetro). A aba padrão não aparece na URL.
- Navegação: link "Meu perfil" no cabeçalho desktop, entre "Criar teoria" e "Entrar", oculto abaixo de 768 px, pelo precedente de ADR-012. A barra mobile não muda.
- Rota estática sem parâmetros, com `robots` `noindex`. Não há 404 dinâmico a tratar.

Por que: a especificação pede uma área pessoal com identidade, edição e as oito abas, sem backend. Reutilizar os componentes do perfil público evita duplicar a regra de autoria e mantém um único conjunto de dados. Limitar a edição ao estado da página evita simular persistência, o que ADR-010 proíbe.

Pendências: (1) decidir se o link "Meu perfil" deve aparecer para visitantes sem conta, já que o cabeçalho também mostra "Entrar" e "Criar conta"; (2) autenticação e backend para editar, responder, marcar como lida de fato e receber notificações reais; (3) upload de avatar, ainda não existe; (4) leitor de tela não testado nesta área.

Status: Accepted, com as pendências acima registradas. Aguardando a revisão do produto antes da auditoria final do MVP.

Ajuste visual (2026-10-17, após comparação com a referência aprovada): a área passou a usar cinco abas visíveis, como na referência: Visão geral, Teorias e publicações, Investigações, Evidências e Atividade. Solicitações e conexões, respostas e discussões e notificações ficaram na aba Atividade. A aba Conquistas saiu: as conquistas aparecem como rótulos no cabeçalho, e a patente tem cartão próprio, somente leitura. O parâmetro de URL passou a ser `?aba=atividade` (e os valores antigos `respostas`, `solicitacoes`, `notificacoes` e `conquistas` caem na aba padrão). A mudança de oito para cinco abas é uma mudança de decisão e precisa de confirmação do produto. Também saíram do Meu Perfil o indicador de contribuições, a investigação em destaque e as contribuições recentes, que continuam no perfil público.

Esclarecimento (2026-10-17, auditoria final da etapa): a aba Atividade mostra o número de notificações não lidas e atualiza esse contador junto com a lista. Um valor de `?aba=` desconhecido cai na aba Visão geral, como em ADR-017 para o perfil público. A ação "Abrir investigação" usa o mesmo padrão de ação restrita do projeto (desabilitada, com link para `/entrar`), porque não há rota de criação de investigação.

## ADR-022: Início antecipado do backend, sem integração com o front

Decisão (solicitada pelo Lucas em 2026-10-19 e confirmada em 2026-10-20): o backend começa a ser construído antes de o front estar "concluído e validado", sob estas condições:

- O escopo é exclusivamente backend: `src/server/**`, `src/app/api/**`, `drizzle/**`, `docs/backend/**` e arquivos de apoio (`drizzle.config.ts`, `vitest.config.ts`, `.env.example`, `docker-compose.yml`).
- O frontend, `src/lib/data.ts`, os mocks e os tipos compartilhados permanecem intactos. Não há integração nem troca de mocks por chamadas de API.
- Nenhum serviço pago, conta externa, período de teste ou deploy. Desenvolvimento e testes são locais (PostgreSQL local).
- A integração com o front só começa por autorização expressa do Lucas e é gradual, por funcionalidade.

Relação com outros ADRs: **não altera o ADR-015**. A restrição do ADR-015 ("backend, banco e autenticação reais ficam fora do escopo até que o frontend esteja concluído e validado") é **excepcionada** por esta decisão apenas quanto ao início do desenvolvimento do backend; o ADR-015 continua valendo para a interface de gerenciamento dentro da investigação (visível só ao responsável autenticado) e para a integração. O ADR-010 continua valendo para o front enquanto não houver integração.

Por que: validar contratos de dados e regras de autorização antes da integração reduz retrabalho; manter o front intacto preserva o MVP em revisão.

Status: Accepted (aprovado pelo Lucas em 2026-10-20 e incorporado a este arquivo).

## ADR-023: Stack do backend

Decisão (Lucas, 2026-10-20): Next.js Route Handlers com TypeScript; PostgreSQL 16 (local no desenvolvimento); Drizzle ORM com migrações SQL versionadas em `drizzle/`; Zod para validação (variáveis de ambiente, entradas e contratos); sessões persistidas no banco com cookie opaco `HttpOnly`; mesma origem entre front e API.

Por que: uma única base e um único deploy futuro, sem CORS, camada `src/server/` desacoplada de React e portável para um serviço separado se for preciso. Relacional se ajusta ao domínio (autoria, estados, contagens).

Consequências: Node 22.12+ para as ferramentas de teste (Vitest 5), enquanto o Next aceita 20.9+. Hospedagem, banco gerenciado, e-mail e armazenamento de arquivos de produção **não estão decididos nem contratados**; o código fala com interfaces (`DATABASE_URL`, futuramente `Armazenamento` e `EnviadorEmail`) para que a escolha seja reversível. `generateStaticParams` com `dynamicParams = false` (ADR-014) não acomoda conteúdo criado depois do build: será revisitado só na integração, em ADR próprio.

Status: Accepted (decisão do Lucas em 2026-10-20).

## ADR-024: Criação de investigações por membros autenticados

Decisão (Lucas, 2026-10-20): qualquer membro autenticado pode criar investigações pela API, com no máximo 3 investigações abertas (não encerradas) por membro. Isto **substitui** a regra anterior do plano do backend (seção 0A.5, item 2, e D22), que previa "ninguém cria por API no MVP-A; moderador/admin no MVP-B". A exigência de e-mail verificado (D12) fica adiada, pois não há verificação de e-mail.

Complementos aprovados na mesma data: `status` (eixo da listagem, ADR-009) nasce `investigating` e **não** é alterado pelas rotas de gerenciamento; alterações de `status` ficam para a moderação (Tarefa 7). `estado` (eixo do detalhe) é alterado só pelo responsável, com qualquer transição entre os quatro valores e histórico gravado pelo servidor. `encerrar` apenas marca `encerradaPeloAutor` (não altera `status` nem `estado`, não reabre e é idempotente), em linha com o ADR-009. Campos que dependem de tabelas ainda inexistentes (contagens de evidências, comentários e participantes, síntese) são omitidos, e `imagem` é sempre `null`. Limites de tamanho, de investigações abertas e de mutações por minuto são provisórios, a revisar antes da produção. A regra de quem cria fica em um único predicado no servidor, para ser restringida de novo (por exemplo à moderação) sem mudar contratos.

Relação com outros ADRs: não altera o ADR-015 nem o ADR-009. A interface de gerenciamento no front continua dependente do ADR-015 e da integração, que não foi feita.

Status: Accepted (aprovado pelo Lucas em 2026-10-20).

## ADR-025: Evidências, moderação mínima e primeiro administrador

Decisão (Lucas, 2026-10-20, Tarefa 7): sugestão e evidência são o mesmo registro, com decisão final de `pendente` para `aceita` ou `recusada`, tomada pelo responsável da investigação ou pela moderação (nunca pelo próprio remetente). O responsável cria evidência já aceita; membros criam sugestões pendentes. Só as aceitas são públicas e contam em totais e no histórico público; a autoria original é preservada. Não há imagens, avaliações nem comentários em evidências nesta etapa.

A moderação mínima permite: moderador ou admin mudar o `status` de uma investigação (qualquer transição entre os 5 valores reais, com motivo, nunca na própria investigação); o administrador trocar papéis apenas entre `membro` e `moderador`; o administrador ler a auditoria. O responsável não ganha poder sobre `status`. Os papéis são sempre lidos do banco. Toda mudança efetiva de status, decisão de evidência da moderação, troca de papel e criação do primeiro administrador grava um registro em uma tabela de auditoria somente de inserção (gatilhos do PostgreSQL), na mesma transação da operação: se a auditoria falhar, a operação é desfeita.

O primeiro administrador é criado apenas pelo script `npm run admin:criar`, sem rota HTTP: senha fora da linha de comando, recusa quando já existe administrador, execução serializada por bloqueio consultivo. Nenhum caminho HTTP concede `admin`.

Relação com outros ADRs: não altera ADR-009 (o `status` continua sendo o eixo da listagem; a moderação passa a ser quem o altera), ADR-015, ADR-022, ADR-023 nem ADR-024. Substitui, para a API, o item "moderação mínima" do plano como proposta. O front permanece sem integração.

Limites provisórios (a revisar antes da produção): 10 sugestões por minuto por membro, 10 pendentes por membro e investigação, 30 ações de decisão e moderação por minuto por pessoa.

Status: Accepted (aprovado pelo Lucas em 2026-10-20).

## ADR-026: Perfis públicos, criadores e edição do próprio perfil

Decisão (Lucas, 2026-10-20, Tarefa 8): a API expõe perfil público de qualquer conta, lista de criadores, listas de publicações e investigações de um usuário e a edição de `nome` e `bio` da própria conta. Os indicadores (publicações, investigações, evidências aceitas e comentários) são contagens reais de conteúdo público, sem valores inventados. Criador é quem tem ao menos uma publicação publicada ou uma investigação. A busca por nome ignora acentos e maiúsculas, normalizada na aplicação e com função nativa do PostgreSQL, sem extensão. Nenhum dado fictício existe em produção: o front deve tratar estado vazio; um seed apenas de desenvolvimento só pode ser proposto à parte.

Fora de escopo e inalterado: patentes e conquistas, seguir, busca global, destaques, upload e avatar. Não altera ADR-018 nem ADR-019. O front continua sem integração.

Status: Accepted (aprovado pelo Lucas em 2026-10-20).

## ADR-027: Etapa I, sessão na interface e fim da simulação de entrada e cadastro

Decisão (Lucas, 2026-10-21, Fatia 1 da Etapa I): `/entrar` e `/criar-conta` passam a usar a API real (`POST /api/v1/auth/entrar` e `POST /api/v1/auth/cadastro`), sem simulação nem aviso de demonstração. Isto encerra, para essas duas rotas, a exceção aprovada no ADR-010; o ADR-010 segue valendo para `/criar` até a Fatia 3. O texto do ADR-010 não foi alterado.

**Leitura da sessão no cliente.** O cookie é `HttpOnly`, então a interface descobre a sessão por `GET /api/v1/auth/eu`, em um `SessaoProvider` no `Providers` raiz (estados `carregando`, `visitante`, `autenticado`, `erro`; relida ao voltar para a aba). A preferência por ler no servidor foi avaliada e **não adotada**: ler o cookie no shell torna todas as páginas dinâmicas e, com `(site)/loading.tsx`, as rotas de detalhe passam a responder HTTP 200 com a página "não encontrado" (soft 404) e os redirecionamentos viram redirecionamentos no cliente, o que desfaz o ADR-014 (verificado com `next start`; o mesmo efeito já estava registrado na etapa 4 do perfil social). Com a leitura no cliente, as rotas continuam estáticas e o 404 real é mantido.

**Navegação.** Visitante vê Entrar e Criar conta e não vê Meu perfil nem Sair. Autenticado vê Meu perfil e Sair e não vê Entrar nem Criar conta. Enquanto a sessão é consultada, nenhuma das duas opções aparece (espaço reservado). Não há opções por papel, porque ainda não existe tela de moderação ou administração. `/meu-perfil` redireciona o visitante a `/entrar` e `/entrar` e `/criar-conta` redirecionam quem já tem sessão ao início, ambos no navegador. Isto é conveniência de navegação: a autorização continua no servidor, que valida sessão e papel lidos do banco em cada operação.

**Limitações aceitas.** Há um instante inicial sem opções de sessão no cabeçalho; os redirecionamentos de navegação não são HTTP 307; a sessão mostrada pode ficar desatualizada até a próxima leitura (troca de aba ou recarga), sem efeito sobre a segurança. Pendente para a Etapa I: as quatro rotas de detalhe ainda usam `dynamicParams = false` e não acolhem conteúdo criado depois do build (tratado nas Fatias 2 a 4, com a decisão sobre 404 real em rotas dinâmicas).

Status: Accepted (aprovado pelo Lucas em 2026-10-21).

## ADR-028: Rotas de detalhe com conteúdo criado depois do build e 404 real

Decisão (Lucas, 2026-10-21, Etapa I): preservar HTTP 404 real para slugs ou usuários inexistentes e permitir acesso ao conteúdo legítimo criado depois do build, sem recompilar e **sem tornar todas as páginas dinâmicas**. HTTP 200 para conteúdo inexistente (soft 404) não é aceito como solução definitiva. A verificação de existência acontece no servidor, antes de qualquer streaming.

**Estratégia.** A rota de detalhe com dados reais é dinâmica (`force-dynamic`, sem `generateStaticParams`) e fica em um grupo de rotas próprio, `src/app/(detalhe)/`, **sem `loading.tsx`**. O grupo tem `layout.tsx` com o mesmo `SiteShell` do grupo `(site)` e `not-found.tsx` sem shell (o layout já o aplica). A página consulta o serviço no processo (ADR-029) e chama `notFound()` antes de qualquer `Suspense`; as listas pesadas ficam em `Suspense` dentro da página, depois da verificação, e dão o estado de carregamento. As demais rotas não mudam.

**Por que um grupo novo.** `loading.tsx` cria uma fronteira de Suspense acima da página: o streaming começa antes de a página rodar e `notFound()` e `redirect()` viram resposta 200 com tratamento no cliente (verificado na Fatia 1 e de novo na Fatia 2). Sem `loading.tsx` acima da página, o Next ainda não enviou o cabeçalho HTTP quando `notFound()` é chamado e responde 404 ou 307 reais.

**Verificado com requisições reais** (`next start`, banco descartável, Next 16.4.0): `/perfil/{existente}` 200; `/perfil/naoexiste`, `/perfil/ab` e `/perfil/%00` 404; `/meu-perfil` sem sessão 307 para `/entrar`; um só cabeçalho e um só rodapé na página 404; perfil criado depois do build abre sem recompilar. `/publicacao/[slug]` migrou para este modelo na Fatia 3 (publicação criada depois do build abre sem recompilar; slug inexistente 404). `/investigacoes/[slug]` e `/publicacoes/investigacao/[slug]` migraram na Fatia 4. Não resta rota de detalhe estática com mocks.

Limitações: o shell é aplicado por dois layouts irmãos (`(site)` e `(detalhe)`), então uma mudança no shell não pode ser feita só em um deles; páginas dinâmicas não são pré-renderizadas.

Status: Accepted (decisão do Lucas em 2026-10-21; verificação da estratégia na Fatia 2).

## ADR-029: Páginas leem o banco pelos serviços, no processo; sessão no servidor só em /meu-perfil

Decisão (Etapa I, Fatia 2): Server Components chamam os mesmos serviços das rotas `/api/v1/*` diretamente (`src/server/leitura/`), sem requisição HTTP para a própria aplicação, que o Next desaconselha e que falha durante o build. As regras de visibilidade ficam nos serviços; nada é duplicado. O navegador continua usando as rotas HTTP para mutações (cabeçalho `X-Requested-With: archives-vi` e `Origin` do mesmo site). Páginas que leem o banco usam `export const dynamic = "force-dynamic"` (não há banco no build).

**Sessão.** O ADR-027 mantém a sessão do shell no cliente. Exceção: `/meu-perfil` lê o cookie no servidor (`usuarioDaSessao`), porque precisa dos dados da pessoa antes de renderizar e deve responder HTTP 307 real a visitantes. A página fica dinâmica e as demais rotas não são afetadas. Isto complementa o ADR-027, que descrevia o redirecionamento de `/meu-perfil` como feito no navegador: agora é HTTP 307. `usuarioDaSessao` devolve só `id`, `usuario`, `nome`, `bio` e `criadoEm`, nunca e-mail, papel ou hash.

**Dados na interface.** Adaptadores na borda (`src/lib/adaptadores.ts`) convertem os tipos da API para os do front. Nada é inventado: patente, conquistas, destaque, participações e atividade recente ficam ocultos ou como estado vazio honesto até existir dado real (Fatia 6). O perfil público mostra os quatro indicadores reais da API; listas truncam em 50 itens com aviso (ainda não há "ver mais"). "Seguir" aparece como ação restrita só para visitante, porque não há API de seguir.

Status: Accepted (Etapa I, Fatia 2; a aprovar na revisão da fatia).

## ADR-030: Publicações, criação, comentários e curtidas pela API real

Decisão (Etapa I, Fatia 3, escopo aprovado pelo Lucas em 2026-10-21): `/publicacoes`, `/publicacao/[slug]`, `/criar`, os comentários e as curtidas usam os serviços e endpoints reais (`GET /api/v1/publicacoes`, `GET /api/v1/publicacoes/{slug}`, `…/relacionadas`, `POST /api/v1/publicacoes`, `GET`/`POST /api/v1/comentarios`, `PUT`/`DELETE …/curtida`). Isto encerra a exceção do ADR-010 para `/criar`: o envio simulado e o aviso de demonstração foram removidos. O texto do ADR-010 não foi alterado.

- **Leitura e 404:** páginas leem pelos serviços no processo (ADR-029). `/publicacao/[slug]` está no grupo `(detalhe)` (ADR-028), dinâmica; 404 real para slug inexistente, fora do formato ou oculto. O cookie é lido nessa página só para `euCurti`; o cabeçalho continua com sessão no cliente (ADR-027).
- **Escrita:** o navegador chama as rotas HTTP com `X-Requested-With`. Nenhum estado otimista: curtida, comentário e publicação só aparecem depois da resposta do servidor; em falha, o estado anterior e o texto digitado são mantidos e a mensagem do servidor (ou "Não foi possível concluir agora…") é exibida. 401 mostra "sessão expirou"; 422 aparece no campo.
- **Visitante:** `/criar` mostra pedido de entrada (sem formulário); curtir e comentar ficam desabilitados com link para `/entrar`. A autorização continua no servidor.
- **Conteúdo exibido:** a página da publicação mostra o `corpo` completo (o resumo só para dados sem corpo). Comentários: 20 por página, em ordem cronológica, com "Ver mais comentários" pelo cursor da API. Listagem: 50 itens com aviso (sem "ver mais").
- **Retiradas por falta de API/dado real (não são regressões de backend):** botão "Favoritar" (sem endpoint); sidebar de tópicos do fórum e atualizações em `/publicacoes` (só havia mocks); o grupo "Investigações" de `/publicacoes` (só havia mocks; volta na Fatia 4, vindo da API); `?simular=` em `/publicacoes`.
- **Lacunas entre fatias:** Home, Explorar e Buscar ainda linkam publicações dos mocks, que agora dão 404 com banco real (Fatia 5); `DiscussaoSection` de investigações ainda usa `ComposerBloqueado` (Fatia 4).

Status: Accepted (Etapa I, Fatia 3; a aprovar na revisão da fatia).

## ADR-031: Investigações, evidências e sugestões pela API real

Decisão (Etapa I, Fatia 4, escopo aprovado pelo Lucas em 2026-10-21): `/investigacoes`, `/investigacoes/[slug]`, `/publicacoes/investigacao/[slug]` e o grupo Investigações de `/publicacoes` usam os serviços e endpoints reais de investigações e evidências (`GET /api/v1/investigacoes`, `…/{slug}`, `…/historico`, `GET`/`POST …/evidencias`, `GET …/sugestoes`, `POST …/sugestoes/{id}/aceitar` e `/recusar`, `GET /api/v1/me/sugestoes`). Os detalhes ficam no grupo `(detalhe)` (ADR-028): 404 real e investigações criadas depois do build abrem sem recompilar. Leitura no processo (ADR-029); o cookie é lido nas páginas de detalhe só para permissões e para as sugestões da própria pessoa (`usuarioDaSessao` passa a trazer o `papel`, que nunca vai a componentes de cliente).

- **Evidências:** a lista pública traz só as aceitas (a API filtra). Quem não é o responsável cria sugestão pendente; o responsável publica direto. O envio não aceita imagens (a API rejeita o campo): o formulário oferece só as origens textuais (`referencia_textual`, `origem_nao_verificada`) e avisa que imagens não estão disponíveis. O remetente vê as próprias sugestões (pendente, aceita, recusada e o motivo, que a API entrega só a ele, ao responsável e à moderação). O responsável e a moderação veem a fila de pendentes e aceitam ou recusam (motivo opcional); o resultado só aparece após a confirmação do servidor. A autorização é sempre da API.
- **Retirado por não haver API ou dado real:** discussão (geral e por evidência), localização das evidências (mapa demonstrativo), síntese, participantes, atividade recente, avaliações, imagens e fotografias, capa da investigação, botão "Acompanhar", aba "Sem fontes" em `/investigacoes`, sidebar de fórum e atualizações. O local da investigação aparece como texto no resumo. `EvidenciasList` (aceitar e recusar simulados) foi removida.
- **Filtros:** em `/investigacoes`, "Em andamento" e "Resolvidas" são aplicados sobre as 50 investigações carregadas (a API não filtra por `status`), com aviso. Em `/publicacoes`, "Investigações" mostra o grupo real; o filtro de tema vale para as duas listas.
- **Fora desta fatia (sem tela existente):** editar (a criação ganhou tela depois, ADR-032), mudar `estado`, encerrar e a mudança de `status` pela moderação. Os endpoints existem e seguem sem interface.

Status: Accepted (Etapa I, Fatia 4; a aprovar na revisão da fatia).

## ADR-032: Tela de criação de investigações

Decisão (Lucas, 2026-10-21): `/criar/investigacao` (grupo `(site)`, página estática; a sessão é lida no cliente por `useSessao`, como em `/criar`) cria investigações pelo endpoint existente `POST /api/v1/investigacoes`, sem alterar o contrato. Qualquer membro autenticado pode criar (ADR-024); o servidor decide o limite de 3 abertas, a taxa e a sessão. A rota fica sob `/criar` porque `/investigacoes/criar` colidiria com o slug `criar` de `/investigacoes/[slug]`. Visitante vê "Entre para criar uma investigação" com link para `/entrar`. O sucesso só existe depois do 201 com o `slug`; então a pessoa vai para `/investigacoes/{slug}`. Validação local espelha os limites do contrato (teste de igualdade com `LIMITES_INVESTIGACAO`); o link do YouTube é validado só pelo servidor. Erros aninhados chegam com chaves como `teoria.hipotese` e `teoria.fontes.2`. Links de entrada: `/investigacoes`, `/criar` e `/meu-perfil` (substitui a ação restrita citada no esclarecimento da ADR-021, que dizia não haver rota de criação). Fora do escopo: imagens, evidências na criação, edição, encerramento e demais funções.

## ADR-033: Home, Explorar e Buscar com dados reais

Decisão (Lucas, 2026-10-21, Etapa I, Fatia 5): as três páginas leem os serviços reais no processo (ADR-029) e ficam dinâmicas. **Home:** banner institucional fixo (texto e imagem do site, não conteúdo de usuário) no lugar do carrossel de destaques, que dependia de curadoria inexistente (Tarefa 9, não autorizada); "Mistérios em alta" vira "Investigações recentes" (3 mais recentes por `atualizadoEm`), sem sidebar de fórum e atualizações. **Explorar:** atalhos só para destinos que existem (Mistérios e Teorias); Mapa e Galeria foram removidos até haver rota e dados; mesma lista de investigações recentes. **Buscar:** criadores pela busca da API (`q`: nome sem acento ou usuário; a busca anterior também olhava a bio, o que a API não faz); publicações (título, resumo, palavras-chave, temas) e investigações (título, descrição, localização) são filtradas entre as 50 mais recentes de cada tipo, porque `GET /api/v1/publicacoes` e `/investigacoes` não têm `q`. Quando há mais de 50 registros do tipo, a página avisa que a busca é parcial. Busca completa exige um endpoint novo (busca global, D de busca adiada), que não foi criado. Não há contagem real de investigadores online: o número fixo no cabeçalho continua demonstrativo e fica para a Fatia 6.

Status: parcialmente revertido pelo ADR-036 (Mapa e Galeria em Explorar; sidebars da Home).

## ADR-034: Estabilização da Etapa I (Fatia 6)

Decisão (Lucas, 2026-10-21): o contador "investigadores online" e os itens de menu sem destino (Mapa, Galeria, Fórum) saem do cabeçalho até existirem fonte real e rotas. Não há presença em tempo real na API, então nenhuma contagem substitui o número fixo. `/meu-perfil` usa `key` só com o usuário (antes incluía nome e bio e remontava após salvar, apagando o aviso de sucesso). Sem criação de endpoints, mudança de contrato, redesign ou páginas novas. Pendências registradas, não corrigidas por exigirem decisão de produto ou design: contraste do texto branco sobre o degradê rosa/roxo dos botões primários (3,04:1 no rosa e 4,27:1 no roxo, abaixo de 4,5:1 para texto pequeno); ausência de favicon (`/favicon.ico` responde 404); 14 componentes e 9 mocks sem uso (candidatos a remoção).

Status: parcialmente revertido pelo ADR-036 (contador "investigadores online" e itens Mapa, Galeria e Fórum no menu).

## ADR-035: Contraste dos botões primários e favicon

Decisão (Lucas, 2026-10-21): os tokens `gradientStart` e `gradientEnd` do tema (antes iguais a `pink` e `purple`) passam a `#E5006E` e `#9743FF`, e os botões primários, o link primário do cabeçalho, `LinkDeAcao`, o link primário de Meu Perfil, o botão de `MisterioArtigo` e a seleção de texto usam esses tokens, sem exceções locais. Contraste do texto branco medido com a mesma fórmula do WCAG: 4,61:1 no início, 5,13:1 no meio e 4,60:1 no fim (antes 3,04, 3,74 e 4,27). `pink` e `purple` ficam como cores de destaque sobre fundo escuro. Desabilitado e carregando usam opacidade 0,55 (componente inativo, isento do critério): o contraste efetivo cai para cerca de 3,1 a 3,3:1. Favicon: `src/app/icon.svg` e `src/app/favicon.ico` (32x32, PNG dentro de ICO, 733 bytes), servidos pelo Next com `<link rel="icon">`; usam as cores da marca, não o texto do logotipo.

## ADR-036: Lote de restauração de itens ocultados (revê parte dos ADR-033 e ADR-034)

Decisão (Lucas, 2026-10-22): itens ocultados de propósito no commit `a8cf9a91` voltam à interface, sem funcionalidade nova, identificados como "em breve" ou "demonstração".

- **Menu:** Mapa, Galeria e Fórum voltam ao final de `MAIN_NAV`, nessa ordem, com `href: null`. Aparecem esmaecidos, com o selo "em breve", sem link e sem navegar. Não se criam as rotas `/mapa`, `/galeria` e `/forum`. `MOBILE_NAV` não muda (só rotas funcionais).
- **"Investigadores online":** volta ao canto direito do menu como demonstração rotulada. Não há presença em tempo real na API (ADR-033), então o número é a constante `INVESTIGADORES_ONLINE_DEMO` em `src/constants/demonstracao.ts` (3, coerente com os poucos usuários de exemplo, e não os 312 antigos). O selo "demonstração" aparece junto do valor.
- **Explorar:** os cards Mapa e Galeria voltam em `EXPLORAR_ITENS`, o que vale para a Início e para `/explorar`, que compartilham a lista. Sem rota, mostram "Em breve" no lugar do link, com `aria-disabled`.
- **Sidebars:** "Atualizações recentes" e "Últimos tópicos do fórum" voltam com um item de exemplo de cada, vindo de `src/mocks/` e rotulado "Demonstração" (`SidebarDemonstrativa`). Não há tabela, API nem rota de fórum ou de atualizações.
- **Classificação de Mistérios e filtros (pedidos pelo Lucas nesta mesma data):** a redução das classificações de Mistérios a quatro (Em andamento, Resolvido, Easter egg, Curiosidade), a remoção do filtro por tipo em Teorias e investigações e o botão de mostrar/ocultar filtros foram pedidos por ele. A classificação vale só na interface, derivada do `status` atual; o **campo persistente de classificação de mistério fica para uma etapa futura**. Investigações mantêm seus status. O detalhe de cada mudança é registrado pelas threads responsáveis.

Efeito sobre decisões anteriores: o ADR-033 deixou de valer para Mapa e Galeria em Explorar e para a ausência de sidebar na Home; o ADR-034, para o contador de online e para os itens de menu sem destino. O restante de ambos continua em vigor. Os textos originais não foram reescritos.

A `SidebarDemonstrativa` é usada na Início, em `/investigacoes` e em `/publicacoes` (ligada em 2026-10-22, quando essas páginas não tinham alterações pendentes).

Status: Accepted (decisão do Lucas em 2026-10-22).

## ADR-037: Meu perfil completo, com estados vazios onde não há dado real (revê parte do ADR-028)

Decisão (Lucas, 2026-10-22, lote de restauração, item 04): `/meu-perfil` volta à estrutura completa do ADR-021, com dados reais onde a API tem dado e estado vazio rotulado nos demais blocos. Nada de dado inventado: patente, especializações, pendências, atividade e evidências aparecem como "Informação ainda não disponível". O projeto não define patente inicial, então o cartão de patente fica vazio. Não há tabela, API nem rota demonstrativa novas. Abas, nessa ordem: Visão geral (padrão), Teorias e publicações, Investigações, Evidências e Atividade. Visão geral: "Aguardando sua ação" e "Atividade recente" (vazios rotulados) e, na lateral, "Minhas teorias" e "Minhas investigações" com dados reais e mensagem de vazio. A página continua lendo a sessão real (ADR-029) e redirecionando visitantes para `/entrar`. Os componentes antigos que dependiam de mocks de perfil (`MeuPerfilAtividade`, `MeuPerfilListas`) seguem sem uso, e as regras de patente e de tags não aparecem na interface.

Status: Accepted (decisão do Lucas em 2026-10-22).

Exceção provisória (Lucas, 2026-10-22): para ver o perfil preenchido sem backend, a conta `mamoa` recebe dados de demonstração em `src/constants/demonstracaoMamoa.ts` (tags e patentes, com o selo "Demonstração"). É provisório e deve ser removido quando houver dado real; outros usuários não são afetados. Medalhas: o mapa patente → arquivo está em `src/constants/medalhasPatente.ts` (Observador = 01, Analista de Campo = 03, Investigador = 06, Investigador Sênior = 09; as outras cinco, sem uso).
