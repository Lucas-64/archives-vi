# Funcionalidade: Perfil social e progressão

**Status**: etapas 1 a 10 do plano concluídas, fechamento funcional (etapa 11) e auditoria final (etapa 12) concluídos. As pendências que restam estão em "Pendências e limitações" e dependem de backend, autenticação ou decisão de produto. Nenhuma investigação tem tags, porque não há dados para elas.
**Última atualização**: 2026-10-17

## Objetivo

Transformar `/perfil/[usuario]` em um perfil de investigador: identidade, contribuições e uma investigação em destaque, com a investigação como centro da experiência. Patente, especializações e distintivos entram depois, quando houver regras e dados para eles.

## Escopo

- **Dentro (implementado)**: identidade com ações desabilitadas; indicadores derivados dos dados; abas por `?aba=`; investigação em destaque (fallback determinístico); contribuições recentes; sidebar condicional; loading do perfil.
- **Dentro (fechamento, etapa 11)**: aba "Investigações" com dados reais; "Curtir" e "Favoritar" desabilitados na página da publicação.
- **Fora (depende de backend, autenticação ou decisão de produto)**: ações que gravam; contagens de curtidas; aba "Conquistas" (placeholder, sem conceito); tags de investigações (sem dados).
- **Fora desta funcionalidade**: backend, autenticação, persistência, mecanismo de XP, votação, desbloqueio de especializações, mensagens privadas, notificações e moderação real.

## Decisões registradas (2026-10-17)

1. **Investigação em destaque (híbrida)**. Até haver autenticação e persistência, o destaque é determinado por uma regra fixa, descrita na seção 4. Não se afirma que o membro escolheu a investigação. Quando houver autenticação e persistência, o próprio membro poderá escolher a sua; essa escolha não existe nesta fase. Se nenhuma investigação for elegível, o bloco não aparece.
2. **Catálogo controlado de tags temáticas (decisão final, 2026-10-17)**. Investigações e publicações usam o mesmo catálogo compartilhado. Cada item pode ter mais de uma tag, quando apropriado. A aplicação é adequada a cada tipo de conteúdo. Catálogo inicial:
   - OVNIs e extraterrestres
   - Criaturas e lendas
   - Easter eggs e segredos
   - Símbolos e mensagens
   - Áudio e transmissões
   - Locais e mapas
   - Crimes e acontecimentos
   - Teorias e conexões

   Regras:
   - Tags temáticas não são patentes, especializações nem distintivos.
   - O catálogo evita categorias duplicadas ou semanticamente equivalentes.
   - Servem, no futuro, como contexto para avaliar a elegibilidade de contribuições para especializações. Os critérios de desbloqueio são privados e não aparecem na interface.
   - Não há motor de XP, conquistas, votação ou progressão nesta decisão.
   - Não aparecem na interface antes da etapa 10 do plano.
   - Conferência feita: nenhum documento existente do repositório define outro catálogo. Os termos de tags em `docs/page-specs/buscar.md` (busca por texto) continuam válidos.
   - Conflito sinalizado: os mocks de publicações usavam tags de texto livre fora deste catálogo. **Resolvido na etapa 10**: os temas do catálogo ficaram em `tags`; os termos de texto livre foram preservados em `termos` (ver "Migração das tags" na etapa 10).
3. **Sidebar condicional**. A sidebar do perfil aparece somente quando houver conteúdo relevante do perfil. Quando não houver, o layout usa a largura total, sem espaço vazio.

## Rotas

| Rota | Arquivo | Situação |
|---|---|---|
| `/perfil/[usuario]` | `src/app/(site)/perfil/[usuario]/page.tsx` | existe; evolução planejada |

## Diagnóstico atual (verificado no repositório em 2026-10-17, antes da implementação)

Esta seção descreve o estado de partida. O estado atual está em "Plano de implementação" e em "Pendências e limitações".

- `Criador` (`src/types/Criador.ts`) tem apenas `id`, `usuario`, `nome` e `bio`. Não há data de entrada, jogos favoritos, seguidores, seguindo, avatar real ou qualquer progresso.
- `src/mocks/criadores.ts` tem três criadores. O `id` é igual ao `autorId` das publicações (`analista-vb`, `noturno-leonida`, `arquivista-99`), e a rota usa o `usuario` (`analista_vb`, etc.).
- A página atual (`src/app/(site)/perfil/[usuario]/page.tsx`) usa `ContentGrid` com `Sidebar`, `Breadcrumb`, `ProfileHeader` (avatar de iniciais, nome, usuário, bio) e `PublicacoesSecao` (lista de `PublicationCard`).
- A rota é gerada no build com `dynamicParams = false` (ADR-014). Um usuário fora da lista recebe 404 real.
- `Publicacao` tem `autorId` e `tags`. `Case` (listagem de investigações) não tem autor nem tags. `InvestigacaoDetalhe` tem `autor`, `participantes` e as evidências, cada uma com `autor`.
- Não existem dados de XP, patentes, especializações, distintivos, seguidores, favoritos ou curtidas. Não existe nenhum componente de seguir ou curtir.
- A ADR-010 proíbe simular ações que exigem conta, como seguir, avaliar e comentar. Elas ficam desabilitadas, com link para `/entrar`. As exceções aprovadas cobrem só `/criar`, `/entrar` e `/criar-conta`.
- `docs/ROADMAP.md` lista perfil de usuário, distintivos de contribuidor, investigações salvas e teorias seguidas. `docs/PROJECT_VISION.md` lista perfis e histórico de contribuições como etapa futura.

