import { NextRequest, NextResponse } from "next/server";

function normalizarNota(nota: number) {
  const valor = ((nota - 100) / (400 - 100)) * 10;
  return Math.max(0, Math.min(10, valor));
}

function normalizarTaxa(valor: number) {
  if (valor > 1) return valor / 100;
  return valor;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const lp = Number(body.lp);
    const mat = Number(body.mat);

    const a6 = normalizarTaxa(Number(body.aprovacoes?.["6"]));
    const a7 = normalizarTaxa(Number(body.aprovacoes?.["7"]));
    const a8 = normalizarTaxa(Number(body.aprovacoes?.["8"]));
    const a9 = normalizarTaxa(Number(body.aprovacoes?.["9"]));

    const nLp = normalizarNota(lp);
    const nMat = normalizarNota(mat);
    const n = (nLp + nMat) / 2;

    const soma = (1 / a6) + (1 / a7) + (1 / a8) + (1 / a9);
    const p = 4 / soma;

    const ideb = n * p;

    return NextResponse.json({
      ok: true,
      resultado: {
        ideb: Number(ideb.toFixed(2)),
        n: Number(n.toFixed(2)),
        p: Number(p.toFixed(4)),
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}