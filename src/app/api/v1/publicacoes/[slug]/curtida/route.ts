import { criarManipuladoresInteracoes } from "@/server/publicacoes/rotasInteracoes";

export const dynamic = "force-dynamic";

const manipuladores = criarManipuladoresInteracoes();

export const PUT = manipuladores.curtir;
export const DELETE = manipuladores.descurtir;