## Mapa do mockup (referência aprovada)

O mockup de direção visual (`perfil-mockup.html` e `perfil-mockup.png`) está fora do repositório, na pasta de rascunhos. Ele é a referência visual. Os números, datas, interesses e membros relacionados nele são fictícios e não podem virar dados.

| Elemento do mockup | Origem do dado | Situação |
|---|---|---|
| Avatar com iniciais | `nome` | existe |
| Nome e `@usuario` | `nome`, `usuario` | existe |
| Bio | `bio` | existe |
| Membro desde | campo novo (`entrouEm`) | futuro, sem dado |
| Interesses em GTA VI (chips) | campo novo (`interesses`) | futuro, sem dado |
| Seguidores e seguindo | campos novos | futuro, sem dado |
| Botão "Seguir" desabilitado com link para `/entrar` | regra existente (ADR-010) | pode ser feito já |
| Menu de ações (denunciar, bloquear) | UI sem ação | pode ser feito já, desabilitado |
| Indicadores (investigações, teorias, evidências, reconhecimento) | derivados dos mocks, com o reconhecimento sem dado | parcial |
| Abas (Visão geral, Investigações, Teorias e publicações, Conquistas) | navegação da própria página | pode ser feito já |
| Investigação em destaque | `InvestigacaoDetalhe` e `Case` | pode ser feito já, com regra de escolha |
| Contribuições recentes | `Publicacao`, evidências e participações | pode ser feito já |
| Reconhecimento (chips) | distintivos | futuro |
| Membros relacionados | sem dado | futuro (ou omitido) |

## Especificação funcional

### 1. Identidade do membro

- Avatar (iniciais, como hoje), nome de exibição, `@usuario`, bio.
- Data de entrada, jogos e temas de interesse e contagens de seguidores: exibidos somente quando o dado existir. Sem dado, o campo não aparece. Não há texto de substituição.
- Ação principal "Seguir": desabilitada, com a frase "Seguir exige conta" e link para `/entrar`.
- Menu discreto de ações sociais: "Denunciar" e "Bloquear" aparecem desabilitados, com a nota de que a moderação ainda não existe. Não simular segurança.

### 2. Patente, especializações e distintivos

Estes três conceitos são distintos e visualmente separados. Nenhum deles é exibido com dados falsos nesta funcionalidade.

- **Patente**: progresso geral por XP. Permanente; não diminui por inatividade. Exibição futura, quando houver regras e dados.
- **Especializações**: áreas de atuação (Caçador de Easter Eggs, Ufólogo, Analista de Áudio, Cartógrafo, Investigador de Campo, Arquivista). Cada uma tem critérios próprios, mantidos em regras internas. O membro poderá exibir até duas especializações desbloqueadas. Exibição futura.
- **Distintivos**: conquistas pontuais (Documentação Rigorosa, Evidência Decisiva, Colaborador Recorrente, Pesquisador Multijogo, são exemplos conceituais). Exibição futura, na aba "Conquistas".
- A interface pública mostra somente o que foi conquistado e o progresso geral autorizado. Não mostra critérios, limiares exatos, combinações necessárias ou regras internas.

### 3. Métricas de contribuição

Somente métricas derivadas de dados existentes:

- Teorias publicadas: publicações de `tipo: "teoria"` com `autorId` do membro.
- Evidências enviadas: evidências cujo `autor` é o membro, em todas as investigações detalhadas.
- Investigações criadas: investigações cujo `autor` é o membro.
- Contribuições reconhecidas: sem dado. Não aparece até existir o conceito.

Quantidade bruta não é apresentada como qualidade. Não há taxas, rankings ou pontuação.

### 4. Conteúdo central

Nesta ordem. **Estado atual**: os dois blocos ficam na Visão geral, depois das abas (ADR-017 e etapa 5), e não logo abaixo da identidade, como esta seção dizia antes. A ordem em que aparecem é a da seção 8 (celular): identidade, indicadores, abas, destaque, contribuições e publicações.

1. **Investigação em destaque**: título, imagem (quando existir), estado, resumo da hipótese, jogo relacionado, indicadores discretos (evidências e participantes) e link "Abrir investigação".
   - **Regra determinística de fallback** (aplicada até haver escolha do próprio membro):
     - Elegíveis: investigações com `InvestigacaoDetalhe` (somente as detalhadas, pois só elas têm autor e participantes) em que o membro é `autor` ou está em `participantes`.
     - Ordem de prioridade: (a) investigações criadas pelo membro antes das de participação; (b) dentro de cada grupo, `atualizadoEm` mais recente primeiro; (c) desempate por `id` em ordem crescente.
     - A primeira investigação da ordem é a destacada. Se não houver nenhuma elegível, o bloco é omitido.
   - A página não deve dizer que o destaque foi escolhido pelo membro. O rótulo pode ser "Investigação em destaque", sem atribuição de escolha.
   - Escolha pelo próprio membro: futura, depende de autenticação e persistência (Decisões registradas, item 1).
2. **Contribuições recentes**: lista vertical mista de teorias, investigações das quais participou, publicações e evidências. Cada item indica o tipo (rótulo), o título, um resumo curto e a data. Ordenado por data, mais recente primeiro.

### 5. Abas

