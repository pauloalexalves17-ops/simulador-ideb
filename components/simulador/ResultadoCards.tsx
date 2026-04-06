import { ResultadoCalculo } from '@/types/ideb'
import { formatarNumero } from '@/lib/format'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'

type Props = {
  resultado: ResultadoCalculo
}

export default function ResultadoCards({ resultado }: Props) {
  return (
    <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Taxa de aprovação"
        value={`${formatarNumero(resultado.taxaAprovacao)}%`}
      />

      <StatCard
        label="IDEB projetado"
        value={formatarNumero(resultado.idebProjetado)}
      />

      <StatCard
        label="Meta inteligente"
        value={formatarNumero(resultado.meta)}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <p className="text-sm text-slate-500">Situação</p>
        <div className="mt-3">
          <StatusBadge status={resultado.statusMeta} />
        </div>
      </div>
    </section>
  )
}