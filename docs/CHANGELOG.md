# Changelog

All notable changes to Archives VI will be documented in this file.

The project follows Semantic Versioning and Conventional Commits.

## [Unreleased]

### Added
- Acessibilidade e favicon: o degradê dos botões primários passa a usar `gradientStart` (`#E5006E`) e `gradientEnd` (`#9743FF`) do tema, com contraste mínimo de 4,6:1 para o texto branco (antes 3,04:1 no rosa e 4,27:1 no roxo). `pink` e `purple` seguem como cores de destaque. Adicionados `src/app/icon.svg` e `src/app/favicon.ico` (monograma "VI" no degradê da marca); `/favicon.ico` deixa de responder 404. Ver ADR-035.
- Etapa I, Fatia 6 (revisão integrada): removidos o contador fixo "312 investigadores online" (sem fonte real) e os itens Mapa, Galeria e Fórum do menu principal (sem destino). Corrigido o aviso "Perfil atualizado." de `/meu-perfil`, que sumia logo após salvar porque o componente remontava no `router.refresh()`. Validados de ponta a ponta, com permissões por papel (visitante, membro, moderador, administrador), sessão expirada, logout, listas com mais de 50 registros, 404 reais e conteúdo criado depois do build, em `next start` e `next dev`. Ver ADR-034.
- Etapa I, Fatia 5: Home, `/explorar` e `/buscar` usam dados reais. A Home mostra um banner institucional e as investigações mais recentes (antes, "Mistérios em alta" com mocks); o carrossel "Em destaque" e a sidebar de fórum e atualizações saíram por não haver fonte real. `/explorar` mantém os atalhos Mistérios e Teorias e mostra as investigações recentes; os atalhos Mapa e Galeria, sem destino, foram removidos. `/buscar` pesquisa criadores pela API (nome sem acento ou usuário) e publicações e investigações entre as 50 mais recentes de cada tipo, com aviso explícito quando há mais registros (a API não tem busca por texto para elas). Corrigido: `NotaLista` não tinha `"use client"` e quebrava a página quando o aviso de limite aparecia. Ver ADR-033.
- Etapa I, Fatia 4 (criação): `/criar/investigacao` cria investigações pela API real (`POST /api/v1/investigacoes`): título, descrição, categoria, localização, temas, vídeo do YouTube e teoria (hipótese, argumentos, pergunta central, fontes). Visitantes veem o pedido de entrada; erros por campo e do servidor (limite de 3 abertas, taxa, sessão expirada) aparecem sem perder o texto; o sucesso só existe após o 201 e leva à investigação criada. Links em `/investigacoes`, `/criar` e `/meu-perfil`. Sem imagens, evidências na criação nem outras funções. Ver ADR-032.
- Etapa I, Fatia 4: `/investigacoes`, `/investigacoes/[slug]`, `/publicacoes/investigacao/[slug]` e o grupo Investigações de `/publicacoes` usam a API real (investigações criadas depois do build abrem sem recompilar; slug inexistente dá 404 real). A área da comunidade tem evidências aceitas, histórico, envio de evidência (sugestão pendente para quem não é o responsável), acompanhamento das próprias sugestões com status e motivo da recusa, e fila de análise para o responsável e a moderação, que aceitam ou recusam pela API. Retirados por não haver API ou dado real: discussão, localização das evidências, síntese, participantes, atividade recente, avaliações, imagens, Acompanhar, aba "Sem fontes" e sidebar de fórum/atualizações. Ver ADR-031.
- Etapa I, Fatia 3: `/publicacoes`, `/publicacao/[slug]`, `/criar`, comentários e curtidas usam a API real. A publicação mostra o texto completo, curtir (com contagem confirmada pelo servidor) e comentários reais, com "Ver mais comentários". `/criar` publica de verdade e leva à publicação criada; visitantes veem o pedido de entrada. Publicações criadas depois do build abrem sem recompilar e slugs inexistentes respondem 404 real. Removidos por não haver API ou dado real: botão Favoritar, sidebar de fórum e atualizações em `/publicacoes`, grupo de investigações da listagem (volta na Fatia 4) e o aviso de simulação de `/criar`. Ver ADR-030.
- Etapa I, Fatia 2: `/criadores` e `/perfil/[usuario]` usam a API real (criadores e perfis criados depois do build abrem sem recompilar; usuário inexistente ou inválido responde HTTP 404). O perfil mostra os indicadores reais, publicações e investigações da pessoa, com estados de carregamento, vazio e erro; e-mail, papel e identificadores internos não aparecem. `/meu-perfil` mostra a conta da sessão (HTTP 307 para `/entrar` sem sessão) e a edição de nome e bio chama `PATCH /api/v1/me/perfil`, com erros por campo e sucesso só após confirmação do servidor. Visão geral, evidências, atividade, patente e conquistas de `/meu-perfil` foram removidas até a Fatia 6, por não haver dados reais. Ver ADR-028 e ADR-029.
- Etapa I, Fatia 1: `/entrar` e `/criar-conta` usam a API real (sessão por cookie `HttpOnly`), com erros de validação por campo, mensagem de credenciais incorretas e de limite de tentativas, e sem avisos de demonstração. O cabeçalho passa a respeitar a sessão: visitante vê Entrar e Criar conta; autenticado vê Meu perfil e Sair (o botão Sair encerra a sessão no servidor). `/meu-perfil` redireciona visitantes a `/entrar`; `/entrar` e `/criar-conta` redirecionam quem já tem sessão. O conteúdo de `/meu-perfil` continua demonstrativo até a Fatia 6.
- Backend: perfis e criadores (`GET /api/v1/criadores`, `GET /api/v1/usuarios/{usuario}` com indicadores reais, `GET …/usuarios/{usuario}/publicacoes` e `…/investigacoes`, `PATCH /api/v1/me/perfil` para nome e bio), sem migração. Busca de criadores sem acento e sem extensão do PostgreSQL. O front continua sem usar o backend. Sem patentes, seguir, busca global, destaques, upload nem seed.
- Backend: evidências e sugestões em investigações (`GET`/`POST /api/v1/investigacoes/{slug}/evidencias`, fila de sugestões, aceitar e recusar, `GET /api/v1/me/sugestoes`), moderação mínima (mudar `status` da investigação, trocar papel `membro` ↔ `moderador`, leitura da auditoria), tabela de auditoria somente de inserção e script `npm run admin:criar` para o primeiro administrador, com migração `0005_evidencias_moderacao`. Os resumos e detalhes de investigação ganham `contagemEvidencias`, `contagens.evidencias`, `permissoes.podeSugerirEvidencia` e `permissoes.podeModerar`. O front continua sem usar o backend. Sem imagens, avaliações, denúncias nem notificações.
- Backend: gerenciamento de investigações (`/api/v1/investigacoes`: lista, detalhe, histórico, criar por membro com até 3 abertas, editar, mudar `estado` e encerrar), com migração `0004_investigacoes`. O `status` da lista não é alterado pela API e `imagem` é sempre `null`. O front continua sem usar o backend. Sem evidências, moderação nem seed dos mocks.
- Backend: comentários (`GET`/`POST /api/v1/comentarios`, em publicações) e curtidas (`PUT`/`DELETE /api/v1/publicacoes/{slug}/curtida`), com migração `0003_comentarios_curtidas`; as publicações da API passam a trazer `comentarios`, `curtidas` e `euCurti` calculados. O front continua sem usar o backend. Sem edição, exclusão, moderação nem respostas de comentários.
- Backend (sem integração com o front, que continua com dados simulados): rotas `GET /api/v1/publicacoes` (filtros `tipo`, `tag`, `autor` e paginação por cursor estável), `GET /api/v1/publicacoes/{slug}`, `GET /api/v1/publicacoes/{slug}/relacionadas` e `POST /api/v1/publicacoes` (criação de teoria por membro autenticado, limite de 10 por minuto), com migração `0002_publicacoes` e testes de concorrência. Antes, autenticação com sessões no banco (`/api/v1/auth/*`). Comentários, curtidas, busca e perfis ainda não existem na API. Ver `docs/backend/README.md`.
- `/meu-perfil`: área pessoal demonstrativa (ADR-021), com identidade, edição de nome e bio com validação e aviso de que nada é salvo, e cinco abas: Visão geral, Teorias e publicações, Investigações, Evidências e Atividade (solicitações, conexões, respostas e notificações). Layout ajustado à referência visual: cabeçalho com identidade, patente em cartão próprio, Aguardando sua ação, Atividade recente e colunas laterais. Evidências, respostas e investigações vêm dos dados reais; solicitações, conexões e notificações são demonstrativas. Patente e conquistas são somente leitura. Sem login, backend ou persistência.
- Cabeçalho desktop: "Meu perfil" (`/meu-perfil`), oculto abaixo de 768px (ADR-012).
- `/publicacoes/investigacao/[slug]`: community area of an investigation, with theory, evidence and suggestions, discussion, location, timeline and synthesis (ADR-020). Unknown slugs return HTTP 404.
- `/investigacoes/[slug]`: editorial page of the mystery: presentation, optional YouTube video (only when a valid link exists), theory text, photographs from public evidence, and a transition to the community area.
- `/publicacoes`: unified community area of theories and investigations, with investigations and publications in separate groups (no artificial links, ADR-013).