- "Visão geral" (padrão): identidade, indicadores, investigação em destaque e contribuições recentes.
- "Investigações": investigações criadas e em que participou. **Estado atual (etapa 11)**: implementada com dados reais. Duas seções, "Criadas por este membro" e "Em que participa", com `CaseCard` horizontal e link para a página da investigação. Só entram investigações com detalhe publicado, porque só o detalhe tem autor e participantes (`investigacoesDoMembro`, `src/lib/perfil.ts`). Cada seção tem estado vazio próprio com o motivo real. Nos mocks, `simbolos-vice-city` é participação dos três criadores e nenhum deles é autor.
- "Teorias e publicações": publicações do membro. **Estado atual**: lista de publicações, a mesma da Visão geral.
- "Conquistas": placeholder da etapa futura, com texto explícito de que as conquistas ainda não estão disponíveis. **Estado atual**: placeholder "Conquistas ainda não disponíveis". Só terá conteúdo quando houver o conceito implementado.

A Visão geral mostra, além do previsto, a lista de publicações (preservada da fase 2). Por isso publicações aparecem na Visão geral e em "Teorias e publicações", e também na lista de contribuições recentes. Essa sobreposição foi aceita (ver etapa 6).

Implementação (etapa 4, ADR-017): abas no cliente, com `?aba=`. Não reutiliza `FilterTabs`, que navega por link e não troca o painel no cliente; usa o componente `AbasPerfil`, com o padrão ARIA de abas. A página continua estática e não lê `searchParams` (risco R2).

No celular, as abas rolam horizontalmente dentro da própria linha, como em `FilterTabs`. A barra inferior global não muda.

### 6. Recursos sociais

- **Seguir**: implementado, desabilitado, com "Seguir exige conta" e link para `/entrar` (ADR-010).
- **Curtir conteúdos** para reconhecimento público: implementado como botão desabilitado na página da publicação (etapa 11). Nenhum contador é simulado.
- **Favoritar** para consulta posterior, privado por padrão: **não implementado**, pelo mesmo motivo. Pendente.
- **Local dos controles (etapa 11)**: "Curtir" e "Favoritar" ficam na página da publicação (`PublicacaoCabecalho`), desabilitados, com a mensagem "Curtir e favoritar exigem conta" e link para `/entrar`. A especificação não aponta um local; a página da publicação foi escolhida porque é onde o conteúdo de um membro aparece. Não há contagem, nem persistência.
- **Denunciar e bloquear**: implementados desabilitados, dentro do menu de ações (`MenuAcoesPerfil`), com a nota de que a moderação ainda não existe.
- Mensagens privadas e notificações completas ficam fora desta funcionalidade.

### 7. Estados de interface

| Estado | Comportamento |
|---|---|
| Perfil existente com dados completos | todas as seções |
| Perfil existente com dados parciais | somente as seções com dados; sem texto de substituição para campos ausentes |
| Perfil inexistente | página "Página não encontrada", HTTP 404 (já existe) |
| Sem publicações | estado vazio "Este criador ainda não tem publicações" (já existe) |
| Sem investigação em destaque | a seção não aparece na visão geral |
| Sem contribuições | estado vazio com texto próprio |
| Perfil próprio versus de outro membro | não aplicável nesta fase: não há autenticação. Todos os perfis são tratados como de outro membro (ver Decisões registradas, item 1) |
| Sem investigação elegível para destaque | o bloco de destaque é omitido |
| Carregamento | `loading.tsx` com `PerfilSkeleton`, na hierarquia da página e sem sidebar (etapa 8). Implementado |
| Erro | `error.tsx` do grupo `(site)`, como hoje. Existe; não foi testado especificamente no perfil |

### 8. Responsividade

- Desktop: coluna principal e sidebar (320 px), como as demais páginas, quando houver conteúdo para a sidebar. A sidebar recebe apenas conteúdo do perfil (reconhecimento e membros relacionados); nunca conteúdo principal, e não recebe os tópicos e atualizações globais do fórum.
- Sem sidebar: a coluna principal ocupa a largura total. Implementado na etapa 7: `ContentGrid` deixa de reservar a coluna de 320 px quando não recebe `sidebar`. Os consumidores atuais passam sidebar e não mudam.
- Tablet (768–1023 px): mesma estrutura, com a sidebar mais estreita, como em `ContentGrid`.
- Celular (abaixo de 768 px): coluna única. A ordem é identidade, indicadores, abas, investigação em destaque, contribuições e, por último, a sidebar, se houver. Sem rolagem horizontal, exceto dentro das abas.

## Inventário de componentes

