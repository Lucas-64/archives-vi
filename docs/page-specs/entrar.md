# Especificação: `/entrar`

**Status**: pendente de implementação. Escopo aprovado.
**Fonte de verdade**: decisões aprovadas abaixo, `docs/DECISIONS.md` (ADR-010) e o código atual.

## 1. Objetivo e responsabilidade

Página com um **formulário demonstrativo** de entrada, com aviso claro de que não há backend. Não autentica ninguém.

**Estado atual**: "Entrar" no cabeçalho (`ROUTES.entrar`), "Entre para continuar" em `AcaoRestrita` e "Entre para comentar" em `ComposerBloqueado` já levam a `/entrar`.

## 2. Decisões confirmadas

- Formulário **demonstrativo**, com **aviso claro** de ausência de backend.

## 3. Interpretação adotada (a confirmar)

"Formulário demonstrativo" foi interpretado assim:
- o formulário é validado no cliente e exibe uma mensagem de demonstração ao ser enviado;
- a mensagem diz que nenhuma sessão foi criada, porque o backend ainda não existe;
- não há sessão, redirecionamento para área logada, cookie, `localStorage`, `sessionStorage`, requisição de rede nem estado global de usuário.

Esse comportamento não simula login: a mensagem o declara como ausente. Isso está registrado como complemento do ADR-010, na seção "Exceções aprovadas".

## 4. Detalhes técnicos (a confirmar na inspeção)

- Campos: e-mail e senha. `type="password"` e `autocomplete="current-password"` na senha.
- Validação: e-mail com formato válido; senha obrigatória.

## 5. Estrutura visual e responsividade

- Cartão centralizado (`Card`, variante `elevated`, padding `large`), largura máxima de 420 px, dentro do `Container`.
- Título "Entrar" (fonte `display`) e uma frase de contexto.
- Campos, botão "Entrar" e, abaixo, o aviso de demonstração.
- Link "Criar conta" para `/criar-conta`.
- Mobile: cartão em largura total, com margem lateral de 16 px.
- Sem overflow horizontal em 375, 768 e 1440 px.

## 6. Componentes

**Reutilizar**: `Card`, `Button` (variante `primary`), `Container`.

**Novos, compartilhados**: `Input` e `FormField` (fundação de formulários). Esta página não cria esses componentes.

## 7. Dados, tipos e mocks

Nenhum.

## 8. Interações e navegação

- Envio: se houver erro de validação, mostra as mensagens nos campos. Se for válido, mostra a mensagem de demonstração (texto proposto: "Demonstração: nenhuma sessão foi criada. A autenticação ainda não existe nesta versão.").
- Link "Criar conta" leva a `/criar-conta`.

## 9. Estados

- Carregamento e vazio: não se aplicam.
- Erro: mensagens de validação dos campos.
- Falha de carregamento: `error.tsx` do grupo `(site)`.

## 10. Critérios de aceitação

- [ ] Formulário com e-mail e senha, validado no cliente.
- [ ] Aviso de demonstração visível, com a declaração de que nenhuma sessão foi criada.
- [ ] Nenhuma sessão, cookie, armazenamento do navegador ou requisição de rede.
- [ ] Senha com `type="password"`.
- [ ] Campos com `label` associado; mensagens ligadas por `aria-describedby`.
- [ ] Sem overflow horizontal em 375, 768 e 1440 px.

## 11. Dependências e arquivos

**Depende de**: fundação de formulários (`Input`, `FormField`).

**Grupo de rota**: `src/app/(site)/entrar/`, sem novo layout. Um grupo `(auth)` com layout próprio criaria um layout compartilhado e exige aprovação; não é proposto.

**Pode criar**: `src/app/(site)/entrar/page.tsx`, `loading.tsx` (se necessário).

**Não alterar sem autorização**: `src/components/layout/Header.tsx`, `src/constants/routes.ts`, `src/app/(site)/layout.tsx`.

## 12. Validação

- Nível 2 de `docs/PAGE_TEMPLATE.md`.
- Testar: e-mail inválido, campos vazios, envio válido com aviso, link para `/criar-conta`.
- Verificar no código que nenhum armazenamento do navegador nem requisição são usados.
