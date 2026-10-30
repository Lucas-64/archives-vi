// Meu Perfil (ADR-021). Funções puras: recebem os registros já lidos de src/lib/data.ts.
// Não acessam mocks, não gravam nada e não criam relações entre registros.
import type { Criador } from "../types/Criador";
import type { Comentario, InvestigacaoDetalhe } from "../types/InvestigacaoDetalhe";
import type { EvidenciaMeu, RespostaMeu } from "../types/MeuPerfil";

// Membro exibido pela área. Não há login: a área mostra este criador de demonstração.
export const ID_CRIADOR_DEMONSTRATIVO = "analista-vb";

// Abas de Meu Perfil, como na referência visual (cinco abas). A primeira aba é a padrão e não aparece
// na URL (ADR-017 vale aqui também). "Atividade" reúne notificações, solicitações e conexões e respostas.
// Conquistas ficam no cabeçalho e a patente em cartão próprio (ADR-021).
export const ABAS_MEU_PERFIL = [
  { chave: "visao-geral", rotulo: "Visão geral" },
  { chave: "teorias-publicacoes", rotulo: "Teorias e publicações", parametro: "teorias-publicacoes" },
  { chave: "investigacoes", rotulo: "Mistérios", parametro: "investigacoes" },
  { chave: "evidencias", rotulo: "Evidências", parametro: "evidencias" },
  { chave: "atividade", rotulo: "Atividade", parametro: "atividade" },
] as const;

export const LIMITE_NOME_PERFIL = 60;
export const LIMITE_BIO_PERFIL = 240;

export interface DadosEdicaoPerfil {
  nome: string;
  bio: string;
}

export interface ErrosEdicaoPerfil {
  nome?: string;
  bio?: string;
  avatar?: string;
  banner?: string;
}

// Validação da edição de perfil. Nome obrigatório (sem espaços nas pontas) e limites de tamanho.
export function validarEdicaoPerfil(dados: DadosEdicaoPerfil): ErrosEdicaoPerfil {
  const erros: ErrosEdicaoPerfil = {};
  const nome = dados.nome.trim();

  if (nome.length === 0) {
    erros.nome = "Informe um nome.";
  } else if (nome.length > LIMITE_NOME_PERFIL) {
    erros.nome = `O nome pode ter até ${LIMITE_NOME_PERFIL} caracteres.`;
  }

  if (dados.bio.trim().length > LIMITE_BIO_PERFIL) {
    erros.bio = `A bio pode ter até ${LIMITE_BIO_PERFIL} caracteres.`;
  }

  return erros;
}

function ehDoMembro(usuario: string, criador: Criador): boolean {
  return usuario === criador.usuario;
}

// Evidências enviadas pelo membro, com o estado real do domínio:
// - evidência pública (autor = membro): aceita, com âncora na lista da comunidade;
// - sugestão aceita: aceita e visível na lista pública, sem âncora (a comunidade não a identifica por id);
// - sugestão pendente ou recusada: não aparece na lista pública.
// Ordem: mais recente primeiro.
export function evidenciasDoMembro(
  criador: Criador,
  detalhes: readonly InvestigacaoDetalhe[],
): EvidenciaMeu[] {
  const itens: EvidenciaMeu[] = [];

  for (const detalhe of detalhes) {
    for (const evidencia of detalhe.evidencias) {
      if (!ehDoMembro(evidencia.autor.usuario, criador)) continue;
      itens.push({
        chave: `publica-${detalhe.id}-${evidencia.id}`,
        titulo: evidencia.titulo,
        descricao: evidencia.descricao,
        investigacaoId: detalhe.id,
        data: evidencia.data,
        estado: "aceita",
        publica: true,
        ancora: `#evidencia-${evidencia.id}`,
      });
    }

    for (const sugestao of detalhe.sugestoes) {
      if (!ehDoMembro(sugestao.enviadaPor.usuario, criador)) continue;
      const estado = sugestao.status === "pendente" ? "pendente" : sugestao.status === "aceita" ? "aceita" : "rejeitada";
      itens.push({
        chave: `sugestao-${detalhe.id}-${sugestao.id}`,
        titulo: sugestao.titulo,
        descricao: sugestao.descricao,
        investigacaoId: detalhe.id,
        data: sugestao.data,
        estado,
        publica: estado === "aceita",
        ancora: undefined,
      });
    }
  }

  return itens.sort((a, b) => b.data.localeCompare(a.data));
}

// Comentários do membro nas discussões de cada investigação, incluindo respostas aninhadas.
// Só entram comentários reais dos mocks, com autor igual ao membro. Ordem: mais recente primeiro.
export function respostasDoMembro(
  criador: Criador,
  detalhes: readonly InvestigacaoDetalhe[],
): RespostaMeu[] {
  const itens: RespostaMeu[] = [];

  function percorrer(comentarios: readonly Comentario[], investigacaoId: string, local: RespostaMeu["local"]) {
    for (const comentario of comentarios) {
      if (ehDoMembro(comentario.autor.usuario, criador)) {
        itens.push({
          chave: `${investigacaoId}-${comentario.id}`,
          texto: comentario.texto,
          data: comentario.data,
          investigacaoId,
          local,
        });
      }
      percorrer(comentario.respostas, investigacaoId, local);
    }
  }

  for (const detalhe of detalhes) {
    percorrer(detalhe.discussaoGeral, detalhe.id, "Discussão geral");
    percorrer(detalhe.discussaoContextual, detalhe.id, "Discussão da evidência");
  }

  return itens.sort((a, b) => b.data.localeCompare(a.data));
}
