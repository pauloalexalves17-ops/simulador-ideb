import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Lead recebido:", body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao salvar lead:", error);

    return NextResponse.json(
      { ok: false, error: "Erro ao salvar lead." },
      { status: 500 }
    );
  }
}