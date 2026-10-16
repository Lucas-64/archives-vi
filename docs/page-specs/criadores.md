# Especificação: `/criadores`

**Status**: pendente de implementação. Escopo aprovado.
**Fonte de verdade**: decisões aprovadas abaixo, `docs/PROJECT_VISION.md`, `docs/ROADMAP.md` e o código atual.

## 1. Objetivo e responsabilidade

Listar os criadores presentes nos mocks. Cada criador leva ao seu perfil.

**Estado atual**: `src/mocks/criadores.ts` tem três criadores: `analista_vb`, `noturno_leonida` e `arquivista_99`. `getCriadores()` está em `src/lib/data.ts`. Nenhum link para `/criadores` existe hoje.

## 2. Decisões confirmadas

- Listar **os criadores presentes nos mocks**.
- **Sem contagens inventadas**. Interpretação adotada: nenhuma contagem é exibida. A contagem de publicações por criador seria calculada a partir dos mocks, e não inventada, mas a decisão aprovada fala em não exibir contagens. Se você quiser a contagem de publicações, é uma decisão nova.
- Não existe contagem de investigações por criador. `Case` não tem autor.

## 3. Detalhes técnicos (a confirmar na inspeção)

- Ordem: a mesma ordem do arquivo de mock. Não há campo de data nem de ordenação em `Criador`.
- Cada card mostra o que existe em `Criador`: nome, usuário e bio.

## 4. Estrutura visual e responsividade

- `PageHeader` com o título "Criadores".
- Lista vertical, um criador por linha, na largura da coluna principal, como em `/publicacoes`.
- Sem sidebar.
- Mobile: a mesma lista, sem colunas.
- Sem overflow horizontal em 375, 768 e 1440 px.

## 5. Componentes

**Reutilizar**: `PageHeader`, `CardList`, `PageBody`, `Avatar` (`src/components/ui/Avatar`), `EmptyState`, `Skeleton`.

**Existente (fase 1, concluída)**: `CreatorCard` (`src/components/cards/CreatorCard.tsx`). Justificativa: não há card de criador. `AutorCard` (`src/components/sidebar/AutorCard.tsx`) é um bloco de sidebar sem link. `CreatorCard` também é usado em `/buscar` (ver `buscar.md`), por isso foi criado antes, na fundação (ver `EXECUTION_PLAN.md`).

**Ação do card**: "Seguir" não existe nesta versão. Se existir, usa `AcaoRestrita` (`src/components/acoes/AcaoRestrita.tsx`), desabilitado, com link para `/entrar`.

## 6. Dados, tipos e mocks

- Tipo `Criador` (`src/types/Criador.ts`): id, usuario, nome, bio.
- Mock `src/mocks/criadores.ts`; função `getCriadores()` em `src/lib/data.ts`.
- Nenhum arquivo de dados é alterado.

## 7. Interações e navegação

- Clicar no nome ou no avatar leva a `/perfil/[usuario]` (`ROUTES.perfil`).
- Sem filtros.

## 8. Estados

- Carregamento: `loading.tsx`, com skeleton de três cards.
- Vazio: `EmptyState` ("Nenhum criador por enquanto"), caso a lista venha vazia.
- Erro: `error.tsx` do grupo `(site)`.

## 9. Critérios de aceitação

- [ ] Os três criadores dos mocks aparecem, com nome, usuário e bio corretos.
- [ ] Nenhuma contagem é exibida.
- [ ] Cada card leva a `/perfil/<usuario>` correto.
- [ ] Lista vertical, sem grade.
- [ ] Estados de carregamento, vazio e erro.
- [ ] Sem overflow horizontal em 375, 768 e 1440 px.

## 10. Dependências e arquivos

**Depende de**: `CreatorCard`, criado antes desta página e de `/buscar`. Depende também de `/perfil/[usuario]` para os links, que pode ser implementada em paralelo.

**Pode criar**: `src/app/(site)/criadores/page.tsx`, `loading.tsx`. `CreatorCard` não é recriado nem alterado por esta página.

**Não alterar sem autorização**: `src/components/sidebar/AutorCard.tsx`, `src/lib/data.ts`, `src/mocks/criadores.ts`, `src/constants/routes.ts`.

## 11. Validação

- Nível 2 de `docs/PAGE_TEMPLATE.md`.
- Conferir os três links: `/perfil/analista_vb`, `/perfil/noturno_leonida` e `/perfil/arquivista_99`.
