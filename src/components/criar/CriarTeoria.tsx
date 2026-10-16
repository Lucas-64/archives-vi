"use client";

import { useState, type FormEvent } from "react";

import { ContentGrid } from "../layout/ContentGrid";
import { PageBody } from "../page/PageBody";
import { PageHeader } from "../page/PageHeader";
import { FormularioTeoria } from "./FormularioTeoria";
import { PreviaTeoria } from "./PreviaTeoria";
import { temErros, validarTeoria, type RascunhoTeoria } from "./validarTeoria";

// Estado da página /criar. Nada é gravado: o rascunho existe só na memória desta tela.
export function CriarTeoria() {
  const [rascunho, setRascunho] = useState<RascunhoTeoria>({ titulo: "", texto: "" });
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [simulado, setSimulado] = useState(false);

  const erros = validarTeoria(rascunho);
  const existeErro = temErros(erros);

  function alterar(campo: keyof RascunhoTeoria, valor: string) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }));
    setSimulado(false);
  }

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTentouEnviar(true);
    setSimulado(!existeErro);
  }

  // Os erros só aparecem depois da primeira tentativa de envio; depois, acompanham a digitação.
  const errosVisiveis = tentouEnviar ? erros : {};

  return (
    <ContentGrid
      main={
        <>
          <PageHeader
            titulo="Criar teoria"
            descricao="Escreva uma teoria e acompanhe a prévia enquanto digita."
          />
          <PageBody>
            <FormularioTeoria
              rascunho={rascunho}
              erros={errosVisiveis}
              mostrarResumoErro={tentouEnviar && existeErro}
              simulado={simulado}
              onAlterar={alterar}
              onEnviar={enviar}
            />
          </PageBody>
        </>
      }
      sidebar={<PreviaTeoria titulo={rascunho.titulo.trim()} texto={rascunho.texto.trim()} />}
    />
  );
}
