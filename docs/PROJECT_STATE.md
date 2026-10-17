# Estado do projeto

Última verificação: 2026-10-17, contra o repositório.

## Próximo passo

As sete rotas da fase 2 estão implementadas e verificadas, e a fase 2.1 (acabamento) foi concluída. No lote 1, as entradas de navegação aprovadas foram implementadas (`/explorar` na navegação principal; `/criadores` e `/criar` no cabeçalho desktop) e as decisões de produto foram registradas em `docs/DECISIONS.md` (ADR-012 a ADR-016). No lote 2, as rotas `/perfil/[usuario]`, `/investigacoes/[slug]` e `/publicacao/[slug]` passaram a responder HTTP 404 real para recursos inexistentes, verificado em produção (ADR-014). No lote 3B, a página de não encontrado passou a usar o shell compartilhado do site (`SiteShell`), com status 404 mantido. O trabalho do lote 2 em diante e o perfil social foram commitados em `53acd0ad` e enviados para `origin/main`. Próximas tarefas: (1) decidir a entrada de `/criadores` na barra mobile; (2) isolar o console por página em `next dev`. Nenhuma delas começa sem autorização específica.

**Perfil social** (`docs/features/perfil-social.md`): etapas 1 a 9 do plano concluídas, commitadas em `53acd0ad`. O perfil tem cabeçalho com ações desabilitadas, indicadores, abas por `?aba=` (ADR-017), investigação em destaque (fallback determinístico), contribuições recentes, sidebar condicional e loading próprio. Etapa 10 concluída com autorização: catálogo de oito temas e tags das publicações (ADR-018); investigações ainda não têm tags. Fechamento funcional (etapa 11): "Curtir" e "Favoritar" desabilitados na publicação; aba "Investigações" com dados reais (só investigações com detalhe publicado); auditoria dos temas, com duas associações removidas. Pendências: ações que gravam dependem de backend e autenticação; a catalogação restante precisa de revisão do produto. Auditoria final (etapa 12): `next dev` verificado nos fluxos do perfil, da publicação e do filtro, sem erros de React nem avisos de hidratação; sem defeito comprovado e sem alteração de código. Limitações: leitor de tela não testado; aviso de fonte pré-carregada e 404 de `favicon.ico` preexistentes, fora do perfil. Ver `docs/features/perfil-social.md`, "Auditoria final".

**Decisões confirmadas**: isolamento B (paralelo no checkout atual, com escopos disjuntos); demonstrações de `/criar`, `/entrar` e `/criar-conta` como simulações rotuladas, sem persistência nem sessão (ADR-010, "Exceções aprovadas"); `/investigacoes` com todos os status em "Todas", incluindo `community` e `classified`.

## Estado confirmado

**Stack**: Next.js 16.4.0 (App Router), React 19.2.9, TypeScript strict, styled-components 6.6, ESLint 9 com `eslint-config-next`. Node 20.9 ou superior.

**Git**: branch `main`, HEAD `53acd0ad`, igual a `origin/main`. Os commits `86a4fc65`, `e29e2e96`, `a13c7305`, `b920c65f` (navegação, lote 1) e `53acd0ad` (perfil social, etapas 1 a 12, tags, correções 404 e `SiteShell`, e a documentação) já estão enviados. `53acd0ad` foi um commit único, sem separação por etapa. O working tree tem alterações em `node_modules/` (rastreado pelo Git, ver "Código e dados") e arquivos não rastreados de Máquinas de Turing e `Microsoft/` e `__pycache__/`, que não pertencem ao projeto (ver "Fora do projeto").

**Rotas implementadas** (grupo `(site)`):

