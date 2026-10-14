// Camada de dados da interface. Hoje devolve mocks; quando houver backend,
// só este arquivo precisa mudar. Funções assíncronas para manter o contrato
// de Server Components.
import { destaques, investigacoes } from "@/mocks/investigacoes";
import { atualizacoes } from "@/mocks/atualizacoes";
import { topicos } from "@/mocks/topicos";
import { investigadoresOnline } from "@/mocks/atividade";
import type { Case } from "@/types/Case";
import type { Atualizacao } from "@/types/Atualizacao";
import type { Destaque } from "@/types/Destaque";
import type { Topico } from "@/types/Topico";

export async function getDestaques(): Promise<Destaque[]> {
  return destaques;
}

export async function getInvestigacoes(): Promise<Case[]> {
  return investigacoes;
}

export async function getInvestigacoesEmAlta(limite = 3): Promise<Case[]> {
  return investigacoes.slice(0, limite);
}

export async function getTopicosForum(): Promise<Topico[]> {
  return topicos;
}

export async function getAtualizacoes(): Promise<Atualizacao[]> {
  return atualizacoes;
}

export async function getInvestigadoresOnline(): Promise<number> {
  return investigadoresOnline;
}
