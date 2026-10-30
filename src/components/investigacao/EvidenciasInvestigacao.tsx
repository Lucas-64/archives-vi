"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import styled from "styled-components";

import { decidirSugestaoNaApi, enviarEvidenciaNaApi, type OrigemEnviavel } from "../../lib/investigacoesApi";
import { ROTULO_ORIGEM } from "../../lib/investigacaoEstado";
import { formatarData } from "../../lib/formatacao";
import type { SugestaoDaPessoa } from "../../lib/adaptadores";
import type { Evidencia, Pessoa } from "../../types/InvestigacaoDetalhe";
import { NotaLista } from "../page/NotaLista";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { UploadImagem } from "../ui/UploadImagem";
import { CartaoEnviarEvidencia } from "../investigacao-classica/CartaoEnviarEvidencia";
import { EvidenciaCard } from "./EvidenciaCard";

export type SugestaoNaFila = SugestaoDaPessoa & { enviadaPor: Pessoa };

export interface EvidenciasInvestigacaoProps {
  slug: string;
  evidencias: Evidencia[];
  total: number;
  haMais: boolean;
  investigador: Pessoa;
  // Calculadas pelo servidor para a sessão atual. A API repete a verificação em cada operação.
  podeSugerir: boolean;
  podeAnalisar: boolean;
  minhasSugestoes: SugestaoDaPessoa[];
  fila: SugestaoNaFila[];
  filaTemMais: boolean;
}

const ROTULO_STATUS = {
  pendente: { rotulo: "Aguardando análise", variant: "warning" },
  aceita: { rotulo: "Aceita", variant: "success" },
  recusada: { rotulo: "Recusada", variant: "danger" },
} as const;

const LIMITE = { titulo: 120, descricao: 1000, fonte: 300, motivo: 300 } as const;

// Evidências reais. A lista pública só tem evidências aceitas. Uma sugestão enviada por outra pessoa fica
// pendente e só aparece aqui depois de aceita; quem enviou acompanha o estado. O responsável pela
// investigação e a moderação analisam a fila. Nada é mostrado como concluído antes de o servidor confirmar.
export function EvidenciasInvestigacao({
  slug,
  evidencias,
  total,
  haMais,
  investigador,
  podeSugerir,
  podeAnalisar,
  minhasSugestoes,
  fila,
  filaTemMais,
}: EvidenciasInvestigacaoProps) {
  return (
    <Wrapper>
      <Resumo>
        {evidencias.length === 0
          ? "Nenhuma evidência aceita ainda."
          : `Exibindo ${evidencias.length} de ${total} evidências aceitas.`}
      </Resumo>

      <Nota>
        “Evidência do criador” indica a procedência do material, publicado pelo criador desta investigação. Não indica
        veracidade nem força científica. Sugestões pendentes ou recusadas nunca aparecem nesta lista.
      </Nota>

      {evidencias.length === 0 ? null : (
        <Lista>
          {evidencias.map((evidencia) => (
            <li key={evidencia.id}>
              <EvidenciaCard evidencia={evidencia} ehDoCriador={evidencia.autor.usuario === investigador.usuario} />
            </li>
          ))}
        </Lista>
      )}
      {haMais ? <NotaLista>Mostrando as primeiras evidências aceitas.</NotaLista> : null}

      <CartaoEnviarEvidencia podeEnviar={podeSugerir}>
        <FormularioEvidencia slug={slug} />
      </CartaoEnviarEvidencia>

      {minhasSugestoes.length > 0 ? <MinhasSugestoes itens={minhasSugestoes} /> : null}

      {podeAnalisar ? <FilaDeAnalise slug={slug} itens={fila} temMais={filaTemMais} /> : null}
    </Wrapper>
  );
}

