import { ResultadoCalculo } from "@/types/typesideb";

type Props = {
  resultado: ResultadoCalculo;
};

export default function MetaProgress({ resultado }: Props) {
  const idebProjetado = resultado.idebProjetado ?? 0;
  const percentual = Math.min((idebProjetado / 10) * 100, 100);

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Progresso</h3>
        <span
          className="rounded-full px-3 py-1 text-sm font-medium"
          style={{
            backgroundColor: "#dbeafe",
            color: "#1d4ed8",
          }}
        >
          IDEB projetado
        </span>
      </div>

      <p className="mb-3 text-sm text-slate-600">
        Visualização simples do IDEB simulado na escala de 0 a 10.
      </p>

      <div className="mb-2 h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentual}%`,
            backgroundColor: "#2563eb",
          }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>
          IDEB projetado:{" "}
          <strong>{idebProjetado.toFixed(1).replace(".", ",")}</strong>
        </span>
        <span>
          Escala máxima: <strong>10,0</strong>
        </span>
      </div>

      <div className="mt-2 text-right text-xs text-slate-500">
        {percentual.toFixed(0)}% da escala
      </div>
    </div>
  );
}