"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calcularIdeb, ANOS_POR_ETAPA } from "@/lib/ideb";
import { validarDadosIdeb } from "@/lib/validation";
import {
  DadosEntrada,
  EtapaEnsino,
  ResultadoCalculo,
  TaxasAprovacaoPorAno,
} from "@/types/typesideb";

type EscolaJson = {
  uf?: string;
  UF?: string;
  municipio?: string;
  NO_MUNICIPIO?: string;
  escola?: string;
  NO_ESCOLA?: string;
  codigoEscola?: string | number;
  CO_ENTIDADE?: string | number;
  rede?: string;
  REDE?: string;
  etapa?: string;
  portugues?: number | null;
  matematica?: number | null;
  media?: number | null;
  fluxo?: number | null;
  ideb?: number | null;
  taxasAprovacao2023?: {
    [key: string]: number | null;
  };
};

const taxasIniciais: TaxasAprovacaoPorAno = {
  "1": "",
  "2": "",
  "3": "",
  "4": "",
  "5": "",
  "6": "",
  "7": "",
  "8": "",
  "9": "",
};

function getUf(item: EscolaJson) {
  return item.uf || item.UF || "";
}

function getMunicipio(item: EscolaJson) {
  return item.municipio || item.NO_MUNICIPIO || "";
}

function getEscola(item: EscolaJson) {
  return item.escola || item.NO_ESCOLA || "";
}

function getCodigoEscola(item: EscolaJson) {
  return String(item.codigoEscola || item.CO_ENTIDADE || "");
}

function getRede(item: EscolaJson) {
  return item.rede || item.REDE || "";
}

function formatarDataAtual() {
  return new Date().toLocaleDateString("pt-BR");
}

