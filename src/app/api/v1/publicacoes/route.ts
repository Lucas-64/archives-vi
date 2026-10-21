import { criarManipuladoresPublicacoes } from "@/server/publicacoes/rotas";

export const dynamic = "force-dynamic";

const manipuladores = criarManipuladoresPublicacoes();
export const GET = manipuladores.listar;
export const POST = manipuladores.criar;