- `/`: Home (Hero em destaque, Explorar, Mistérios em alta, sidebar).
- `/publicacoes`: listagem com filtros por tipo, lista vertical e sidebar.
- `/publicacao/[slug]`: detalhe de publicação, com comentários apenas estruturais.
- `/investigacoes`: listagem de investigações (todas, em andamento, resolvidas e sem fontes), em lista vertical, com sidebar. Filtros pela URL (`?categoria=`).
- `/investigacoes/[slug]`: detalhe de investigação, com seções Teoria, Evidências, Discussão, Localização das evidências e Histórico/Síntese. Evidências com imagens abrem em visualização ampliada, com carrossel de até cinco imagens. Evidências do criador têm a tag "Evidência do criador". Sugestões da comunidade seguem o fluxo de aprovação demonstrativo (área do investigador, só na sessão). Dados demonstrativos.
- `/criar`: formulário de teoria com prévia ao vivo e envio simulado, rotulado como simulação. Nada é salvo.
- `/entrar` e `/criar-conta`: formulários demonstrativos. Informam que nenhuma sessão ou conta é criada.
- `/buscar`: busca em publicações, investigações e criadores, com abas e consulta na URL (`?q=`, `?tipo=`).
- `/criadores`: lista dos criadores dos mocks, com links para o perfil. Sem contagens.
- `/perfil/[usuario]`: perfil público, com identidade, indicadores, abas (Visão geral, Investigações, Teorias e publicações, Conquistas), investigação em destaque e contribuições recentes na Visão geral. Sem sidebar, porque ainda não há conteúdo próprio para ela. Usuário inexistente responde HTTP 404 real.
- `/explorar`: hub de descoberta com as quatro tiles e "Mistérios em alta". Está na navegação principal desde o lote 1 (ADR-012).

**Entradas de navegação das rotas novas (verificado no código)**:

- Navegação principal: `/explorar`, depois de "Teorias" (ADR-012).
- Cabeçalho desktop: `/buscar`, `/criadores`, `/criar` (texto "Criar teoria"), `/entrar`, `/criar-conta` (ADR-012). `/criadores` e `/criar` ficam ocultos abaixo de 768 px.
- Barra mobile: `/criar`, `/buscar`. `/criadores` ainda não tem entrada na barra mobile.

**Itens de navegação sem rota** (visuais, com `href: null`): Mapa, Galeria e Fórum.

**Componentes**: primitives em `src/components/ui/` (Avatar, Badge, Button, Card, StatusBadge, Input, Textarea, FormField). Domínios em `src/components/`: acoes, auth, busca, cards (incluindo `CreatorCard`), comentarios, criar, filters, home, investigacao, layout, navigation, page, perfil, publicacao, sidebar, states. Inventário completo em `docs/DESIGN_SYSTEM.md` e `docs/ARCHITECTURE.md`.

**Dados**: tudo é mock em `src/mocks/`, em pt-BR, marcado como demonstrativo. Não há backend, autenticação, banco nem persistência. Ações que exigem conta estão desabilitadas.

**Validação**: scripts `dev`, `build`, `start`, `typecheck` e `lint`. Não há testes automatizados nem CI. Na fase 2, typecheck, lint e build passaram. O navegador foi usado para verificar as rotas em 375, 768 e 1440 px, com medição de largura de rolagem, interação de formulários e busca.

## Decisões

Registradas em `docs/DECISIONS.md`: ADR-008 (migração para Next.js), ADR-009 (mapeamento de status), ADR-010 (dados demonstrativos e ações sem persistência, com as exceções aprovadas), ADR-011 (rotas de publicação e de investigação), e, aprovadas em 2026-10-16: ADR-012 (entradas de navegação), ADR-013 (sem vínculo artificial entre publicação e investigação), ADR-014 (404 real para rotas inexistentes, implementada no lote 2), ADR-015 (área de gerenciamento dentro da investigação, backend depois do frontend) e ADR-016 (divergência temporária da evidência #001). Em 2026-10-17: ADR-017 (abas do perfil selecionadas no cliente, com `?aba=`, mantendo a geração estática) e ADR-018 (decisões do perfil social: destaque híbrido, catálogo de tags, sidebar condicional). Item 2 do ADR-018 (tags) ainda não está implementado.

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

1. Decisão de entrada de `/criadores` na barra mobile. Os erros de hidratação ainda precisam ser verificados em `next dev`.
2. Decisões em aberto: entrada de `/criadores` na barra mobile; significado de `community` e `classified`; aba "Sem fontes".
3. Perfil social, pendências que exigem autorização: "Curtir" e "Favoritar" (desabilitados, como prevê a especificação); conteúdo da aba "Investigações"; revisão da catalogação dos temas das publicações (etapa 10, ADR-018). Detalhes em `docs/features/perfil-social.md`, "Pendências e limitações".
4. Alterações em `node_modules/`, rastreado pelo Git apesar do `.gitignore`: decidir com aprovação como tratá-las. Não fazer sem pedido explícito.
5. Revisão de limpeza do legado e dos arquivos sem importadores, com aprovação.
