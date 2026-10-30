# Estado do projeto

Última verificação: 2026-10-17, contra o repositório.

## Próximo passo

As sete rotas da fase 2 estão implementadas e verificadas, e a fase 2.1 (acabamento) foi concluída. No lote 1, as entradas de navegação aprovadas foram implementadas (`/explorar` na navegação principal; `/criadores` e `/criar` no cabeçalho desktop) e as decisões de produto foram registradas em `docs/DECISIONS.md` (ADR-012 a ADR-016). No lote 2, as rotas `/perfil/[usuario]`, `/investigacoes/[slug]` e `/publicacao/[slug]` passaram a responder HTTP 404 real para recursos inexistentes, verificado em produção (ADR-014). No lote 3B, a página de não encontrado passou a usar o shell compartilhado do site (`SiteShell`), com status 404 mantido. O trabalho do lote 2 em diante e o perfil social foram commitados em `53acd0ad` e enviados para `origin/main`. Próximas tarefas: (1) decidir a entrada de `/criadores` na barra mobile; (2) isolar o console por página em `next dev`. Nenhuma delas começa sem autorização específica.

**Meu Perfil** (ADR-021, `/meu-perfil`): área pessoal demonstrativa no layout da referência visual aprovada. Cabeçalho com identidade, edição de nome e bio (validação de nome obrigatório, 60 e 240 caracteres, e aviso de que nada é salvo), patente em cartão próprio (somente leitura) e conquistas como rótulos. Cinco abas por `?aba=` (Visão geral, Teorias e publicações, Investigações, Evidências e Atividade). Atividade reúne notificações (marcar uma ou todas, com contador), solicitações, conexões e respostas. Solicitações, conexões e notificações são demonstrativas; ações que exigem conta ficam desabilitadas com link para `/entrar`. Sem login, backend, upload ou persistência, e sem XP, nível ou reputação. Auditoria funcional e visual concluída em 1600 px e 375 px, com typecheck, lint e build aprovados. Perfil público e 404 verificados sem regressão. Próximo passo: revisão do produto e autorização explícita antes da auditoria final do MVP. Não iniciar o backend.

**Perfil social** (`docs/features/perfil-social.md`): etapas 1 a 9 do plano concluídas, commitadas em `53acd0ad`. O perfil tem cabeçalho com ações desabilitadas, indicadores, abas por `?aba=` (ADR-017), investigação em destaque (fallback determinístico), contribuições recentes, sidebar condicional e loading próprio. Etapa 10 concluída com autorização: catálogo de oito temas e tags das publicações (ADR-018); investigações ainda não têm tags. Fechamento funcional (etapa 11): "Curtir" e "Favoritar" desabilitados na publicação; aba "Investigações" com dados reais (só investigações com detalhe publicado); auditoria dos temas, com duas associações removidas. Pendências: ações que gravam dependem de backend e autenticação; a catalogação restante precisa de revisão do produto. Ajuste final (ADR-019): lateral do perfil com "Patente do Investigador" e "Conquistas do Investigador", com dados demonstrativos em `src/mocks/patentes.ts` e `src/mocks/conquistas.ts`; filtro de temas recolhível na aba "Teorias e publicações". Sem XP nem regra de progressão. Auditoria final (etapa 12): `next dev` verificado nos fluxos do perfil, da publicação e do filtro, sem erros de React nem avisos de hidratação; sem defeito comprovado e sem alteração de código. Limitações: leitor de tela não testado; aviso de fonte pré-carregada e 404 de `favicon.ico` preexistentes, fora do perfil. Ver `docs/features/perfil-social.md`, "Auditoria final".

**Decisões confirmadas**: isolamento B (paralelo no checkout atual, com escopos disjuntos); demonstrações de `/criar`, `/entrar` e `/criar-conta` como simulações rotuladas, sem persistência nem sessão (ADR-010, "Exceções aprovadas"); `/investigacoes` com todos os status em "Todas", incluindo `community` e `classified`.