| Componente | Situação | Observação |
|---|---|---|
| `ContentGrid` | ajustado (etapa 7) | sem `sidebar`, largura total, sem coluna vazia de 320 px. Os consumidores atuais passam sidebar e não mudam |
| `Breadcrumb`, `PublicationCard`, `EmptyState`, `Skeleton` | reutilizar | sem alteração |
| `Sidebar` (tópicos e atualizações do fórum) | não usar no perfil | conteúdo global, sem relação com o perfil. Continua disponível para as páginas que o usam |
| `FilterTabs` | não usado no perfil | navega por link e não troca o painel no cliente. Substituído por `AbasPerfil` (ADR-017). Continua em `/publicacoes`, `/buscar` e `/investigacoes` |
| `AbasPerfil` | criado (etapa 4) | abas ARIA com `?aba=` no cliente, sem `searchParams` no servidor |
| `PerfilSkeleton` | criado (etapa 8) | loading do perfil, sem sidebar, com alturas por breakpoint |
| `TagTematica` | criado (etapa 10) | `src/components/tags/`. Tag do catálogo, estática ou como link de filtro; estados: estático, link, foco e ativo. Usada na página da publicação e no filtro |
| `FiltroTemas` | criado (etapa 10) | `src/components/tags/`. Filtro por tema da listagem de publicações, com links (`?tag=`), que funciona sem JavaScript |
| `Avatar`, `Card`, `Badge`, `Button` | reutilizar | variantes existentes |
| `CardList`, `PageBody` | reutilizar | |
| `ProfileHeader` | ajustado (etapa 2) | ação desabilitada "Seguir". "Curtir" e "Favoritar" ficam na publicação, não no perfil. Data, interesses e seguidores não aparecem, porque `Criador` não tem esses campos |
| `InvestigacoesPerfil` | criado (etapa 11) | aba "Investigações": criadas e participações, com `CaseCard` e estados vazios próprios |
| `PublicacoesSecao` | reutilizado | aparece na Visão geral e em "Teorias e publicações" |
| `AcaoRestrita` | reutilizado | usado por "Seguir" no perfil. "Curtir" e "Favoritar" na publicação usam `Button` desabilitado, com a mensagem e o link de `AcaoRestrita`, em uma linha só (ver etapa 11) |
| `InvestigacaoEmDestaque` | criado (etapa 5) | card da investigação do perfil (não reutiliza `CaseCard` horizontal, que não tem resumo de hipótese) |
| `ContribuicoesRecentes` | criado (etapa 6) | lista mista com rótulo de tipo |
| `IndicadoresContribuicao` | criado (etapa 3) | faixa compacta, sem grade grande |
| `PerfilSidebarBox` | não criado | não há conteúdo para a sidebar do perfil (etapa 7) |
| `MenuAcoesPerfil` | criado (etapa 2) | menu discreto com itens desabilitados |
| `PatenteInvestigador` | criado (ajuste final, ADR-019) | lateral: patente atual em destaque, frase descritiva opcional, medalhas das patentes anteriores (demonstrativo). Substitui a ideia de "Reconhecimento" |
| `ConquistasInvestigador` | criado (ajuste final, ADR-019) | lateral: nomes das conquistas do próprio membro, em rótulos `Badge` (demonstrativo). Substitui "Membros relacionados" |
| `MedalhaPatente` | criado (ajuste final, ADR-019) | SVG provisório em `src/components/perfil/`, cor por token do tema; informativa (`role="img"`) ou decorativa (`aria-hidden`) |
| `TeoriasPublicacoesPerfil` | criado (ajuste final) | aba "Teorias e publicações": botão "Filtrar temas" (recolhido por padrão), reutiliza `FiltroTemas` em modo de botões, tema vindo de `?tag=` |
| `Reconhecimento` (chips) | pendente | depende de distintivos, que não existem nos dados |

## Modelo de dados proposto

**Dados existentes (usar agora)**

- `Criador`: `id`, `usuario`, `nome`, `bio`.
- `Publicacao`: `autorId`, `tipo`, `titulo`, `resumo`, `data`, `tags`.
- `InvestigacaoDetalhe`: `autor`, `criadoEm`, `atualizadoEm`, `participantes`, `evidencias`.
- `Evidencia`: `autor`, `data`, `titulo`, `origem`.

**Dados futuros (campos opcionais, sem valores fictícios nos mocks)**

- `Criador.entrouEm?: string` (data ISO).
- `Criador.interesses?: string[]` (jogos e temas).
- `Criador.seguidores?` e `Criador.seguindo?`: dependem de um modelo de relacionamento, ainda não definido.
- `Case.tags?: TagTematica[]` e `Publicacao.tags: TagTematica[]`, com `TagTematica` como união fechada do catálogo da decisão 2. **Implementado na etapa 10**: o tipo `TagTematica` e o catálogo estão em `src/constants/tagsTematicas.ts`. `Publicacao.tags` é o catálogo; `Publicacao.termos` guarda o texto livre anterior. `Case.tags` é opcional e nenhum mock de investigação tem valor.
- `Case.autor?`: necessário para a listagem indicar o criador. Hoje a autoria só existe no detalhe.
- Progresso: `xp`, `patente`, `especializacoes[]` (com status de desbloqueio) e `distintivos[]`. Dependem das regras de gamificação, ainda não definidas.

**Regra de contagem**: as métricas são calculadas em funções puras dentro de `src/lib/` a partir das listas que `lib/data.ts` já devolve. Não há nova persistência.

## Plano de implementação

Cada etapa é pequena e verificável. Nenhuma começa sem autorização.

