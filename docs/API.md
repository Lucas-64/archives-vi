# Archives VI: contratos da API (v1.5)

Status: **v1.2, stack confirmada pelo Lucas em 2026-10-20 (Next.js Route Handlers, PostgreSQL, Drizzle, Zod, sessões no banco). Contrato ainda é proposta**; vira definitivo rota a rota conforme cada tarefa for aceita. Versão anterior: v1.1 (corrigida em 2026-10-19: valores reais de `status`/`categoria`, `nome` opcional no cadastro, limites da teoria alinhados ao `/criar`).

**Etapas:** rotas marcadas **[A]** fazem parte do MVP-A (implementar primeiro); **[B]** são MVP-B (reservadas, não implementar agora). **Desenvolvimento e testes 100% locais e gratuitos**; nenhum serviço externo é necessário para nenhuma rota [A].

**Implementado e testado até agora (Tarefas 2 a 8):** convenções da seção 1 (erros, paginação, validação), as rotas de autenticação da seção 3 (`cadastro`, `entrar`, `sair`, `eu`) as quatro rotas de publicações da seção 7 (`GET /publicacoes`, `GET /publicacoes/{slug}`, `GET /publicacoes/{slug}/relacionadas`, `POST /publicacoes`) e, da Tarefa 5, `GET`/`POST /comentarios` (só alvo `publicacao:{slug}`) e `PUT`/`DELETE /publicacoes/{slug}/curtida`, e, da Tarefa 6, as rotas de investigações da seção 5 marcadas como implementadas, marcadas com **(implementado)**, e, da Tarefa 7, as rotas de evidências, sugestões, `GET /me/sugestoes`, moderação de `status`, troca de papéis e leitura da auditoria (seções 6 e 12), e, da Tarefa 8, `GET /criadores`, `GET /usuarios/{usuario}`, suas listas de publicações e investigações e `PATCH /me/perfil` (seção 4). Todo o resto continua proposta. Os esquemas Zod em `src/server/contracts/` e os testes são a fonte de verdade do que está implementado.

Base: `/api/v1`, mesma origem do site (ver decisão D5 do plano). Formato: JSON, UTF-8, idioma dos campos e mensagens: português do Brasil. Os nomes dos campos seguem os tipos que o front já usa (`src/types/`) para reduzir adaptação.

## 1. Convenções

**Datas**: `AAAA-MM-DD` para datas de conteúdo (como nos mocks) e ISO 8601 UTC (`2026-10-19T20:11:49Z`) para `criadoEm`/`atualizadoEm`.

**Identificadores**: `id` opaco (UUID v4 em texto, gerado pelo PostgreSQL). Recursos públicos também têm `slug` estável (investigações e publicações). Usuários são endereçados por `usuario` (ex.: `analista_vb`), nunca por e-mail.

**Imagens**: o front hoje usa `StaticImageData`. Na API toda imagem é `{ url, alt, largura, altura }`. No MVP-A `url` é um caminho relativo a arquivos estáticos já existentes (sem upload). O adaptador no front é trabalho futuro (F-03), **não** desta etapa.

**Paginação** (listas): `?limite=20&cursor=<opaco>` (máx. 50). Resposta: `{ "itens": [...], "proximoCursor": "..." | null }`.

**Sucesso**: o corpo é o recurso (ou `{ itens, proximoCursor }`). `201` + `Location` ao criar. `204` sem corpo em exclusões e logout.

**Erro** (sempre este formato, nunca stack trace):

```json
{
  "erro": {
    "codigo": "validacao",
    "mensagem": "Revise os campos destacados.",
    "campos": { "titulo": "O título precisa ter pelo menos 3 caracteres." },
    "idRequisicao": "req_..."
  }
}
```

| HTTP | `codigo` | Quando |
|---|---|---|
| 400 | `requisicao_invalida` | JSON malformado, parâmetro inválido |
| 401 | `nao_autenticado` | sem sessão válida |
| 403 | `sem_permissao` | autenticado, mas sem direito (ex.: não é o responsável pela investigação) |
| 404 | `nao_encontrado` | recurso inexistente **ou oculto** (não revela existência) |
| 409 | `conflito` | usuário/e-mail já existe, avaliação duplicada |
| 413 | `corpo_grande` | corpo JSON acima do limite (100 KB) |
| 413 | `arquivo_grande` | upload acima do limite **[B]** |
| 415 | `tipo_nao_suportado` | MIME não permitido |
| 422 | `validacao` | corpo válido em JSON, mas campos inválidos (`campos` preenchido) |
| 429 | `limite_excedido` | rate limit (`Retry-After` em segundos) |
| 500 | `erro_interno` | falha não prevista (detalhes só no log, com `idRequisicao`) |

