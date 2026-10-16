# Plano de execução multiagente

**Status**: Fase 1 concluída (fundação de formulários e `CreatorCard`). Fase 2 executada: as sete rotas foram implementadas e validadas por typecheck, lint, build e navegador (ver seção 4, "Execução"). Entradas de navegação e textos novos pendentes de decisão.
**Última revisão**: 2026-10-16.
**Especificações**: `docs/page-specs/*.md`.

## 1. Estado de partida (verificado no repositório)

| Rota | Situação | Ação |
|---|---|---|
| `/` | implementada | nenhuma |
| `/publicacoes` | implementada | nenhuma |
| `/publicacao/[slug]` | implementada | nenhuma |
| `/investigacoes/[slug]` | implementada | nenhuma |
| `/investigacoes` | **implementada, no working tree** (`page.tsx`, `loading.tsx`) | preservar; revisar e commitar quando você decidir |
| `/explorar` | pendente | `explorar.md` |
| `/criadores` | pendente | `criadores.md` |
| `/buscar` | pendente | `buscar.md` |
| `/perfil/[usuario]` | pendente | `perfil-usuario.md` |
| `/entrar` | pendente | `entrar.md` |
| `/criar-conta` | pendente | `criar-conta.md` |
| `/criar` | pendente | `criar.md` |

**Working tree atual (preservado, sem commit)**: `CaseCard.tsx` (prop `orientacao`), `filtros.ts` (`FILTROS_INVESTIGACOES`), `lib/data.ts` (`getInvestigacoes` com `simular`), `lib/investigacao.ts` (`filtrarInvestigacoes`), `investigacoes/page.tsx`, `investigacoes/loading.tsx`, documentação, `docs/page-specs/` e os componentes da fase 1.

**Concluído na fase 1 (verificado no código)**:
- `src/components/ui/Input/`, `src/components/ui/Textarea/` e `src/components/ui/FormField/`.
- `src/components/cards/CreatorCard.tsx`.

## 2. Git e isolamento

**Regra**: não há commit obrigatório antes da execução. O trabalho atual permanece no working tree, e nenhuma tarefa deve reverter ou sobrescrever essas alterações. Commit e push só com pedido seu.

**Limite técnico conhecido**: uma worktree criada por `isolation: "worktree"` parte do último commit (`86a4fc65`) e não inclui o working tree. `/buscar` usa a prop `orientacao` de `CaseCard`, que não existe nesse commit. Por isso worktrees só são viáveis depois de commit autorizado.

| Opção | Como funciona | Avaliação |
|---|---|---|
| **A. Sequencial** | um agente por vez, no checkout atual | seguro; mais lento |
| **B. Paralelo no checkout atual, com escopo disjunto** | agentes editam arquivos diferentes do mesmo working tree; só o coordenador roda typecheck, lint e build | **escolhida** |
| **C. Worktrees após commit** | `isolation: "worktree"` depois de commitar | exige commit autorizado e `node_modules` linkado (ambiente, aprovação separada) |
| **D. Cópia de diretório** | cópia do working tree | não recomendado |

**Decisão confirmada pelo usuário**: isolamento **B**. A regra de escopo disjunto da seção 4 é obrigatória.

## 3. Mecanismos de agente

**Disponíveis e confirmados**:
- Subagentes pela ferramenta `Agent`, com os tipos `general-purpose`, `Explore` (somente leitura), `Plan`, `claude`, `claude-code-guide` e `statusline-setup`.
- Execução em segundo plano (`run_in_background`).
- Continuação de um agente pelo nome (`SendMessage`).
- Listagem de agentes em execução (`ListAgents`).

**Não utilizado**: Agent Teams. Não está habilitado, e o plano não depende dele.

## 4. Fases

### Fase 0 — análise paralela (somente leitura)

**Não executada como etapa separada.** As verificações técnicas necessárias para a fase 1 foram feitas pelo coordenador ao criar os componentes. Para a fase 2, os itens abaixo ficam como conferência que cada agente faz no próprio escopo, em modo somente leitura:

