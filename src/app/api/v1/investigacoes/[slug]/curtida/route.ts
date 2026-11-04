import { criarManipuladoresInteracoes } from "@/server/publicacoes/rotasInteracoes";

export const dynamic = "force-dynamic";

const manipuladores = criarManipuladoresInteracoes();

export const PUT = manipuladores.curtirInvestigacao;
export const DELETE = manipuladores.descurtirInvestigacao;