function FormularioEvidencia({ slug }: { slug: string }) {
  const router = useRouter();
  const id = useId();
  const [origem, setOrigem] = useState<OrigemEnviavel>("referencia_textual");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fonte, setFonte] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function validar(): Record<string, string> {
    const e: Record<string, string> = {};
    if (titulo.trim().length < 3) e.titulo = "O título precisa ter pelo menos 3 caracteres.";
    else if (titulo.trim().length > LIMITE.titulo) e.titulo = `O título pode ter no máximo ${LIMITE.titulo} caracteres.`;
    if (descricao.trim().length < 10) e.descricao = "A descrição precisa ter pelo menos 10 caracteres.";
    else if (descricao.trim().length > LIMITE.descricao) e.descricao = `A descrição pode ter no máximo ${LIMITE.descricao} caracteres.`;
    if (fonte.trim().length > LIMITE.fonte) e.fonte = `A fonte pode ter no máximo ${LIMITE.fonte} caracteres.`;
    return e;
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando) return;
    setSucesso(null);
    setErroGeral(null);
    const locais = validar();
    setErros(locais);
    if (Object.keys(locais).length > 0) return;

    setEnviando(true);
    const resultado = await enviarEvidenciaNaApi(slug, {
      origem,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      ...(fonte.trim() ? { fonte: fonte.trim() } : {}),
      ...(imagem ? { imagem } : {}),
    });
    setEnviando(false);

    if (resultado.ok) {
      setTitulo("");
      setDescricao("");
      setFonte("");
      setImagem(null);
      setSucesso(
        resultado.status === "aceita"
          ? "Evidência publicada na lista desta investigação."
          : "Sugestão enviada. Ela fica pendente e só aparece na lista pública se for aceita.",
      );
      router.refresh();
      return;
    }
    setErros({ origem: resultado.campos.origem ?? "", titulo: resultado.campos.titulo ?? "", descricao: resultado.campos.descricao ?? "", fonte: resultado.campos.fonte ?? "", imagem: resultado.campos.imagem ?? "" });
    setErroGeral(resultado.semSessao ? "Sua sessão expirou. Entre novamente para enviar." : (resultado.erroGeral ?? null));
  }

  return (
    <>
      <Aviso>
        Se você não é a pessoa responsável pela investigação, o envio vira uma sugestão pendente de análise.
      </Aviso>
      <form onSubmit={enviar} noValidate aria-label="Enviar evidência">
        <Campos>
          <Fieldset>
            <legend>Origem</legend>
            {(imagem ? (["imagem_propria", "imagem_terceiro"] as const) : (["referencia_textual", "origem_nao_verificada"] as const)).map((valor) => (
              <label key={valor}>
                <input type="radio" name={`${id}-origem`} checked={origem === valor} onChange={() => setOrigem(valor)} />{" "}
                {ROTULO_ORIGEM[valor]}
              </label>
            ))}
            {erros.origem ? <ErroCampo role="alert">{erros.origem}</ErroCampo> : null}
          </Fieldset>

          <FormField label="Título" required error={erros.titulo || undefined} hint={`${titulo.trim().length} de ${LIMITE.titulo} caracteres.`}>
            <Input name="titulo" autoComplete="off" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </FormField>
          <FormField label="Descrição" required error={erros.descricao || undefined} hint={`${descricao.trim().length} de ${LIMITE.descricao} caracteres.`}>
            <Textarea name="descricao" rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </FormField>
          <FormField label="Fonte (opcional)" error={erros.fonte || undefined}>
            <Input name="fonte" autoComplete="off" value={fonte} onChange={(e) => setFonte(e.target.value)} />
          </FormField>
          <UploadImagem
            rotulo="Imagem"
            opcional
            dica="JPEG, PNG ou WebP, até 5 MB. Ao anexar uma imagem, informe se ela é sua ou de terceiro."
            proporcao="16 / 9"
            valor={imagem}
            erro={erros.imagem || undefined}
            onChange={(url) => {
              setImagem(url);
              setOrigem(url ? "imagem_propria" : "referencia_textual");
            }}
          />

          {erroGeral ? <Erro role="alert">{erroGeral}</Erro> : null}
          {sucesso ? <Sucesso role="status">{sucesso}</Sucesso> : null}

          <div>
            <Button type="submit" variant="primary" size="small" loading={enviando} loadingLabel="Enviando">
              Enviar evidência
            </Button>
          </div>
        </Campos>
      </form>
    </>
  );
}

function MinhasSugestoes({ itens }: { itens: SugestaoDaPessoa[] }) {
  return (
    <Painel aria-label="Suas sugestões">
      <TituloPainel>Suas sugestões nesta investigação</TituloPainel>
      <Aviso>Só você, a pessoa responsável e a moderação veem esta lista. Pendentes e recusadas não aparecem como evidências.</Aviso>
      <Itens>
        {itens.map((item) => {
          const status = ROTULO_STATUS[item.status];
          return (
            <li key={item.id}>
              <Item>
                <Topo>
                  <Badge size="small" variant={status.variant}>{status.rotulo}</Badge>
                  <Badge size="small" variant="default">{ROTULO_ORIGEM[item.origem]}</Badge>
                </Topo>
                <NomeItem>{item.titulo}</NomeItem>
                <Meta>Enviada em {formatarData(item.data)}{item.decididaPor ? ` · decidida por @${item.decididaPor}` : ""}</Meta>
                {item.motivo ? <Meta>Motivo da recusa: {item.motivo}</Meta> : null}
              </Item>
            </li>
          );
        })}
      </Itens>
    </Painel>
  );
}