- `/investigacoes/[slug]`: "Evidência do criador" tag on evidences whose author is the investigation's creator. It indicates provenance, not veracity.
- `/investigacoes/[slug]`: evidence images open in an expanded view inside the card, with up to five images, previous/next controls and a "1 de 3" counter. Keyboard arrows and Escape work.
- `/investigacoes/[slug]`: community evidence suggestions (demonstrative data). Accepted ones appear in the public list with their sender and the approving investigator. Pending and rejected ones never appear publicly. Accept and reject change only the current page session; nothing is saved.
- `/investigacoes/[slug]`: "Localização das evidências" section with a reference map image. It is demonstrative: it marks no real location.
- `/publicacoes` listing with filters (Todas, Teorias, Investigações), loading, empty and error states.
- `/investigacoes/[slug]` detail page (demonstrative data): theory, evidence, discussion, connections graph, history and synthesis. Authenticated actions are disabled with a link to sign-in.
- `Avatar`, `AcaoRestrita` and `ComposerBloqueado` shared components.
- `/investigacoes` listing with filters (Todas, Em andamento, Resolvidas, Sem fontes) in a vertical list with the sidebar. "Todas" includes every record, including community and classified.
- `CaseCard` optional `orientacao="horizontal"` (default unchanged), used in the listing.
- Section images (`galery_day`, `map_day`, `teory_night`) on the Explore tiles, registered in `src/constants/imagensSecoes.ts`.
- Form foundation: `Input`, `Textarea` and `FormField` in `src/components/ui/`, and `CreatorCard` in `src/components/cards/`.
- `/criar`: theory form with live preview and a simulated submission, clearly labeled as simulation. Nothing is saved.
- `/entrar` and `/criar-conta`: demonstrative forms. They state that no session or account is created and that nothing is saved.
- `/buscar`: search across publications, investigations and creators, with tabs and state kept in the URL.
- `/criadores`: list of the creators in the mocks, with links to their profiles.
- `/perfil/[usuario]`: public profile with the creator's publications. Unknown users get the "not found" page.
- `/explorar`: discovery hub with the four explore tiles and "Mistérios em alta". It is in the main navigation (ADR-012).
- `/perfil/[usuario]`: tabs Visão geral, Investigações, Teorias e publicações and Conquistas, selected by `?aba=` on the client (ADR-017). Clicking a tab adds a history entry, so back and forward move between tabs. Conquistas shows a "not available yet" state, with no invented records (Investigações was filled later, see below). Profiles stay statically generated and missing ones still return HTTP 404.
- `/perfil/[usuario]`: "Investigação em destaque" block in the Visão geral, after the tabs. The choice is an automatic fallback, not the member's pick: investigations the member created come first, then those they took part in, each group by most recent update. It shows the investigation's status, hypothesis, evidence and participant counts, and links to the investigation. It is omitted when no detailed investigation involves the member. The game field is not shown, because the data has none.
- `/perfil/[usuario]`: compact contribution indicators (investigations created, theories published, evidence sent), computed from the demonstrative data.
- `/perfil/[usuario]`: header actions. "Seguir" is shown disabled with a link to `/entrar`, because following requires an account (ADR-010). A menu shows "Denunciar" and "Bloquear" disabled, with a note that moderation does not exist yet.
- `/perfil/[usuario]`: sidebar "Patente do Investigador", with the current medal in large size, the previous medals in a compact row, and demonstrative data (ADR-019). Shows an empty state when a member has no patent data.
- `/perfil/[usuario]`: sidebar "Conquistas do Investigador", with achievement names as colored labels. Demonstrative data (ADR-019). Shows an empty state when there are none.
- `/perfil/[usuario]`: the "Teorias e publicações" tab has a collapsible theme filter ("Filtrar temas" / "Ocultar filtros"), closed by default. An active theme from the URL stays applied with the panel closed.
- `/perfil/[usuario]`: the "Investigações" tab lists real investigations in two groups, "Criadas por este membro" and "Em que participa". Each item links to the investigation. Only investigations with a published detail are included. Empty groups show their own state.
- `/publicacao/[slug]`: "Curtir" and "Favoritar" as disabled buttons, with the message "Curtir e favoritar exigem conta" and a link to sign in. Nothing is saved and no count is shown.
- Thematic tags: a controlled catalog of eight themes (`src/constants/tagsTematicas.ts`, ADR-018), with the `TagTematica` component. Publication tags now use the catalog ids.
- `/publicacoes`: theme filter (`?tag=`), combined with the type filter. Unknown values are ignored. A theme with no publications shows an empty state.
- `/perfil/[usuario]`: "Contribuições recentes" list in the Visão geral: publications, public evidence, accepted community suggestions, and investigations the member created or took part in, most recent first (up to 10). Each item links to its publication or investigation, and evidence links to its anchor on the investigation page.

