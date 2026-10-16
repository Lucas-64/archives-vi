# Funcionalidade: <nome>

Copie este arquivo para `docs/features/<nome-kebab>.md` e preencha. Remova as seções que não se aplicarem. Uma página simples não precisa deste arquivo: use `docs/PAGE_TEMPLATE.md`.

**Status**: planejada | em andamento | concluída
**Última atualização**: AAAA-MM-DD

## Objetivo

Uma ou duas frases sobre o resultado para o usuário.

## Escopo

- Dentro: ...
- Fora: ...

## Rotas

| Rota | Arquivo | Situação |
|---|---|---|
| `/exemplo` | `src/app/(site)/exemplo/page.tsx` | a criar |

## Dados

- Tipos: `src/types/...`
- Mocks (demonstrativos): `src/mocks/...`
- Funções em `src/lib/data.ts`: ...
- Persistência: nenhuma | descrever quando houver backend

## Componentes

| Componente | Origem | Motivo |
|---|---|---|
| `SidebarBox` | reutilizado | bloco de sidebar |
| `XxxCard` | novo | ... (não existe equivalente em `src/components/`) |

Antes de listar um componente novo, confirme em `docs/DESIGN_SYSTEM.md` e em `src/components/` que não há equivalente.

## Decisões

- Decisões novas vão para `docs/DECISIONS.md`. Liste aqui os IDs relacionados: ADR-00X.
- Decisões em aberto (precisam de aprovação): ...

## Etapas

Cada etapa é um incremento pequeno, com validação própria.

1. [ ] Etapa 1: ... Critério: ...
2. [ ] Etapa 2: ... Critério: ...

## Validação

- Por etapa: nível de validação de `docs/PAGE_TEMPLATE.md` (seção 7), conforme a complexidade.
- Ao final: revisão de todas as rotas afetadas, em 1440, 768 e 375 px.

## Riscos e pendências

- ...

## Registro

- `docs/PROJECT_STATE.md`: atualizar ao concluir cada etapa.
- `docs/CHANGELOG.md`: uma entrada por funcionalidade concluída.