1. **Dados e funções puras** (`src/lib/perfil.ts`, novo): contagens e contribuições derivadas, com testes isolados em scratch, como na busca. Sem alteração de UI. Arquivos: `src/lib/perfil.ts`. **Concluída em 2026-10-17**: funções `contarContribuicoes`, `investigacaoEmDestaque` e `contribuicoesRecentes`, com 18 casos em scratch (fora do repositório). Typecheck, lint e build passaram. Nenhuma página usa o módulo ainda.
2. **Cabeçalho do perfil**: campos opcionais, ações desabilitadas e menu. Arquivos: `src/components/perfil/ProfileHeader.tsx`, `src/components/perfil/MenuAcoesPerfil.tsx`. **Concluída em 2026-10-17**: "Seguir" reutiliza `AcaoRestrita` (desabilitado, com "Seguir exige conta" e link para `/entrar`); menu com "Denunciar" e "Bloquear" desabilitados e a nota de que a moderação ainda não existe. Data de entrada, jogos e interesses não aparecem: `Criador` não tem esses campos, e o tipo não foi alterado nesta etapa. Avatar continua de iniciais.
3. **Indicadores**: faixa compacta. Arquivos: `src/components/perfil/IndicadoresContribuicao.tsx`. **Concluída em 2026-10-17**: três indicadores (investigações criadas, teorias publicadas e evidências enviadas), com números de `contarContribuicoes`. "Investigações criadas" considera apenas investigações com detalhe publicado, porque só o detalhe tem autor. A página obtém os detalhes com `getInvestigacoes` e `getInvestigacaoPorSlug`, sem alterar `lib/data.ts`. Números verificados em produção: analista 0/1/1, noturno 0/1/2, arquivista 0/1/2.
4. **Abas e estrutura da página**: `AbasPerfil` com `?aba=`, no cliente, mantendo a geração estática e o 404 (ADR-017). Arquivos: `src/app/(site)/perfil/[usuario]/page.tsx`, `src/components/perfil/AbasPerfil.tsx`, `src/lib/perfil.ts`. **Concluída em 2026-10-17**: quatro abas (Visão geral com as publicações; Teorias e publicações com as mesmas publicações; Investigações e Conquistas com estado de conteúdo ainda não disponível, sem registros inventados). `?aba=` válido seleciona a aba ao abrir a URL; valor desconhecido mostra a Visão geral. Clique usa `pushState`, então voltar e avançar percorrem as abas. Setas, Home e End movem o foco; Enter e Espaço ativam. Validado em produção: perfis válidos 200; perfil inexistente 404 com e sem `?aba=`; build com a página em SSG. Não inclui investigação em destaque, contribuições recentes nem mudança de sidebar.
5. **Investigação em destaque**: arquivos `src/components/perfil/InvestigacaoEmDestaque.tsx`, `src/app/(site)/perfil/[usuario]/page.tsx`, `src/components/perfil/AbasPerfil.tsx` (espaçamento entre blocos do painel). **Concluída em 2026-10-17**: a regra da seção 4 é aplicada por `investigacaoEmDestaque` (`src/lib/perfil.ts`), sem duplicação. Bloco com título, estado (`ESTADO_INVESTIGACAO`), imagem do `Case`, hipótese, evidências e participantes (mesmos números do cabeçalho da investigação) e link "Abrir investigação". Rótulo "Investigação em destaque" e nota explicando que a escolha é automática. **Disposição adotada**: a seção 4 diz "logo abaixo da identidade e dos indicadores", mas a seção 5 e a hierarquia pedida colocam o bloco na Visão geral, depois das abas. Seguiu-se a seção 5. Não aparece nas outras abas. **Não implementado**: "jogo relacionado", porque os dados não têm campo de jogo; o bloco não o exibe e não há texto de substituição. Validado: 18 casos da regra em scratch (incluindo sem elegível, criada antes de participação, empate por id); em produção, os três perfis mostram o bloco com os dados de `simbolos-vice-city`; no navegador, desktop e celular, com troca de aba e volta. Não validado no navegador: o caso sem elegível (nenhum perfil de mock fica sem participação; coberto só pelos testes da função).
6. **Contribuições recentes**: arquivos `src/components/perfil/ContribuicoesRecentes.tsx`, `src/app/(site)/perfil/[usuario]/page.tsx`. **Concluída em 2026-10-17**: a lista vem de `contribuicoesRecentes` (`src/lib/perfil.ts`), sem lógica duplicada: publicações do membro, evidências públicas, sugestões aceitas e investigações criadas ou de participação, por data decrescente, com limite de 10. A apresentação só mapeia cada tipo: rótulo (Teoria, Investigação, Evidência, Investigação criada, Participação), título, contexto e data com rótulo ("Publicada em", "Enviada em", "Atualizada em"; a data de participação é `atualizadoEm` da investigação, porque o membro não tem data de entrada). Destinos: `/publicacao/[slug]`, `/investigacoes/[slug]` e `/investigacoes/[slug]#evidencia-{id}`, todos verificados (200 e âncora presente). Itens sem investigação correspondente são omitidos. Estado vazio "Ainda não há contribuições recentes". Aparece só na Visão geral, entre a investigação em destaque e as publicações, na ordem indicada para o celular no layout (identidade, indicadores, abas, destaque, contribuições e sidebar). **Sobreposição prevista**: a seção 6 inclui publicações, e a lista de publicações da Visão geral é mantida; por isso a mesma publicação pode aparecer nas duas. **Limitação**: sugestões aceitas aparecem com o rótulo "Evidência", sem distinção da evidência pública, porque a função não as separa. Validado: três perfis existentes com 200 e inexistente com 404 (com e sem `?aba=`); no navegador, desktop e celular, sem rolagem horizontal da página; troca de abas, voltar/avançar; links e âncoras. Não validado: o estado vazio no navegador (nenhum perfil de mock fica sem contribuição); coberto só pelo teste da função com lista vazia.
7. **Sidebar condicional**: ajustar `ContentGrid` para largura total sem sidebar; sidebar do perfil só com conteúdo (reconhecimento e membros relacionados, quando houver dados). Arquivos: `src/components/layout/ContentGrid.tsx`, `src/app/(site)/perfil/[usuario]/page.tsx`. **Concluída em 2026-10-17**:
   - `ContentGrid`: sem a prop `sidebar`, a coluna principal ocupa a largura toda, sem coluna vazia de 320 px (280 px no tablet). Com `sidebar`, o layout não muda. Nenhuma prop nova: a presença de `sidebar` define o layout. Os 13 consumidores passam `sidebar` (páginas e `loading.tsx`), então nenhum muda de layout. Medido em produção antes e depois, nas três larguras: 606/320 px (desktop), 422/280 px (tablet) e coluna única (celular), iguais antes e depois.
   - Perfil: deixou de usar a `Sidebar` global (tópicos e atualizações), como prevê a seção 8. Não há conteúdo próprio de reconhecimento nem de membros relacionados nos dados, então a página não passa sidebar: o conteúdo ocupa 950 px no desktop (largura do container) e 726 px no tablet. Nenhum `PerfilSidebarBox` foi criado, porque não há conteúdo para ele.
   - Pendência para a etapa 8: `loading.tsx` do perfil ainda mostra um esqueleto com sidebar, então durante o carregamento há uma coluna que some na página final.