- V1: `Criador`, `Publicacao` e `Case` para busca, perfil e contagens.
- V2: padrões de pasta e exports de `src/components/ui/*`.
- V3: `ExploreCards.tsx`, para a exportação de `ExploreTile`.
- V4: uso de `getInvestigacoes({ simular })` e `filtrarInvestigacoes` em `/buscar`.

### Fase 1 — fundação (concluída)

Executada pelo coordenador, sem agentes paralelos.

| Componente | Local | Situação de validação |
|---|---|---|
| `Input` | `src/components/ui/Input/` | typecheck, lint e build passaram |
| `Textarea` | `src/components/ui/Textarea/` | typecheck, lint e build passaram |
| `FormField` | `src/components/ui/FormField/` | typecheck, lint e build passaram |
| `CreatorCard` | `src/components/cards/CreatorCard.tsx` | typecheck, lint e build passaram |

**Limites conhecidos**:
- Nenhum componente é usado por página ainda. O comportamento no navegador não foi testado.
- Defeito em `FormField` (corrigido em 2026-10-16): um `id` passado diretamente ao controle, dentro de `FormField`, substituía o id gerado e desfazia a ligação com o rótulo. Agora o id gerado prevalece dentro de `FormField`. Fora dele, o `id` é usado como passado.
- Verificação da correção: não há framework de teste no repositório, e nenhuma dependência foi adicionada. O comportamento foi checado com um script temporário fora do projeto, que compila os componentes com o TypeScript já instalado e renderiza com `react-dom/server`. Cobre `label`/`for`, `aria-describedby`, `aria-invalid`, `required`, ids distintos e o uso fora de `FormField`. Com a fórmula antiga, 3 casos falham; com a correção, todos passam.
- Recomendação para as páginas com formulário: usar `noValidate`, para que a validação do navegador não sobreponha as mensagens em pt-BR.

### Fase 2 — páginas (paralelas, depois da fase 1)

**Pré-condição**: autorização do usuário para iniciar. Nenhum agente é iniciado antes disso.

**Matriz de tarefas**

| Agente | Rotas | Cria (exclusivo) | Edita (exclusivo) | Depende de (fase 1 e existentes) |
|---|---|---|---|---|
| **A** | `/criar` | `src/app/(site)/criar/page.tsx`, `loading.tsx`; `src/components/criar/*` | nenhum | `Input`, `Textarea`, `FormField`, `Card`, `Button`, `ContentGrid`, `PageHeader`, `PublicationCard` (somente leitura) |
| **B** | `/entrar` e `/criar-conta` | `src/app/(site)/entrar/*`, `src/app/(site)/criar-conta/*`, `src/components/auth/*` | nenhum | `Input`, `FormField`, `Card`, `Button`, `Container` |
| **C** | `/buscar` | `src/app/(site)/buscar/*`, `src/components/busca/*`, `src/lib/busca.ts` | nenhum | `Input`, `CreatorCard`, `CaseCard` (com `orientacao`, já no working tree), `FilterTabs`, `CardList`, `EmptyState`, `Skeleton`, `getPublicacoes`, `getInvestigacoes`, `getCriadores` |
| **D** | `/criadores` e `/perfil/[usuario]` | `src/app/(site)/criadores/*`, `src/app/(site)/perfil/*`, `src/components/perfil/*`, `src/lib/criadores.ts` | nenhum | `CreatorCard`, `Avatar`, `PublicationCard`, `CardList`, `ContentGrid`, `Sidebar`, `Breadcrumb`, `EmptyState`, `Skeleton`, `getCriadores`, `getPublicacoes` |
| **E** | `/explorar` | `src/app/(site)/explorar/page.tsx`, `loading.tsx` | nenhum | `ExploreTile` exportado pelo coordenador (ver abaixo), `PageHeader`, `TrendingCases`, `EXPLORAR_ITENS`, `imagemDaSecao` |

