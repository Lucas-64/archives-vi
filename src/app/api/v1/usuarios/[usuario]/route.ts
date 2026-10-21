import { criarManipuladoresUsuarios } from "@/server/usuarios/rotas";

export const dynamic = "force-dynamic";

const manipuladores = criarManipuladoresUsuarios();

export const GET = manipuladores.perfil;
