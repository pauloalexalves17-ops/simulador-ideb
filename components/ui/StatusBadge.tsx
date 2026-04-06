type Props = {
  status: 'abaixo' | 'atingida' | 'acima'
}

export default function StatusBadge({ status }: Props) {
  if (status === 'abaixo') {
    return (
      <span className="inline-flex rounded-full border px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 border-red-200">
        Abaixo da meta
      </span>
    )
  }

  if (status === 'acima') {
    return (
      <span className="inline-flex rounded-full border px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 border-green-200">
        Acima da meta
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full border px-3 py-1 text-sm font-semibold bg-amber-100 text-amber-700 border-amber-200">
      Meta atingida
    </span>
  )
}