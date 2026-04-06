import { ReactNode } from 'react'

type Props = {
  title?: string
  subtitle?: string
  children: ReactNode
}

export default function SectionCard({ title, subtitle, children }: Props) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h2 className="text-xl font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}

      {children}
    </section>
  )
}