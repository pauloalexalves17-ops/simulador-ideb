type DadosEntrada = {
  nomeEscola: string;
  etapaEnsino: string;
  proficienciaLP: number | string;
  proficienciaMT: number | string;
};

type Props = {
  dados: DadosEntrada;
  erros: string[];
  onChange: (campo: string, valor: string | number) => void;
};

export default function IdebForm({ dados, erros, onChange }: Props) {
  function atualizarCampo(campo: string, valor: string | number) {
    onChange(campo, valor);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nome da escola
          </label>
          <input
            type="text"
            value={dados.nomeEscola}
            onChange={(e) => atualizarCampo("nomeEscola", e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Etapa de ensino
          </label>

          <select
            value={dados.etapaEnsino}
            onChange={(e) => atualizarCampo("etapaEnsino", e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Anos Iniciais">Anos Iniciais</option>
            <option value="Anos Finais">Anos Finais</option>
          </select>

          {dados.nomeEscola && (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
              📊 Os dados da escola foram carregados automaticamente com base no
              Inep 2023. Você pode alterar os valores abaixo para simular novos
              cenários.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Proficiência em Língua Portuguesa
          </label>
          <input
            type="number"
            value={dados.proficienciaLP}
            onChange={(e) => atualizarCampo("proficienciaLP", e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex.: 250"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Proficiência em Matemática
          </label>
          <input
            type="number"
            value={dados.proficienciaMT}
            onChange={(e) => atualizarCampo("proficienciaMT", e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex.: 260"
          />
        </div>
      </div>

      {erros.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-700 mb-2">Verifique os dados:</p>
          <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
            {erros.map((erro, index) => (
              <li key={index}>{erro}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}