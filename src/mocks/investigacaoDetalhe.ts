// DADOS DEMONSTRATIVOS. Nomes, números, datas, evidências, discussões, relações e
// atividades abaixo são ilustrativos. Não são registros reais, não representam ações
// de usuários reais e não são referências oficiais sobre GTA VI.
import type { InvestigacaoDetalhe } from "@/types/InvestigacaoDetalhe";
// Imagens de exemplo. exemplo.jpg é JPEG. exemplo_2.jpg é PNG com extensão .jpg: a importação
// estática do Next resolve o formato real, como acontece com hero.jpg.
import exemploImagem from "@/assets/images/exemplo.jpg";
import exemploImagem2 from "@/assets/images/exemplo_2.jpg";

const LUCAS = { nome: "Lucas Andrade", usuario: "lucas_andrade" };
const ANALISTA = { nome: "Analista de Vice Beach", usuario: "analista_vb" };
const ARQUIVISTA = { nome: "Arquivista 99", usuario: "arquivista_99" };
const NOTURNO = { nome: "Observador Noturno", usuario: "noturno_leonida" };

export const investigacaoDetalhes: InvestigacaoDetalhe[] = [
  {
    id: "simbolos-vice-city",
    estado: "em_andamento",
    encerradaPeloAutor: false,
    autor: LUCAS,
    criadoEm: "2026-10-09",
    atualizadoEm: "2026-10-13",
    contagens: { participantes: 8, evidencias: 12, comentarios: 34, revisoes: 4 },
    teoria: {
      hipotese:
        "Alguns símbolos identificados em diferentes locais podem fazer parte de um mesmo enigma, possivelmente relacionado a uma organização ou a um acontecimento dentro do universo de GTA VI.",
      argumentosFavoraveis: [
        "Traçado repetido em três muros da orla.",
        "Placa do Mount Kalaga com o símbolo sob tinta.",
        "Letreiro verde no trailer.",
      ],
      perguntaCentral:
        "Os símbolos pertencem a uma mesma rede ou são coincidências urbanas?",
      fontes: [
        "Referência textual demonstrativa sobre o traçado dos muros.",
        "Referência demonstrativa a uma placa, sem origem verificada.",
      ],
    },
    evidencias: [
      {
        id: "001",
        origem: "imagem_propria",
        titulo: "Traçado repetido no muro da orla",
        descricao:
          "Captura própria do traçado em um dos muros. Relacionada à evidência #004.",
        autor: LUCAS,
        data: "2026-10-10",
        fonte: "Captura própria (demonstrativa)",
        comentarios: 3,
        avaliacoes: { relevante: 5, contradiz: 0, precisaContexto: 1 },
        relacionadaA: "004",
        temDiscussao: false,
        imagens: [
          {
            image: exemploImagem,
            alt: "Imagem de exemplo (demonstrativa): vista noturna de uma cidade, com um prédio iluminado e um helicóptero no céu.",
          },
        ],
      },
      {
        id: "004",
        origem: "imagem_terceiro",
        titulo: "Placa do Mount Kalaga com símbolo sob tinta",
        descricao:
          "Imagem de terceiro: o símbolo aparece parcialmente sob uma camada de tinta. Precisa de contexto antes de ser usada como prova.",
        autor: ARQUIVISTA,
        data: "2026-10-11",
        fonte: "Origem de terceiro (demonstrativa, sem link)",
        comentarios: 9,
        avaliacoes: { relevante: 4, contradiz: 1, precisaContexto: 6 },
        temDiscussao: true,
      },
      {
        id: "007",
        origem: "referencia_textual",
        titulo: "Menção textual a símbolos na orla",
        descricao:
          "Descrição textual de um padrão semelhante, sem imagem anexada.",
        autor: NOTURNO,
        data: "2026-10-11",
        fonte: null,
        comentarios: 2,
        avaliacoes: { relevante: 2, contradiz: 0, precisaContexto: 2 },
        temDiscussao: false,
      },
      {
        id: "009",
        origem: "imagem_propria",
        titulo: "O letreiro verde pode ser apenas parte do cenário",
        descricao:
          "Análise que contradiz a hipótese: o letreiro verde do trailer parece fazer parte da cena e não de uma rede de símbolos.",
        autor: ANALISTA,
        data: "2026-10-12",
        fonte: "Análise da cena (demonstrativa)",
        comentarios: 4,
        avaliacoes: { relevante: 3, contradiz: 5, precisaContexto: 2 },
        temDiscussao: false,
      },
      {
        id: "011",
        origem: "origem_nao_verificada",
        titulo: "Registro sem origem identificada",
        descricao:
          "Registro sem imagem disponível. A origem ainda não foi verificada.",
        autor: NOTURNO,
        data: "2026-10-12",
        fonte: null,
        comentarios: 1,
        avaliacoes: { relevante: 0, contradiz: 0, precisaContexto: 3 },
        temDiscussao: false,
      },
    ],
    // Sugestões da comunidade. "aceita" aparece na lista pública com a identificação de aprovação.
    // "pendente" só aparece na área do investigador. "recusada" não é apresentada ao público.
    sugestoes: [
      {
        id: "012",
        status: "aceita",
        origem: "imagem_terceiro",
        titulo: "Sugestão de demonstração com duas imagens",
        descricao:
          "Sugestão demonstrativa criada para exibir o carrossel. A segunda imagem é um mapa de referência de exemplo, e não uma captura da evidência.",
        enviadaPor: ARQUIVISTA,
        data: "2026-10-11",
        imagens: [
          { image: exemploImagem, alt: "Imagem de exemplo (demonstrativa): vista noturna de uma cidade, primeira de duas no carrossel." },
          { image: exemploImagem2, alt: "Mapa de referência de exemplo (demonstrativo), segunda de duas no carrossel." },
        ],
        aceitaPor: LUCAS,
      },
      {
        id: "013",
        status: "pendente",
        origem: "imagem_terceiro",
        titulo: "Relato sobre a placa do Mount Kalaga, em outro ângulo",
        descricao:
          "Sugestão demonstrativa em texto, sem imagem anexada. A origem ainda não foi verificada.",
        enviadaPor: ANALISTA,
        data: "2026-10-13",
      },
      {
        id: "014",
        status: "pendente",
        origem: "referencia_textual",
        titulo: "Relato sobre o padrão visto à noite",
        descricao:
          "Relato textual demonstrativo, sem imagem anexada.",
        enviadaPor: NOTURNO,
        data: "2026-10-13",
      },
      {
        id: "015",
        status: "recusada",
        origem: "origem_nao_verificada",
        titulo: "Registro sem data nem local",
        descricao:
          "Sugestão demonstrativa recusada pelo investigador. Não deve aparecer como evidência aceita.",
        enviadaPor: ARQUIVISTA,
        data: "2026-10-12",
      },
    ],
    discussaoGeral: [
      {
        id: "dg-1",
        autor: ARQUIVISTA,
        data: "2026-10-12",
        texto:
          "Sugiro separar as evidências por origem antes de comparar os traçados. Isso evita misturar capturas próprias com material de terceiros.",
        respostas: [
          {
            id: "dg-1-1",
            autor: LUCAS,
            data: "2026-10-12",
            texto: "Boa sugestão. Vou reorganizar a lista de evidências com essa separação.",
            respostas: [],
          },
        ],
      },
      {
        id: "dg-2",
        autor: ANALISTA,
        data: "2026-10-13",
        texto:
          "A evidência que contradiz a hipótese deveria ficar tão visível quanto as que sustentam. Está bem assim.",
        respostas: [],
      },
    ],
    discussaoEvidenciaId: "004",
    discussaoContextual: [
      {
        id: "dc-1",
        autor: ANALISTA,
        data: "2026-10-11",
        texto:
          "A tinta cobre parte do símbolo. Antes de comparar com o traçado da orla, precisamos saber de onde veio a imagem.",
        respostas: [
          {
            id: "dc-1-1",
            autor: ARQUIVISTA,
            data: "2026-10-11",
            texto: "A origem é de terceiro e está sem link. Vou tentar identificar o registro original.",
            respostas: [],
          },
        ],
      },
      {
        id: "dc-2",
        autor: NOTURNO,
        data: "2026-10-12",
        texto:
          "Comparei a proporção da placa com a da evidência #001. As duas parecem ter a mesma escala, o que ajuda a descartar uma edição simples.",
        contribuicaoUtil: true,
        respostas: [
          {
            id: "dc-2-1",
            autor: LUCAS,
            data: "2026-10-12",
            texto: "Essa comparação de escala é útil. Vou incluir a medida na próxima revisão.",
            respostas: [],
          },
        ],
      },
    ],
    historico: [
      {
        id: "h-1",
        data: "2026-10-09",
        autor: LUCAS,
        titulo: "Abertura da investigação",
        resumo: "Hipótese inicial e primeira lista de símbolos observados.",
      },
      {
        id: "h-2",
        data: "2026-10-10",
        autor: LUCAS,
        titulo: "Inclusão da evidência #001",
        resumo: "Captura própria do traçado no muro da orla.",
      },
      {
        id: "h-3",
        data: "2026-10-11",
        autor: ARQUIVISTA,
        titulo: "Inclusão da evidência #004",
        resumo: "Imagem de terceiro da placa, marcada como precisando de contexto.",
      },
      {
        id: "h-4",
        data: "2026-10-12",
        autor: ANALISTA,
        titulo: "Registro da evidência #009",
        resumo: "Análise que contradiz parte da hipótese, publicada com a mesma visibilidade.",
      },
      {
        id: "h-5",
        data: "2026-10-13",
        autor: LUCAS,
        titulo: "Revisão da teoria",
        resumo: "Separação das evidências por origem e atualização das perguntas em aberto.",
      },
    ],
    sintese: {
      observado: [
        "Símbolos semelhantes aparecem em três pontos da orla.",
        "A placa do Mount Kalaga mostra um símbolo parcialmente coberto.",
        "O letreiro verde aparece em um quadro do trailer.",
      ],
      sustentam: [
        "O traçado se repete em locais diferentes.",
        "A escala da placa é compatível com a da captura própria.",
      ],
      contradizem: [
        "O letreiro verde pode fazer parte do cenário, sem relação com os demais símbolos.",
      ],
      perguntasEmAberto: [
        "Qual é a origem da imagem da placa?",
        "Os traçados foram feitos pelo mesmo grupo ou são coincidências urbanas?",
      ],
      conclusaoProvisoria: null,
    },
    participantes: [LUCAS, ARQUIVISTA, ANALISTA, NOTURNO],
    atividadeRecente: [
      "Atividade demonstrativa: nova revisão da teoria.",
      "Atividade demonstrativa: evidência #004 recebeu comentários.",
      "Atividade demonstrativa: evidência #011 aguarda verificação de origem.",
    ],
  },
];
