# Especificação: `/perfil/[usuario]`

**Status**: evoluída pelo plano do perfil social (`docs/features/perfil-social.md`), etapas 1 a 9 concluídas em 2026-10-17, sem commit. A versão da fase 2 (commit `e29e2e96`) foi verificada no navegador em 1440, 768 e 375 px. Usuário inexistente responde HTTP 404 real, em build de produção (lote 2, ADR-014). Pendências desta página: "Curtir" e "Favoritar" (não existem), e a aba "Investigações" (placeholder). A página de não encontrado da raiz usa o shell do site desde o lote 3B.
**Fonte de verdade**: decisões aprovadas abaixo, `docs/ROADMAP.md` e o código atual.

## 1. Objetivo e responsabilidade

Perfil público de um criador: apresentação e publicações disponíveis. Para um usuário que não existe, mostrar um estado claro.

**Estado atual**: `ROUTES.perfil(usuario)` está em `src/constants/routes.ts`. Nenhum link para ele existe hoje; `/criadores` e `/buscar` vão criar os primeiros.

## 2. Decisões confirmadas

- Perfil **público**, com as **publicações disponíveis** do criador.
- **Estado para usuário inexistente**.

## 3. Detalhes técnicos (a confirmar na inspeção)

- "Publicações disponíveis" = publicações de `src/mocks/publicacoes.ts` cujo `autorId` corresponde ao criador, ordenadas pela data, mais recentes primeiro.
- **Investigações não aparecem como lista no perfil.** Motivo técnico: `Case` não tem autor, e a autoria está em `InvestigacaoDetalhe`, com um detalhe publicado. Por isso, a investigação em destaque e as contribuições recentes usam o detalhe (etapas 5 e 6). A aba "Investigações" continua sendo placeholder.
- **Busca por usuário**: a rota usa `usuario`, mas `getCriadorPorId()` procura por `id`. A correspondência por `usuario` fica em `src/lib/criadores.ts` (arquivo novo), que chama `getCriadores()`. Assim `src/lib/data.ts` não precisa mudar.
- Badges, saved cases e seguidores não existem nos dados e não são exibidos.

## 4. Estrutura visual e responsividade

- Cabeçalho do perfil: `Avatar` tamanho `medium`, nome, @usuario e bio.
- Abaixo: abas (Visão geral, Investigações, Teorias e publicações, Conquistas), selecionadas por `?aba=` no cliente (ADR-017). Na Visão geral: investigação em destaque, contribuições recentes e a lista vertical de `PublicationCard`, com o título "Publicações". Na aba "Investigações": investigações criadas e em que participa, com detalhe publicado (etapa 11).
- Sidebar condicional: aparece somente com conteúdo do perfil (reconhecimento e membros relacionados). Quando não há conteúdo, o layout usa a largura total. Não usa `Sidebar` global (tópicos e atualizações). Ver `docs/features/perfil-social.md`, decisão 3. **Estado atual (etapa 7)**: os dados não têm reconhecimento nem membros relacionados, então a página não passa sidebar e o `ContentGrid` usa a largura total. Carregamento (etapa 8): `loading.tsx` usa `ContentGrid` sem sidebar, com `PerfilSkeleton` na mesma hierarquia da página, sem dados fictícios.
- Mobile: a sidebar fica abaixo do conteúdo.
- Sem overflow horizontal em 375, 768 e 1440 px.

## 5. Componentes

**Reutilizar**: `ContentGrid` (sem sidebar, desde a etapa 7), `CardList`, `PublicationCard`, `Avatar`, `Badge`, `Breadcrumb`, `EmptyState`, `Skeleton`. `Sidebar` (global) não é usado no perfil. `PageBody` também não é usado: o espaçamento vem de `AbasPerfil` e `ContentGrid`.

**Novo**: `ProfileHeader` (`src/components/perfil/ProfileHeader.tsx`): avatar, nome, usuário e bio. Justificativa: `CreatorCard` é de lista, e `AutorCard` é de sidebar. Nenhum deles é cabeçalho de página.

**Ação**: nenhuma nesta versão. Não há "Seguir" nem edição de perfil, porque dependem de autenticação.

## 6. Dados, tipos e mocks

- `getCriadores()` e `getPublicacoes()` (`src/lib/data.ts`).
- `src/lib/criadores.ts`: busca por `usuario`, para a qual `CreatorCard`, `/criadores` e `/buscar` também podem usar a mesma função.

## 7. Interações e navegação

- Cada publicação leva a `/publicacao/[slug]`.
- Breadcrumb: Início › Criadores › nome. O item "Criadores" leva a `/criadores`.

## 8. Estados

- Usuário inexistente: `notFound()`, com a página "Página não encontrada" do grupo `(site)`, em português. Essa página também responde com HTTP 200 pelo mesmo motivo de streaming registrado em `CLAUDE.md`.
- Sem publicações: `EmptyState` na seção de publicações, por exemplo "Este criador ainda não tem publicações".
- Carregamento: `loading.tsx`.
- Erro: `error.tsx` do grupo `(site)`.

## 9. Critérios de aceitação

- [ ] `/perfil/analista_vb` mostra o nome, o usuário e a bio corretos, e somente as publicações com `autorId` igual a `analista-vb`.
- [ ] `/perfil/inexistente` mostra a página de não encontrado em português.
- [ ] Cada publicação leva à rota de detalhe correta.
- [ ] Nenhuma investigação aparece no perfil.
- [ ] Nenhuma ação de seguir ou editar aparece.
- [ ] Sem overflow horizontal em 375, 768 e 1440 px.

## 10. Dependências e arquivos

**Depende de**: `CreatorCard` e `/criadores` (links), e de `src/lib/criadores.ts`.

**Pode criar**: `src/app/(site)/perfil/[usuario]/page.tsx`, `loading.tsx`; `src/components/perfil/ProfileHeader.tsx`; `src/lib/criadores.ts`.

**Não alterar sem autorização**: `src/lib/data.ts`, `src/constants/routes.ts`, `src/mocks/*`.

## 11. Validação

- Nível 2 de `docs/PAGE_TEMPLATE.md`.
- Testar os três criadores e um usuário inexistente, em 1440, 768 e 375 px.
