import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Simulador IDEB',
  description: 'Sistema de simulação de desempenho escolar',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 text-slate-800 antialiased">
        <header className="bg-slate-900 text-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 md:px-6">
            <h1 className="text-xl font-semibold">Simulador IDEB</h1>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-10 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-4 md:px-6 text-sm text-slate-500">
            © {new Date().getFullYear()} - Sistema educacional
          </div>
        </footer>
      </body>
    </html>
  )
}