import { configuracaoCookie } from "../auth/cookie";
import { exigirOrigemConfiavel, exigirSessao } from "../auth/guarda";
import {
  LARGURA_MAXIMA_IMAGEM,
  LIMITE_IMAGEM_BYTES,
  TIPOS_IMAGEM,
  armazenamentoConfigurado,
  armazenamentoVercelBlob,
  detectarTipoImagem,
  novoCaminhoImagem,
  prepararImagem,
  type ArmazenamentoImagens,
} from "../armazenamento/imagens";
import { obterDb, type Banco } from "../db/cliente";
import { ErroApi } from "../http/erros";
import { envolver, json } from "../http/resposta";

// Folga para os campos do formulário multipart além do arquivo.
const FOLGA_CORPO_BYTES = 64 * 1024;

export interface OpcoesRotasUploads {
  obterDb?: () => Banco;
  agora?: () => Date;
  producao?: boolean;
  // Testes: exige sessão sem banco.
  autenticar?: (requisicao: Request) => Promise<void>;
  // Testes: armazenamento simulado. `null` simula ambiente sem token.
  armazenamento?: ArmazenamentoImagens | null;
  ambiente?: NodeJS.ProcessEnv;
}

export function criarManipuladoresUploads(opcoes: OpcoesRotasUploads = {}) {
  const cookie = configuracaoCookie(opcoes.producao ?? process.env.NODE_ENV === "production");
  const agora = opcoes.agora ?? (() => new Date());
  const ambiente = opcoes.ambiente ?? process.env;
  const armazenamento = () => (opcoes.armazenamento !== undefined ? opcoes.armazenamento : armazenamentoVercelBlob(ambiente));

  const semCache = (resposta: Response) => {
    resposta.headers.set("Cache-Control", "no-store");
    return resposta;
  };

  return {
    // O formulário usa isto para mostrar "Envio de imagens indisponível no momento" sem tentar enviar.
    disponibilidade: envolver(async () =>
      semCache(json({ disponivel: opcoes.armazenamento !== undefined ? opcoes.armazenamento !== null : armazenamentoConfigurado(ambiente) })),
    ),

    // Exige sessão ANTES de ler o corpo; só depois verifica o armazenamento, o tamanho e o conteúdo.
    enviar: envolver(async (requisicao: Request) => {
      exigirOrigemConfiavel(requisicao);
      if (opcoes.autenticar) await opcoes.autenticar(requisicao);
      else await exigirSessao((opcoes.obterDb ?? obterDb)(), requisicao, cookie, agora());

      const destino = armazenamento();
      if (!destino) throw new ErroApi("servico_indisponivel", "Envio de imagens indisponível no momento.");

      const declarado = Number(requisicao.headers.get("content-length"));
      if (Number.isFinite(declarado) && declarado > LIMITE_IMAGEM_BYTES + FOLGA_CORPO_BYTES) {
        throw new ErroApi("arquivo_grande", "A imagem pode ter no máximo 5 MB.");
      }

      let formulario: FormData;
      try {
        formulario = await requisicao.formData();
      } catch {
        throw new ErroApi("requisicao_invalida", "Envie a imagem em um formulário multipart.");
      }
      const arquivo = formulario.get("arquivo");
      if (!(arquivo instanceof File)) {
        throw new ErroApi("validacao", undefined, { campos: { arquivo: "Escolha uma imagem." } });
      }
      if (arquivo.size === 0) throw new ErroApi("validacao", undefined, { campos: { arquivo: "O arquivo está vazio." } });
      if (arquivo.size > LIMITE_IMAGEM_BYTES) throw new ErroApi("arquivo_grande", "A imagem pode ter no máximo 5 MB.");

      const bytes = Buffer.from(await arquivo.arrayBuffer());
      const tipo = detectarTipoImagem(bytes);
      if (!tipo) throw new ErroApi("tipo_nao_suportado", "Use uma imagem JPEG, PNG ou WebP.");

      let preparada;
      try {
        preparada = await prepararImagem(bytes, tipo);
      } catch (causa) {
        throw new ErroApi("validacao", undefined, { campos: { arquivo: "Não foi possível ler esta imagem." }, causa });
      }

      const url = await destino.salvar(novoCaminhoImagem(tipo), preparada.dados, tipo);
      return semCache(
        json(
          { url, tipo, largura: preparada.largura, altura: preparada.altura, tamanho: preparada.dados.length, larguraMaxima: LARGURA_MAXIMA_IMAGEM },
          201,
        ),
      );
    }),
  };
}

export { TIPOS_IMAGEM };
