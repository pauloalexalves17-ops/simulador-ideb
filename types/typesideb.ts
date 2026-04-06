export type EtapaEnsino = "Anos Iniciais" | "Anos Finais";

export type TaxasAprovacaoPorAno = {
  "1": string;
  "2": string;
  "3": string;
  "4": string;
  "5": string;
  "6": string;
  "7": string;
  "8": string;
  "9": string;
};

export type DadosEntrada = {
  nomeEscola: string;
  etapaEnsino: EtapaEnsino;
  anoReferencia: number;
  proficienciaLP: number;
  proficienciaMT: number;
  taxasAprovacao: TaxasAprovacaoPorAno;
};

export type ResultadoCalculo = {
  aprendizado: number;
  fluxo: number | null;
  idebProjetado: number | null;
  taxaMediaAprovacao: number | null;
};