8. **Estados e loading**: `src/app/(site)/perfil/[usuario]/loading.tsx` no novo formato. **Concluída em 2026-10-17**: `loading.tsx` usa `ContentGrid` sem sidebar e o novo `PerfilSkeleton` (`src/components/perfil/PerfilSkeleton.tsx`), que segue a hierarquia real: breadcrumb, identidade, indicadores, abas, destaque, contribuições e publicações. Alturas medidas na página real (desktop 950 px e celular 343 px) por breakpoint, para reduzir salto de layout. Os skeletons não mostram texto nem dado: nada de conteúdo fictício. Validado: no DOM do perfil, o fallback tem 7 blocos com as alturas e larguras previstas (desktop: 950 px; celular: 343 px, sem sidebar); a página produção responde 200 e 404 como antes. **Limitação**: não foi possível observar o loading em operação. A navegação do Next não usa o `fetch` interceptável, e a página estática já aparece pronta; por isso a verificação é estrutural (DOM), não visual.
9. **Documentação**: `PROJECT_STATE`, `CHANGELOG`, `DESIGN_SYSTEM` e esta especificação. **Concluída em 2026-10-17** (revisão documental, sem mudança de código): os documentos foram conferidos com o código. Mudanças: estado desta especificação, inventário, critérios, pendências; `PROJECT_STATE` (estado do perfil e do Git); `DESIGN_SYSTEM` (sem sidebar, skeleton do perfil, componentes do perfil); `page-specs/perfil-usuario.md`; `CHANGELOG` (categorias corrigidas e entrada de desatualizada removida); ADR-018 (decisões desta especificação, antes só aqui).
10. **Tags controladas (etapa separada, após o catálogo final)**: tipo `TagTematica`, campo `Case.tags`, mocks e filtro na listagem, se o produto aprovar. Não é parte das etapas 1 a 9. **Concluída em 2026-10-17**, com autorização explícita:
    - **Catálogo**: os oito temas da decisão 2, com os rótulos da especificação, na mesma ordem (`src/constants/tagsTematicas.ts`). Os ids são canônicos: minúsculos, sem acento, com hífen (ex.: `simbolos-mensagens`). Ids e rótulos não foram inventados.
    - **Migração das tags**: `Publicacao.tags` virou o catálogo. O texto livre anterior foi para `Publicacao.termos`, sem perda. Um tema só foi atribuído quando o nome do tema corresponde ao termo: `vice-beach`, `mapa`, `bunker`, `pântanos` e `loja` → Locais e mapas; `rádio`, `áudio` e `frequência` → Áudio e transmissões; `símbolos` → Símbolos e mensagens. **Auditoria (etapa 11)**: removidas `letreiro` → Símbolos e mensagens (um letreiro transmite mensagem, mas não é um símbolo) e `código` → Símbolos e mensagens (um código numérico não é símbolo). Os termos continuam em `termos`. Restam como decisões de catalogação, revisáveis pelo produto, `loja` → Locais e mapas e `bunker` → Locais e mapas. `trailer`, `edição`, `quadro` e `tempestade` não têm tema correspondente no catálogo: ficaram só como termos. A publicação `clarao-tempestade-anomalia-ou-edicao` ficou sem tema.
    - **Investigações**: nenhum mock de investigação tem tags, então nada foi migrado nem inventado.
    - **Componente**: `TagTematica` (`src/components/tags/TagTematica.tsx`), com estado estático e estado de link (filtro), foco visível e seleção (`aria-current`). `FiltroTemas` (`src/components/tags/FiltroTemas.tsx`) monta o filtro da listagem.
    - **Filtro**: `/publicacoes?tag=<id>`, combinável com `?tipo=`. Valor fora do catálogo é ignorado e mostra todas. Sem resultado, mostra estado vazio com ação para ver todos os temas. A comparação do valor da URL ignora caixa, acentos e espaços (`lerTagTematica`).
    - **Busca**: continua pesquisando os termos (texto livre) e também o rótulo dos temas, para que "locais" encontre publicações de "Locais e mapas".
    - **Não feito**: filtro na listagem de investigações (não há dados de tags para filtrar); tags nos cards da listagem (o card não as mostra).
11. **Fechamento funcional** (continuação autorizada; não estava no roteiro original, que termina na etapa 10). **Concluída em 2026-10-17**:
    - **Pendência A**: "Curtir" e "Favoritar" desabilitados na página da publicação, com a mensagem de conta e link para `/entrar` (ver seção 6).
    - **Pendência B**: aba "Investigações" com dados reais, separando criadas e participações, com `CaseCard` e links para a página da investigação. Função `investigacoesDoMembro` em `src/lib/perfil.ts`. Componente `InvestigacoesPerfil`.
    - **Pendência C**: auditoria das associações de tema. Removidas duas associações duvidosas (`letreiro` → Símbolos e mensagens; `código` → Símbolos e mensagens). Termos preservados. Identificadores canônicos, busca e filtros mantidos.