**Ajustes de navegação e fluxos (2026-10-26, aguardando revisão, ADR-038):** itens 1 a 9 do pedido implementados no working tree (sem commit). Pendências: regra de patente, regra de quem é criador, carrossel sem curadoria.

## Backend

Iniciado antes da validação do front por decisão registrada no ADR-022, sem alterar o ADR-015; a stack está no ADR-023. O trabalho é feito por tarefas pequenas, cada uma revisada antes da seguinte. Documentação: `docs/backend/README.md`, `docs/backend/DECISOES.md` e `docs/API.md`. Nada foi commitado nem publicado.

**Fechamento da Etapa I (2026-10-21, aguardando revisão):** contraste dos botões primários corrigido e favicon adicionado (ADR-035).

**Fatia 6, revisão integrada (2026-10-21, aguardando revisão):** ADR-034. Fatias 1 a 6 entregues; ver `/mnt/project-files/back/RELATORIO_ETAPA_I_FATIA_6.md`.

**Fatia 5 (2026-10-21, aguardando revisão):** Home, `/explorar` e `/buscar` com dados reais (ADR-033); busca de publicações e investigações é parcial (50 mais recentes). Fatia 6 não iniciada.

**Fatia 4, criação de investigações (2026-10-21, aguardando revisão):** `/criar/investigacao` integrada a `POST /api/v1/investigacoes` (ADR-032). Fatia 5 não iniciada.

**Feito e testado (Tarefas 1 a 8)**: ambiente local (PostgreSQL, Drizzle, Zod, Vitest); fundação HTTP (erros padronizados, validação, paginação por cursor); autenticação (cadastro, entrar, sair, eu; senha com scrypt, sessões no banco, cookie seguro, CSRF e limite de tentativas); publicações (`GET /api/v1/publicacoes`, `GET /api/v1/publicacoes/{slug}`, `GET /api/v1/publicacoes/{slug}/relacionadas` e `POST /api/v1/publicacoes` para criar teoria, com limite de 10 por minuto por membro). Comentários (`GET`/`POST /api/v1/comentarios`, só em publicações) e curtidas (`PUT`/`DELETE /api/v1/publicacoes/{slug}/curtida`), com `comentarios`, `curtidas` e `euCurti` calculados nas publicações. Investigações (`/api/v1/investigacoes`: listar, detalhe, histórico, criar por membro com até 3 abertas, editar, mudar `estado` e encerrar; `status` não é alterado pela API; ADR-024). Evidências e sugestões (Tarefa 7: `GET`/`POST /api/v1/investigacoes/{slug}/evidencias`, fila `GET …/sugestoes`, `…/sugestoes/{id}/aceitar` e `…/recusar`, `GET /api/v1/me/sugestoes`; o responsável cria evidência já aceita, o membro cria sugestão pendente; decisão final, sem imagens, avaliações nem comentários em evidências). Moderação mínima (Tarefa 7): `PATCH /api/v1/mod/investigacoes/{slug}/status`, `PATCH /api/v1/admin/usuarios/{usuario}/papel` (só `membro` ↔ `moderador`) e `GET /api/v1/mod/auditoria` (só administrador), com tabela `auditoria` somente de inserção e gravação na mesma transação. Primeiro administrador só pelo script `npm run admin:criar` (sem rota HTTP). ADR-025. Perfis e criadores (Tarefa 8, ADR-026): `GET /api/v1/criadores`, `GET /api/v1/usuarios/{usuario}` (indicadores reais de conteúdo público), `…/publicacoes`, `…/investigacoes` e `PATCH /api/v1/me/perfil` (nome e bio), sem migração e sem seed. Migrações `0000` a `0005`. Testes de concorrência no PostgreSQL real cobrem os limites de login, criação, comentário e investigações abertas, as curtidas simultâneas e o encerramento repetido.

