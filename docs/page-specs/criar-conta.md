# Especificação: `/criar-conta`

**Status**: pendente de implementação. Escopo aprovado.
**Fonte de verdade**: decisões aprovadas abaixo, `docs/DECISIONS.md` (ADR-010) e `docs/page-specs/entrar.md`.

## 1. Objetivo e responsabilidade

Página com um **formulário demonstrativo** de cadastro, com aviso claro de que não há backend. Não cria conta.

**Estado atual**: "Criar conta" no cabeçalho (`ROUTES.criarConta`) já leva a esta rota.

## 2. Decisões confirmadas

- Formulário **demonstrativo**, com **aviso claro** de ausência de backend.

## 3. Interpretação adotada (a confirmar)

Mesma de `/entrar`: validação no cliente, mensagem de demonstração ao enviar, nenhuma conta criada, nenhuma sessão, nenhum armazenamento e nenhuma requisição. Registrada como exceção no ADR-010.

## 4. Detalhes técnicos (a confirmar na inspeção)

- Campos: nome de usuário, e-mail, senha e confirmação de senha.
- Validação: nome de usuário obrigatório; e-mail com formato válido; senha com no mínimo 8 caracteres; confirmação igual à senha.
- `autocomplete="new-password"` nos dois campos de senha.
- **Não incluídos**: termos de uso e política de privacidade. Não existem no repositório. Não serão criados sem o texto aprovado por você.
- Unicidade do nome de usuário: não verificável sem backend. A página não promete verificação.

## 5. Estrutura visual e responsividade

- Cartão centralizado, igual ao de `/entrar`.
- Título "Criar conta" e frase de contexto.
- Campos, botão "Criar conta" e, abaixo, o aviso de demonstração.
- Link "Já tenho conta" para `/entrar`.
- Mobile: cartão em largura total.
- Sem overflow horizontal em 375, 768 e 1440 px.

## 6. Componentes

**Reutilizar**: `Card`, `Button`, `Container`, como em `/entrar`.

**Novos, compartilhados**: `Input` e `FormField` (fundação de formulários).

## 7. Dados, tipos e mocks

Nenhum.

## 8. Interações e navegação

- Envio: erros de validação aparecem nos campos. Se for válido, mostra a mensagem de demonstração (texto proposto: "Demonstração: nenhuma conta foi criada. O cadastro ainda não existe nesta versão.").
- Link "Já tenho conta" leva a `/entrar`.

## 9. Estados

- Carregamento e vazio: não se aplicam.
- Erro: mensagens de validação dos campos.
- Falha de carregamento: `error.tsx` do grupo `(site)`.

## 10. Critérios de aceitação

- [ ] Campos e validações da seção 4 funcionam.
- [ ] Aviso de demonstração visível, com a declaração de que nenhuma conta foi criada.
- [ ] Nenhuma conta, sessão, armazenamento do navegador ou requisição de rede.
- [ ] Senhas com `type="password"` e `autocomplete="new-password"`.
- [ ] Campos com `label` associado; mensagens ligadas por `aria-describedby`.
- [ ] Sem overflow horizontal em 375, 768 e 1440 px.

## 11. Dependências e arquivos

**Depende de**: fundação de formulários; mesmo grupo de `/entrar`.

**Pode criar**: `src/app/(site)/criar-conta/page.tsx`, `loading.tsx` (se necessário).

**Não alterar sem autorização**: `src/components/layout/Header.tsx`, `src/constants/routes.ts`, `src/app/(site)/layout.tsx`.

## 12. Validação

- Nível 2 de `docs/PAGE_TEMPLATE.md`.
- Testar cada validação, a confirmação de senha, o aviso e o link para `/entrar`.
