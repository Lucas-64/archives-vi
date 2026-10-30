import { criarManipuladoresUploads } from "@/server/uploads/rotas";

export const dynamic = "force-dynamic";

const manipuladores = criarManipuladoresUploads();

export const GET = manipuladores.disponibilidade;
export const POST = manipuladores.enviar;
