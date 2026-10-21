export const FUSO_LOCAL = "America/Sao_Paulo";

const formatador = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_LOCAL,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// Dia civil (AAAA-MM-DD) de um instante no fuso de São Paulo. O instante em si continua em UTC no banco.
export function diaLocal(instante: Date): string {
  return formatador.format(instante);
}
