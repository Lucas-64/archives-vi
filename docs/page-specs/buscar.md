# Especificação: `/buscar`

**Status**: implementada (fase 2, commit `e29e2e96`; busca sem acentos na fase 2.1). Verificada no navegador em 1440, 768 e 375 px: consulta vazia, sem resultados, resultados por aba, links corretos e sem rolagem horizontal. Pendências dentro do escopo: nenhuma. Observação: a busca compara texto sem acentos, mas não há ordenação por relevância.
**Fonte de verdade**: decisões aprovadas abaixo, `docs/ROADMAP.md`, `docs/PROJECT_VISION.md` e o código atual.

## 1. Objetivo e responsabilidade

Pesquisar **publicações, investigações e criadores** por texto.

**Estado atual**: o botão "Buscar" do cabeçalho (`ROUTES.buscar`) e o item "Buscar" da barra mobile (`MOBILE_NAV`) já levam a `/buscar`, que ainda não existe.

## 2. Decisões confirmadas

- Pesquisar publicações, investigações **e criadores**.

## 3. Detalhes técnicos (a confirmar na inspeção)

- Correspondência: texto contido, sem diferenciar maiúsculas de minúsculas, nos campos de cada tipo:
  - publicações: título, resumo e tags;
  - investigações: título, descrição e localização;
  - criadores: nome, usuário e bio.
- Ordenação: publicações pela data, mais recentes primeiro; investigações pela data de atualização, mais recentes primeiro; criadores na ordem do mock.
- Abas: Todos, Publicações, Investigações e Criadores.

## 4. Estrutura visual e responsividade

- `PageHeader` com o título "Buscar".
- Formulário de busca no topo: campo de texto e botão "Buscar". Envio por `GET`, com a consulta na URL (`?q=`). Funciona sem JavaScript.
- `FilterTabs` com as quatro abas, mantendo `q` na URL (`?q=...&tipo=...`).
- Resultados em `CardList`, em lista vertical:
  - `PublicationCard` para publicações;
  - `CaseCard` com `orientacao="horizontal"` para investigações;
  - `CreatorCard` para criadores.
- Sem sidebar.
- Mobile: campo em largura total; abas com rolagem interna.
- Sem overflow horizontal em 375, 768 e 1440 px.

## 5. Componentes

**Reutilizar**: `PageHeader`, `FilterTabs`, `CardList`, `PageBody`, `PublicationCard`, `CaseCard` (com `orientacao`, já existente no working tree), `EmptyState`, `Skeleton`.

**Novos**:
- Campo de busca, feito com `Input` (fundação de formulários, ver `criar.md`, seção 11).
- Resultados de criadores: `CreatorCard`, criado antes, em tarefa própria.

## 6. Dados, tipos e mocks

- `getPublicacoes()`, `getInvestigacoes()` e `getCriadores()` (`src/lib/data.ts`).
- Lógica nova em `src/lib/busca.ts` (arquivo novo): função pura que recebe a consulta e as três listas e devolve os resultados por tipo. Não alterar `src/lib/data.ts`.

## 7. Interações e navegação

- Envio com consulta vazia: mostra a orientação do `EmptyState`, sem mensagem de erro.
- Cada resultado leva à página do próprio item: `/publicacao/[slug]`, `/investigacoes/[slug]` ou `/perfil/[usuario]`.
- Abas mudam o tipo de resultado e preservam a consulta.

## 8. Estados

- Carregamento: `loading.tsx`.
- Sem consulta: `EmptyState` com instrução para digitar um termo.
- Sem resultados: `EmptyState` com a consulta exibida.
- Erro: `error.tsx` do grupo `(site)`.

## 9. Critérios de aceitação

- [ ] Publicações, investigações e criadores são pesquisados.
- [ ] Consulta vazia, sem resultados e com resultados, cada um com estado próprio.
- [ ] As quatro abas filtram pela URL e mantêm a consulta.
- [ ] Campo com `label` associado e foco visível.
- [ ] Cada resultado leva à rota correta.
- [ ] Sem overflow horizontal em 375, 768 e 1440 px.

## 10. Dependências e arquivos

**Depende de**: fundação de formulários (`Input`) e de `CreatorCard`.

**Pode criar**: `src/app/(site)/buscar/page.tsx`, `loading.tsx`; `src/lib/busca.ts`; componentes em `src/components/busca/`.

**Não alterar sem autorização**: `src/components/layout/Header.tsx`, `MobileTabBar.tsx`, `src/constants/routes.ts`, `src/lib/data.ts`, `src/components/cards/*` (uso apenas).

## 11. Validação

- Nível 2 de `docs/PAGE_TEMPLATE.md`.
- Consultas com os mocks: "Frequência" (publicações e investigações), "bunker" (um de cada tipo), "analista" (criador), e uma consulta sem resultado.