**Não existe ainda**: imagens e upload de evidências, avaliações e comentários em evidências, denúncias, ocultação e exclusão, notificações, seed dos mocks (a lista de investigações começa vazia), busca, perfis, edição ou exclusão de publicação, edição, exclusão e respostas de comentários, e-mail. **O front não usa o backend** (continua com mocks e simulações do ADR-010); nenhuma integração foi feita.

**Pendências do backend (documentadas, não resolvidas)**: origem confiável do IP (proxy), agendamento da limpeza de sessões e de `limites_taxa`, janela fixa do limite de tentativas (permite rajada na virada). `docker-compose.yml` não foi testado (sem Docker no ambiente); o PostgreSQL usado foi o 16 nativo.

**Pendências registradas (Tarefa 8)**: `tsx` só em `devDependencies` (implantação do `admin:criar` indefinida); `atualizado_em` da investigação não muda com status/aceitação de evidência (avaliar à parte); sem seed de desenvolvimento (a propor se o Lucas quiser); `patente`/`conquistas`/`investigacaoEmDestaque` e participações não existem na API.

**Limites provisórios a revisar antes da produção** (inclui 10 edições de perfil por minuto por membro): 20 comentários, 60 curtidas e 20 mutações de investigação por minuto por membro; 3 investigações abertas por membro; tamanhos de texto das investigações; 10 sugestões por minuto por membro, 10 pendentes por membro e investigação, 30 ações de decisão/moderação por minuto (Tarefa 7).

**Etapa I, integração do front com a API (aprovada em 2026-10-21)**: front descongelado só para integrar o que já existe. Sequência: 1 sessão, cabeçalho, `/entrar`, `/criar-conta`; 2 criadores, perfil, edição do perfil; 3 publicações, `/criar`, comentários, curtidas; 4 investigações, evidências, sugestões; 5 Home, Explorar, Buscar; 6 revisão integrada de `/meu-perfil`, navegação e permissões. **Fatia 1 concluída** (ADR-027), aguardando revisão: sessão lida por `GET /auth/eu` no cliente (`SessaoProvider`), cabeçalho por sessão, formulários reais, sem mocks nesses fluxos. **Fatia 2 concluída** (ADR-028, ADR-029), aguardando revisão: `/criadores`, `/perfil/[usuario]` e edição do perfil usam a API real, em grupo de rotas `(detalhe)` sem `loading.tsx` (404 e 307 reais); `/meu-perfil` mostra só a conta da sessão (visão geral, evidências, atividade, patente e conquistas removidas até a Fatia 6). Lacunas entre fatias: cartões do perfil apontam para `/publicacao/[slug]` e `/investigacoes/[slug]`, ainda estáticos com mocks (slug real dá 404 até as Fatias 3 e 4); páginas mock linkam perfis fictícios que dão 404 com banco real; listas truncam em 50; sem seed; Seguir oculto para autenticados. **Fatia 3 concluída** (ADR-030), aguardando revisão: publicações, `/criar`, comentários e curtidas reais; `/publicacao/[slug]` no grupo `(detalhe)`. Home, Explorar e Buscar ainda linkam publicações dos mocks (404 com banco real) até a Fatia 5; a listagem de `/publicacoes` não mostra investigações até a Fatia 4. **Fatia 4 concluída** (ADR-031), aguardando revisão: investigações, evidências, sugestões e decisões pela API real, nos grupos `(detalhe)` e `(site)`. Sem tela para criar, editar, mudar estado ou encerrar investigação (endpoints existem). Home, Explorar e Buscar ainda usam mocks e linkam conteúdo que dá 404 com banco real (Fatia 5). A Tarefa 9 (destaques, em-alta) **não está autorizada**; D19 adiado. Sem seed; busca global sem `unaccent`.

**Próximo passo do backend**: aguardar a revisão das Tarefas 7 e 8 e das Fatias 1 a 4 da Etapa I. Nenhuma tarefa seguinte (imagens, avaliações, denúncias, notificações, integração com o front) começa sem aprovação explícita. Nenhum administrador real foi criado em nenhum banco compartilhado ou de desenvolvimento; `npm run admin:criar` deve ser executado por quem administra o ambiente.

