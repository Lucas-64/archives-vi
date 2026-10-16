# Archives VI — instruções para o Claude Code

Site da comunidade de GTA VI. Stack: Next.js 16 (App Router), React 19, TypeScript strict e Styled Components 6. Idioma da interface e da documentação: português do Brasil.

## Leia antes de começar

1. `AGENT.md`: regras de nomenclatura, tema e o que não fazer.
2. `docs/PROJECT_STATE.md`: estado atual, pendências e próximo passo.
3. `docs/DECISIONS.md`: decisões aceitas. Não altere um ADR sem justificativa e aprovação.
4. `docs/ARCHITECTURE.md` e `docs/DESIGN_SYSTEM.md`: estrutura, tema e componentes.

Para criar página: `docs/PAGE_TEMPLATE.md`. Para funcionalidade com várias páginas ou componentes: `docs/features/_modelo.md`.

## Comandos

- `npm run typecheck`: verificação de tipos.
- `npm run lint`: ESLint.
- `npm run build`: build de produção.
- `npm run dev`: servidor de desenvolvimento. Estados de teste (`?simular=vazio|erro|lento`) só funcionam nele.

Não há testes automatizados.

## Regras de trabalho

- Antes de editar, rode `git status` e leia os arquivos afetados. Preserve alterações pendentes, inclusive as não rastreadas.
- Não faça commit, push, checkout, reset ou stash sem pedido explícito.
- Não instale dependências, nem crie scripts, hooks, skills ou agentes sem aprovação.
- Não altere `src/app/components/` (legado, ADR-006).
- Não mexa em `node_modules/` nem nos arquivos de apresentação de Máquinas de Turing (`*.pptx`, `*.pdf`, `generate_turing_presentation.py`), que não pertencem ao projeto.
- Antes de criar um componente, procure um equivalente em `src/components/` e `docs/DESIGN_SYSTEM.md`. Primitives ficam em `src/components/ui/`.
- Cores, espaçamentos e fontes vêm de `src/styles/theme.ts`. Não escreva hexadecimais nem `rgba()` em componentes. Há exceções antigas listadas em `docs/PROJECT_STATE.md`: não as copie.
- `'use client'` só quando o componente tiver estado, evento ou styled-components.
- Mocks são demonstrativos e devem ser identificados como tais. Não simule persistência, login ou envio: ações que exigem autenticação ficam desabilitadas, com link para `/entrar`. Exceção: as demonstrações aprovadas em `docs/DECISIONS.md` (ADR-010, "Exceções aprovadas"), que devem ser rotuladas como simulação e não gravam nada.
- Imagens de seção vêm de `src/constants/imagensSecoes.ts`. Nunca use essas imagens em conteúdo de usuário.
- Textos da interface em português do Brasil. Não use emoji como ícone.

## Ao terminar uma tarefa

- Atualize `docs/PROJECT_STATE.md` (estado, pendências e próximo passo) quando a tarefa mudar o estado do projeto.
- Registre decisões novas em `docs/DECISIONS.md`.
- Atualize `docs/CHANGELOG.md` para mudanças visíveis.
- Informe o que foi validado e o que não foi. Não declare teste visual concluído sem tê-lo executado no navegador.

## Armadilhas conhecidas

- Navegador de automação: o conteúdo de rotas com `loading.tsx` só aparece depois de uma interação (rolagem), porque a revelação do Suspense usa `requestAnimationFrame`. Role a página antes de medir.
- Slug inexistente em páginas de detalhe responde HTTP 200 com a página "não encontrada" (soft 404), pelo mesmo motivo do streaming.
- `hero.jpg` contém PNG com extensão `.jpg`.
