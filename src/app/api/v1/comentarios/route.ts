import { criarManipuladoresInteracoes } from "@/server/publicacoes/rotasInteracoes";

export const dynamic = "force-dynamic";

const manipuladores = criarManipuladoresInteracoes();

export const GET = manipuladores.listarComentarios;
export const POST = manipuladores.criarComentario;