## Estado confirmado

**Stack**: Next.js 16.4.2 (App Router; atualizado de 16.4.0 por avisos de segurança), React 19.2.9, TypeScript strict, styled-components 6.6, ESLint 9 com `eslint-config-next`. Node 20.9 ou superior.

**Git**: branch `main`. O commit que publica o Meu Perfil e o trabalho pendente das fases anteriores (ADR-018 a ADR-021) está no topo do histórico (ver `git log`), sincronizado com `origin/main`. Antes dele, HEAD era `53acd0ad`. Os commits `86a4fc65`, `e29e2e96`, `a13c7305`, `b920c65f` (navegação, lote 1) e `53acd0ad` (perfil social, etapas 1 a 12, tags, correções 404 e `SiteShell`, e a documentação) já estão enviados. `53acd0ad` foi um commit único, sem separação por etapa. O working tree tem alterações em `node_modules/` (rastreado pelo Git, ver "Código e dados") e arquivos não rastreados de Máquinas de Turing e `Microsoft/` e `__pycache__/`, que não pertencem ao projeto (ver "Fora do projeto").

**Rotas implementadas** (grupo `(site)`):

- `/`: Home (Hero em destaque, Explorar, Mistérios em alta, sidebar).
- `/publicacoes`: layout do backup (ADR-041): abas Todas, Teorias e Investigações, filtro de tema, grupos Investigações e Publicações e sidebar de fórum e atualizações, com dados reais.
- `/publicacoes/investigacao/[slug]` (grupo `(detalhe)`, dinâmica): área da comunidade com teoria, evidências aceitas, envio e acompanhamento de sugestões, fila de análise (responsável e moderação) e histórico, tudo real. Slugs com conteúdo no mock (ex.: simbolos-vice-city) mostram a página idêntica à do backup; os do banco seguem com exemplo rotulado ou estado vazio (ADR-039/041). 404 real. A página editorial continua em `/investigacoes/[slug]` (ADR-020).
- `/publicacao/[slug]` (grupo `(detalhe)`, dinâmica): texto completo, curtir e comentários reais, autor e relacionadas. 404 real; abre publicações criadas depois do build.
- `/investigacoes`: listagem real (Etapa I, Fatia 4), com abas Todas, Em andamento e Resolvidas (aplicadas sobre as 50 mais recentes), sem sidebar.
- `/investigacoes/[slug]` (grupo `(detalhe)`, dinâmica): página editorial do mistério com dados reais (teoria, vídeo, estado, autor), Fotografias (exemplo rotulado ou estado vazio) e Acompanhar desabilitado (ADR-039). 404 real.
- `/criar`: publica de verdade por `POST /api/v1/publicacoes` e leva à publicação criada; visitante vê pedido de entrada (ADR-030).
- `/entrar` e `/criar-conta`: formulários reais (Etapa I, Fatia 1, ADR-027): chamam `POST /api/v1/auth/entrar` e `/auth/cadastro`, abrem a sessão e levam ao início. Quem já tem sessão é redirecionado ao início.
- `/buscar`: busca em publicações, investigações e criadores, com abas e consulta na URL (`?q=`, `?tipo=`).
- `/criadores`: lista real de criadores (API, dinâmica), com estado vazio e aviso quando há mais de 50 (Etapa I, Fatia 2). Perfil em `/perfil/[usuario]` (grupo `(detalhe)`): dados e indicadores reais, 404 real.
- `/perfil/[usuario]`: perfil público real (Etapa I, Fatia 2), no grupo `(detalhe)`: identidade, quatro indicadores reais, abas Visão geral, Investigações, Teorias e publicações e Conquistas (vazia, sem dado real). Sem destaque, contribuições recentes nem sidebar. Usuário inexistente ou inválido responde HTTP 404 real.
- `/meu-perfil` (grupo `(detalhe)`, dinâmica): a conta da sessão, com edição real de nome e bio (`PATCH /api/v1/me/perfil`) e cinco abas (Visão geral, Teorias e publicações, Investigações, Evidências, Atividade). Listas de teorias e investigações com dados reais; patente, especializações, pendências, atividade e evidências como estado vazio rotulado (ADR-037). Sem sessão, HTTP 307 para `/entrar`.
- `/explorar`: hub de descoberta com as quatro tiles e "Mistérios em alta". Está na navegação principal desde o lote 1 (ADR-012).

