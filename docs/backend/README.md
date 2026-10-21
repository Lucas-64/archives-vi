# Backend do Archives VI: ambiente local

Backend em Next.js (Route Handlers) com TypeScript, PostgreSQL, Drizzle e Zod. Em desenvolvimento tudo roda na sua máquina, sem conta, sem serviço pago e sem rede (depois do `npm install`). O plano e os contratos estão em `docs/API.md` e na pasta de planejamento do projeto.

Estado: **fundação, autenticação, publicações, comentários, curtidas e investigações (Tarefas 1 a 6)**. Existem configuração validada, conexão com o banco, migrações (`usuarios`/`sessoes`, `limites_taxa`, `publicacoes` e tabelas ligadas, `comentarios`/`curtidas`, `investigacoes` e tabelas ligadas), a fundação HTTP (erros padronizados, respostas, validação com Zod e paginação) e testes. As rotas de API são `/api/v1/auth/{cadastro,entrar,sair,eu}` `/api/v1/publicacoes` (listar, detalhe, relacionadas e criar teoria), `/api/v1/comentarios` (listar e criar) `/api/v1/publicacoes/{slug}/curtida` (curtir e descurtir) e `/api/v1/investigacoes` (listar, detalhe, histórico, criar, editar, estado e encerrar). O front não usa o backend (ADR-010 continua valendo para o front). Evidências, moderação, busca, perfis, edição e exclusão de comentários, respostas, upload e seed dos mocks ainda não existem.

## Requisitos

- Node.js **22.12 ou superior** (o Vitest 5 exige; o Next aceita 20.9+). Confira com `node -v`.
- PostgreSQL **16** acessível em `127.0.0.1`. Duas opções gratuitas:
  - **Instalado no sistema** (instalador oficial). Crie um papel `archives` com senha e permissão `CREATEDB`, e o banco `archives_vi_dev`.
  - **Docker Compose**: `docker compose up -d` (usa `docker-compose.yml`, porta 5433). Este arquivo **não foi testado** no ambiente de desenvolvimento do plano (sem daemon do Docker); se falhar, use a opção anterior.
- Não presuma nada instalado: confirme com `psql --version` ou `docker --version`.

## Configuração

```bash
npm install
cp .env.example .env.local     # ajuste as URLs se o seu PostgreSQL usar outra porta/senha
npm run db:migrate             # aplica drizzle/*.sql no DATABASE_URL
npm test                       # roda os testes (precisa de TEST_DATABASE_URL)
```

Variáveis (validadas por Zod em `src/server/config/env.ts`; a falta de `DATABASE_URL` gera erro claro que não imprime a senha):

| Variável | Uso |
|---|---|
| `DATABASE_URL` | banco do app e das migrações |
| `TEST_DATABASE_URL` | servidor onde os testes criam bancos descartáveis (papel com `CREATEDB`) |

`.env.local` é ignorado pelo Git. `.env.example` só tem credenciais de desenvolvimento local.

## Comandos

| Comando | O que faz |
|---|---|
| `npm test` | Vitest. Cada suíte de banco cria `archives_teste_<hex>`, migra do zero e apaga. Sem `TEST_DATABASE_URL` o teste **falha** (não é ignorado) |
| `npm run db:generate` | gera uma nova migração SQL em `drizzle/` a partir de `src/server/db/esquema/` |
| `npm run db:migrate` | aplica as migrações pendentes em `DATABASE_URL` |
| `npm run db:check` | confere a consistência das migrações |
| `npm run admin:criar` | cria o **primeiro administrador** (ver abaixo). Não roda em instalação, build, migração nem rota |
| `npm run typecheck`, `npm run lint`, `npm run build` | validações do projeto |

Fluxo para mudar o esquema: edite `src/server/db/esquema/*.ts` → `npm run db:generate -- --name=descricao` → revise o SQL gerado → `npm run db:migrate` → `npm test`. Nunca edite uma migração já aplicada; crie outra.

## Estrutura