**Autenticação** (implementado): cookie opaco `HttpOnly`, `SameSite=Lax`, `Path=/`, com `Max-Age` e `Expires` explícitos (igual ao limite absoluto da sessão, 90 dias). Em **produção** o nome é `__Host-sessao` e o cookie é `Secure`; em **desenvolvimento** (http local) o nome é `sessao` e não é `Secure`. O front **não** guarda token. A sessão expira após 30 dias sem uso (janela deslizante, renovada no máximo a cada 5 minutos) e, no mais tardar, 90 dias após o login. Mutações (`POST/PATCH/PUT/DELETE`) exigem o cabeçalho `X-Requested-With: archives-vi` e `Origin` igual à origem da requisição; sem isso, `403 sem_permissao`. Respostas de autenticação levam `Cache-Control: no-store`.

**Legenda de acesso**: `P` público · `M` membro autenticado · `R` responsável (autor da investigação) · `A` autor do recurso · `MOD` moderador/admin.

Os validadores de teoria já existentes no front (`LIMITES_TEORIA`: título 3 a 120, texto 20 a 2000; perfil: nome até 60, bio até 240; senha mínima 8) são copiados para o servidor como **fonte autoritativa**; o front continua validando só para UX.

## 2. Tipos compartilhados

```ts
type Pessoa = { nome: string; usuario: string };
type Imagem = { url: string; alt: string; largura: number; altura: number };
type TagTematica = "ovnis-extraterrestres" | "criaturas-lendas" | "easter-eggs-segredos"
  | "simbolos-mensagens" | "audio-transmissoes" | "locais-mapas" | "crimes-acontecimentos"
  | "teorias-conexoes";            // catálogo fechado, ADR-018
```

## 3. Autenticação e conta

| Método e rota | Acesso | Corpo / parâmetros | Resposta |
|---|---|---|---|
| `POST /auth/cadastro` **(implementado)** | P | `{ usuario, email, senha, nome? }`. `usuario` é aparado e vira minúsculas (3 a 30, `[a-z0-9_]`); `email` aparado, minúsculas, até 254; `senha` 8 a 128 (não é aparada); `nome` opcional (até 60; vazio ou ausente = `usuario`). Campos extras (por exemplo `papel`) são rejeitados com 422 | `201 { usuario: UsuarioPrivado }`, `Location: /api/v1/auth/eu` e cookie. `papel` é sempre `membro` |
| `POST /auth/entrar` **(implementado)** | P | `{ email, senha }` | `200 { usuario: UsuarioPrivado }` e cookie. Falha: `401 nao_autenticado` com a mesma mensagem e o mesmo corpo para e-mail inexistente e senha errada |
| `POST /auth/sair` **(implementado)** | P | — | `204`, cookie apagado e sessão revogada no servidor. **Idempotente**: sem sessão também responde 204 (desvio deliberado da legenda `M`: sair não deve falhar) |
| `GET /auth/eu` **(implementado)** | P | — | `200 { usuario: UsuarioPrivado \| null }` (visitante, token inválido, revogado ou expirado recebem `null`, não 401; cookie inválido é apagado) |
| `POST /auth/senha/recuperar` **[B]** | P | `{ email }` | `202` sempre. **Adiada: depende de e-mail (D9)** |
| `POST /auth/senha/redefinir` **[B]** | P | `{ token, senha }` | `204`. **Adiada (D9)** |

Regras (as de entrada estão na tabela acima): `usuario` 3 a 30 caracteres, `[a-z0-9_]`, único (sem diferenciar maiúsculas; **regra nova no servidor**, o formulário atual só exige não vazio e a confirmação de senha é validada no cliente); `email` único, normalizado; `senha` 8 a 128 caracteres; mensagem de erro de login é única ("E-mail ou senha incorretos."). Limite de tentativas por IP e por e-mail (seção 14). **Conflito no cadastro**: nome de usuário repetido responde `409 conflito` com `campos.usuario` (nomes são públicos nos perfis); e-mail repetido responde `409 conflito` genérico ("Não foi possível criar a conta com esses dados."), sem `campos`. Sem verificação de e-mail, essa resposta ainda distingue "e-mail já existe" de sucesso: risco residual conhecido, reduzido pelo limite de tentativas, que só some com o fluxo de e-mail (MVP-B, D9). Senhas são guardadas só como hash `scrypt` (N=2^15, r=8, p=3, sal aleatório de 16 bytes); o token de sessão é guardado só como SHA-256.

```ts
type UsuarioPrivado = Usuario & { email: string; papel: "membro" | "moderador" | "admin" };
type Usuario = { id: string; usuario: string; nome: string; bio: string; avatar: Imagem | null; criadoEm: string };
```

## 4. Perfis e criadores

### 4.1 Implementado na Tarefa 8

Tipos (de `src/server/contracts/usuarios.ts`). **Nunca** inclui `email`, `papel`, `id`, hash, sessão nem a marca `demonstrativo`:

```ts
type PerfilPublico = {
  usuario: string; nome: string; bio: string; avatar: null; criadoEm: string;
  indicadores: { publicacoes: number; investigacoes: number; evidenciasAceitas: number; comentarios: number };
};
```