**Entradas de navegação das rotas novas (verificado no código)**:

- Navegação principal: `/explorar`, depois de "Teorias" (ADR-012).
- Cabeçalho desktop: `/buscar`, `/criadores`, `/criar` (texto "Criar teoria"), e, conforme a sessão (ADR-027), `/entrar` e `/criar-conta` (visitante) ou `/meu-perfil` e Sair (autenticado) (ADR-012). `/criadores` e `/criar` ficam ocultos abaixo de 768 px.
- Barra mobile: `/criar`, `/buscar`. `/criadores` ainda não tem entrada na barra mobile.

**Itens de navegação sem rota** (visuais, com `href: null`): Mapa, Galeria e Fórum.

**Componentes**: primitives em `src/components/ui/` (Avatar, Badge, Button, Card, StatusBadge, Input, Textarea, FormField). Domínios em `src/components/`: acoes, auth, busca, cards (incluindo `CreatorCard`), comentarios, criar, filters, home, investigacao, layout, navigation, page, perfil, publicacao, sidebar, states. Inventário completo em `docs/DESIGN_SYSTEM.md` e `docs/ARCHITECTURE.md`.

**Dados**: tudo é mock em `src/mocks/`, em pt-BR, marcado como demonstrativo. Não há backend, autenticação, banco nem persistência. Ações que exigem conta estão desabilitadas.

**Validação**: scripts `dev`, `build`, `start`, `typecheck` e `lint`. Não há testes automatizados nem CI. Na fase 2, typecheck, lint e build passaram. O navegador foi usado para verificar as rotas em 375, 768 e 1440 px, com medição de largura de rolagem, interação de formulários e busca.

## Decisões