**Verificação de disjunção**:
- A, B, C, D e E não criam nem editam arquivos em comum.
- `src/lib/criadores.ts` é criado só por D. C não o usa.
- `CreatorCard` é usado por C e D, somente leitura.
- `src/lib/data.ts` não é alterado por nenhum agente. `busca.ts` e `criadores.ts` são arquivos novos.

**Arquivos compartilhados: somente o coordenador edita.** Nenhum agente de página altera:
- `src/components/home/ExploreCards.tsx`
- `src/components/layout/*` (`Header.tsx`, `MobileTabBar.tsx`, `Navigation.tsx`, `ContentGrid.tsx`, etc.)
- `src/app/(site)/layout.tsx`
- `src/constants/routes.ts`, `src/constants/explorar.ts`
- `src/lib/data.ts`
- `src/types/*`, `src/mocks/*`
- `src/components/ui/*`, `src/components/cards/*`, `src/components/page/*`, `src/components/states/*`
- `src/styles/*`
- todos os documentos (`PROJECT_STATE.md`, `CHANGELOG.md`, `DESIGN_SYSTEM.md`, `EXECUTION_PLAN.md`, `DECISIONS.md`, `page-specs/*`)

**Exportação de `ExploreTile` (dependência de E, responsabilidade do coordenador)**: o coordenador exporta `ExploreTile` de `src/components/home/ExploreCards.tsx` antes de iniciar E. Nenhuma outra alteração é feita nesse arquivo. A Home precisa continuar idêntica (comparação antes e depois).

**Navegação de `/explorar` (separada, sem alteração nesta fase)**: o cabeçalho, a barra mobile e `routes.ts` não são alterados pelos agentes. A proposta mínima fica na seção 10 e só é aplicada pelo coordenador após a decisão.

**Regras para os agentes de página**:
- Não rodar `next build` nem `next dev`. Não iniciar servidor.
- Typecheck e lint somente sobre o próprio escopo, e só quando o coordenador confirmar que os arquivos de outros agentes estão estáveis.
- Não é preciso passar `id` a controles dentro de `FormField`: o id gerado é o usado (ver fase 1).
- Formulários com `noValidate`.
- Se precisarem de mudança em arquivo compartilhado, relatam a mudança com `BLOQUEIO` (seção 7). Não a fazem.
- Critérios de conclusão: os critérios de aceitação da própria especificação, marcados com evidência. Visual e comportamento só podem ser declarados verificados depois de executados no navegador, pelo coordenador.

**Critérios de conclusão por agente**:
- **A**: `docs/page-specs/criar.md`, seção 10. Prévia atualizada sem gravação. Mensagem de simulação com rótulo claro. Sem `localStorage`, `sessionStorage`, cookie ou requisição.
- **B**: `docs/page-specs/entrar.md`, seção 10, e `criar-conta.md`, seção 10. Mesmas garantias de simulação. Senhas com `type="password"`.
- **C**: `docs/page-specs/buscar.md`, seção 9. Abas e consulta pela URL. Cada resultado leva à rota correta.
- **D**: `docs/page-specs/criadores.md`, seção 9, e `perfil-usuario.md`, seção 9. Investigações fora do perfil. Usuário inexistente com `notFound()`.
- **E**: `docs/page-specs/explorar.md`, seção 9. Tiles sem rota sem link. Grade de 4, 2 e 1 colunas.

**Execução (2026-10-16)**: os cinco agentes foram executados no checkout atual, em paralelo, com os escopos da matriz. Cada um criou apenas arquivos novos dentro do seu escopo, sem bloqueios. Desvios técnicos relatados:

- A: a prévia de `/criar` não reutiliza `PublicationCard`, porque ele criaria link para um rascunho sem rota. A prévia tem estilos próprios, com o mesmo visual. Sem objeto `Publicacao` montado.
- A: prévia com rótulo "Prévia, sem autor"; nenhum autor é atribuído.
- B: `/entrar` e `/criar-conta` não aninham `Container`, porque o layout `(site)` já aplica o `Container`. Um segundo dobraria a margem no mobile.
- D: `/criadores` não usa `ContentGrid`, porque não há sidebar. `/perfil` usa `PublicacoesSecao`, componente extra dentro do escopo de D.
- E: `/explorar` é `'use client'`, porque `EXPLORAR_ITENS` tem ícones (funções) que não podem cruzar a fronteira de Server Component. Há um `h2` oculto "Tipos de conteúdo" (texto a revisar).
- C: a busca não normaliza acentos. Ordenação de investigações por `updatedAt`, com os mocks atuais todos com esse campo.

**Coordenador (validação)**:

- `npm run typecheck`: passou.
- `npm run lint`: passou.
- `npm run build`: passou, com as sete rotas novas listadas.
- Arquivos preexistentes conferidos por hash (`/investigacoes`, `CaseCard`, `data.ts`, `investigacao.ts`, `filtros.ts`): sem alteração. Única alteração em arquivo existente: a exportação de `ExploreTile`, em `ExploreCards.tsx`.
- Navegador (`npm run dev`), após rolagem e captura de tela (ver `CLAUDE.md`), sem rolagem horizontal:
  - 1440 px: `/`, `/explorar`, `/criar`, `/entrar`, `/criar-conta`, `/buscar` (com e sem consulta, com e sem resultados, aba de criadores), `/criadores`, `/perfil/analista_vb`, `/perfil/noturno_leonida`, `/perfil/inexistente`, `/publicacoes`, `/publicacao/letreiro-praia-trailer`, `/investigacoes`, `/investigacoes?categoria=resolvidas` e `/investigacoes/vice-beach-night-lights`.
  - 375 px: `/explorar`, `/criar`, `/entrar`, `/criar-conta`, `/buscar?q=frequ`, `/criadores`, `/perfil/analista_vb` e `/perfil/inexistente`.
  - 768 px: `/explorar`, `/criar`, `/perfil/noturno_leonida` e `/buscar?q=analista`.
  - Não medidos nesta execução: `/criadores`, `/entrar`, `/criar-conta` e `/perfil/inexistente` em 768 px; `/` e as rotas existentes em 375 px.
- Interações verificadas: validação de `/entrar` (mensagens ligadas, `aria-invalid`, foco no primeiro campo), envio demonstrativo de `/entrar` e `/criar`, validação de `/criar-conta` (senha curta e confirmação), prévia de `/criar`, consulta vazia e sem resultados em `/buscar`, abas de criadores, perfis com publicações corretas (2 em cada), e "não encontrado" em português.
- Storage: nenhum `localStorage`, `sessionStorage` ou cookie gravado pelos formulários.
- Não verificado: console de erros (a ferramenta não registrou as mensagens de forma confiável), comparação visual pixel a pixel da Home, e teste em tela de carregamento com `?simular=lento`.

### Fase 3 — integração (serial, coordenador)

O coordenador é o único responsável pelos arquivos compartilhados e pela validação final:

1. Exportar `ExploreTile` (antes de E começar) e registrar a Home antes da mudança.
2. Confirmar que a fase 2 terminou e que nenhum agente está editando.
3. Aplicar as mudanças de arquivos compartilhados pedidas nos relatórios, uma por vez.
4. Rodar, nesta ordem: `npm run typecheck`, `npm run lint` e `npm run build`. Corrigir antes de continuar.
5. Verificação no navegador de cada rota nova, em 375, 768 e 1440 px, com overflow e console. Antes de medir, capturar a tela e rolar a página, por causa da revelação do Suspense (ver `CLAUDE.md`).
6. Conferir que a Home e as rotas existentes não mudaram: `/`, `/publicacoes`, `/publicacao/[slug]`, `/investigacoes`, `/investigacoes/[slug]`.
7. Atualizar `PROJECT_STATE.md` e `CHANGELOG.md`. Registrar decisões em `DECISIONS.md` somente quando forem aprovadas.

## 5. Revisão