**Dependências**: 1 antes de 2–7. 4 antes de 5–6. 8 depois de 4. Nenhuma etapa depende de backend.

**Riscos**

- **R1 (dados)**: os mocks têm pouca informação por membro. Seções vazias são esperadas; a visão geral precisa funcionar com poucos dados.
- **R2 (SSG e `searchParams`)**: resolvido na etapa 4 (ADR-017). Ler `searchParams` no servidor tornava a rota dinâmica e fazia perfis inexistentes responderem 200. A aba agora é lida no cliente, e a validação de 404 foi feita por `curl` em produção.
- **R3 (gamificação antecipada)**: exibir patente ou especialização com valores falsos induziria a crer que o sistema existe. Por isso essas partes ficam fora de todas as etapas. **Atualizado (ADR-019)**: a exibição demonstrativa de patente e de conquistas foi autorizada pelo produto em 2026-10-17, com dados rotulados como demonstrativos e sem qualquer regra de progressão. XP, especializações e regras de desbloqueio continuam fora de escopo.
- **R4 (ações desabilitadas)**: botões desabilitados precisam de texto explicativo e link para `/entrar`, sem parecer funcionais.
- **R5 (identidade de dados)**: o `id` do criador e o `autorId` das publicações precisam continuar iguais.

## Critérios de aceitação

Legenda: [x] atendido e verificado; [~] parcial (o detalhe está na nota); [ ] não atendido.

- [x] `/perfil/analista_vb` responde HTTP 200 com nome, `@usuario`, bio e publicações corretas. Verificado em produção (curl e navegador).
- [x] `/perfil/inexistente` responde HTTP 404. Verificado em produção (curl, com e sem `?aba=`). A página em português aparece no navegador; o shell do site vem do lote 3B.
- [x] Nenhum dado fictício do mockup aparece. Interesses, data de entrada, seguidores e membros relacionados não foram exibidos. Verificado no código e no navegador.
- [x] "Seguir" desabilitado no perfil, e "Curtir" e "Favoritar" desabilitados na publicação, com texto e link para `/entrar`. Nada grava nem simula contagem (etapa 11).
- [x] Denunciar e bloquear aparecem desabilitados, com a nota de moderação.
- [x] Patente, especializações e distintivos não aparecem. Verificado por busca no código: a única ocorrência de "conquistas" é o placeholder previsto da aba.
- [x] Métricas derivadas dos dados existentes, sem taxas nem ranking.
- [x] A investigação em destaque aparece na Visão geral, com link para `/investigacoes/simbolos-vice-city`. Verificado no navegador.
- [x] O destaque segue a regra da seção 4: `simbolos-vice-city` aparece para `analista_vb`, `noturno_leonida` e `arquivista_99`, que participam dela. A interface não afirma escolha do membro.
- [~] Sem investigação elegível, o bloco não aparece. Coberto pelos testes da função; **não verificado no navegador**, porque nenhum perfil de mock fica sem participação.
- [x] Sem conteúdo para a sidebar, a página não mostra sidebar nem espaço vazio, em desktop (950 px), tablet (726 px) e celular (343 px). Verificado.
- [x] Nenhuma tag temática do catálogo aparece no perfil. Observação: a página de publicação já exibia tags de texto livre antes desta funcionalidade; elas não são o catálogo e não foram alteradas (ver "Conflitos").
- [~] As contribuições recentes indicam tipo, título, data e linkam para a rota correta. O **resumo** aparece nas publicações; evidências mostram o contexto da investigação, e participações não têm resumo. Os destinos foram verificados.
- [~] Abas por teclado: setas e Enter verificados no navegador. Home, End e Espaço não foram testados.
- [x] Em 375, 768 e 1024 px, sem rolagem horizontal da página, com a ordem de hierarquia da seção 8. Medido.
- [x] Typecheck, lint e build passaram em cada etapa de código.
- [ ] Console sem erros de aplicação ou de hidratação, verificado em `next dev`. **Não executado.**

## Auditoria final (etapa 12)

Auditoria técnica do escopo do perfil social, investigações e tags, sem mudança de produto. **Nenhum defeito comprovado foi encontrado; nenhum código foi alterado nesta etapa.**

- **Desenvolvimento (`next dev`, porta de teste)**: abertura de `/perfil/analista_vb?aba=investigacoes`, troca de abas, voltar e avançar, recarga, perfil inexistente, publicação com Curtir e Favoritar, aba Investigações, filtro de tema. Nenhum erro do React nem aviso de hidratação no console. Hidratação confirmada pelas propriedades de React nas abas.
- **Avisos no console, todos fora do perfil ou esperados**:
  - Erro 404 do navegador ao abrir uma página: o projeto não tem `favicon.ico` nem ícone versionado (preexistente). Não foi criado ícone, porque está fora do escopo.
  - Aviso de fonte pré-carregada não usada: aparece também na Home e em `/criadores`, na mesma fonte. Não é do perfil, e `src/app/layout.tsx` não foi alterado pelas etapas.