export default function HomePage() {
  const relatorioRef = useRef<HTMLDivElement | null>(null);
  const [modoRelatorio, setModoRelatorio] = useState(false);

  const [dados, setDados] = useState<DadosEntrada>({
    nomeEscola: "",
    etapaEnsino: "Anos Finais",
    anoReferencia: 2025,
    proficienciaLP: 0,
    proficienciaMT: 0,
    taxasAprovacao: taxasIniciais,
  });

  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [idebReal, setIdebReal] = useState<number | null>(null);
  const [baseEscolas, setBaseEscolas] = useState<EscolaJson[]>([]);

  const [ufSelecionada, setUfSelecionada] = useState("");
  const [municipioSelecionado, setMunicipioSelecionado] = useState("");
  const [redeSelecionada, setRedeSelecionada] = useState("");
  const [escolaSelecionada, setEscolaSelecionada] = useState("");
  const [buscaEscola, setBuscaEscola] = useState("");
  const [mostrarListaEscolas, setMostrarListaEscolas] = useState(false);

  const anosDaEtapa = useMemo(
    () => ANOS_POR_ETAPA[dados.etapaEnsino],
    [dados.etapaEnsino]
  );

  useEffect(() => {
    async function carregarBase() {
      const arquivo =
        dados.etapaEnsino === "Anos Iniciais" ? "/iniciais.json" : "/finais.json";

      try {
        const resposta = await fetch(arquivo);
        const json = await resposta.json();

        setBaseEscolas(Array.isArray(json) ? json : []);
        setUfSelecionada("");
        setMunicipioSelecionado("");
        setRedeSelecionada("");
        setEscolaSelecionada("");
        setBuscaEscola("");
        setMostrarListaEscolas(false);
        setIdebReal(null);

        setDados((prev) => ({
          ...prev,
          nomeEscola: "",
          proficienciaLP: 0,
          proficienciaMT: 0,
          taxasAprovacao: taxasIniciais,
        }));

        setResultado(null);
        setErros([]);
      } catch (error) {
        console.error("Erro ao carregar base de escolas:", error);
        setBaseEscolas([]);
      }
    }

    carregarBase();
  }, [dados.etapaEnsino]);

  const ufs = useMemo(() => {
    return [...new Set(baseEscolas.map((item) => getUf(item)).filter(Boolean))].sort();
  }, [baseEscolas]);

  const municipios = useMemo(() => {
    if (!ufSelecionada) return [];

    return [
      ...new Set(
        baseEscolas
          .filter((item) => getUf(item) === ufSelecionada)
          .map((item) => getMunicipio(item))
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [baseEscolas, ufSelecionada]);

  const redes = useMemo(() => {
    if (!ufSelecionada || !municipioSelecionado) return [];

    return [
      ...new Set(
        baseEscolas
          .filter(
            (item) =>
              getUf(item) === ufSelecionada &&
              getMunicipio(item) === municipioSelecionado
          )
          .map((item) => getRede(item))
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [baseEscolas, ufSelecionada, municipioSelecionado]);

  const escolas = useMemo(() => {
    if (!ufSelecionada || !municipioSelecionado) return [];

    return baseEscolas
      .filter(
        (item) =>
          getUf(item) === ufSelecionada &&
          getMunicipio(item) === municipioSelecionado &&
          (!redeSelecionada || getRede(item) === redeSelecionada)
      )
      .sort((a, b) => getEscola(a).localeCompare(getEscola(b), "pt-BR"));
  }, [baseEscolas, ufSelecionada, municipioSelecionado, redeSelecionada]);

  const escolasFiltradas = useMemo(() => {
    if (!buscaEscola.trim()) {
      return escolas.slice(0, 30);
    }

    const termo = buscaEscola.toLowerCase();

    return escolas
      .filter((item) => getEscola(item).toLowerCase().includes(termo))
      .slice(0, 30);
  }, [escolas, buscaEscola]);

  function handleNumero(campo: "proficienciaLP" | "proficienciaMT", valor: string) {
    const numero = valor === "" ? 0 : Number(valor.replace(",", "."));

    setDados((prev) => ({
      ...prev,
      [campo]: Number.isNaN(numero) ? 0 : numero,
    }));

    setResultado(null);
  }

  function handleEtapa(valor: string) {
    setDados((prev) => ({
      ...prev,
      etapaEnsino: valor as EtapaEnsino,
    }));
  }

  function handleTaxaAno(ano: string, valor: string) {
    setDados((prev) => ({
      ...prev,
      taxasAprovacao: {
        ...prev.taxasAprovacao,
        [ano]: valor,
      },
    }));

    setResultado(null);
  }

  function preencherTaxasDaEscola(escola: EscolaJson) {
    const novasTaxas: TaxasAprovacaoPorAno = { ...taxasIniciais };

    if (escola.taxasAprovacao2023) {
      Object.entries(escola.taxasAprovacao2023).forEach(([ano, valor]) => {
        if (valor !== null && valor !== undefined) {
          novasTaxas[ano as keyof TaxasAprovacaoPorAno] = String(valor).replace(".", ",");
        }
      });
    }

    return novasTaxas;
  }

  function limparDadosEscola() {
    setEscolaSelecionada("");
    setBuscaEscola("");
    setMostrarListaEscolas(false);
    setIdebReal(null);

    setDados((prev) => ({
      ...prev,
      nomeEscola: "",
      proficienciaLP: 0,
      proficienciaMT: 0,
      taxasAprovacao: taxasIniciais,
    }));

    setResultado(null);
  }

  function handleSelecionarEscola(codigo: string) {
    setEscolaSelecionada(codigo);

    const escola = escolas.find((item) => getCodigoEscola(item) === String(codigo));
    if (!escola) return;

    setBuscaEscola(getEscola(escola));
    setMostrarListaEscolas(false);
    setIdebReal(typeof escola.ideb === "number" ? escola.ideb : null);

    setDados((prev) => ({
      ...prev,
      nomeEscola: getEscola(escola),
      proficienciaLP: escola.portugues ?? 0,
      proficienciaMT: escola.matematica ?? 0,
      taxasAprovacao: preencherTaxasDaEscola(escola),
    }));

    setResultado(null);
    setErros([]);
  }

  function handleCalcular() {
    const novosErros = validarDadosIdeb(dados);
    setErros(novosErros);

    if (novosErros.length > 0) {
      setResultado(null);
      return;
    }

    const calculo = calcularIdeb(dados);
    setResultado(calculo);
  }

 async function handleGerarPDF() {
  if (!resultado) {
    alert("Faça o cálculo antes de gerar o PDF.");
    return;
  }

  try {
    const { jsPDF } = await import("jspdf");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    const margem = 14;
    let y = 18;

    const azulEscuro = "#0f172a";
    const azul = "#2563eb";
    const azulClaro = "#60a5fa";
    const cinza = "#475569";
    const cinzaClaro = "#e2e8f0";
    const branco = "#ffffff";
    const amarelo = "#f59e0b";

    const titulo = "Relatório de projeção do IDEB";
    const subtitulo = "Simulador IDEB - Prof. Paulo Alexandre Alves";

    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(margem, y, pageWidth - margem * 2, 22, 3, 3, "F");

    pdf.setTextColor(branco);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(titulo, margem + 6, y + 9);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(96, 165, 250);
    pdf.text(subtitulo, margem + 6, y + 16);

    y += 30;

    pdf.setTextColor(azulEscuro);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Dados da simulação", margem, y);

    y += 6;

    pdf.setDrawColor(cinzaClaro);
    pdf.roundedRect(margem, y, pageWidth - margem * 2, 30, 3, 3);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(cinza);

    const linhas = [
      `Escola: ${dados.nomeEscola || "-"}`,
      `Etapa: ${dados.etapaEnsino || "-"}`,
      `Município: ${municipioSelecionado || "-"}`,
      `UF: ${ufSelecionada || "-"}`,
      `Rede: ${redeSelecionada || "-"}`,
      `Data: ${new Date().toLocaleDateString("pt-BR")}`,
    ];

    let infoY = y + 7;
    linhas.forEach((linha) => {
      pdf.text(linha, margem + 4, infoY);
      infoY += 5;
    });

    y += 40;

    const cardW = 42;
    const gap = 6;
    const x1 = margem;
    const x2 = x1 + cardW + gap;
    const x3 = x2 + cardW + gap;
    const x4 = x3 + cardW + gap;
    const cardY = y;
    const cardH = 52;

    const desenharCard = (
      x: number,
      titulo: string,
      valor: string,
      subtitulo: string,
      valorColor = azulEscuro,
      fundo = branco,
      texto = azulEscuro
    ) => {
      const rgb = (hex: string) => {
        const h = hex.replace("#", "");
        return [
          parseInt(h.substring(0, 2), 16),
          parseInt(h.substring(2, 4), 16),
          parseInt(h.substring(4, 6), 16),
        ];
      };

      const [r, g, b] = rgb(fundo);
      pdf.setFillColor(r, g, b);
      pdf.setDrawColor(cinzaClaro);
      pdf.roundedRect(x, cardY, cardW, cardH, 4, 4, "FD");

      pdf.setTextColor(texto);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(titulo, x + cardW / 2, cardY + 10, { align: "center" });

      const [vr, vg, vb] = rgb(valorColor);
      pdf.setTextColor(vr, vg, vb);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text(valor, x + cardW / 2, cardY + 28, { align: "center" });

      pdf.setTextColor(texto);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const subt = pdf.splitTextToSize(subtitulo, cardW - 8);
      pdf.text(subt, x + cardW / 2, cardY + 40, { align: "center" });
    };

    desenharCard(
      x1,
      "Aprendizado",
      resultado.aprendizado.toFixed(2).replace(".", ","),
      "Resultado calculado a partir das proficiências.",
      amarelo
    );

    desenharCard(
      x2,
      "Fluxo",
      resultado.fluxo !== null
        ? Number(resultado.fluxo).toFixed(2).replace(".", ",")
        : "-",
      "Calculado a partir das taxas de aprovação.",
      amarelo
    );

    desenharCard(
      x3,
      "IDEB real 2023",
      idebReal !== null ? idebReal.toFixed(1).replace(".", ",") : "-",
      "Resultado oficial divulgado para a escola.",
      "#334155"
    );

    desenharCard(
      x4,
      "IDEB simulado",
      resultado.idebProjetado !== null
        ? resultado.idebProjetado.toFixed(1).replace(".", ",")
        : "-",
      "Resultado projetado para o cenário informado.",
      branco,
      azul,
      branco
    );

    y += 65;

    pdf.setTextColor(azulEscuro);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Metodologia", margem, y);

    y += 6;

    pdf.setDrawColor(cinzaClaro);
    pdf.roundedRect(margem, y, pageWidth - margem * 2, 36, 3, 3);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(cinza);

    const metodologia = [
      "Os dados de referência da escola foram extraídos da divulgação oficial do Inep 2023 por escola.",
      "As taxas de aprovação podem ser atualizadas com base no Censo Escolar 2025.",
      "A simulação considera o desempenho em Língua Portuguesa e Matemática combinado ao fluxo escolar.",
      "Relatório gerado em formato neutro para uso por escolas e redes de ensino.",
    ];

    let textoY = y + 6;
    metodologia.forEach((linha) => {
      const quebrado = pdf.splitTextToSize(linha, pageWidth - margem * 2 - 8);
      pdf.text(quebrado, margem + 4, textoY);
      textoY += 7;
    });

    const nomeArquivo = dados.nomeEscola
      ? `simulacao-ideb-${dados.nomeEscola.toLowerCase().replace(/\s+/g, "-")}.pdf`
      : "simulacao-ideb.pdf";

    pdf.save(nomeArquivo);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Erro ao gerar PDF.");
  }
}

  function handleLimpar() {
    setDados({
      nomeEscola: "",
      etapaEnsino: dados.etapaEnsino,
      anoReferencia: 2025,
      proficienciaLP: 0,
      proficienciaMT: 0,
      taxasAprovacao: taxasIniciais,
    });

    setUfSelecionada("");
    setMunicipioSelecionado("");
    setRedeSelecionada("");
    setEscolaSelecionada("");
    setBuscaEscola("");
    setMostrarListaEscolas(false);
    setIdebReal(null);
    setResultado(null);
    setErros([]);
  }

  const diferencaIdeb =
    resultado && resultado.idebProjetado !== null && idebReal !== null
      ? Number((resultado.idebProjetado - idebReal).toFixed(1))
      : null;

  const classeCampo =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] text-slate-800 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none";

  const classeLabel = "mb-2 block text-sm font-semibold text-slate-700";

  return (
  <div>
 <div className="sticky top-0 z-30 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur shadow-lg">
  <div className="mx-auto flex max-w-[1400px] flex-col items-center px-6 py-5 gap-1">
    <span className="text-xl font-bold tracking-wide text-white md:text-2xl">
      Simulador IDEB
    </span>

    <span className="mt-1 text-sm md:text-lg font-bold text-blue-400 tracking-wide">
  Prof. Paulo Alexandre Alves
</span>
  </div>
</div>

    <main className="min-h-screen bg-gradient-to-b from-slate-200 via-slate-100 to-slate-100 px-4 py-8 md:px-6">
      <div ref={relatorioRef} className="pdf-safe mx-auto max-w-7xl space-y-8">

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-4xl">

              
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {modoRelatorio
                  ? "Relatório de projeção do IDEB"
                  : "Simulador IDEB"}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                {modoRelatorio
                  ? "Documento gerado a partir da simulação realizada no sistema, com foco direto na projeção do IDEB da escola."
                  : "Informe a etapa de ensino, selecione a escola e ajuste as proficiências e taxas de aprovação para simular o IDEB de forma objetiva."}
              </p>

            </div>
          </div>

          {modoRelatorio && (
            <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Escola
                </span>
                <span className="mt-1 block font-semibold text-slate-900">
                  {dados.nomeEscola || "—"}
                </span>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Etapa
                </span>
                <span className="mt-1 block font-semibold text-slate-900">
                  {dados.etapaEnsino}
                </span>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Município / UF
                </span>
                <span className="mt-1 block font-semibold text-slate-900">
                  {municipioSelecionado || "—"} {ufSelecionada ? `- ${ufSelecionada}` : ""}
                </span>
              </div>

              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rede / Data
                </span>
                <span className="mt-1 block font-semibold text-slate-900">
                  {redeSelecionada || "—"} · {formatarDataAtual()}
                </span>
              </div>
            </div>
          )}
        </div>

        {!modoRelatorio && (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-8">
            <div className="mb-6 flex flex-col gap-2">
              
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Dados para simulação
              </h2>

              <p className="text-sm leading-6 text-slate-600">
                Selecione a escola e ajuste os dados conforme o cenário que deseja projetar.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className={classeLabel}>Etapa de ensino</label>
                <select
                  value={dados.etapaEnsino}
                  onChange={(e) => handleEtapa(e.target.value)}
                  className={classeCampo}
                >
                  <option value="Anos Iniciais">Anos Iniciais (1º ao 5º)</option>
                  <option value="Anos Finais">Anos Finais (6º ao 9º)</option>
                </select>
              </div>

              <div>
                <label className={classeLabel}>Estado (UF)</label>
                <select
                  value={ufSelecionada}
                  onChange={(e) => {
                    setUfSelecionada(e.target.value);
                    setMunicipioSelecionado("");
                    setRedeSelecionada("");
                    limparDadosEscola();
                    setErros([]);
                  }}
                  className={classeCampo}
                >
                  <option value="">Selecione a UF</option>
                  {ufs.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={classeLabel}>Município</label>
                <select
                  value={municipioSelecionado}
                  onChange={(e) => {
                    setMunicipioSelecionado(e.target.value);
                    setRedeSelecionada("");
                    limparDadosEscola();
                    setErros([]);
                  }}
                  disabled={!ufSelecionada}
                  className={classeCampo}
                >
                  <option value="">Selecione o município</option>
                  {municipios.map((municipio) => (
                    <option key={municipio} value={municipio}>
                      {municipio}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={classeLabel}>Rede</label>
                <select
                  value={redeSelecionada}
                  onChange={(e) => {
                    setRedeSelecionada(e.target.value);
                    limparDadosEscola();
                    setErros([]);
                  }}
                  disabled={!municipioSelecionado}
                  className={classeCampo}
                >
                  <option value="">Todas as redes</option>
                  {redes.map((rede) => (
                    <option key={rede} value={rede}>
                      {rede}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className={classeLabel}>Escola</label>
                <input
                  type="text"
                  value={buscaEscola}
                  onChange={(e) => {
                    setBuscaEscola(e.target.value);
                    setMostrarListaEscolas(true);
                    setEscolaSelecionada("");
                  }}
                  onFocus={() => {
                    if (municipioSelecionado) setMostrarListaEscolas(true);
                  }}
                  placeholder={
                    municipioSelecionado
                      ? "Digite o nome da escola"
                      : "Selecione o município antes"
                  }
                  disabled={!municipioSelecionado}
                  className={classeCampo}
                />

                {mostrarListaEscolas &&
                  municipioSelecionado &&
                  escolasFiltradas.length > 0 && (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                      {escolasFiltradas.map((escola) => (
                        <button
                          key={getCodigoEscola(escola)}
                          type="button"
                          onClick={() => handleSelecionarEscola(getCodigoEscola(escola))}
                          className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50 last:border-b-0"
                        >
                          {getEscola(escola)}
                        </button>
                      ))}
                    </div>
                  )}

                {mostrarListaEscolas &&
                  municipioSelecionado &&
                  buscaEscola.trim() !== "" &&
                  escolasFiltradas.length === 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-xl">
                      Nenhuma escola encontrada.
                    </div>
                  )}
              </div>
            </div>

            {dados.nomeEscola && (
              <div className="mt-5 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 text-sm leading-6 text-slate-700 shadow-sm">
                <span className="font-semibold text-blue-700">Base carregada:</span>{" "}
                os dados da escola foram preenchidos automaticamente com base no Inep 2023.
                As taxas de aprovação podem ser ajustadas para simular cenários mais recentes.
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className={classeLabel}>Proficiência em Língua Portuguesa</label>
                <input
                  type="number"
                  value={dados.proficienciaLP || ""}
                  onChange={(e) => handleNumero("proficienciaLP", e.target.value)}
                  placeholder="Ex.: 220"
                  className={classeCampo}
                />
              </div>

              <div>
                <label className={classeLabel}>Proficiência em Matemática</label>
                <input
                  type="number"
                  value={dados.proficienciaMT || ""}
                  onChange={(e) => handleNumero("proficienciaMT", e.target.value)}
                  placeholder="Ex.: 235"
                  className={classeCampo}
                />
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    Taxas de aprovação por ano/série (%)
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Informe as taxas para compor o cálculo do fluxo escolar.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {anosDaEtapa.map((ano) => (
                  <div key={ano}>
                    <label className={classeLabel}>{ano}º ano</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={dados.taxasAprovacao[ano as keyof TaxasAprovacaoPorAno]}
                      onChange={(e) => handleTaxaAno(ano, e.target.value)}
                      placeholder="Ex.: 98,5"
                      className={classeCampo}
                    />
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                As taxas de aprovação podem ser consultadas no Censo Escolar 2025.
                Se a escola não tiver esses dados, deixe os campos em branco. Nesse caso,
                o sistema calculará apenas o aprendizado.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCalcular}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 font-semibold text-white shadow-lg shadow-lg transition hover:scale-[1.01] hover:from-blue-700 hover:to-indigo-700"
              >
                Calcular
              </button>

              <button
                type="button"
                onClick={handleLimpar}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Limpar
              </button>

              <button
                type="button"
                onClick={handleGerarPDF}
                disabled={!resultado}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Gerar PDF
              </button>
            </div>

            {erros.length > 0 && (
              <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5">
                <h3 className="mb-2 font-semibold text-red-700">Verifique os dados:</h3>
                <ul className="list-disc pl-5 text-sm leading-6 text-red-600">
                  {erros.map((erro, index) => (
                    <li key={index}>{erro}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {resultado && (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-8">
            <div className="mb-6 flex flex-col gap-2">
              <div className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
                Resultado
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {modoRelatorio
                  ? `Resumo da projeção — ${dados.etapaEnsino}`
                  : `Resultado da simulação — ${dados.etapaEnsino}`}
              </h2>

              <p className="text-sm leading-6 text-slate-600">
                Visualização direta dos principais indicadores usados na projeção.
              </p>
            </div>

            {modoRelatorio && (
              <div className="mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Escola
                  </span>
                  <span className="mt-1 block font-semibold text-slate-900">
                    {dados.nomeEscola || "—"}
                  </span>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Município
                  </span>
                  <span className="mt-1 block font-semibold text-slate-900">
                    {municipioSelecionado || "—"}
                  </span>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    UF
                  </span>
                  <span className="mt-1 block font-semibold text-slate-900">
                    {ufSelecionada || "—"}
                  </span>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rede
                  </span>
                  <span className="mt-1 block font-semibold text-slate-900">
                    {redeSelecionada || "—"}
                  </span>
                </div>

                <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Data
                  </span>
                  <span className="mt-1 block font-semibold text-slate-900">
                    {formatarDataAtual()}
                  </span>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
                <div className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 shadow-sm">
                  Indicador
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Aprendizado</h3>
                <p className="mt-4 text-5xl font-bold tracking-tight text-amber-500">
                  {resultado.aprendizado.toFixed(2).replace(".", ",")}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Resultado calculado a partir das proficiências.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
                <div className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 shadow-sm">
                  Indicador
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Fluxo</h3>
                <p className="mt-4 text-5xl font-bold tracking-tight text-amber-500">
                  {resultado.fluxo !== null
                    ? Number(resultado.fluxo).toFixed(2).replace(".", ",")
                    : "—"}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Calculado a partir das taxas de aprovação.
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
                <div className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 shadow-sm">
                  Referência
                </div>
                <h3 className="text-lg font-semibold text-slate-900">IDEB real 2023</h3>
                <p className="mt-4 text-5xl font-bold tracking-tight text-slate-700">
                  {idebReal !== null ? idebReal.toFixed(1).replace(".", ",") : "—"}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Resultado oficial divulgado para a escola.
                </p>
              </div>

              <div className="rounded-[28px] border border-blue-700 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 p-6 text-center text-white shadow-[0_20px_50px_rgba(37,99,235,0.28)]">
                <div className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-100">
                  Projeção principal
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">
                  IDEB simulado
                </h3>
                <p className="mt-4 text-7xl font-bold tracking-tight">
                  {resultado.idebProjetado !== null
                    ? resultado.idebProjetado.toFixed(1).replace(".", ",")
                    : "—"}
                </p>
                <p className="mt-3 text-sm text-blue-100">
                  Resultado projetado para o cenário informado.
                </p>

                {diferencaIdeb !== null && (
                  <div className="mt-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-white">
                      Δ {diferencaIdeb > 0 ? "+" : ""}
                      {diferencaIdeb.toFixed(1).replace(".", ",")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                Referências técnicas
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Base de dados e metodologia
              </h2>

              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  Os dados utilizados para preenchimento automático da escola foram
                  extraídos da divulgação oficial do Inep 2023 por escola, para{" "}
                  <strong>Anos Iniciais</strong> e <strong>Anos Finais</strong>.
                </p>

                <p>
                  As taxas de aprovação podem ser consultadas e atualizadas a partir
                  dos dados do <strong>Censo Escolar 2025</strong>, permitindo
                  simulações com base em cenários mais recentes da escola.
                </p>

                <p>
                  A simulação considera a lógica do IDEB, combinando o desempenho em{" "}
                  <strong>Língua Portuguesa</strong> e <strong>Matemática</strong> com
                  o fluxo escolar da etapa selecionada.
                </p>
              </div>
            </div>

            <div className="w-full rounded-[28px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm lg:max-w-sm">
              <div className="mb-3 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
                Informação
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Uso institucional
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Este simulador foi estruturado para uso objetivo por escolas e redes
                de ensino, com foco na projeção direta do IDEB a partir dos dados
                informados.
              </p>

              <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Observação</p>
                <p className="mt-2 leading-6">
                  O relatório em PDF mantém apresentação neutra, sem logotipo, para
                  permitir uso em diferentes escolas e contextos administrativos.
                </p>
              </div>
            </div>
          </div>
        </section>
            </div>
    </main>
  </div>
);
}