### Changed

- `/meu-perfil`: layout ajustado à referência visual. Cabeçalho com avatar grande, patente em cartão próprio (somente leitura) e conquistas como rótulos. Cinco abas (ADR-021, ajuste visual), com ações "+ Criar teoria" e "Abrir investigação" (ação restrita) na linha de abas. Visão geral em duas colunas, com atalhos para as abas. A aba Atividade reúne notificações, solicitações e respostas, com contador de não lidas.
- `AbasPerfil` (opções `variante="caixa"` e `acoes`) e `Avatar` (tamanho `large`) ganharam opções novas. O estilo padrão do perfil público não mudou.
- Tag audit: two theme associations were removed because they were doubtful. "letreiro" no longer maps to "Símbolos e mensagens", and "código" no longer maps to it. Their free-text terms stay in `termos`.
- Publication tags: `Publicacao.tags` now holds catalog ids. The previous free-text tags moved to `Publicacao.termos`, unchanged, and still feed the search. The publication page shows the themes as tags and the free-text terms on a separate "Palavras-chave" line. Search also matches theme names.
- `ContentGrid`: without a `sidebar`, the main column takes the full width, with no empty 320px column. Pages that pass a sidebar keep their layout.
- `/perfil/[usuario]`: the global sidebar (forum topics and updates) is no longer shown, because it has no relation to the profile. The profile content takes the full width of the page.
- `/perfil/[usuario]`: the loading state follows the profile layout (breadcrumb, identity, indicators, tabs and content) without a sidebar. Placeholders carry no data.
- Main navigation: "Explorar" (`/explorar`) added after "Teorias" (ADR-012).
- Desktop header: "Criadores" (`/criadores`) and "Criar teoria" (`/criar`) text actions added (ADR-012). They are hidden below 768px.
- Active navigation items are matched by path segment, so `/criar` is no longer marked active on `/criar-conta` or `/criadores`.
- `/investigacoes/[slug]`: the "Conexões" section is replaced by "Localização das evidências". The anchor navigation follows.
- `/investigacoes/[slug]`: the first image of each evidence card is about 40% of its previous height (604×135 px on desktop, 341×102 px on mobile). The width and `object-fit: cover` are unchanged.
- `/investigacoes/[slug]`: the reference map in "Localização das evidências" is about half its previous size (about 188px wide on desktop, 162px on mobile), keeping its proportion.
- `/buscar` ignores accents and letter case: "frequencia" finds "Frequência". Data and displayed titles are unchanged.
- `/criadores`: the description no longer says creators publish investigations, because investigations have no author.
- `/explorar`: the hidden section heading reads "Seções para explorar" instead of "Tipos de conteúdo".
- Home investigation cards link to `/investigacoes/[slug]`; the "Ver mais" link points to `/investigacoes`.
- `/publicacoes` lists publications in a single vertical column with the sidebar on the right.
- Migrated from React + Vite to Next.js 16.4.0 with the App Router (ADR-008).
- Upgraded React and React DOM from 18.3.1 to 19.2.9.
- Styled Components now uses an SSR registry and a client provider in the App Router.
- Home moved to `src/app/page.tsx`; root layout in `src/app/layout.tsx`.
- Inter is loaded with `next/font`; `theme.fonts.primary` uses its variable.
- Scripts are now `dev`, `build`, `start` and `typecheck`.