`indicadores` são contagens reais, calculadas nas tabelas a cada leitura (nada fixo), e **só contam conteúdo público**: publicações com `status = 'publicado'`; investigações de que a conta é responsável; evidências **aceitas** enviadas por ela; comentários feitos em publicações publicadas. Conta sem atividade tem perfil válido com zeros. `avatar` é sempre `null` (sem upload).

| Rota | Acesso | Notas |
|---|---|---|
| `GET /criadores` **(implementado)** | P | `?q=` (até 60), `?limite=` (padrão 20, máx. 50), `?cursor=`. Lista `PerfilPublico` de quem tem **ao menos uma publicação publicada ou uma investigação**, em ordem alfabética de `usuario`; cursor opaco por `usuario`. `q` casa com o nome (sem diferenciar maiúsculas nem acentos, normalizado na aplicação e com `translate()` nativo no banco, sem a extensão `unaccent`) ou com o `usuario`; `%`, `_` e `\` são texto literal. Vazia é `200 { itens: [], proximoCursor: null }`. `no-store` |
| `GET /usuarios/{usuario}` **(implementado)** | P | `200 PerfilPublico`. Qualquer conta tem perfil público (o `usuario` já é público nas autorias). Nome fora do formato `[a-z0-9_]{3,30}` ou inexistente: `404`. `no-store` |
| `GET /usuarios/{usuario}/publicacoes` **(implementado)** | P | mesma lista e filtros (`tipo`, `tag`) de `GET /publicacoes`, fixada no autor; só `publicado`. 404 se o usuário não existe |
| `GET /usuarios/{usuario}/investigacoes` **(implementado)** | P | mesma lista e filtros (`categoria`, `tag`) de `GET /investigacoes`, fixada nas de que a conta é **responsável**, com a mesma visibilidade da lista pública. Participação e `investigacaoEmDestaque` não existem (sem tabela de participantes; ADR-018 não aplicado). 404 se o usuário não existe |
| `PATCH /me/perfil` **(implementado)** | M | `{ nome?, bio? }`, ao menos um campo, estrito: qualquer outro campo (`usuario`, `email`, `papel`, `senha`, `avatar`, `id`…) dá `422 Campo não permitido.`. `nome` aparado, 1 a 60; `bio` aparada, 0 a 240 (vazia limpa); sem caracteres de controle. Só edita a própria conta (não há parâmetro de usuário). Reenviar os mesmos valores é `200` sem gravar. CSRF antes da sessão e a sessão antes do corpo (limite 2 KB). `200 { usuario: UsuarioPrivado }`. Limite: 10 por minuto por membro (provisório) |

### 4.2 Ainda proposto **[B]**

| Rota | Acesso | Notas |
|---|---|---|
| `avatarArquivoId` em `PATCH /me/perfil` | M | depende de upload (§11) |
| `patente` e `conquistas` em `GET /usuarios/{usuario}` | P | ver §9 (regra de concessão não definida) |
| `GET /me/evidencias` | M | **Implementado como `GET /me/sugestoes`** (§6, Tarefa 7, D-N) |
| `GET /me/respostas` | M | respostas do membro nas discussões |
| `GET /me/atividade` | M | notificações, solicitações e conexões (§10; **fora do MVP, D18**) |

`GET /saude` (P, sem dados sensíveis: `{ ok: true }`) para verificação de implantação. `GET /atividade/online` fica **fora** até D20 (hoje o número 312 é fixo).

## 14. Limites de taxa

| Grupo | Limite | Estado |
|---|---|---|
| `POST /auth/entrar` | 5 por minuto por IP e 10 por hora por e-mail | **implementado** (janela fixa, contador no PostgreSQL com chave em hash) |
| `POST /auth/cadastro` | 5 por minuto por IP e 10 por hora por e-mail | **implementado** |
| `POST /publicacoes` | 10 por minuto por membro | **implementado** |
| `POST /comentarios` | 20 por minuto por membro | **implementado** (provisório) |
| `PUT`/`DELETE …/curtida` | 60 por minuto por membro | **implementado** (provisório) |
| `POST/PATCH` de investigações | 20 por minuto por membro | **implementado** (provisório) |
| `POST …/evidencias` | 10 por minuto por membro + 10 pendentes por investigação | **implementado** (provisório, D-P) |
| Decidir sugestão, `PATCH …/status`, `PATCH …/papel` | 30 por minuto por pessoa | **implementado** (provisório, D-P) |
| `PATCH /me/perfil` | 10 por minuto por membro | **implementado** (provisório) |
| Upload | 20 por hora por membro | proposto |
| Leituras públicas | 120 por minuto por IP | proposto |

O IP vem de `X-Forwarded-For` (primeiro valor). Sem proxy confiável configurado, o cabeçalho pode ser forjado: o limite por e-mail é a proteção que não depende dele. A configuração de proxy confiável é decisão de hospedagem (adiada). Excedido: `429 limite_excedido` com `Retry-After` em segundos.
