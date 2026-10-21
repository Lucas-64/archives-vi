import { criarManipuladoresInvestigacoes } from "@/server/investigacoes/rotas";

export const dynamic = "force-dynamic";

const manipuladores = criarManipuladoresInvestigacoes();

export const GET = manipuladores.historico;
