import { DadosEntrada } from "@/types/ideb";
import { ANOS_POR_ETAPA } from "@/lib/ideb";

export function validarDadosIdeb(dados: DadosEntrada): string[] {
  const erros: string[] = [];

  if (dados.proficienciaLP <= 0) {
    erros.push("Informe uma proficiência válida em Língua Portuguesa.");
  }

  if (dados.proficienciaMT <= 0) {
    erros.push("Informe uma proficiência válida em Matemática.");
  }

  const anosDaEtapa = ANOS_POR_ETAPA[dados.etapaEnsino];

  const taxasVisiveis = anosDaEtapa.map(
    (ano) => dados.taxasAprovacao[ano as keyof typeof dados.taxasAprovacao]
  );

  const temAlgumaTaxaPreenchida = taxasVisiveis.some(
    (valor) => valor.trim() !== ""
  );

  if (temAlgumaTaxaPreenchida) {
    for (const ano of anosDaEtapa) {
      const valorBruto =
        dados.taxasAprovacao[ano as keyof typeof dados.taxasAprovacao];

      if (valorBruto.trim() === "") {
        erros.push(
          `Preencha a taxa de aprovação do ${ano}º ano para completar a etapa selecionada.`
        );
        continue;
      }

      const valor = Number(valorBruto.replace(",", "."));

      if (Number.isNaN(valor) || valor < 0 || valor > 100) {
        erros.push(
          `A taxa de aprovação do ${ano}º ano deve estar entre 0 e 100.`
        );
      }
    }
  }

  return erros;
}