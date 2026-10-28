# Seed de perfis de teste

Script: `src/server/cli/seedPerfisTeste.ts` (`npm run seed:perfis-teste`). Cria 10 contas fictícias com conteúdo de teste, para ver o site com dados em desenvolvimento. Não altera o schema.

## O que cria

- 10 contas com `demonstrativo = true`, e-mail `<usuario>@exemplo.invalid` e hash scrypt da aplicação (`hashSenha`). Usernames: `pedro_rdr`, `caio_exe`, `vini_jpg`, `leo_clips`, `gui_trilhas`, `arthurzin7`, `marcoslima`, `rafael_1899`, `brunofps`, `gta6leaks999`. Onde o apelido original tinha ponto (`caio.exe`, `vini.jpg`, `leo.clips`), o username usa `_` (CHECK `[a-z0-9_]`) e o apelido fica em `nome`.
- 2 investigações (teias de pistas de `pedro_rdr`; "Como diferenciar uma pista de uma coincidência?" de `caio_exe`), 1 evidência de `gui_trilhas` aceita por `pedro_rdr`, 7 publicações, 7 comentários e 6 curtidas.
- Slugs começam com `teste-` e os textos dizem que o conteúdo é fictício. As tabelas de investigações, publicações etc. não têm coluna `demonstrativo`; a marca de teste está no texto e na autoria das contas demonstrativas.

## Como rodar

A senha vem só da variável `SEED_SENHA_PERFIS` (sem valor padrão; sem ela o script aborta). Nunca vai na linha de comando nem é gravada em arquivo versionado.

```bash
SEED_SENHA_PERFIS='<senha>' DATABASE_URL='<url do banco local>' npm run seed:perfis-teste -- --confirmar
```

- Sem `--confirmar` nada é gravado.
- Banco que não seja `localhost`/`127.0.0.1`/`::1` exige também `--host-esperado <host>`, igual ao host de `DATABASE_URL`; host diferente é recusado. A URL nunca é impressa.
- Recusa `NODE_ENV=production`.
- Idempotente: a segunda execução cria 0 registros (usuários por `usuario`, investigações e publicações por `slug`, evidência e comentários por autor+texto, curtidas pela chave primária).
- Rodar em banco remoto (por exemplo o Neon de Preview) exige aprovação do Lucas e coordenação prévia. Contas com senha compartilhada não devem ficar em ambiente público: remova-as depois (`demonstrativo = true`).

## Validação

`src/server/cli/seedPerfisTeste.test.ts` (vitest, usa `TEST_DATABASE_URL`) cobre contagens, idempotência, `demonstrativo`, login nas 10 contas, recusa de senha errada e as guardas da linha de comando.

## Fora do escopo (não existem no schema)

Patentes, tags de especialização, seguir, votos em evidência, denúncias e moderação de spam, fórum, visualizações, histórico de edição, comentário em investigação, classificação Easter egg/Curiosidade e o fluxo de duplicata de `gta6leaks999`.
