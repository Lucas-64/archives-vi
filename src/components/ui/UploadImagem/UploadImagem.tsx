"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";

import {
  MENSAGEM_ARMAZENAMENTO_INDISPONIVEL,
  armazenamentoDeImagensDisponivel,
  enviarImagemNaApi,
  validarArquivoDeImagem,
} from "../../../lib/uploadApi";
import { Button } from "../Button";

export interface UploadImagemProps {
  rotulo: string;
  // URL pública já salva (devolvida pelo envio). Vazio: sem imagem.
  valor?: string | null;
  // Chamado com a URL depois do envio confirmado, ou com null ao remover.
  onChange: (url: string | null) => void;
  opcional?: boolean;
  dica?: string;
  // Erro do formulário pai (por exemplo, recusado pela API ao salvar o registro).
  erro?: string;
  // Proporção fixa da prévia, para não mudar o layout (ex.: "16 / 9", "1 / 1", "3 / 1").
  proporcao?: string;
  redondo?: boolean;
  desabilitado?: boolean;
}

type Estado = "verificando" | "pronto" | "indisponivel";

// Componente único de upload de imagem (ADR-043): escolher arquivo, prévia, remover, estado de envio e erro, com
// rótulo, teclado e região `aria-live`. O envio é feito na hora, para `POST /api/v1/uploads/imagem` (exige login;
// jpeg, png ou webp até 5 MB; o servidor confere o conteúdo e redimensiona). Sem armazenamento configurado, mostra
// "Envio de imagens indisponível no momento." e não oferece outro caminho (não aceita URL digitada).
export function UploadImagem({
  rotulo,
  valor,
  onChange,
  opcional = false,
  dica,
  erro,
  proporcao = "16 / 9",
  redondo = false,
  desabilitado = false,
}: UploadImagemProps) {
  const id = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<Estado>("verificando");
  const [enviando, setEnviando] = useState(false);
  const [previa, setPrevia] = useState<string | null>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [falhouImagem, setFalhouImagem] = useState(false);

  useEffect(() => {
    let ativo = true;
    armazenamentoDeImagensDisponivel().then((disponivel) => {
      if (ativo) setEstado(disponivel ? "pronto" : "indisponivel");
    });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previa) URL.revokeObjectURL(previa);
    };
  }, [previa]);

  async function aoEscolher(arquivos: FileList | null) {
    const arquivo = arquivos?.[0];
    if (entrada.current) entrada.current.value = "";
    if (!arquivo || enviando) return;

    setAviso(null);
    const recusado = validarArquivoDeImagem(arquivo);
    if (recusado) {
      setErroLocal(recusado);
      return;
    }

    setErroLocal(null);
    setFalhouImagem(false);
    setPrevia(URL.createObjectURL(arquivo));
    setEnviando(true);
    const resultado = await enviarImagemNaApi(arquivo);
    setEnviando(false);

    if (resultado.ok) {
      setPrevia(null);
      setAviso("Imagem enviada.");
      onChange(resultado.url);
      return;
    }
    setPrevia(null);
    if (resultado.indisponivel) setEstado("indisponivel");
    setErroLocal(resultado.erro);
  }

  function remover() {
    setPrevia(null);
    setErroLocal(null);
    setAviso("Imagem removida.");
    setFalhouImagem(false);
    onChange(null);
  }

  const mostrada = previa ?? (valor && !falhouImagem ? valor : null);
  const mensagemErro = erroLocal ?? erro;

  return (
    <Campo>
      <Rotulo id={`${id}-rotulo`}>
        {rotulo}
        {opcional ? <Opcional> (opcional)</Opcional> : null}
      </Rotulo>
      {dica ? <Dica id={`${id}-dica`}>{dica}</Dica> : null}

      {mostrada ? (
        <Previa $proporcao={proporcao} $redondo={redondo}>
          <Image
            src={mostrada}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 480px"
            unoptimized={previa !== null}
            onError={() => setFalhouImagem(true)}
            style={{ objectFit: "cover" }}
          />
        </Previa>
      ) : null}

      {estado === "indisponivel" ? (
        <Indisponivel role="status">{MENSAGEM_ARMAZENAMENTO_INDISPONIVEL}</Indisponivel>
      ) : (
        <Acoes>
          <input
            ref={entrada}
            id={`${id}-arquivo`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            disabled={desabilitado || estado !== "pronto" || enviando}
            aria-labelledby={`${id}-rotulo`}
            aria-describedby={dica ? `${id}-dica` : undefined}
            onChange={(evento) => aoEscolher(evento.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="small"
            disabled={desabilitado || estado !== "pronto"}
            loading={enviando}
            loadingLabel="Enviando"
            onClick={() => entrada.current?.click()}
            aria-describedby={`${id}-status`}
          >
            {valor || previa ? "Trocar imagem" : "Escolher imagem"}
          </Button>
          {valor && !enviando ? (
            <Button type="button" variant="ghost" size="small" disabled={desabilitado} onClick={remover}>
              Remover imagem
            </Button>
          ) : null}
        </Acoes>
      )}

      <Status id={`${id}-status`} aria-live="polite">
        {enviando ? "Enviando imagem..." : estado === "verificando" ? "" : (aviso ?? "")}
      </Status>
      {mensagemErro ? <Erro role="alert">{mensagemErro}</Erro> : null}
    </Campo>
  );
}

const Campo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const Rotulo = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Opcional = styled.span`
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Dica = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Previa = styled.div<{ $proporcao: string; $redondo: boolean }>`
  position: relative;
  width: ${({ $redondo }) => ($redondo ? "112px" : "100%")};
  max-width: 480px;
  aspect-ratio: ${({ $proporcao }) => $proporcao};
  overflow: hidden;
  border-radius: ${({ $redondo, theme }) => ($redondo ? theme.borderRadius.pill : theme.borderRadius.md)};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
`;

const Indisponivel = styled.p`
  padding: 10px 14px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Status = styled.p`
  min-height: 1em;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Erro = styled.p`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.debunked};
`;