- **Estado inicial da aba antes da hidratação**: confirmado de novo. O acesso direto a `?aba=` mostra a Visão geral até a hidratação, e depois seleciona a aba correta. É o trade-off do ADR-017, mantido.
- **Acessibilidade por teclado (testado)**: setas movem o foco entre as abas sem mudar a URL; Home e End funcionam; Enter ativa a aba e grava uma entrada no histórico; o foco visível aparece (contorno sólido de 2 px). Os botões Curtir e Favoritar são `disabled`, não recebem foco. O link "Entre para continuar" recebe foco.
- **Overflow horizontal em 375 px (testado)**: perfil (Visão geral, Investigações, Teorias e publicações), publicação, listagem com tema e tipo, busca e investigação. Todos com `scrollWidth` igual a 375.
- **Regressões (testadas)**: scripts de regressão de tags, da auditoria e da regra do perfil passam. HTTP em produção conforme a matriz da etapa 11 (perfis 200, inexistentes 404, perfil em SSG).
- **Não testado nesta etapa**: leitor de tela; desktop por captura de todas as abas; medições de `ContentGrid` e skeleton (já verificados nas etapas 7 e 8, sem alteração desde então).

## Pendências e limitações

Itens que o código ainda não atende ou que não foram verificados. Cada um precisa de autorização antes de ser feito.

- **"Curtir" e "Favoritar"**: desabilitados na publicação (etapa 11). Não gravam, e não há contagem. Ativá-los depende de autenticação e persistência (backend).
- **Aba "Investigações"**: implementada com dados reais (etapa 11). Limite: só investigações com detalhe publicado entram, por falta de autoria nos demais.
- **Aba "Conquistas"**: placeholder, sem conceito implementado. Esperado.
- **Campo "jogo relacionado"** do destaque: não existe nos dados. Não exibido.
- **Campos de identidade** (data de entrada, interesses, seguidores): não existem em `Criador`. Não exibidos.
- **Reconhecimento e membros relacionados** (sidebar do perfil): sem dados. A sidebar do perfil não existe ainda.
- **Tags de investigações**: `Case.tags` existe como campo opcional, mas nenhum mock de investigação tem tags. O filtro não existe na listagem de investigações, porque não há o que filtrar.
- **Catalogação dos temas**: atribuída por correspondência com o nome, precisa de revisão do produto (etapa 10).
- **Estados do `TagTematica`**: o design system não define estados de tag. Os estados implementados reutilizam tokens de Badge e de FilterTabs. Não foram revisados visualmente contra um mockup de tags, porque não há um.
- **Console em `next dev`** e erros de hidratação: não verificados.
- **Leitor de tela**: não testado.
- **Loading**: verificação estrutural (DOM). Não foi observado em operação (ver etapa 8).
- **Estado vazio de contribuições e destaque omitido**: cobertos só por testes da função, não no navegador.
- **Largura do cabeçalho a 768 px**: a barra principal quebra em duas linhas (ver `PROJECT_STATE.md`). Fora do perfil, mas afeta as páginas dele.

## Conflitos com a documentação existente

- **`docs/page-specs/perfil-usuario.md`** (seção 4 e 5): previa sidebar com `Sidebar` (tópicos e atualizações). Foi substituído pela sidebar condicional de conteúdo do perfil (Decisões registradas, item 3). O arquivo foi atualizado para refletir isso.
- **`Publicacao.tags`** era texto livre nos tipos e nos mocks, fora do catálogo da decisão 2. **Resolvido na etapa 10**: `tags` é o catálogo, e o texto livre está em `termos`. Ver a etapa 10.
- **Referências à "seção 11"** nas versões anteriores deste documento não correspondiam a nenhuma seção. Foram substituídas pela referência correta.
- **Tags na página de publicação** (`src/components/publicacao/PublicacaoCabecalho.tsx`): desde a etapa 10, exibem os temas do catálogo, e os termos de texto livre aparecem em uma linha separada, "Palavras-chave", para não perder esse conteúdo. Essa separação é uma decisão desta etapa, revisável.
- **Posição do destaque**: a seção 4 previa o bloco logo abaixo da identidade e dos indicadores. A seção 5 e a hierarquia pedida na etapa 5 colocam o bloco na Visão geral, depois das abas. Adotou-se a segunda; a seção 4 foi atualizada.
- **"Curtir" e "Favoritar"**: a seção 6 e o inventário os previam com `AcaoRestrita`. Não foram implementados (ver "Pendências e limitações").

## Questões em aberto

1. **Revisão da catalogação**: a migração da etapa 10 atribuiu temas por correspondência com o nome (ver a etapa 10). O produto deve confirmar essas atribuições, e decidir o que fazer com os termos sem tema (`trailer`, `edição`, `quadro`, `tempestade`) e com a publicação sem nenhum tema.
2. **Conferência do catálogo**: o catálogo da decisão 2 é a lista inicial aprovada. Se houver uma lista oficial diferente, deve ser informada antes da etapa 10.
3. **Local de "Curtir" e "Favoritar"**: a especificação não aponta um local. Foi adotada a página da publicação (etapa 11). Confirmar, ou indicar outro local.
4. **Investigações sem detalhe**: a aba "Investigações" só inclui investigações com detalhe publicado. Incluir as demais exige um campo de autoria em `Case` (dado de produto).
5. **Campos de identidade e jogo relacionado**: quais dados o produto vai fornecer (data de entrada, interesses, seguidores, jogo do destaque)? Sem eles, nada é exibido.

Os itens XP, patentes, especializações, distintivos e seguidores dependem de regras de produto e de backend, por isso ficam fora desta etapa.
