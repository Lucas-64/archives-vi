# Estado do projeto

Última verificação: 2026-10-16, contra o repositório.

## Próximo passo

A fase 2 (sete rotas) e a fase 2.1 (acabamento) foram implementadas e validadas por typecheck, lint e build. A fase 2.1 corrigiu a busca sem acentos, a dica de senha repetida, a hierarquia de títulos da busca e do perfil, e revisou os textos. Próximos passos: decidir as entradas de navegação de `/explorar`, `/criadores` e `/criar` no desktop (proposta em `docs/page-specs/EXECUTION_PLAN.md`, seção 4); decidir a estratégia para o status HTTP de `/perfil/[usuario]`; e revisar o working tree antes de qualquer commit, somente com pedido explícito.

**Decisões confirmadas**: isolamento B (paralelo no checkout atual, com escopos disjuntos); demonstrações de `/criar`, `/entrar` e `/criar-conta` como simulações rotuladas, sem persistência nem sessão (ADR-010, "Exceções aprovadas"); `/investigacoes` com todos os status em "Todas", incluindo `community` e `classified`.

## Estado confirmado

**Stack**: Next.js 16.4.0 (App Router), React 19.2.9, TypeScript strict, styled-components 6.6, ESLint 9 com `eslint-config-next`. Node 20.9 ou superior.

**Git**: branch `main`. Commit `86a4fc65` está local e ainda não foi enviado (`ahead 1`). Ele reúne publicações, investigação, imagens de seção e a documentação anterior. Commit `75c2b87b` já está em `origin/main`. O restante do trabalho está no working tree, sem commit.

**Rotas implementadas** (grupo `(site)`):

- `/`: Home (Hero em destaque, Explorar, Mistérios em alta, sidebar).
- `/publicacoes`: listagem com filtros por tipo, lista vertical e sidebar.
- `/publicacao/[slug]`: detalhe de publicação, com comentários apenas estruturais.
- `/investigacoes`: listagem de investigações (todas, em andamento, resolvidas e sem fontes), em lista vertical, com sidebar. Filtros pela URL (`?categoria=`).
- `/investigacoes/[slug]`: detalhe de investigação, com seções Teoria, Evidências, Discussão, Conexões e Histórico/Síntese. Dados demonstrativos.
- `/criar`: formulário de teoria com prévia ao vivo e envio simulado, rotulado como simulação. Nada é salvo.
- `/entrar` e `/criar-conta`: formulários demonstrativos. Informam que nenhuma sessão ou conta é criada.
- `/buscar`: busca em publicações, investigações e criadores, com abas e consulta na URL (`?q=`, `?tipo=`).
- `/criadores`: lista dos criadores dos mocks, com links para o perfil. Sem contagens.
- `/perfil/[usuario]`: perfil público com as publicações do criador. Usuário inexistente mostra "Página não encontrada".
- `/explorar`: hub de descoberta com as quatro tiles e "Mistérios em alta". Não tem entrada de navegação ainda.

**Entradas de navegação das rotas novas (verificado no código)**:

- Cabeçalho: `/buscar`, `/entrar`, `/criar-conta`.
- Barra mobile: `/criar`, `/buscar`.
- Sem entrada: `/explorar`. `/criadores` só é alcançada pela migalha de pão do perfil. `/criar` não tem entrada no desktop.

**Itens de navegação sem rota** (visuais, com `href: null`): Mapa, Galeria e Fórum.

**Componentes**: primitives em `src/components/ui/` (Avatar, Badge, Button, Card, StatusBadge, Input, Textarea, FormField). Domínios em `src/components/`: acoes, auth, busca, cards (incluindo `CreatorCard`), comentarios, criar, filters, home, investigacao, layout, navigation, page, perfil, publicacao, sidebar, states. Inventário completo em `docs/DESIGN_SYSTEM.md` e `docs/ARCHITECTURE.md`.

**Dados**: tudo é mock em `src/mocks/`, em pt-BR, marcado como demonstrativo. Não há backend, autenticação, banco nem persistência. Ações que exigem conta estão desabilitadas.

**Validação**: scripts `dev`, `build`, `start`, `typecheck` e `lint`. Não há testes automatizados nem CI. Na fase 2, typecheck, lint e build passaram. O navegador foi usado para verificar as rotas em 375, 768 e 1440 px, com medição de largura de rolagem, interação de formulários e busca.

## Decisões

