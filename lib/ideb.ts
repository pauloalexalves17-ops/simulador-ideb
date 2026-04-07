import { DadosEntrada, EtapaEnsino, ResultadoCalculo } from "@/types/typesideb";

export const ANOS_POR_ETAPA: Record<EtapaEnsino, string[]> = {
  "Anos Iniciais": ["1", "2", "3", "4", "5"],
  "Anos Finais": ["6", "7", "8", "9"],
};

// Limites oficiais da nota técnica do Ideb
const LIMITES = {
  "Anos Iniciais": {
    LP: { min: 49, max: 324 },
    MT: { min: 60, max: 322 },
  },
  "Anos Finais": {
    LP: { min: 100, max: 400 },
    MT: { min: 100, max: 400 },
  },
};

function limitarValor(valor: number, min: number, max: number): number {
  if (valor < min) return min;
  if (valor > max) return max;
  return valor;
}

function padronizarNota(valor: number, min: number, max: number): number {
  const valorLimitado = limitarValor(valor, min, max);
  const notaPadronizada = ((valorLimitado - min) / (max - min)) * 10;
  return Number(notaPadronizada.toFixed(2));
}

export function calcularAprendizado(
  etapa: EtapaEnsino,
  proficienciaLP: number,
  proficienciaMT: number
): number {
  const limites = LIMITES[etapa];

  const nLP = padronizarNota(
    proficienciaLP,
    limites.LP.min,
    limites.LP.max
  );

  const nMT = padronizarNota(
    proficienciaMT,
    limites.MT.min,
    limites.MT.max
  );

  const aprendizado = (nLP + nMT) / 2;

  return Number(aprendizado.toFixed(2));
}

// Fluxo mais fiel à lógica técnica do Inep:
// P = n / soma(1 / p_r)
// onde p_r é a taxa da série em forma decimal
export function calcularFluxo(
  etapa: EtapaEnsino,
  taxasAprovacao: DadosEntrada["taxasAprovacao"]
): { fluxo: number | null; taxaMediaAprovacao: number | null } {
  const anosDaEtapa = ANOS_POR_ETAPA[etapa];

  const taxasPreenchidas = anosDaEtapa
    .map((ano) => taxasAprovacao[ano as keyof typeof taxasAprovacao].replace(",", ".").trim())
    .filter((valor) => valor !== "")
    .map(Number)
    .filter((valor) => !Number.isNaN(valor) && valor > 0);

  if (taxasPreenchidas.length === 0) {
    return {
      fluxo: null,
      taxaMediaAprovacao: null,
    };
  }

  const taxasDecimais = taxasPreenchidas.map((taxa) => taxa / 100);

  const somaInversos = taxasDecimais.reduce((acc, taxa) => acc + 1 / taxa, 0);

  const fluxo = taxasDecimais.length / somaInversos;

  const taxaMediaAprovacao =
    taxasPreenchidas.reduce((acc, taxa) => acc + taxa, 0) / taxasPreenchidas.length;

  return {
    fluxo: Number(fluxo.toFixed(3)),
    taxaMediaAprovacao: Number(taxaMediaAprovacao.toFixed(1)),
  };
}

export function calcularIdeb(dados: DadosEntrada): ResultadoCalculo {
  const aprendizado = calcularAprendizado(
    dados.etapaEnsino,
    dados.proficienciaLP,
    dados.proficienciaMT
  );

  const { fluxo, taxaMediaAprovacao } = calcularFluxo(
    dados.etapaEnsino,
    dados.taxasAprovacao
  );

  const idebProjetado =
    fluxo !== null ? Number((aprendizado * fluxo).toFixed(1)) : null;

  return {
    aprendizado,
    fluxo,
    idebProjetado,
    taxaMediaAprovacao,
  };
}