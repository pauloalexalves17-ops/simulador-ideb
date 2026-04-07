import { DadosEntrada, ResultadoCalculo } from "@/types/typesideb";
import { formatarNumero } from "@/lib/format";

type Props = {
  dados: DadosEntrada;
  resultado: ResultadoCalculo;
};

export default function RelatorioIdeb({ dados, resultado }: Props) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">
        Relatório simples
      </h2>

      <div className="space-y-3 text-slate-700 leading-7">
        <p>
          A escola <strong>{dados.nomeEscola}</strong>, na etapa de ensino{" "}
          <strong>{dados.etapaEnsino}</strong>, considerando o ano de{" "}
          <strong>{dados.anoReferencia}</strong>, apresentou:
        </p>

        <p>
          Proficiência em Língua Portuguesa de{" "}
          <strong>{formatarNumero(Number(dados.proficienciaLP))}</strong> e
          proficiência em Matemática de{" "}
          <strong>{formatarNumero(Number(dados.proficienciaMT))}</strong>.
        </p>

        <p>
          O aprendizado projetado foi de{" "}
          <strong>{formatarNumero(resultado.aprendizado)}</strong>.
        </p>

        <p>
          O fluxo calculado foi de{" "}
          <strong>
            {resultado.fluxo !== null
              ? formatarNumero(Number(resultado.fluxo))
              : "não informado"}
          </strong>
          .
        </p>

        <p>
          A taxa média de aprovação informada foi de{" "}
          <strong>
            {resultado.taxaMediaAprovacao !== null
              ? `${formatarNumero(resultado.taxaMediaAprovacao)}%`
              : "não informada"}
          </strong>
          .
        </p>

        <p>
          O IDEB projetado foi de{" "}
          <strong>
            {resultado.idebProjetado !== null
              ? formatarNumero(resultado.idebProjetado)
              : "não calculado"}
          </strong>
          .
        </p>
      </div>
    </section>
  );
}