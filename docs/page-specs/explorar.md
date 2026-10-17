# Especificação: `/explorar`

**Status**: implementada (fase 2, commit `e29e2e96`). Verificada no navegador em 1440, 768 e 375 px: quatro tiles, links corretos, tiles sem rota sem link, "Mistérios em alta" e sem rolagem horizontal. A Home não foi alterada: desde o commit anterior à fase 2, a única mudança em `ExploreCards.tsx` é a exportação de `ExploreTile`. Entrada na navegação principal integrada no lote 1 (ADR-012, `docs/page-specs/EXECUTION_PLAN.md`, seção 14). Pendência: nenhuma dentro do escopo desta página.
**Fonte de verdade**: decisões aprovadas abaixo, `docs/DESIGN_SYSTEM.md` e o código atual.

## 1. Objetivo e responsabilidade

Hub de descoberta, separado da Home. Reúne os caminhos para os tipos de conteúdo do site.

**Estado atual**: a Home tem o bloco "Explorar" com quatro tiles (`src/constants/explorar.ts`): Mistérios leva a `/investigacoes`; Teorias da comunidade leva a `/publicacoes`; Mapa interativo e Galeria são visuais, sem rota. Nenhum link aponta para `/explorar`, e a rota não está em `MAIN_NAV`.

## 2. Decisões confirmadas

- `/explorar` é um hub de descoberta **separado da Home**. A Home não muda.

## 3. Detalhes técnicos (a confirmar na inspeção)

- Conteúdo: as quatro tiles de `EXPLORAR_ITENS` e, abaixo, "Mistérios em alta" (`TrendingCases`) com os três primeiros registros de `getInvestigacoesEmAlta()`. A inclusão de "Mistérios em alta" é uma escolha técnica para dar mais descoberta; pode ser removida se você preferir só as tiles.

## 4. Estrutura visual e responsividade

- `PageHeader` com o título "Explorar" e uma descrição curta.
- Grade de tiles: 4 colunas no desktop, 2 no tablet (até 1023 px) e 1 no mobile (até 767 px), com o mesmo padrão da Home.
- Abaixo, `TrendingCases`.
- Sem sidebar. Página dentro do `Container` do layout `(site)`.
- Sem overflow horizontal em 375, 768 e 1440 px.

## 5. Componentes

**Reutilizar**: `PageHeader`, `TrendingCases`, `Container` (pelo layout `(site)`).

**Mudança compartilhada necessária**: exportar `ExploreTile`, hoje uma função interna de `src/components/home/ExploreCards.tsx`, sem exportação. A exportação não muda o comportamento nem o visual da Home. Alternativa: mover para `src/components/explore/`, o que exige atualizar a Home. A primeira opção é a menor. **Responsável: coordenador**, antes de o agente de `/explorar` começar (ver `EXECUTION_PLAN.md`, seção 4).

## 6. Dados, tipos e mocks

- `EXPLORAR_ITENS` (`src/constants/explorar.ts`): titulo, descricao, icon, href, secao.
- `imagemDaSecao()` (`src/constants/imagensSecoes.ts`): imagens de seção, usadas só nas tiles.
- `getInvestigacoesEmAlta()` (`src/lib/data.ts`).

## 7. Interações e navegação

- Tiles com `href` levam à rota correspondente.
- Tiles sem rota (Mapa, Galeria) são visuais: `aria-disabled`, sem link.
- Sem filtros.

## 8. Estados

- Carregamento: `loading.tsx`.
- Vazio: não se aplica às tiles, que vêm de constantes. "Mistérios em alta" usa o `EmptyState` de `TrendingCases`.
- Erro: `error.tsx` do grupo `(site)`.

## 9. Critérios de aceitação

- [ ] Rota `/explorar` existe, separada da Home.
- [ ] Quatro tiles com a mesma imagem e o mesmo texto de `EXPLORAR_ITENS`.
- [ ] Tiles sem rota não têm link.
- [ ] Home visualmente inalterada (verificada antes e depois).
- [ ] Grade de 4, 2 e 1 colunas nos breakpoints.
- [ ] Sem erros de tipo, lint e build; sem overflow horizontal em 375, 768 e 1440 px.

## 10. Pendente

- **Entrada na navegação**: não foi decidido se `/explorar` entra no cabeçalho, na navegação principal ou só na Home. A rota pode existir sem entrada. Esta é a única pergunta de produto em aberto para esta página.

## 11. Dependências e arquivos

**Depende de**: a exportação de `ExploreTile` (seção 5), feita pelo coordenador antes do início desta página.

**Pode criar**: `src/app/(site)/explorar/page.tsx` e `loading.tsx`.

**Não altera**: `src/components/home/ExploreCards.tsx`. Esse arquivo é do coordenador.

**Não alterar sem autorização**: `src/components/layout/*`, `src/constants/routes.ts`, `src/lib/data.ts`, `src/constants/explorar.ts`.

## 12. Validação

- Nível 2 de `docs/PAGE_TEMPLATE.md`: typecheck, lint e build.
- Navegador em 1440, 768 e 375 px: overflow, console, imagens (`complete` e `naturalWidth` maior que zero), links das tiles.
- Comparar a Home antes e depois da exportação: nenhuma diferença visual.
