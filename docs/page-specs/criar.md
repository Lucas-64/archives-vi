# Especificação: `/criar`

**Status**: implementada (fase 2, commit `e29e2e96`; ajustes de acabamento na fase 2.1). Verificada no navegador em 1440, 768 e 375 px, sem rolagem horizontal. Escopo aprovado: somente teorias, sem seletor de tipo, sem tags e sem vínculo com investigação. Qualquer ampliação exige nova decisão. Pendências dentro do escopo: nenhuma.
**Fonte de verdade**: decisões aprovadas abaixo, `docs/ROADMAP.md`, o protótipo aprovado (painel "Criar publicação") e o código atual.

## 1. Objetivo e responsabilidade

Criar uma **teoria** de forma demonstrativa: preencher o formulário, ver a prévia e enviar uma simulação. Nada é publicado nem salvo.

## 2. Decisões confirmadas

- Criar **somente teorias**. Não há seletor de tipo, e investigações não são criadas aqui.
- Mostrar **prévia** da teoria, atualizada enquanto o usuário digita.
- **Envio simulado**, com mensagem de sucesso claramente identificada como simulação.
- Não criar funcionalidades de autenticação.

Não pertence ao escopo aprovado: anexos (imagens e vídeo, que aparecem no protótipo). Não serão implementados nesta versão. Se forem desejados, é preciso uma nova decisão.

## 3. Detalhes técnicos (adotados, a confirmar na inspeção)

- Texto em texto simples, sem Markdown.
- Limites de validação propostos: título de 3 a 120 caracteres; texto de 20 a 2000 caracteres. São valores técnicos, não regras de produto.

## 4. Estrutura visual e responsividade

- `PageHeader` com o título "Criar teoria" e uma frase curta.
- `ContentGrid`: formulário na coluna principal e prévia na sidebar. No mobile, a prévia fica abaixo do formulário.
- Formulário, nesta ordem: título, texto, botão "Enviar simulação".
- Sem sidebar de `Sidebar` (tópicos e atualizações) nesta página.
- Sem overflow horizontal em 375, 768 e 1440 px.

## 5. Componentes

**Reutilizar**: `ContentGrid`, `PageHeader`, `PageBody`, `Button`, `Badge`, `Card`, `Breadcrumb`, `PublicationCard` (prévia, alimentado pelo estado do formulário, sem alteração no componente).

**Novo, compartilhado (fundação, ver seção 11)**: `Input`, `Textarea` e `FormField`, em `src/components/ui/`.

**Inspeção feita**: nenhum componente de formulário existe em `src/components/ui/`. Os componentes shadcn do legado não são reutilizados (ADR-006).

## 6. Dados, tipos e mocks

- Tipo `Publicacao` (`src/types/Publicacao.ts`). A prévia monta um objeto `Publicacao` apenas na tela, com `tipo: "teoria"` fixo, `autorId` do usuário demonstrativo e `comentarios: 0`.
- Nenhum mock é alterado. Nenhum registro é criado.

## 7. Interações e navegação

- Validação no cliente: título e texto obrigatórios, dentro dos limites da seção 3. Mensagens em português, ligadas aos campos com `aria-describedby`.
- A prévia atualiza enquanto o usuário digita, sem exigir validação completa.
- "Enviar simulação": valida o formulário. Se houver erro, mostra as mensagens. Se for válido, mostra a mensagem de sucesso (seção 8).
- Nenhum dado é gravado: não há `localStorage`, `sessionStorage`, cookie, requisição de rede nem estado global compartilhado.

## 8. Estados

- Carregamento: `loading.tsx`.
- Vazio: não se aplica, o formulário começa vazio.
- Envio simulado com sucesso: mensagem identificada como simulação. Texto proposto: "Simulação: sua teoria não foi publicada nem salva. O envio real depende de backend e de conta, que ainda não existem."
- Erro: mensagens de validação dos campos. Falha de carregamento: `error.tsx` do grupo `(site)`.

## 9. Conflito de regras e interpretação adotada

Existe um conflito concreto entre a decisão aprovada e duas regras documentais:

- `CLAUDE.md`, seção "Regras de trabalho": "Não simule persistência, login ou envio: ações que exigem autenticação ficam desabilitadas."
- `docs/DECISIONS.md`, ADR-010: ações que exigem conta "are shown disabled".

**Interpretação adotada**: a regra existe para evitar que uma simulação pareça persistência real ou um login real. O envio aprovado cumpre essa intenção, porque (a) é rotulado como simulação, (b) não grava nada, (c) não declara autenticação, e (d) não cria registro. Por isso ele é permitido, como exceção registrada.

**Ação documental**: o ADR-010 recebe um complemento com essa exceção, e a regra do `CLAUDE.md` passa a dizer que vale "exceto demonstrações aprovadas, rotuladas como simulação". **Confirme esta interpretação.** Se você preferir a regra literal, o envio fica desabilitado, e a especificação precisa ser refeita.

## 10. Critérios de aceitação

- [ ] Somente teorias: não há seletor de tipo, e nenhuma investigação é criada.
- [ ] Prévia atualizada a partir do formulário, sem gravação.
- [ ] Validação no cliente, com mensagens ligadas aos campos.
- [ ] Envio simulado mostra a mensagem de simulação da seção 8.
- [ ] Nenhuma gravação: nenhum `localStorage`, `sessionStorage`, cookie nem requisição.
- [ ] Anexos não aparecem.
- [ ] Layout em duas colunas no desktop e em uma coluna no mobile.
- [ ] Sem overflow horizontal em 375, 768 e 1440 px.

## 11. Dependências e arquivos

**Depende de**: fundação de formulários (`Input`, `Textarea`, `FormField`), concluída antes desta página.

**Pode criar**: `src/app/(site)/criar/page.tsx`, `loading.tsx`; `src/components/criar/` (formulário e prévia).

**Não alterar sem autorização**: `src/components/cards/PublicationCard.tsx`, `src/types/Publicacao.ts`, `src/components/layout/*`, `src/constants/routes.ts`, `src/lib/data.ts`.

## 12. Validação

- Nível 2 de `docs/PAGE_TEMPLATE.md`.
- Testes: título vazio, texto curto, envio válido com mensagem de simulação, e confirmação visual de que a prévia atualiza.
- Verificar no código que nenhum armazenamento do navegador e nenhuma requisição são usados.
- Navegador em 1440, 768 e 375 px, com overflow e console.
