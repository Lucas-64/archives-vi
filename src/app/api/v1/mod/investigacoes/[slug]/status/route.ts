import { criarManipuladoresModeracao } from "@/server/moderacao/rotas";

export const dynamic = "force-dynamic";

const manipuladores = criarManipuladoresModeracao();

export const PATCH = manipuladores.mudarStatus;