```
src/server/config/   variáveis de ambiente (Zod)
src/server/db/       cliente (pg + Drizzle), migrador e esquema (esquema/*.ts)
src/server/http/     erros, respostas, validação (Zod) e paginação das rotas
src/server/auth/     senha (scrypt), token, cookie, sessão, limite de tentativas, guardas e manipuladores
src/server/servicos/ regras de negócio (hoje: auth, publicacoes, interacoes, investigacoes, slugs, evidencias, moderacao, auditoria, admin)
src/server/contracts/ esquemas Zod de entrada/saída (hoje: auth, publicacoes, interacoes, investigacoes, evidencias, moderacao)
src/server/publicacoes/ slug, resumo, dia local e manipuladores das rotas (publicações, comentários e curtidas)
src/server/investigacoes/ validação de link do YouTube e manipuladores das rotas de investigações
src/server/evidencias/ manipuladores das rotas de evidências, sugestões e /me/sugestoes
src/server/moderacao/ manipuladores das rotas de moderação (status, papéis, auditoria)
src/server/cli/      script do primeiro administrador (criarAdmin.ts)
src/server/testes/   apoio de testes (banco descartável)
src/app/api/v1/      route.ts finos (auth/, publicacoes/) que só instanciam os manipuladores
drizzle/             migrações versionadas (SQL + meta)
```

Testes ficam junto do código (`*.test.ts`), porque o `tsconfig.json` só inclui `src/`.

## Fundação HTTP (`src/server/http/`)

Uso típico em um Route Handler:

```ts
export const POST = envolver(async (requisicao) => {
  const dados = await lerCorpo(requisicao, esquemaDoRecurso); // 415/400/413/422 já tratados
  // ... regra de negócio no serviço ...
  return criado(recurso, `/api/v1/recursos/${recurso.id}`);
});
```

- `erros.ts`: `ErroApi(codigo, mensagem?, { campos, retryAfter })`; tabela código → HTTP igual à seção 1 de `docs/API.md`. Só `ErroApi` chega ao cliente.
- `resposta.ts`: `json`, `criado`, `semConteudo`, `erroParaResposta` e `envolver`. Erro inesperado vira `500 erro_interno` genérico, sem stack nem texto original; a resposta sempre leva `X-Request-Id`. O registro do erro (nome e mensagem) é provisório, em `console.error`, até a tarefa de logs.
- `validar.ts`: `validar`, `validarQuery`, `lerJson`, `lerCorpo`. Mensagens do Zod em português; campos extras de `.strict()` viram "Campo não permitido."; problema na raiz usa a chave `_`. O limite do corpo (100 KB por padrão) é aplicado lendo o corpo, não só o `Content-Length`.
- `paginacao.ts`: `?limite` (padrão 20, máximo 50, acima disso é 422) e `?cursor` opaco (JSON em base64url, validado ao ler; adulterado dá 400). `fatiarPagina` ajuda consultas que buscam `limite + 1` linhas. O cursor não é segredo: não coloque nada nele que o cliente não possa ver.

## Limitações conhecidas

- **`docker-compose.yml` não foi testado.** O ambiente onde o backend foi desenvolvido não tem daemon do Docker em funcionamento.
- **O PostgreSQL usado nos testes e nas migrações foi o 16 instalado nativamente** (porta 5433), não o do Compose. Não foi verificado em outros sistemas operacionais.
- O registro de erros em `console.error` é provisório.
- Nada é integrado ao front.
- A janela do limite de tentativas é fixa (permite uma rajada na virada) e o IP vem de `X-Forwarded-For`, forjável sem proxy confiável.
- Sem verificação de e-mail, o cadastro com e-mail repetido ainda distingue "já existe" de sucesso (resposta genérica, mas distinguível). Resolve-se com o fluxo de e-mail (MVP-B).
- Rotinas de manutenção (`removerSessoesInvalidas`, limpeza de `limites_taxa`) existem/são simples, mas **não estão agendadas**.
- O primeiro administrador só é criado pelo script `npm run admin:criar` (nunca por rota). Nenhum foi criado em banco real; o script foi testado só em bancos descartáveis.

## Autenticação (Tarefa 3)

