type Props = {
  title: string
  subtitle: string
  onCalcular: () => void
}

export default function PageHeader({ title, subtitle, onCalcular }: Props) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Painel principal</p>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-600 mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onCalcular}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-white font-medium hover:bg-slate-800 transition"
          >
            Calcular IDEB
          </button>

          <button
            onClick={() => window.print()}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Imprimir relatório
          </button>
        </div>
      </div>
    </section>
  )
}