import { DadosEntrada, ResultadoCalculo } from '@/types/ideb'
import { formatarNumero } from '@/lib/format'

type Props = {
  dados: DadosEntrada
  resultado: ResultadoCalculo
}

export default function RelatorioIdeb({ dados, resultado }: Props) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">
        Relatório simples
      </h2>

      <div className="space-y-3 text-slate-700 leading-7">
        <p>
          A escola <strong>{dados.nomeEscola}</strong>, na etapa de ensino{' '}
          <strong>{dados.etapaEnsino}</strong>, considerando o ano de{' '}
          <strong>{dados.anoReferencia}</strong>, apresentou uma taxa de
          aprovação de <strong>{formatarNumero(resultado.taxaAprovacao)}%</strong>.
        </p>

        <p>
          Com proficiência média de{' '}
          <strong>{formatarNumero(dados.proficiencia)}</strong>, o sistema
          projetou um IDEB de{' '}
          <strong>{formatarNumero(resultado.idebProjetado)}</strong>.
        </p>

        <p>
          A meta inteligente calculada para o cenário informado foi de{' '}
          <strong>{formatarNumero(resultado.meta)}</strong>.
        </p>

        {resultado.statusMeta === 'abaixo' && (
          <p>
            Neste momento, a unidade está <strong>abaixo da meta</strong> e
            precisa avançar aproximadamente{' '}
            <strong>{formatarNumero(resultado.faltaParaMeta)}</strong> ponto(s)
            no índice projetado para alcançar o objetivo.
          </p>
        )}

        {resultado.statusMeta === 'atingida' && (
          <p>
            Neste cenário, a unidade <strong>atingiu a meta estimada</strong>.
          </p>
        )}

        {resultado.statusMeta === 'acima' && (
          <p>
            Neste cenário, a unidade está <strong>acima da meta</strong>,
            indicando um resultado favorável em relação ao objetivo calculado.
          </p>
        )}
      </div>
    </section>
  )
}