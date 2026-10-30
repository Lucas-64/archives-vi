// Adaptadores na borda: tipos da API (src/server/contracts) -> tipos que os componentes já usam.
// Funções puras, sem acesso a dados. Quando o contrato não traz um campo, o campo fica ausente ou vazio:
// nada é inventado para preencher a interface.
import type { EvidenciaPublica, Sugestao } from "../server/contracts/evidencias";
import type { InvestigacaoDetalhePublico, InvestigacaoResumo, RegistroHistoricoPublico } from "../server/contracts/investigacoes";
import type { PublicacaoPublica } from "../server/contracts/publicacoes";
import type { PerfilCriador, PerfilPublico } from "../server/contracts/usuarios";
import { demonstracaoDoUsuario } from "../constants/demonstracaoMamoa";
import type { CasoDeCard, CaseCategory, CaseStatus } from "../types/Case";
import type { Criador, CriadorListado } from "../types/Criador";
import type { Evidencia, InvestigacaoDetalhe, OrigemEvidencia, RegistroHistorico, StatusSugestao } from "../types/InvestigacaoDetalhe";
import type { Publicacao } from "../types/Publicacao";
import { lerTagTematica } from "./tags";

import type { TagTematica } from "../constants/tagsTematicas";

// `Criador.id` é o `usuario`: a API não expõe identificador interno e `Publicacao.autorId` aponta para ele.
export function perfilParaCriador(perfil: Pick<PerfilPublico, "usuario" | "nome" | "bio"> & Partial<Pick<PerfilPublico, "avatar" | "banner">>): Criador {
  return {
    id: perfil.usuario,
    usuario: perfil.usuario,
    nome: perfil.nome,
    bio: perfil.bio,
    ...(perfil.avatar ? { avatar: perfil.avatar } : {}),
    ...(perfil.banner ? { banner: perfil.banner } : {}),
  };
}

// Item da lista de criadores: temas reais (no máximo 3, só ids do catálogo) e patente de demonstração quando houver.
export function criadorListado(perfil: Pick<PerfilCriador, "usuario" | "nome" | "bio" | "temas">): CriadorListado {
  const demonstracao = demonstracaoDoUsuario(perfil.usuario);
  return {
    ...perfilParaCriador(perfil),
    temas: tagsDoCatalogo(perfil.temas).slice(0, 3),
    ...(demonstracao ? { patente: demonstracao.patentes.atual, patenteDemonstracao: true } : {}),
  };
}

function tagsDoCatalogo(valores: readonly string[]): TagTematica[] {
  return valores.flatMap((valor) => {
    const tag = lerTagTematica(valor);
    return tag ? [tag] : [];
  });
}

export function publicacaoParaFront(p: PublicacaoPublica): Publicacao {
  return {
    id: p.id,
    slug: p.slug,
    titulo: p.titulo,
    resumo: p.resumo,
    corpo: p.corpo ?? undefined,
    imagemUrl: p.imagem ?? undefined,
    tipo: p.tipo,
    autorId: p.autor.usuario,
    data: p.data,
    comentarios: p.comentarios,
    tags: tagsDoCatalogo(p.tags),
    termos: p.termos,
  };
}

// `Case.id` é o slug (é o que as rotas usam). Sem imagem, sem inventar uma.
export function investigacaoParaCaso(i: InvestigacaoResumo): CasoDeCard {
  return {
    id: i.slug,
    title: i.titulo,
    description: i.descricao,
    status: i.status as CaseStatus,
    category: i.categoria as CaseCategory,
    location: i.localizacao,
    evidenceCount: i.contagemEvidencias,
    updatedAt: i.atualizadoEm.slice(0, 10),
    tags: tagsDoCatalogo(i.tags),
    video: i.video,
    capa: i.imagem ?? undefined,
  };
}

// Detalhe da API -> só o que a interface mostra com dado real. Participantes, atividade recente, discussão,
// síntese e imagens não existem na API e ficam de fora: nada é inventado para preenchê-los.
export type DetalheReal = Pick<
  InvestigacaoDetalhe,
  "id" | "estado" | "encerradaPeloAutor" | "autor" | "criadoEm" | "atualizadoEm" | "teoria"
> & { contagens: { evidencias: number; revisoes: number } };

const dia = (instante: string) => instante.slice(0, 10);

export function investigacaoDetalheParaFront(d: InvestigacaoDetalhePublico): DetalheReal {
  return {
    id: d.slug,
    estado: d.estado as InvestigacaoDetalhe["estado"],
    encerradaPeloAutor: d.encerradaPeloAutor,
    autor: d.autor,
    criadoEm: dia(d.criadoEm),
    atualizadoEm: dia(d.atualizadoEm),
    teoria: d.teoria,
    contagens: { evidencias: d.contagens.evidencias, revisoes: d.contagens.revisoes },
  };
}

// Evidência aceita. Sem imagens, discussão nem avaliações: a API não os tem.
export function evidenciaParaFront(e: EvidenciaPublica): Evidencia {
  return {
    id: e.id,
    origem: e.origem as OrigemEvidencia,
    titulo: e.titulo,
    descricao: e.descricao,
    autor: e.autor,
    data: dia(e.data),
    fonte: e.fonte,
    temDiscussao: false,
    ...(e.imagens[0] ? { imagemUrl: e.imagens[0].url } : {}),
    ...(e.relacionadaA ? { relacionadaA: e.relacionadaA } : {}),
    ...(e.origemComunidade ? { origemComunidade: e.origemComunidade } : {}),
  };
}

// A API entrega o histórico do mais recente ao mais antigo; a linha do tempo da interface vai do mais antigo ao mais novo.
export function historicoParaFront(itens: readonly RegistroHistoricoPublico[]): RegistroHistorico[] {
  return itens.map((r) => ({ id: r.id, data: dia(r.data), autor: r.autor, titulo: r.titulo, resumo: r.resumo })).reverse();
}

export interface SugestaoDaPessoa {
  id: string;
  status: StatusSugestao;
  origem: OrigemEvidencia;
  titulo: string;
  descricao: string;
  data: string;
  motivo?: string;
  decididaPor?: string;
}

// Sugestão vista pelo remetente, pelo responsável ou pela moderação. O motivo da recusa só chega a quem a API entrega.
export function sugestaoParaFront(s: Sugestao): SugestaoDaPessoa & { enviadaPor: { nome: string; usuario: string } } {
  return {
    id: s.id,
    status: s.status as StatusSugestao,
    origem: s.origem as OrigemEvidencia,
    titulo: s.titulo,
    descricao: s.descricao,
    data: dia(s.data),
    enviadaPor: s.autor,
    ...(s.motivo ? { motivo: s.motivo } : {}),
    ...(s.decididaPor ? { decididaPor: s.decididaPor.usuario } : {}),
  };
}