- **Senhas**: `scrypt` do `node:crypto`, N=2^15, r=8, p=3 (padrão OWASP, ~32 MiB e ~0,5 s por hash), sal aleatório de 16 bytes por senha, chave de 64 bytes, comparação em tempo constante. O hash `scrypt$N$r$p$sal$hash` guarda os próprios parâmetros: mudar `PARAMETROS_PADRAO` não invalida hashes antigos, que são regravados no próximo login (`precisaRehash`). Senha de 8 a 128 caracteres.
- **Sessões**: token de 32 bytes aleatórios (`randomBytes`), em base64url, só no cookie; o banco guarda apenas o SHA-256. Expira após 30 dias sem uso (renovação a cada 5 min, limitada ao absoluto) e 90 dias no máximo. Logout revoga no servidor (`revogada_em`); `revogarSessoesDoUsuario` encerra todas.
- **Cookie**: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age`/`Expires`; produção usa `__Host-sessao` + `Secure`, desenvolvimento usa `sessao` sem `Secure` (http local). Quem decide é `NODE_ENV`.
- **CSRF**: mutações exigem `Origin` igual à origem da requisição e `X-Requested-With: archives-vi`.
- **Abuso**: limite por IP (5/min) e por e-mail (10/h) em login e cadastro, contador no PostgreSQL (`limites_taxa`) com chave em hash. Login com e-mail inexistente também gasta um `scrypt` (hash falso) para o tempo não revelar a conta.
- **Guardas**: `exigirSessao` (401) e `exigirPapel` (401/403) leem o papel do banco, nunca do cliente.
- **Logs**: nenhum log recebe senha, token ou corpo da requisição; erro inesperado registra só nome e mensagem do erro.

## Publicações (Tarefa 4)

- **Tabelas** (migração `0002_publicacoes`): `tags` (catálogo fechado de 8 temas, inserido pela própria migração e igual a `src/constants/tagsTematicas.ts`; um teste confere a igualdade lendo o arquivo do front, sem alterá-lo), `publicacoes`, `publicacao_tags` e `publicacao_termos`. CHECKs no banco repetem os limites (slug, título 3–120, resumo 1–200, corpo ≤2000).
- **Ordem e cursor**: `data` desc, `criado_em` desc, `id` desc; cursor com os três campos e comparação de tupla (paginação estável com empates). `criado_em` viaja no cursor como texto UTC com microssegundos, porque o driver só devolve milissegundos.
- **Fuso**: `data` é o dia civil em `America/Sao_Paulo` (calculado pela aplicação, com o mesmo padrão na coluna); `criado_em` é UTC. Os dois nunca se misturam na ordenação.
- **Criação**: autor sempre da sessão, `tipo` sempre `teoria`, campos extras recusados (422), limite de 10 por minuto por membro com contador atômico em `limites_taxa` (grupo `publicar:membro`), slug com nova tentativa em caso de colisão (até 5, sufixo aleatório).
- **Leitura**: só `status = publicado`; oculta e inexistente dão o mesmo 404; nenhum e-mail, hash ou bio sai nas respostas.
- **Testes de concorrência** (PostgreSQL real): 20 logins simultâneos do mesmo IP dão exatamente 5 processados e 15 × 429; 20 logins do mesmo e-mail com IPs diferentes dão 10 e 10; 20 criações simultâneas do mesmo membro dão 10 × 201 e 10 × 429; criações simultâneas com o mesmo título geram slugs únicos. Os resultados foram deterministas em três execuções seguidas.

## Comentários e curtidas (Tarefa 5)

- **Tabelas** (migração `0003_comentarios_curtidas`): `comentarios` (texto 1–2000 por CHECK, FK para publicação com CASCADE e para o autor com RESTRICT, índice `(publicacao_id, criado_em, id)`) e `curtidas` (chave primária composta `(publicacao_id, usuario_id)`: duplicata é impossível no banco, mesmo sob concorrência).
- **Comentários**: leitura pública em ordem cronológica com cursor `(criado_em, id)`; criação só por membro autenticado, autor da sessão, alvo `publicacao:{slug}`; corpo estrito (recusa `respostaA`, `autorId` etc.); 20 por minuto por membro (`comentar:membro`).
- **Curtidas**: `PUT` insere com `ON CONFLICT DO NOTHING` e `DELETE` remove só a linha do próprio membro (filtro pelo id da sessão); ambos idempotentes e devolvem `{ curtidas, euCurti }`; 60 por minuto por membro (`curtir:membro`).
- **Campos das publicações**: `comentarios`, `curtidas` e `euCurti` saem de contagens agrupadas nas tabelas (nada fixo). Leituras públicas leem a sessão se houver, só para `euCurti`; visitante recebe `false`.
- **Testes** (`interacoes.test.ts`, PostgreSQL real): inclui 20 curtidas simultâneas do mesmo membro (1 linha), 10 membros curtindo em paralelo (soma 10), curtir e descurtir misturados, e rajada de comentários (20 aceitos e 10 × 429 de 30).

## Investigações (Tarefa 6)

- **Tabelas** (migração `0004_investigacoes`): `investigacoes` (valores reais de `status`, `estado` e `categoria` em CHECKs; teoria em colunas e `text[]`), `investigacao_tags` e `investigacao_historico` (com coluna interna `tipo`). Sem evidências, comentários ou participantes.
- **Dois eixos**: `status` (lista, ADR-009) nasce `investigating` e nenhuma rota o altera; `estado` (detalhe) é do responsável; `encerrar` só marca `encerrada_pelo_autor`. Ver `DECISOES.md` e o ADR-024.
- **Autorização**: responsável = `autor_id`, decidido no servidor. Visitante 401; outro membro (inclusive moderador/admin, por ora) 403. `permissoes.podeGerenciar` é calculado no servidor.
- **Concorrência**: limite de 3 abertas sob `pg_advisory_xact_lock` por autor; linha trancada com `FOR UPDATE` nas mutações; slug escolhido sob bloqueio por slug, em um espaço único com as publicações (`servicos/slugs.ts`).
- **Limites provisórios (D-F)**: tamanhos de texto, 3 abertas por membro e 20 mutações por minuto por membro (`investigacao:mutar`).
- **Testes** (`investigacoes.test.ts`, `investigacoesEsquema.test.ts`, `youtube.test.ts`): autorização, transições de estado, encerramento repetido, slug entre tipos, histórico, paginação com empates e concorrência (10 criações dão 3 × 201 e 7 × 409; 10 encerramentos dão um registro).

## Por que `@types/node` está no `package.json`

O `next build` o acrescentou sozinho (`@types/node`, devDependency) porque o projeto usa TypeScript e o código do servidor usa `process`, `Buffer` e `node:crypto`. Sem ele o `npm run typecheck` falha ao encontrar `process`. Foi mantido por esse motivo e não é usado em código de navegador.

## Regras

- O backend **não** altera nem importa o front (`src/components`, `src/lib`, `src/mocks`, `src/types`, `src/app/(site)`…). A integração será gradual e só com autorização.
- Autorização é sempre no servidor. Segredos só em variáveis de ambiente, nunca no código nem em `NEXT_PUBLIC_*`.
- `usuario` e `email` são guardados em minúsculas (CHECK no banco); a aplicação normaliza antes de gravar.
- Nenhuma ferramenta paga. Qualquer serviço externo (e-mail, armazenamento, hospedagem) está fora do escopo até autorização.

## Decisões desta etapa

- Identificadores: `uuid` v4 gerado pelo PostgreSQL (`gen_random_uuid()`), sem dependência extra. O plano previa UUID v7; trocar é possível depois (ordenação por tempo) e não afeta contratos.
- Unicidade sem diferenciar maiúsculas por **normalização + CHECK**, sem extensão `citext`.
- Sessões: apenas o hash SHA-256 do token vai ao banco; expiração deslizante e limite absoluto (a lógica entra na tarefa de sessões).

## Evidências, moderação e primeiro administrador (Tarefa 7)

- **Tabelas** (migração `0005_evidencias_moderacao`): `evidencias` (sugestão e evidência no mesmo registro; CHECKs de origem, status, tamanhos e coerência da decisão; chave composta que obriga `relacionada_a` a ser da mesma investigação; autor e decisor com `RESTRICT`, investigação com `CASCADE`) e `auditoria` (somente inserção: gatilhos recusam `UPDATE`, `DELETE` e `TRUNCATE`). O CHECK do histórico público ganhou os tipos `evidencia` e `status`.
- **Evidências**: público lê só as aceitas (ordem crescente, cursor estável). Membro cria `pendente` (teto de 10 por investigação, sob `pg_advisory_xact_lock` por membro e investigação); o responsável cria já `aceita`. Decisão (responsável ou moderação) é final e usa `SELECT … FOR UPDATE` + `UPDATE … WHERE status = 'pendente'`; repetir a mesma decisão é idempotente e a contrária dá 409. Ninguém decide a própria sugestão. Pendentes e recusadas nunca entram em listas, contagens nem histórico públicos; o motivo da recusa só chega à gestão e ao remetente. Imagens, avaliações e comentários em evidências **não existem**.
- **`GET /me/sugestoes`**: só as sugestões do membro da sessão, em qualquer estado; não existe parâmetro de usuário.
- **Moderação**: `PATCH /mod/investigacoes/{slug}/status` (moderador/admin; qualquer transição entre os 5 status, motivo de 5 a 300 caracteres; não na própria investigação; responsável sem papel não tem esse poder), `PATCH /admin/usuarios/{usuario}/papel` (só admin; `membro` ↔ `moderador`; nunca concede `admin`, nunca o próprio papel nem o de outro admin) e `GET /mod/auditoria` (só admin). Papel sempre lido do banco.
- **Auditoria transacional**: um registro por mudança efetiva de status, por decisão de evidência da moderação, por troca de papel e pelo bootstrap, gravado na mesma transação (falha na auditoria desfaz a operação). Sem registro em no-op. `antes`/`depois` só têm estado (status, papel, ids), nunca e-mail, hash ou token.
- **Limites provisórios (D-P)**: 10 sugestões por minuto por membro, 10 pendentes por membro e investigação, 30 ações de decisão/moderação por minuto por pessoa.
- **`atualizado_em` da investigação** não muda com aceitação de evidência nem com mudança de status feita pela moderação (a ordem da lista fica estável).

### Primeiro administrador (`npm run admin:criar`)

```
npm run admin:criar -- --usuario <nome> --email <e-mail> [--nome <nome>] [--confirmar]
npm run admin:criar -- --promover --usuario <nome> [--confirmar]
```

- Usa **só** `DATABASE_URL`. Não há rota HTTP; não roda em `postinstall`, build, migração nem pelo servidor.
- **A senha nunca vai na linha de comando** (`--senha` é recusado). Com terminal, é pedida duas vezes **sem eco**; sem terminal (automação), vem de `ADMIN_SENHA`. Nunca é impressa nem registrada. Regra: 8 a 128 caracteres; hash `scrypt` igual ao do cadastro.
- `NODE_ENV=production` exige `--confirmar`. `--promover` promove uma conta existente: no terminal exige digitar o nome do usuário; sem terminal exige `--confirmar`; as sessões dessa conta são **revogadas**.
- Dentro de uma transação com `pg_advisory_xact_lock` exclusivo, **recusa se já existir qualquer administrador** (nada é alterado) e grava a auditoria `admin.bootstrap` (ator nulo, rótulo `cli:admin:criar`, sem senha nem e-mail). Execuções simultâneas resultam em exatamente um administrador.
- Códigos de saída: `0` criado; `1` erro inesperado; `2` entrada inválida (inclui senha ausente); `3` **já existe administrador** (nada foi alterado); `4` conflito (usuário ou e-mail já existem, ou conta a promover não existe); `5` cancelado (sem `--confirmar` em produção, confirmação digitada errada).
- `tsx` (4.23.15) foi declarado em `devDependencies` apenas para executar este script; já estava instalado como dependência transitiva e o lockfile ganhou só essa linha.

## Perfis e criadores (Tarefa 8)

- Código: `src/server/servicos/usuarios.ts` (indicadores, perfil, criadores, edição), `src/server/contracts/usuarios.ts`, `src/server/usuarios/rotas.ts` e 5 `route.ts` (`criadores`, `usuarios/[usuario]`, `…/publicacoes`, `…/investigacoes`, `me/perfil`). As listas do usuário reutilizam `listarPublicacoes` e `listarInvestigacoes` (esta ganhou o filtro interno `autorId`). **Sem migração**.
- Rotas e regras: `docs/API.md` §4. Decisões: `DECISOES.md` (Tarefa 8). Testes: `src/server/usuarios/usuarios.test.ts` (19, PostgreSQL real).
- Não existe seed: sem dados, as rotas respondem listas vazias e perfis com zeros.
