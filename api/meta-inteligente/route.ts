import { NextResponse } from "next/server";

function limitar(valor: number, min: number, max: number) {
  return Math.max(min, Math.min(max, valor));
}

export async function POST(req: Request) {
  try {
    const { idebAtual, nAtual, pAtual } = await req.json();

    const ideb = Number(idebAtual);
    const n = Number(nAtual);
    const p = Number(pAtual);

    if (
      !Number.isFinite(ideb) ||
      !Number.isFinite(n) ||
      !Number.isFinite(p) ||
      ideb <= 0 ||
      n <= 0 ||
      p <= 0
    ) {
      return NextResponse.json(
        { ok: false, erro: "Dados inválidos para gerar a meta." },
        { status: 400 }
      );
    }

    // Meta simples para a etapa 1:
    // sobe 0,2 se o IDEB já estiver mais alto
    // sobe 0,5 se estiver mais baixo
    const ganho = ideb >= 5 ? 0.2 : 0.5;
    const metaSugerida = Number((ideb + ganho).toFixed(1));

    // Cálculos reversos
    const pSeNFixoBruto = metaSugerida / n;
    const nSePFixoBruto = metaSugerida / p;

    // P não pode passar de 1
    const pSeNFixo = Number(limitar(pSeNFixoBruto, 0, 1).toFixed(4));
    const nSePFixo = Number(limitar(nSePFixoBruto, 0, 10).toFixed(2));

    // Regras de foco
    let foco = "combinado";

    if (pSeNFixo >= 1) {
      foco = "aprendizagem";
    } else if (p < 0.9 && n >= 6) {
      foco = "fluxo";
    } else if (n < 6) {
      foco = "aprendizagem";
    }

    // Regras de viabilidade
    let viabilidade = "alta";

    if (ganho > 0.2) {
      viabilidade = "média";
    }

    if (pSeNFixo >= 1 && nSePFixo - n > 0.5) {
      viabilidade = "baixa";
    }

    // Resumo automático
    let resumo = `A meta sugerida é ${metaSugerida.toFixed(
      1
    )}. O caminho mais viável é combinar melhoria de aprendizagem e fluxo escolar.`;

    if (foco === "fluxo") {
      resumo = `A meta sugerida é ${metaSugerida.toFixed(
        1
      )}. O principal esforço deve estar na melhoria do fluxo escolar, com foco em aprovação e permanência dos estudantes.`;
    }

    if (foco === "aprendizagem") {
      resumo = `A meta sugerida é ${metaSugerida.toFixed(
        1
      )}. O principal esforço deve estar na aprendizagem dos estudantes, especialmente no desempenho em Língua Portuguesa e Matemática.`;
    }

    if (pSeNFixo >= 1) {
      resumo += ` O fluxo já está no limite máximo (100%), portanto o avanço depende prioritariamente da aprendizagem.`;
    }

    return NextResponse.json({
      ok: true,
      resultado: {
        metaSugerida,
        viabilidade,
        foco,
        pSeNFixo,
        nSePFixo,
        resumo,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, erro: "Erro ao gerar meta inteligente." },
      { status: 500 }
    );
  }
}