Registradas em `docs/DECISIONS.md`: ADR-008 (migração para Next.js), ADR-009 (mapeamento de status), ADR-010 (dados demonstrativos e ações sem persistência, com as exceções aprovadas), ADR-011 (rotas de publicação e de investigação), e, aprovadas em 2026-10-16: ADR-012 (entradas de navegação), ADR-013 (sem vínculo artificial entre publicação e investigação), ADR-014 (404 real para rotas inexistentes, implementada no lote 2), ADR-015 (área de gerenciamento dentro da investigação, backend depois do frontend) e ADR-016 (divergência temporária da evidência #001). Em 2026-10-17: ADR-017 (abas do perfil selecionadas no cliente, com `?aba=`, mantendo a geração estática) e ADR-018 (decisões do perfil social: destaque híbrido, catálogo de tags, sidebar condicional). Item 2 do ADR-018 (tags) ainda não está implementado. Em 2026-10-17, ADR-021 (Meu Perfil como área pessoal demonstrativa, em `/meu-perfil`), aguardando revisão do produto.

## Pendências

**Produto (precisam de decisão)**

- Significado e categoria dos status `community` e `classified`. Aparecem na aba "Todas", com o rótulo original, como decidido. Falta definir a categoria deles.
- Aba "Sem fontes": nenhum status está mapeado a ela, então fica sempre vazia (mostra o estado vazio). Decidir se permanece assim ou se o mapeamento muda.
- Sobreposição entre publicações com `tipo: "investigacao"` e investigações (`Case`). Ver ADR-011.
- `docs/CONTRIBUTING.md`: regra de páginas corrigida para depender do escopo aprovado em `PROJECT_STATE.md` (o escopo de sprint não existe mais como fonte).
- Conteúdo de Mapa, Galeria e Fórum, quando forem funcionais.
- Autenticação, para liberar seguir, comentar, avaliar, adicionar pista e encerrar investigação.
- Primeira publicação ligada à investigação: não feito. O conteúdo de "Por que o letreiro da praia aparece duas vezes no trailer?" (`letreiro-praia-trailer`) não corresponde claramente a nenhuma investigação. A candidata mais próxima é `simbolos-vice-city` (o letreiro verde do trailer é um nó do grafo e a evidência #009 trata dele), mas a pergunta da publicação é mais estreita. Decisão: não vincular por enquanto (ADR-013).
- Imagens de exemplo: `exemplo.jpg` mostra uma vista noturna de cidade, e não o traçado ou a placa que as evidências #001 e #013 descrevem. Antes, a tag e a imagem estavam em evidência com descrição diferente. A #001 mantém a imagem com texto alternativo fiel. Precisa de uma imagem compatível com a evidência. A divergência é mantida temporariamente (ADR-016). `exemplo_2.jpg` é PNG com extensão `.jpg` e é o mapa de referência; também é usado como segunda imagem do carrossel da sugestão #012, rotulada como mapa.
- Meu Perfil (ADR-021): (1) decidir se o link "Meu perfil" do cabeçalho deve aparecer para visitantes sem conta; (2) autenticação e backend para editar de fato, responder solicitações, marcar notificações e recebê-las; (3) upload de avatar, que não existe; (4) leitor de tela não testado nesta área.
- Entrada de `/criadores` na barra mobile: não existe. Decisão de produto pendente, não coberta pelo ADR-012.
- Cabeçalho desktop com cinco ações e a barra de navegação com sete itens: a 768 px, a barra principal quebra em duas linhas e o contador de investigadores vai para a segunda. Medido, não ajustado (ver `docs/page-specs/EXECUTION_PLAN.md`, seção 14).
- Textos da fase 2 revisados na fase 2.1. Corrigidos: descrição de `/criadores` e título oculto de `/explorar`. Mantidos: avisos demonstrativos de `/entrar` e `/criar-conta`, que dizem explicitamente que nenhuma sessão ou conta é criada e nada é salvo; e o estado vazio de `/perfil`.
- Soft 404 de `/perfil/[usuario]`, `/investigacoes/[slug]` e `/publicacao/[slug]`: **resolvido no lote 2** (ADR-014). Antes, a resposta era HTTP 200 com a página "não encontrada". Agora, identificadores fora das listas dos mocks respondem 404 real, verificado com `curl -i` em build de produção. Limitações: um registro novo exige novo build enquanto os dados forem mocks; a página de não encontrado do roteador fica fora do layout do site (sem cabeçalho nem rodapé); a correspondência é exata (`/perfil/Analista_VB` responde 404).

**Código e dados**

- Verificação da fase 2 no navegador: rotas, validações, medição de largura e busca. Não verificado: o console de erros, porque a ferramenta de automação não registrou as mensagens de forma confiável após navegação.
- Corrigido na fase 2.1: a dica de senha de `/criar-conta` some quando o erro já diz a mesma regra, e continua aparecendo quando o erro é outro (campo vazio). A associação `aria-describedby` acompanha a mensagem visível.
- Corrigido na fase 2.1: cards de publicação e de criador têm a prop `nivelTitulo`, padrão `h2`. Dentro de `/buscar` e na seção de publicações do perfil, usam `h3`, sob o `h2` do grupo. Os demais usos não mudaram.
- Foco em `/criar`: não há gerenciamento de foco no primeiro erro, porque `Input` e `Textarea` não expõem `ref`.
- Soft 404 em `/perfil/[usuario]` (análise da fase 2.1, histórico): o `notFound()` rodava dentro do `Suspense` de `src/app/(site)/loading.tsx`, e a resposta saía com 200. **Resolvido no lote 2** pela alternativa (a) da análise: `generateStaticParams` com os usuários de `getCriadores()` e `dynamicParams = false` (ADR-014). A etapa 4 do perfil social mostrou que ler `searchParams` no servidor reabriria o problema, por isso a aba é lida no cliente (ADR-017). Verificado em produção.
- `FormField` (fase 1): um `id` passado diretamente ao controle, dentro de `FormField`, substituía o id gerado e desfazia a ligação com o rótulo. **Corrigido em 2026-10-16**: dentro de `FormField`, o id gerado prevalece. Fora dele, o comportamento não mudou. Sem teste automatizado no repositório; a verificação foi feita por script temporário fora do projeto (ver `docs/page-specs/EXECUTION_PLAN.md`, seção 4).
- Slug inexistente em páginas de detalhe e usuário inexistente em `/perfil` respondiam HTTP 200 (soft 404). Resolvido no lote 2 (ADR-014), para os três tipos de rota.
- `hero.jpg` contém PNG com extensão `.jpg`. As imagens de seção são JPEG 4K de 0,5 a 0,9 MB.
- Legado `src/app/components/` (52 arquivos, ADR-006), ainda não removido. Sem importadores: `src/components/common/Button.tsx`, `src/styles/theme.css` (sintaxe Tailwind) e `src/styles/globals.css` (vazio). Também sem importadores: `src/components/ui/StatusBadge/StatusBadge.styles.ts`, `src/data/cases.ts` (substituído por `src/mocks/`) e `src/imports/*.png`.
- `dist/` é saída antiga do Vite.
- Cores fixas (`rgba()` ou hexadecimal) em componentes, contrariando a regra de tokens: `common/Button.tsx`, `ui/Badge`, `ui/Button`, `ui/Card`, `home/Hero.tsx` e `home/ExploreCards.tsx`. Os componentes novos da fase 1 e da fase 2 não usam cores fixas.
- Pastas vazias e não rastreadas: `src/hooks/`, `src/pages/` e `src/services/`.
- 43 dependências do `package.json` não são importadas pelo código fora do legado.
- Poppins está declarada no tema e não é carregada.
- `robots` está como `noindex`, herdado do `index.html` antigo.
- ESLint 9 é mantido, mas o npm avisa que a versão não tem mais suporte.
- `node_modules/` está rastreado pelo git (cerca de 65 mil arquivos), apesar do `.gitignore`.
- `docs/PROJECT_STATE.md`, `docs/SPRINT_LOG.md` e `docs/CLICKUP_BACKLOG.md` estão no commit `86a4fc65`, junto com `management/`.
- `docs/ARCHITECTURE.md` tem a árvore de pastas desatualizada: não lista `Avatar`, as pastas de domínio novas nem as rotas atuais.

**Fora do projeto (não versionar sem aprovação)**: `Maquinas_de_Turing_*.pptx`, `apresentacao_maquinas_turing_canva.pdf`, `generate_turing_presentation.py`, `Microsoft/` e `__pycache__/`.

## Próximas etapas do roteiro

0. Revisão do produto de Meu Perfil (ADR-021). Só depois, com autorização explícita, a auditoria final do MVP. Não iniciar backend nem outras fases antes disso.
1. Decisão de entrada de `/criadores` na barra mobile. Os erros de hidratação ainda precisam ser verificados em `next dev`.
2. Decisões em aberto: entrada de `/criadores` na barra mobile; significado de `community` e `classified`; aba "Sem fontes".
3. Perfil social, pendências que exigem autorização: "Curtir" e "Favoritar" (desabilitados, como prevê a especificação); conteúdo da aba "Investigações"; revisão da catalogação dos temas das publicações (etapa 10, ADR-018). Detalhes em `docs/features/perfil-social.md`, "Pendências e limitações".
4. Alterações em `node_modules/`, rastreado pelo Git apesar do `.gitignore`: decidir com aprovação como tratá-las. Não fazer sem pedido explícito.
5. Revisão de limpeza do legado e dos arquivos sem importadores, com aprovação.
