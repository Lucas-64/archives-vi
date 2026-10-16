# Procedimento: nova página

Use este roteiro para cada página nova. Página simples (uma rota, dados de um tipo, sem estado próprio) segue os passos 1 a 7 sem plano escrito. Se a página for parte de uma funcionalidade maior, use `docs/features/_modelo.md`.

## 1. Estado

- `git status` e leitura de `docs/PROJECT_STATE.md`. Não sobrescreva alterações pendentes.
- Confirme que a rota ainda não existe: `find "src/app/(site)" -name page.tsx`.

## 2. Rota e dados

- Caminho da rota, dentro do grupo `(site)`. Slugs dinâmicos seguem `[slug]`.
- Tipo de dado: reuse `src/types/` se já existir. Mock em `src/mocks/` (um arquivo por tipo, em pt-BR, marcado como demonstrativo).
- Função de acesso em `src/lib/data.ts`. A página nunca importa mocks diretamente.
- Se a página for de detalhe, ela recebe `notFound()` para slug inexistente.

## 3. Reutilização

Antes de criar qualquer componente:

1. Leia a seção de componentes em `docs/DESIGN_SYSTEM.md`.
2. Liste `src/components/` e procure por nome e por padrão (`grep -rl "padrão" src/components`).
3. Se existir algo parecido, amplie-o com uma prop opcional. Não duplique.
4. Componente novo só quando não houver equivalente. Coloque-o na pasta do domínio (`cards/`, `investigacao/`, `publicacao/`, `sidebar/`, `states/`, `page/` etc.). Primitives genéricos vão em `ui/`.

## 4. Layout

- Use `ContentGrid` quando a página tiver coluna principal e sidebar. A sidebar desktop fica à direita e, no mobile, abaixo.
- Use `PageHeader` no topo das páginas de lista e `Breadcrumb` nas de detalhe.
- Use `CardList` para listas verticais (um card por linha).

## 5. Implementação

- `page.tsx` como Server Component. Dados via `lib/data.ts`.
- `loading.tsx` com `Skeleton` no mesmo formato da página.
- Componentes com styled-components recebem `'use client'`.
- Cores, espaços e fontes via tema. Textos em pt-BR.
- Links apenas para rotas existentes. Link para rota ainda não criada precisa estar registrado em `PROJECT_STATE.md`.

## 6. Estados

A página deve tratar os três estados:

- **Carregamento**: `loading.tsx`.
- **Vazio**: `EmptyState` com título e descrição.
- **Erro**: o `error.tsx` do grupo `(site)` cobre a rota. Não crie `error.tsx` próprio sem motivo.

Para testar vazio e erro, use `getXxx({ simular })` quando a função já suportar `?simular=`. Não crie outro mecanismo.

## 7. Validação

Nível 2 (página nova):

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. `npm run dev`, depois no navegador em 1440, 768 e 375 px:
   - role a página antes de medir;
   - confira `document.documentElement.scrollWidth - document.documentElement.clientWidth` (deve ser 0);
   - confira o console (sem erros de JavaScript);
   - confira os estados vazio e erro quando houver `simular`;
   - confira se as imagens carregam (`complete` e `naturalWidth` maior que zero).

Registre no relatório o que foi executado e o que não foi.

## 8. Registro

- `docs/PROJECT_STATE.md`: rota criada, pendências e próximo passo.
- `docs/CHANGELOG.md`: mudança visível.
- `docs/DECISIONS.md`: somente se houver decisão nova de produto ou arquitetura.

## Antes de terminar

- Nenhum hexadecimal nem `rgba()` em componentes.
- Nenhum uso de imagem de seção em conteúdo de usuário.
- Nenhuma ação que simule persistência.
- Nenhum arquivo fora do escopo alterado.
