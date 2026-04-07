import { ResultadoCalculo } from '@/types/typesideb'
import { formatarNumero } from '@/lib/format'

type Props = {
  resultado: ResultadoCalculo
}

export default function MetaProgress({ resultado }: Props) {
  const percentual = Math.min((resultado.idebProjetado / resultado.meta) * 100, 100)

  const config =
    resultado.statusMeta === 'abaixo'
      ? {
          texto: 'Abaixo da meta',
          textoCor: 'text-red-600',
          barra: 'bg-red-500',
        }
      : resultado.statusMeta === 'acima'
      ? {
          texto: 'Acima da meta',
          textoCor: 'text-green-600',
          barra: 'bg-green-600',
        }
      : {
          texto: 'Meta atingida',
          textoCor: 'text-amber-600',
          barra: 'bg-amber-500',
        }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Progresso até a meta
          </h2>
          <p className="text-sm text-slate-500">
            Comparação entre o IDEB projetado e a meta calculada.
          </p>
        </div>

        <span className={`text-sm font-semibold ${config.textoCor}`}>
          {config.texto}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>Progresso</span>
          <span>{formatarNumero(percentual)}%</span>
        </div>

        <div className="h-4 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-4 rounded-full ${config.barra}`}
            style={{ width: `${percentual}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-sm text-slate-500">IDEB atual</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatarNumero(resultado.idebProjetado)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Meta</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatarNumero(resultado.meta)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Falta para a meta</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatarNumero(resultado.faltaParaMeta)}
          </p>
        </div>
      </div>
    </section>
  )
}