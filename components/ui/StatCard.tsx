type Props = {
  label: string
  value: string
}

export default function StatCard({ label, value }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  )
}