function FilaDeAnalise({ slug, itens, temMais }: { slug: string; itens: SugestaoNaFila[]; temMais: boolean }) {
  const router = useRouter();
  const [decididas, setDecididas] = useState<Record<string, "aceita" | "recusada">>({});
  const [ocupada, setOcupada] = useState<string | null>(null);
  const [recusando, setRecusando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<{ id: string; texto: string } | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function decidir(item: SugestaoNaFila, decisao: "aceitar" | "recusar") {
    if (ocupada) return;
    setOcupada(item.id);
    setErro(null);
    setMensagem(null);
    const resultado = await decidirSugestaoNaApi(slug, item.id, decisao, motivo.trim() || undefined);
    setOcupada(null);
    if (resultado.ok) {
      setDecididas((atual) => ({ ...atual, [item.id]: resultado.status }));
      setRecusando(null);
      setMotivo("");
      setMensagem(resultado.status === "aceita" ? "Sugestão aceita. Ela passa a aparecer na lista de evidências." : "Sugestão recusada. Ela não aparece como evidência.");
      router.refresh();
      return;
    }
    setErro({
      id: item.id,
      texto: resultado.semSessao ? "Sua sessão expirou. Entre novamente." : (resultado.campos.motivo ?? resultado.erroGeral ?? "Não foi possível concluir."),
    });
  }

  const pendentes = itens.filter((item) => !decididas[item.id]);

  return (
    <Painel aria-label="Sugestões para análise">
      <TituloPainel>Sugestões para análise</TituloPainel>
      <Aviso>Visível só para quem pode analisar. A decisão é final e fica registrada.</Aviso>
      {pendentes.length === 0 ? <Aviso>Nenhuma sugestão pendente.</Aviso> : null}
      <Itens>
        {pendentes.map((item) => (
          <li key={item.id}>
            <Item>
              <Topo>
                <Badge size="small" variant="warning">Aguardando análise</Badge>
                <Badge size="small" variant="default">{ROTULO_ORIGEM[item.origem]}</Badge>
              </Topo>
              <NomeItem>{item.titulo}</NomeItem>
              <Descricao>{item.descricao}</Descricao>
              <Meta>Enviada por @{item.enviadaPor.usuario} em {formatarData(item.data)}</Meta>
              {recusando === item.id ? (
                <FormField label="Motivo da recusa (opcional)">
                  <Textarea rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                </FormField>
              ) : null}
              {erro?.id === item.id ? <Erro role="alert">{erro.texto}</Erro> : null}
              <Acoes>
                {recusando === item.id ? (
                  <>
                    <Button type="button" variant="outline" size="small" loading={ocupada === item.id} loadingLabel="Recusando" onClick={() => decidir(item, "recusar")}>
                      Confirmar recusa
                    </Button>
                    <Button type="button" variant="ghost" size="small" disabled={ocupada === item.id} onClick={() => { setRecusando(null); setMotivo(""); }}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="primary" size="small" loading={ocupada === item.id} loadingLabel="Aceitando" onClick={() => decidir(item, "aceitar")}>
                      Aceitar
                    </Button>
                    <Button type="button" variant="outline" size="small" disabled={ocupada === item.id} onClick={() => { setRecusando(item.id); setMotivo(""); setErro(null); }}>
                      Recusar
                    </Button>
                  </>
                )}
              </Acoes>
            </Item>
          </li>
        ))}
      </Itens>
      {temMais ? <NotaLista>Mostrando as sugestões pendentes mais recentes.</NotaLista> : null}
      {mensagem ? <Sucesso role="status">{mensagem}</Sucesso> : null}
    </Painel>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

const Resumo = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Nota = styled.p`
  font-size: 12px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Lista = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 16px;
  list-style: none;
`;

const Painel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const TituloPainel = styled.h3`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
`;

const Aviso = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Campos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Fieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: none;
  font-size: 14px;

  legend {
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
  }
`;

const ErroCampo = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const Erro = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  border-left: 3px solid ${({ theme }) => theme.colors.debunked};
  padding-left: 10px;
`;

const Sucesso = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
  border-left: 3px solid ${({ theme }) => theme.colors.pink};
  padding-left: 10px;
`;

const Itens = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 12px;
  list-style: none;
`;

const Item = styled.article`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.card};
`;

const Topo = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const NomeItem = styled.h4`
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
  text-transform: uppercase;
  overflow-wrap: anywhere;
`;

const Descricao = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

const Meta = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