### Fixed

- Unknown profiles, investigations and publications now return a real HTTP 404 (previously HTTP 200 with a "not found" page). Verified with `curl` on a production build. Records are generated at build time from the mocks (ADR-014).
- Root "not found" page in Portuguese, used by the router for unknown dynamic segments. It renders the shared site shell (header, navigation, footer and mobile tab bar) through the new `SiteShell` component, which the `(site)` layout also uses.
- `FormField`: an `id` passed to a control inside it no longer breaks the label link. The generated id wins inside `FormField`.
- `/criar-conta`: the password hint no longer repeats the minimum-length error.
- Heading levels: publication and creator results inside `/buscar` and the profile's publications section use `h3` under their `h2` section headings. The `nivelTitulo` prop defaults to `h2`, so other pages are unchanged.
- Hero background image now comes from an import, so it is included in the production build.
- Removed empty `ui/Badge.tsx`, `ui/Button.tsx` and `ui/Card.tsx`, which shadowed the component folders.

### Removed

- `ConexoesGrafo` component and the connections data of the investigation detail, replaced by the location section.
- Vite, Tailwind (Vite plugin, PostCSS config, CSS entry files), `@types/styled-components`, and unused `react-popper`, `@popperjs/core` and `react-day-picker`.

## [0.3.0] - 2026-07-01

### Added

- Official Button design system primitive.
- Official Card design system primitive.
- Official Badge design system primitive.
- Official StatusBadge component built on top of Badge.
- Design system documentation for created UI primitives.
- Architecture decisions document.
- Sprint documentation set.

### Changed

- Documentation expanded for product, engineering and Scrum portfolio use.

## [0.2.0] - 2026-06-30

### Added

- Architecture note defining `src/components` as the official components
  directory.

### Changed

- Active Header and Hero were consolidated into `src/components`.
- App imports were updated to use the official components directory.

### Fixed

- Active Header JSX issue.
- Production build after foundation cleanup.

## [0.1.0] - 2026-06-24

### Added

- Initial React + Vite + TypeScript project setup.
- Styled Components setup.
- Initial theme tokens.
- Global styles.
- Initial Header and Hero implementation.
- Initial project README and placeholder documentation structure.
