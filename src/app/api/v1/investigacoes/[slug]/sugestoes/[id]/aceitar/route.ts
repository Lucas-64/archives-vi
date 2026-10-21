import { criarManipuladoresEvidencias } from "@/server/evidencias/rotas";

export const dynamic = "force-dynamic";

const manipuladores = criarManipuladoresEvidencias();

export const POST = manipuladores.aceitar;
