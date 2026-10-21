# Decisões de produto que afetam o backend

Registro curto. As decisões arquiteturais estão em `docs/DECISIONS.md` (ADR-022 e ADR-023).

## 2026-10-20 (Lucas)

- **P1-01: ocultar temporariamente as 7 investigações sem conteúdo** (opção B), preservando os dados e sem inventar conteúdo editorial. A implementação é do front, depois, e **não está autorizada nesta fase**. Backend: toda investigação da API traz `possuiDetalhe` (verdadeiro só quando existe detalhe); o seed migra apenas o detalhe existente (`simbolos-vice-city`).
- **P1-02: desabilitar aceitar/recusar sugestões para visitantes** com `AcaoRestrita` e link para `/entrar` (opção B). Implementação no front, depois. Backend: autenticação e autorização são verificadas **no servidor**; só o responsável (ou moderação) aceita ou recusa, e o payload traz `permissoes.podeGerenciar`.
- ADR-022 e ADR-023 incorporados a `docs/DECISIONS.md`.

## 2026-10-20 (Tarefa 3, decisões técnicas do Back)

- **Limite de tentativas entrou na Tarefa 3** (estava planejado para depois): login com `scrypt` custa CPU, então sem limite seria vetor de força bruta e de negação de serviço. Contador no PostgreSQL, sem serviço externo. Migração `0001_limites_taxa`.
- **Cookie**: `__Host-` e `Secure` só em produção; em desenvolvimento http local o nome é `sessao`. O contrato antigo exigia `__Host-sessao` sempre, o que não funciona em http.
- **Cookie vive até o limite absoluto (90 dias)** e o servidor impõe os 30 dias de inatividade, para não precisar reemitir o cookie a cada renovação.
- **Sair é idempotente** (204 mesmo sem sessão).
- **`GET /auth/eu`** devolve `usuario: null` (200) para visitante, como no contrato.

## 2026-10-20 (Tarefa 4, decisões técnicas do Back)

- **Ordem da listagem**: `data` desc, `criado_em` desc, `id` desc, com cursor carregando os três campos e comparação de tupla (keyset). Mudar a ordem muda o cursor: cursores antigos deixam de valer.
- **`data` é o dia civil em `America/Sao_Paulo`** (e não UTC), porque é o que o front mostra; `criado_em` fica em UTC. Teste cobre a virada do dia (23:59 e 00:00 locais).
- **`resumo` derivado do corpo** no servidor (até 200 caracteres), pois o formulário `/criar` só pede título e texto.
- **Slug do título**, com sufixo aleatório de 8 hex em colisão (e nova tentativa se a colisão ocorrer entre a escolha e a gravação).
- **Visitante recebe 401 antes de o corpo ser lido** em `POST /publicacoes`.
- **Cache**: respostas de leitura com `Cache-Control: no-store` até a decisão de hospedagem (D8).
- **Catálogo de tags no banco** (tabela `tags`) para integridade referencial; a fonte continua sendo o front, com teste de igualdade.

## 2026-10-20 (Tarefa 5, decisões técnicas do Back, todas reversíveis)

- **Rotas seguem o contrato existente**: `GET`/`POST /comentarios` com `alvo` e `PUT`/`DELETE /publicacoes/{slug}/curtida`. Só o alvo `publicacao:{slug}` é aceito; outros alvos dão 422 até existirem.
- **`respostaA` é recusado (422)**, já que respostas encadeadas estão fora de escopo; o campo pode ser aceito quando a tarefa de respostas existir.
- **Comentários do mais antigo ao mais novo**, porque é uma conversa lida em ordem; paginação por cursor `(criado_em, id)`.
- **`comentarios` = número de comentários gravados na publicação.** Sem exclusão ainda, não há exceções.
- **`euCurti` é sempre booleano**: `false` para visitante ou sessão inválida (o contrato antigo o dava como opcional).
- **Curtir e descurtir devolvem `200` com `{ curtidas, euCurti }`** em vez de `204`, para o cliente atualizar a tela sem nova leitura; ambos idempotentes.
- **Limites de uso**: 20 comentários/min e 60 curtidas ou descurtidas/min por membro, no mesmo contador do PostgreSQL já usado nos outros limites.
- **Leituras públicas leem a sessão opcionalmente** (só para `euCurti`); continuam `no-store`.

## 2026-10-20 (Lucas, aprovação da Tarefa 5)

- Os limites de **20 comentários e 60 curtidas por minuto** por membro ficam aceitos como **valores iniciais do MVP**. São **provisórios** e devem ser revisados antes da produção.

