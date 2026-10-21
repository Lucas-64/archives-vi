# ADRs propostos pela thread Back

Redigidos em inglês/português no formato de `docs/DECISIONS.md`, **incorporados em 2026-10-20 com autorização do Lucas** (este arquivo fica como histórico; vale o texto de `docs/DECISIONS.md`). Nenhum ADR existente foi alterado. Cópia no repositório: `docs/backend/ADRS_PROPOSTOS.md`. Para incorporar, basta anexar as seções abaixo ao final de `docs/DECISIONS.md`.

## ADR-022: Início antecipado do backend, sem integração com o front

Decisão (solicitada pelo Lucas em 2026-10-19 e confirmada em 2026-10-20): o backend começa a ser construído antes de o front estar "concluído e validado", sob estas condições:

- O escopo é exclusivamente backend: `src/server/**`, `src/app/api/**`, `drizzle/**`, `docs/backend/**` e arquivos de apoio (`drizzle.config.ts`, `vitest.config.ts`, `.env.example`, `docker-compose.yml`).
- O frontend, `src/lib/data.ts`, os mocks e os tipos compartilhados permanecem intactos. Não há integração nem troca de mocks por chamadas de API.
- Nenhum serviço pago, conta externa, período de teste ou deploy. Desenvolvimento e testes são locais (PostgreSQL local).
- A integração com o front só começa por autorização expressa do Lucas e é gradual, por funcionalidade.

Relação com outros ADRs: **não altera o ADR-015**. A restrição do ADR-015 ("backend, banco e autenticação reais ficam fora do escopo até que o frontend esteja concluído e validado") é **excepcionada** por esta decisão apenas quanto ao início do desenvolvimento do backend; o ADR-015 continua valendo para a interface de gerenciamento dentro da investigação (visível só ao responsável autenticado) e para a integração. O ADR-010 continua valendo para o front enquanto não houver integração.

Por que: validar contratos de dados e regras de autorização antes da integração reduz retrabalho; manter o front intacto preserva o MVP em revisão.

Status: Proposto (aguardando aprovação para entrar em `docs/DECISIONS.md`).

## ADR-023: Stack do backend

Decisão (Lucas, 2026-10-20): Next.js Route Handlers com TypeScript; PostgreSQL 16 (local no desenvolvimento); Drizzle ORM com migrações SQL versionadas em `drizzle/`; Zod para validação (variáveis de ambiente, entradas e contratos); sessões persistidas no banco com cookie opaco `HttpOnly`; mesma origem entre front e API.

Por que: uma única base e um único deploy futuro, sem CORS, camada `src/server/` desacoplada de React e portável para um serviço separado se for preciso. Relacional se ajusta ao domínio (autoria, estados, contagens).

Consequências: Node 22.12+ para as ferramentas de teste (Vitest 5), enquanto o Next aceita 20.9+. Hospedagem, banco gerenciado, e-mail e armazenamento de arquivos de produção **não estão decididos nem contratados**; o código fala com interfaces (`DATABASE_URL`, futuramente `Armazenamento` e `EnviadorEmail`) para que a escolha seja reversível. `generateStaticParams` com `dynamicParams = false` (ADR-014) não acomoda conteúdo criado depois do build: será revisitado só na integração, em ADR próprio.

Status: Proposto (a decisão de stack já foi tomada pelo Lucas; falta o registro).
