import { ResultadoCalculo } from "@/types/typesideb";
import { formatarNumero } from "@/lib/format";
import StatCard from "@/components/ui/StatCard";

type Props = {
  resultado: ResultadoCalculo;
};

export default function ResultadoCards({ resultado }: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Aprendizado"
        value={formatarNumero(resultado.aprendizado)}
      />

      <StatCard
        label="Fluxo"
        value={
          resultado.fluxo !== null
            ? formatarNumero(Number(resultado.fluxo))
            : "Não informado"
        }
      />

      <StatCard
        label="Taxa média de aprovação"
        value={
          resultado.taxaMediaAprovacao !== null
            ? `${formatarNumero(resultado.taxaMediaAprovacao)}%`
            : "Não informada"
        }
      />

      <StatCard
        label="IDEB projetado"
        value={
          resultado.idebProjetado !== null
            ? formatarNumero(resultado.idebProjetado)
            : "Não calculado"
        }
      />
    </section>
  );
}