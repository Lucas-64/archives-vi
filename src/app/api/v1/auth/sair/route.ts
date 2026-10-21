import { criarManipuladoresAuth } from "@/server/auth/rotas";

// Depende de cookies e do banco: nunca estática.
export const dynamic = "force-dynamic";

export const POST = criarManipuladoresAuth().sair;