## 2026-10-20 (Tarefa 6, aprovação do Lucas e decisões técnicas)

- **D-A: qualquer membro autenticado cria investigações, no máximo 3 abertas.** **Substitui** a decisão anterior do plano (0A.5 item 2 / D22: "ninguém por API no MVP-A"). Registrado no ADR-024. Sem exigir e-mail verificado (não existe). A regra está no predicado `podeCriarInvestigacao` em `src/server/servicos/investigacoes.ts`.
- **D-B: `status` nasce `investigating` e nenhuma rota da Tarefa 6 o altera.** Moderação na Tarefa 7.
- **D-C: `status` e `estado` continuam dois eixos separados**, com os valores reais do front (sem enum novo). `estado` livre entre os 4 valores, com histórico. **`encerrar` altera somente `encerradaPeloAutor` (falso para verdadeiro) e `atualizadoEm`**, grava um registro de histórico e é idempotente: repetir devolve 200 sem novo registro, sem mudar `atualizadoEm` e sem reabrir (não há rota de reabrir). Repetir `estado` com o valor atual também é no-op.
- **D-D: campos sem tabela de origem são omitidos** (contagens de evidências/participantes/comentários, síntese, `podeSugerirEvidencia`, `podeComentar`). `contagens.revisoes` existe porque vem do histórico (registros do tipo `teoria`).
- **D-E: `imagem` é sempre `null`; não há seed dos oito mocks.** Numa base nova a lista começa vazia.
- **D-F: limites provisórios**: tamanhos de texto (iguais aos CHECKs da migração 0004), 3 abertas por membro e 20 mutações por minuto por membro. Revisar antes da produção.
- **Limite de 3 abertas é atômico**: transação com `pg_advisory_xact_lock` por autor; a contagem e o `INSERT` acontecem sob o bloqueio, então requisições simultâneas se enfileiram e nenhuma ultrapassa o limite. Testado: 10 criações simultâneas dão 3 × 201 e 7 × 409.
- **Slug único em um só espaço de nomes**: `servicos/slugs.ts` (`escolherSlugLivre`) substitui o laço antigo de `criarPublicacao` e é usado também pelas investigações. Mesma geração (título sem acentos, hifens, até 60 caracteres, sufixo aleatório de 8 hex em colisão); a escolha e a gravação ocorrem na mesma transação, sob `pg_advisory_xact_lock` por slug, e confere as duas tabelas. As restrições UNIQUE de cada tabela continuam como segunda barreira. O banco **não** impede por si só o mesmo slug em tabelas diferentes; a garantia é da aplicação.
- **Mutações trancam a linha** (`SELECT … FOR UPDATE`) para editar, mudar estado e encerrar: edições simultâneas se enfileiram e o histórico nunca duplica.
- **Histórico guarda nomes de campos, nunca o texto** da teoria. Títulos e resumos de histórico são textos fixos em português.
- **A ordem da lista por `atualizado_em` é mutável**: uma investigação editada durante a leitura pode subir ao topo e não aparecer numa página já passada (não duplica).
- **Moderador/admin não ganham poder de edição** nesta tarefa; `podeGerenciar` é só do responsável.

## 2026-10-20 (Tarefa 7, aprovação do Lucas: D-G a D-P)

