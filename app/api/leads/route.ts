import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const nome = body.nome?.trim() || body.nomeResponsavel?.trim();
    const email = body.email?.trim() || null;
    const telefone = body.telefone?.trim() || body.whatsapp?.trim() || null;
    const escola = body.escola?.trim() || null;
    const municipio = body.municipio?.trim() || null;
    const uf = body.uf?.trim() || null;
    const mensagem = body.mensagem?.trim() || null;
    const origem = "site";

    if (!nome) {
      return NextResponse.json(
        { ok: false, error: "Nome é obrigatório." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("leads").insert([
      {
        nome,
        email,
        telefone,
        escola,
        municipio,
        uf,
        mensagem,
        origem,
      },
    ]);

    if (error) {
      console.error("Erro ao salvar lead no Supabase:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao salvar lead no banco." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao salvar lead:", error);
    return NextResponse.json(
      { ok: false, error: "Erro ao salvar lead." },
      { status: 500 }
    );
  }
}