Separada da execução. Cada tarefa tem um revisor do tipo `Explore`, somente leitura:
- confere cada critério de aceitação da especificação;
- confere os arquivos alterados contra o escopo da tarefa;
- procura hexadecimais e `rgba()` em componentes, `localStorage`, `sessionStorage`, cookies, requisições de rede e persistência simulada como real;
- relata achados por arquivo e linha.

O revisor não corrige. Achados em arquivo do próprio escopo voltam ao agente. Achados em arquivo compartilhado vão ao coordenador.

## 6. Critérios de conclusão por tarefa

Uma tarefa está concluída quando:
1. Todos os critérios de aceitação da sua especificação estão marcados, com evidência.
2. Nenhum arquivo fora do escopo foi alterado.
3. Typecheck e lint passaram no escopo da tarefa, e build passou na integração.
4. O revisor não reportou achado aberto.
5. Os detalhes técnicos da especificação foram confirmados ou ajustados, e a mudança está registrada no relatório.

## 7. Bloqueios

Quando um agente encontra uma decisão de produto que não está na especificação:
1. **Não decide.**
2. **Para** a parte afetada e segue com o que não depende dela.
3. **Relata**: `BLOQUEIO: <pergunta>. Opções: A) ... B) ... Impacto: <arquivos e rotas>.`
4. O coordenador reúne os bloqueios e pergunta ao usuário.
5. A resposta volta ao agente por `SendMessage`.

Detalhes técnicos não são bloqueios. Quando a inspeção mostrar uma alternativa técnica equivalente, o agente adota a mais simples e registra no relatório.

## 8. Riscos

- **Arquivo compartilhado editado por dois agentes**: prevenido pela matriz e pela regra de bloqueio.
- **Tipos quebrados durante a fase 2 (opção B)**: prevenido porque só o coordenador valida o conjunto.
- **Builds simultâneos**: no máximo um, pelo coordenador.
- **Portas de desenvolvimento**: nenhum agente inicia servidor.
- **Componente duplicado**: a fundação (fase 1) é a única fonte de `Input`, `Textarea`, `FormField` e `CreatorCard`. O `FormField` de `src/app/components/ui/form.tsx` é legado e não deve ser usado.
- **Defeito de `id` em `FormField`**: corrigido em 2026-10-16 (ver fase 1). Não há mais restrição de uso.
- **Validação nativa sobrepondo mensagens**: prevenido pelo uso de `noValidate`.

## 9. Envio simulado (decisão confirmada)

As demonstrações de `/criar`, `/entrar` e `/criar-conta` foram confirmadas como exceção à regra de ações sem persistência. O registro está em `docs/DECISIONS.md` (ADR-010, "Exceções aprovadas") e em `CLAUDE.md`. Cada demonstração é rotulada como simulação, não grava nada e não cria sessão.

## 10. Decisões de produto

**Confirmadas pelo usuário em 2026-10-16** (registradas na seção 13):
1. `/explorar` entra na **navegação principal**. Ainda não implementado.
2. `/criadores` e `/criar` ganham **entradas no cabeçalho desktop**. Ainda não implementado.
3. A primeira publicação, `letreiro-praia-trailer`, **não** é vinculada à investigação `simbolos-vice-city` por enquanto.
4. Perfis inexistentes: o 404 real é objetivo, com a recomendação da seção 13. Ainda não implementado.
5. A evidência #001 mantém a imagem e a descrição atuais, apesar da inconsistência registrada.
6. A área do investigador ficará dentro da própria investigação, visível só ao investigador responsável autenticado. Não implementada, e depende de backend.
7. O backend permanece fora do escopo.

**Pendências de produto que continuam abertas**:
- Significado e categoria dos status `community` e `classified`.
- Aba "Sem fontes", que hoje fica sempre vazia.
- Ordenação e busca de `/buscar`: detalhes técnicos, sem decisão de produto aberta.