- **D-G: evidências sem imagens, uploads, avaliações ou comentários.** `imagens` é sempre `[]`; `imagemArquivoIds` e qualquer campo desconhecido dão 422.
- **D-H: quem decide.** Responsável e moderação (moderador/admin) aceitam e recusam sugestões; ninguém decide a própria. Evidência criada pelo responsável nasce `aceita` (decidida por ele). Membro comum cria `pendente`. A autoria original nunca muda; `origemComunidade {enviadaPor, aceitaPor}` só aparece quando quem aceitou não é quem enviou.
- **D-I: moderação mínima.** Mudar `status` da investigação; trocar papel `membro` ↔ `moderador` (só admin); ler a auditoria (só admin). Sem denúncias, ocultação, exclusão ou notificações.
- **D-J/D-M: status.** Moderador/admin faz qualquer transição entre os 5 valores reais, com motivo de 5 a 300 caracteres; nenhuma transição é irreversível; todo status efetivamente alterado é auditado. O responsável não ganha poder de status. Quem modera não muda o status da própria investigação (inclui admin). Repetir o status atual é sucesso sem novo registro. Não altera `atualizado_em`, `estado`, teoria nem encerramento.
- **D-K: campos aditivos.** `contagemEvidencias` (resumo), `contagens.evidencias`, `permissoes.podeSugerirEvidencia`, `permissoes.podeModerar` (do papel no banco). Só evidências aceitas contam. Os testes de chaves exatas da Tarefa 6 foram atualizados por isso; `podeComentar`, `participantes` e `comentarios` seguem omitidos.
- **D-L: decisão final.** `pendente → aceita|recusada`; repetir a mesma é idempotente; a contrária é 409. Linha travada com `FOR UPDATE` e `UPDATE … WHERE status = 'pendente'`.
- **D-N: `GET /me/sugestoes`** (rota nova, pequena e aditiva) para o remetente ver o estado das próprias sugestões, sem enfraquecer `GET …/sugestoes`.
- **D-O: `tsx` 4.23.15** em `devDependencies` e script `admin:criar`.
- **D-P: limites provisórios**: 10 sugestões por minuto por membro, 10 pendentes por membro e investigação, 30 ações de decisão/moderação por minuto por pessoa. A revisar antes da produção.
- **Decisões técnicas do Back (reversíveis)**: aceitar uma evidência registra no histórico público só o título (já público); recusar e mudar status não expõem o motivo (fica na auditoria e, na recusa, na fila e em `/me/sugestoes`); `atualizado_em` da investigação não muda com aceitação de evidência nem com status da moderação; a decisão do próprio responsável não gera auditoria de moderação (fica nos campos da evidência e no histórico público); papel do ator relido dentro da transação ao decidir, mudar status ou papel; os 30/min de `moderacao:agir` valem também para o responsável ao decidir sugestões.

## 2026-10-20 (Tarefa 8, aprovação do Lucas)

- **Escopo**: `GET /criadores`, `GET /usuarios/{usuario}`, listas de publicações e investigações do usuário e `PATCH /me/perfil`. Fora: patentes, seguir, busca global, destaques, seed e upload.
- **Indicadores reais**: publicações publicadas, investigações de que é responsável, evidências aceitas e comentários em publicações publicadas, calculados por consultas agrupadas. Nada é inventado; sem tabela de participantes, "participou" não é contado.
- **Busca por nome sem `unaccent`**: `normalizarBusca` na aplicação (NFD, sem marcas, minúsculas, mapa manual de ø ł đ ı) e `translate(lower(nome), DE, PARA)` nativo no banco, com tabelas geradas pela mesma função (teste confere que concordam). Sem extensão e sem migração. Letras fora da tabela (por exemplo escritas não latinas) casam só por igualdade de caracteres.
- **Quem é criador**: ao menos uma publicação publicada ou uma investigação. Ordem alfabética por `usuario` (único), não por atividade, para cursor estável. Revisar a regra se o produto quiser ranking.
- **Sem dados fictícios em produção**: lista vazia e conta sem atividade são respostas válidas (200, zeros); as páginas precisam tratar estado vazio. Seed só de desenvolvimento pode ser proposta à parte.
- **`PATCH /me/perfil`**: só `nome` e `bio`, estrito; só a própria conta; no-op não grava; linha travada com `FOR UPDATE`; limite provisório de 10/min. Não gera auditoria (não é ação de moderação).
- **Registros pedidos da Tarefa 7**:
  - *`WHERE status = 'pendente'` redundante* em `aceitar`/`recusar`: a linha já está travada com `FOR UPDATE` e o estado é checado antes, então a cláusula nunca muda o resultado hoje. Fica como defesa em profundidade, caso o `FOR UPDATE` seja alterado no futuro. Mutação que remove só ela não é detectada por teste, por construção; remover as duas juntas é detectado.
  - *Proteção do próprio papel*: a checagem "não altera o próprio papel" roda **antes** da de "papel de administrador" e tem mensagem própria. Correção de erro meu na proposta, que a chamou de inalcançável: ela é alcançável. A cobertura agora afirma a mensagem de cada caso (`moderacao.test.ts`), e a mutação que remove só a primeira passa a ser detectada.
  - *`atualizado_em` da investigação* não muda com mudança de status pela moderação nem com aceitação de evidência (decisão técnica da Tarefa 7). **Para avaliação separada**, sem alteração: o efeito é que a lista ordenada por atualização não "sobe" uma investigação por esses eventos.
  - *`tsx`* fica só em `devDependencies` e `npm run admin:criar` depende dele: decisão de implantação (instalar devDependencies no passo de bootstrap, ou compilar o script) **pendente**.