Registradas em `docs/DECISIONS.md`: ADR-008 (migração para Next.js), ADR-009 (mapeamento de status), ADR-010 (dados demonstrativos e ações sem persistência, com as exceções aprovadas) e ADR-011 (rotas de publicação e de investigação).

## Pendências

**Produto (precisam de decisão)**

- Significado e categoria dos status `community` e `classified`. Aparecem na aba "Todas", com o rótulo original, como decidido. Falta definir a categoria deles.
- Aba "Sem fontes": nenhum status está mapeado a ela, então fica sempre vazia (mostra o estado vazio). Decidir se permanece assim ou se o mapeamento muda.
- Sobreposição entre publicações com `tipo: "investigacao"` e investigações (`Case`). Ver ADR-011.
- `docs/CONTRIBUTING.md`: regra de páginas corrigida para depender do escopo aprovado em `PROJECT_STATE.md` (o escopo de sprint não existe mais como fonte).
- Conteúdo de Mapa, Galeria e Fórum, quando forem funcionais.
- Autenticação, para liberar seguir, comentar, avaliar, adicionar pista e encerrar investigação.
- Entrada de `/explorar` na navegação: sem entrada, no cabeçalho ou só na barra mobile. A proposta mínima (título "Explorar" da Home como link) não foi aplicada.
- Entradas de `/criadores` e de `/criar` no desktop. Hoje não há link de entrada no cabeçalho nem na Home.
- Textos da fase 2 revisados na fase 2.1. Corrigidos: descrição de `/criadores` e título oculto de `/explorar`. Mantidos: avisos demonstrativos de `/entrar` e `/criar-conta`, que dizem explicitamente que nenhuma sessão ou conta é criada e nada é salvo; e o estado vazio de `/perfil`.
- Soft 404 de `/perfil/[usuario]`: a análise está em "Código e dados". A decisão é de estratégia de renderização.

**Código e dados**

- Verificação da fase 2 no navegador: rotas, validações, medição de largura e busca. Não verificado: o console de erros, porque a ferramenta de automação não registrou as mensagens de forma confiável após navegação.
- Corrigido na fase 2.1: a dica de senha de `/criar-conta` some quando o erro já diz a mesma regra, e continua aparecendo quando o erro é outro (campo vazio). A associação `aria-describedby` acompanha a mensagem visível.
- Corrigido na fase 2.1: cards de publicação e de criador têm a prop `nivelTitulo`, padrão `h2`. Dentro de `/buscar` e na seção de publicações do perfil, usam `h3`, sob o `h2` do grupo. Os demais usos não mudaram.
- Foco em `/criar`: não há gerenciamento de foco no primeiro erro, porque `Input` e `Textarea` não expõem `ref`.
- Soft 404 em `/perfil/[usuario]` (fase 2.1, análise sem alteração de código): o `notFound()` roda dentro do `Suspense` de `src/app/(site)/loading.tsx`, que envolve todas as rotas do grupo. Por isso o status é 200 e a página "não encontrada" aparece no corpo. Remover `loading.tsx` só da rota não resolve, porque o do grupo continua valendo. Alternativas, sem aplicar: (a) `generateStaticParams` com os usuários de `getCriadores()` e `export const dynamicParams = false`, que devolve 404 pelo roteamento e torna a rota estática, o que muda a estratégia de renderização; (b) mover a rota para um grupo próprio, sem `loading.tsx` do grupo, o que muda o shell; (c) um `proxy` que verifica o usuário e reescreve para 404, que acopla a requisição aos mocks. A alternativa (a) é a menor, e é a que eu recomendaria quando houver decisão. Não verificado em build de produção.
- `FormField` (fase 1): um `id` passado diretamente ao controle, dentro de `FormField`, substituía o id gerado e desfazia a ligação com o rótulo. **Corrigido em 2026-10-16**: dentro de `FormField`, o id gerado prevalece. Fora dele, o comportamento não mudou. Sem teste automatizado no repositório; a verificação foi feita por script temporário fora do projeto (ver `docs/page-specs/EXECUTION_PLAN.md`, seção 4).
- Slug inexistente em páginas de detalhe e usuário inexistente em `/perfil` respondem HTTP 200 (soft 404), por causa do streaming.
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

1. Revisão e commit do working tree: `/investigacoes`, fundação de formulários e fase 2. Aguarda pedido explícito.
2. Decisões em aberto listadas em "Pendências": entradas de navegação, estratégia do soft 404 de `/perfil/[usuario]` e status `community` e `classified`.
3. Revisão de limpeza do legado e dos arquivos sem importadores, com aprovação.