**Fora do escopo aprovado** (não serão implementados):
- Anexos (imagens e vídeo) em `/criar`.
- Criação de investigações.
- Termos de uso e política de privacidade: não existem no repositório.
- Qualquer autenticação real, sessão, persistência ou API.

## 11. Comandos de validação disponíveis

- `npm run typecheck`: verificação de tipos (`tsc --noEmit`).
- `npm run lint`: ESLint 9.
- `npm run build`: build de produção.
- `npm run dev`: servidor de desenvolvimento (estados de teste `?simular=` só funcionam aqui).
- `npm run start`: servidor do build de produção.

Não há testes automatizados, nem script de verificação de rotas. A verificação visual é manual, no navegador.

## 12. Próximo passo

As sete rotas da fase 2 estão implementadas e verificadas. As próximas tarefas de integração estão priorizadas na seção 13, e a primeira delas é a implementação das entradas de navegação já aprovadas. Nenhuma implementação começa sem autorização específica.

## 13. Auditoria de integração (2026-10-16)

Esta seção registra o estado real verificado no código, no navegador e em produção. Não houve alteração funcional nesta etapa.

### 13.1 Estado das rotas

| Rota | Implementação | Especificação | Larguras verificadas |
|---|---|---|---|
| `/criar` | `src/app/(site)/criar/`, `src/components/criar/` | `criar.md`, implementada | 1440, 768, 375 px |
| `/entrar` | `src/app/(site)/entrar/`, `src/components/auth/` | `entrar.md`, implementada | 1440, 768, 375 px |
| `/criar-conta` | `src/app/(site)/criar-conta/`, `src/components/auth/` | `criar-conta.md`, implementada | 1440, 768, 375 px |
| `/buscar` | `src/app/(site)/buscar/`, `src/components/busca/`, `src/lib/busca.ts` | `buscar.md`, implementada | 1440, 768, 375 px |
| `/criadores` | `src/app/(site)/criadores/` | `criadores.md`, implementada, sem entrada de navegação | 1440, 768, 375 px |
| `/perfil/[usuario]` | `src/app/(site)/perfil/[usuario]/`, `src/components/perfil/` | `perfil-usuario.md`, implementada; 404 pendente | 1440, 768, 375 px |
| `/explorar` | `src/app/(site)/explorar/` | `explorar.md`, implementada, sem entrada de navegação | 1440, 768, 375 px |

Não há divergência entre código e especificações além das pendências registradas nas seções 10 e 13.4. As páginas não estavam ausentes: o status "pendente de implementação" estava desatualizado nos sete arquivos, e foi corrigido.

### 13.2 Estado do Git

- Commit atual: `e29e2e96`, na branch `main`. Nenhuma branch ou worktree além da principal.
- Não commitado: a evolução de `/investigacoes/[slug]` (evidências, galeria, sugestões, localização e ajustes de imagem), além de `exemplo.jpg` e `exemplo_2.jpg`, que estão não rastreados.

### 13.3 Comparação da Home

- Histórico: desde o commit anterior à fase 2 (`86a4fc65`), a única alteração em arquivos da Home é a exportação de `ExploreTile` em `src/components/home/ExploreCards.tsx`. Nenhum outro arquivo de `src/components/home/`, nem `src/app/(site)/page.tsx`, mudou.
- Visual: verificada no navegador em 1014 px (desktop) e em 375 px. Hero, tiles de "Explorar", sidebar e rodapé renderizam, sem rolagem horizontal.
- Limitação: não houve comparação pixel a pixel com o commit anterior, porque isso exigiria um build do commit antigo. A equivalência se baseia no diff, que tem uma linha.

### 13.4 Verificações responsivas e console

| Rota | Largura | Resultado visual | Rolagem horizontal |
|---|---|---|---|
| `/criadores` | 768 px | três criadores em lista, sem contagens | não |
| `/entrar` | 768 px | formulário e aviso de demonstração | não |
| `/criar-conta` | 768 px | campos, dica de senha e aviso | não |
| `/perfil/inexistente` | 768 px | "Página não encontrada" | não |

