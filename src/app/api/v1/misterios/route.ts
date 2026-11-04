import { criarManipuladoresMisterios } from "@/server/misterios/rotas";

export const dynamic = "force-dynamic";

const manipuladores = criarManipuladoresMisterios();

export const GET = manipuladores.listar;
export const POST = manipuladores.criar;
