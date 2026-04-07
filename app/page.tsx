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
          novasTaxas[ano as keyof TaxasAprovacaoPorAno] = String(valor).replace(
            ".",
            ","
          );
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

    const escola = escolas.find(
      (item) => getCodigoEscola(item) === String(codigo)
    );

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
  if (!relatorioRef.current) return;
  if (!resultado) return;

  setModoRelatorio(true);
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const canvas = await html2canvas(relatorioRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f8fafc",
      logging: false,
      onclone: (doc) => {
        const clonedBody = doc.body;

        if (clonedBody) {
          clonedBody.style.background = "#f8fafc";
          clonedBody.style.color = "#0f172a";
        }

        const corInvalida = (valor: string) =>
          !valor ||
          valor.includes("lab(") ||
          valor.includes("oklab(") ||
          valor.includes("oklch(");

        const allElements = doc.querySelectorAll("*");

        allElements.forEach((el) => {
          const element = el as HTMLElement;
          const style = window.getComputedStyle(element);

          const color = style.color;
          const backgroundColor = style.backgroundColor;
          const borderTopColor = style.borderTopColor;
          const borderRightColor = style.borderRightColor;
          const borderBottomColor = style.borderBottomColor;
          const borderLeftColor = style.borderLeftColor;

          // Preserva cores válidas
          element.style.color = !corInvalida(color) ? color : "#0f172a";

          element.style.backgroundColor = !corInvalida(backgroundColor)
            ? backgroundColor
            : "transparent";

          element.style.borderTopColor = !corInvalida(borderTopColor)
            ? borderTopColor
            : "#cbd5e1";

          element.style.borderRightColor = !corInvalida(borderRightColor)
            ? borderRightColor
            : "#cbd5e1";

          element.style.borderBottomColor = !corInvalida(borderBottomColor)
            ? borderBottomColor
            : "#cbd5e1";

          element.style.borderLeftColor = !corInvalida(borderLeftColor)
            ? borderLeftColor
            : "#cbd5e1";
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    const nomeArquivo = dados.nomeEscola
      ? `simulacao-ideb-${dados.nomeEscola.toLowerCase().replace(/\s+/g, "-")}.pdf`
      : "simulacao-ideb.pdf";

    pdf.save(nomeArquivo);
  } finally {
    setModoRelatorio(false);
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div ref={relatorioRef} className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            {modoRelatorio
              ? "Relatório de Projeção do IDEB"
              : "Simulador de Aprendizagem e IDEB"}
          </h1>
          <p className="mt-2 text-slate-600">
            {modoRelatorio
              ? "Documento gerado automaticamente a partir da simulação registrada na plataforma."
              : "Informe a etapa de ensino, selecione a escola e ajuste as proficiências e taxas de aprovação para simular o IDEB."}
          </p>

          {modoRelatorio && (
            <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-4">
              <div>
                <span className="font-semibold text-slate-900">Escola:</span>{" "}
                {dados.nomeEscola || "—"}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Etapa:</span>{" "}
                {dados.etapaEnsino}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Município:</span>{" "}
                {municipioSelecionado || "—"}
              </div>
              <div>
                <span className="font-semibold text-slate-900">UF:</span>{" "}
                {ufSelecionada || "—"}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Rede:</span>{" "}
                {redeSelecionada || "—"}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Data:</span>{" "}
                {formatarDataAtual()}
              </div>
            </div>
          )}
        </div>

        {!modoRelatorio && (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-slate-900">
              Dados para simulação
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Etapa de ensino
                </label>
                <select
                  value={dados.etapaEnsino}
                  onChange={(e) => handleEtapa(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="Anos Iniciais">Anos Iniciais (1º ao 5º)</option>
                  <option value="Anos Finais">Anos Finais (6º ao 9º)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Estado (UF)
                </label>
                <select
                  value={ufSelecionada}
                  onChange={(e) => {
                    setUfSelecionada(e.target.value);
                    setMunicipioSelecionado("");
                    setRedeSelecionada("");
                    limparDadosEscola();
                    setErros([]);
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Município
                </label>
                <select
                  value={municipioSelecionado}
                  onChange={(e) => {
                    setMunicipioSelecionado(e.target.value);
                    setRedeSelecionada("");
                    limparDadosEscola();
                    setErros([]);
                  }}
                  disabled={!ufSelecionada}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Rede
                </label>
                <select
                  value={redeSelecionada}
                  onChange={(e) => {
                    setRedeSelecionada(e.target.value);
                    limparDadosEscola();
                    setErros([]);
                  }}
                  disabled={!municipioSelecionado}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Escola
                </label>

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
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
                />

                {mostrarListaEscolas &&
                  municipioSelecionado &&
                  escolasFiltradas.length > 0 && (
                    <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                      {escolasFiltradas.map((escola) => (
                        <button
                          key={getCodigoEscola(escola)}
                          type="button"
                          onClick={() =>
                            handleSelecionarEscola(getCodigoEscola(escola))
                          }
                          className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50"
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
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-lg">
                      Nenhuma escola encontrada.
                    </div>
                  )}
              </div>
            </div>

            {dados.nomeEscola && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                📊 Os dados da escola foram carregados automaticamente com base no
                Inep 2023. As taxas de aprovação podem ser obtidas no Censo Escolar
                2025. Você pode alterar os valores abaixo para simular novos
                cenários.
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Proficiência em Língua Portuguesa
                </label>
                <input
                  type="number"
                  value={dados.proficienciaLP || ""}
                  onChange={(e) => handleNumero("proficienciaLP", e.target.value)}
                  placeholder="Ex.: 220"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Proficiência em Matemática
                </label>
                <input
                  type="number"
                  value={dados.proficienciaMT || ""}
                  onChange={(e) => handleNumero("proficienciaMT", e.target.value)}
                  placeholder="Ex.: 235"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-base font-semibold text-slate-800">
  Taxas de aprovação por ano/série (%)
</h3>

              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {anosDaEtapa.map((ano) => (
                  <div key={ano}>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {ano}º ano:
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={dados.taxasAprovacao[ano as keyof TaxasAprovacaoPorAno]}
                      onChange={(e) => handleTaxaAno(ano, e.target.value)}
                      placeholder="Ex.: 98,5"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-slate-500"
                    />
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm text-slate-500">
                As taxas de aprovação podem ser consultadas no Censo Escolar 2025.
                Se a escola não tiver esses dados, deixe os campos em branco. Nesse
                caso, o sistema calculará apenas o aprendizado.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCalcular}
                className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
              >
                Calcular
              </button>

              <button
                type="button"
                onClick={handleLimpar}
                className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-100"
              >
                Limpar
              </button>

              <button
                type="button"
                onClick={handleGerarPDF}
                disabled={!resultado}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Gerar PDF
              </button>
            </div>

            {erros.length > 0 && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                <h3 className="mb-2 font-semibold text-red-700">
                  Verifique os dados:
                </h3>
                <ul className="list-disc pl-5 text-sm text-red-600">
                  {erros.map((erro, index) => (
                    <li key={index}>{erro}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {resultado && (
  <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
    <h2 className="mb-6 text-xl font-semibold text-slate-900">
      {modoRelatorio
        ? `Resumo da projeção — ${dados.etapaEnsino}`
        : `Resultado da simulação — ${dados.etapaEnsino}`}
    </h2>

    {modoRelatorio && (
      <div
        className="mb-6 grid gap-3 rounded-2xl p-4 text-sm"
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <div><strong>Escola:</strong> {dados.nomeEscola || "—"}</div>
        <div><strong>Município:</strong> {municipioSelecionado || "—"}</div>
        <div><strong>UF:</strong> {ufSelecionada || "—"}</div>
        <div><strong>Rede:</strong> {redeSelecionada || "—"}</div>
        <div><strong>Data:</strong> {new Date().toLocaleDateString("pt-BR")}</div>
      </div>
    )}

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {/* APRENDIZADO */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
        }}
      >
        <h3 className="text-2xl font-semibold text-black">Aprendizado</h3>
        <p className="mt-3 text-5xl font-bold" style={{ color: "#eab308" }}>
          {resultado.aprendizado.toFixed(2).replace(".", ",")}
        </p>
        <p className="mt-4 text-base text-slate-500">
          Resultado calculado a partir das proficiências.
        </p>
      </div>

      {/* FLUXO */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
        }}
      >
        <h3 className="text-2xl font-semibold text-black">Fluxo</h3>
        <p className="mt-3 text-5xl font-bold" style={{ color: "#eab308" }}>
          {resultado.fluxo !== null
            ? Number(resultado.fluxo).toFixed(2).replace(".", ",")
            : "—"}
        </p>
        <p className="mt-4 text-base text-slate-500">
          Calculado a partir das taxas de aprovação.
        </p>
      </div>

      {/* IDEB REAL */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
        }}
      >
        <h3 className="text-2xl font-semibold text-black">
          IDEB real 2023
        </h3>
        <p className="mt-3 text-5xl font-bold" style={{ color: "#334155" }}>
          {idebReal !== null ? idebReal.toFixed(1).replace(".", ",") : "—"}
        </p>
        <p className="mt-4 text-base text-slate-500">
          Resultado oficial do Inep.
        </p>
      </div>

      {/* IDEB SIMULADO */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
        }}
      >
        <h3 className="text-2xl font-semibold text-black">
          IDEB simulado
        </h3>

        <p className="mt-3 text-5xl font-bold" style={{ color: "#f97316" }}>
          {resultado.idebProjetado !== null
            ? resultado.idebProjetado.toFixed(1).replace(".", ",")
            : "—"}
        </p>

        <p className="mt-4 text-base text-slate-500">
          Resultado projetado.
        </p>

        {diferencaIdeb !== null && (
          <p
            className="mt-3 text-sm font-semibold"
            style={{
              color: diferencaIdeb >= 0 ? "#16a34a" : "#dc2626",
            }}
          >
            Δ {diferencaIdeb > 0 ? "+" : ""}
            {diferencaIdeb.toFixed(1).replace(".", ",")}
          </p>
        )}
      </div>

    </div>
  </section>
)}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                Referências técnicas
              </div>

              <h2 className="text-xl font-semibold text-slate-900">
                Base de dados e metodologia
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  Os dados utilizados para preenchimento automático da escola foram
                  extraídos da divulgação oficial do Inep 2023 por escola, para
                  <strong> Anos Iniciais </strong>e<strong> Anos Finais</strong>.
                </p>

                <p>
                  As taxas de aprovação podem ser consultadas e atualizadas a partir
                  dos dados do <strong>Censo Escolar 2025</strong>, permitindo
                  simulações com base em cenários mais recentes da escola.
                </p>

                <p>
                  A simulação considera a lógica do IDEB, combinando o desempenho em
                  <strong> Língua Portuguesa </strong>e
                  <strong> Matemática </strong>com o fluxo escolar da etapa
                  selecionada.
                </p>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-blue-100 bg-blue-50 p-5 lg:max-w-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Créditos
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Paulo Alex
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Desenvolvimento do simulador de Aprendizagem e IDEB.
              </p>

              <div className="mt-4 border-t border-blue-100 pt-4 text-sm text-slate-700">
                <p className="font-medium text-slate-800">Contato</p>
                <p className="mt-1">pauloalex.alves17@gmail.com</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}