Console (desenvolvimento): nas três páginas de formulário e no perfil inexistente, não apareceram erros nem avisos da aplicação. Só mensagens informativas do React DevTools e do HMR.

Limitações do ambiente: a ferramenta de navegador lê o console apenas do lote de navegação em que a página é carregada. Não foram verificados erros de rede ou de rotas em produção pelo console. Em produção, a verificação foi feita por requisições HTTP.

### 13.5 404 de perfis inexistentes

Medido em produção (`next start` com o build atual, porta 3100):

- `/perfil/inexistente`: HTTP 200, com o corpo "Página não encontrada".
- `/investigacoes/inexistente`: HTTP 200 (mesmo comportamento).
- `/publicacao/nao-existe`: HTTP 200 (mesmo comportamento).
- `/criadores`, `/perfil/analista_vb`, `/explorar`, `/buscar`, `/criar`: HTTP 200.

Causa: `src/app/(site)/loading.tsx` envolve todas as rotas do grupo em `Suspense`. A resposta 200 é enviada antes de o `notFound()` ser avaliado, por isso o status não muda.

**Recomendação**: em `src/app/(site)/perfil/[usuario]/page.tsx`, exportar `generateStaticParams` com os usuários de `getCriadores()` e `export const dynamicParams = false`.

- Efeito esperado: o roteamento responde 404 para qualquer usuário que não foi gerado, antes do streaming. O `not-found.tsx` do grupo `(site)` renderiza a página em português.
- Compatibilidade: a Home já é estática (○), então o projeto já mistura rotas estáticas e dinâmicas. Os dados são mocks, e o build cobre os três criadores existentes.
- Trade-off: enquanto os dados forem mocks, um criador novo exige novo build. Quando houver backend, a rota deve voltar a ser dinâmica, com verificação de existência antes do streaming ou revalidação.
- Não verificado: a resposta 404 real. Deve ser conferida com build e `next start` depois da implementação, nos casos `/perfil/inexistente` e `/perfil/analista_vb`.
- Alternativas descartadas: remover o `loading.tsx` só da rota não funciona, porque o do grupo continua valendo. Mover a rota para outro grupo muda o shell do site. Um `proxy` que reescreve para 404 acopla a requisição aos mocks.
- Extensão: `/investigacoes/[slug]` e `/publicacao/[slug]` têm o mesmo problema. A mesma abordagem se aplica com `getInvestigacoes()` e `getPublicacoes()`, mas é uma decisão separada.

### 13.6 Tarefas de integração pendentes (em ordem de prioridade)

1. **Entradas de navegação aprovadas**: `/explorar` na navegação principal (`MAIN_NAV`); `/criadores` e `/criar` no cabeçalho desktop. Arquivos compartilhados: `src/constants/routes.ts`, `src/components/layout/Navigation.tsx` e `src/components/layout/Header.tsx`. Verificar em 768, 1024 e 1280 px, porque o cabeçalho já tem três ações. Exige autorização específica.
2. **404 real em `/perfil/[usuario]`**, conforme a recomendação da seção 13.5. Exige autorização. Depois, decidir o mesmo para os detalhes de investigação e publicação.
3. **Registro formal das decisões de 2026-10-16** em `docs/DECISIONS.md`, como exige o `CLAUDE.md`. Não foi criado nesta etapa, porque o arquivo não estava na lista autorizada. Recomendo criar uma entrada, após sua confirmação.
4. **Commit** do trabalho de `/investigacoes` e da fase 2 pendente. Aguarda pedido explícito. Inclui os dois arquivos de imagem não rastreados.
5. **Pendências de produto**: primeira publicação e investigação (não vinculadas por decisão); evidência #001 (mantida); status `community` e `classified`; aba "Sem fontes".
6. **Verificações não feitas**: comparação visual da Home contra o commit anterior; erros de rede e de produção pelo console.
7. **Fora do escopo atual**: área do investigador (depende de autenticação e backend) e qualquer backend.
