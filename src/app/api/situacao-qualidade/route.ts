import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import {
  JWT_REFRESH_SECRET,
  BADGE_SECRET,
  BADGE_IV,
  DESCR_GRUPO_FOLLOWUP,
  DEST_FOLLOWUP,
  FEEDBACK_FOLLOWUP,
  PLATAFORMA_FOLLOWUP,
} from "../../utils/env";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[PUT /situacao] Body recebido:", body);

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      console.warn("[PUT /situacao] Sem refreshToken no cookie");
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    let badgeDecrypted: string;

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { badge: string };

      const decipher = crypto.createDecipheriv("aes-256-cbc", BADGE_SECRET, BADGE_IV);
      let decryptedBadge = decipher.update(decoded.badge, "hex", "utf8");
      decryptedBadge += decipher.final("utf8");
      badgeDecrypted = decryptedBadge;
    } catch (e) {
      console.error("[PUT /situacao] Falha ao verificar/decodificar refreshToken:", e);
      return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
    }

    const requestBody = {
      tpedFollowUp: {
        chavePed: body.chavePed,
        descrGrupoFollowUp: DESCR_GRUPO_FOLLOWUP,
        descrFollowUp: `MATERIAL REVISADO - ${body.codPro} ${body.corPedPro}`,
        obsFollowUp: `Produto ${body.codPro} - Cor: ${body.corPedPro} - Qtd Conferida: ${body.quantidadeConferida}\nLocal: ${body.localProduto}\nAcessorios/Embalagem: ${body.localEmbalagem} `,
        destFollowUp: DEST_FOLLOWUP,
        feedBackFollowUp: FEEDBACK_FOLLOWUP,
        plataformaFollowUp: PLATAFORMA_FOLLOWUP,
      },
    };

    console.log("[PUT /situacao] Body enviado para API externa:", requestBody);

    const response = await fetch(
      `https://api.unitycorp.com.br/producao-marcar-etapa/${body.chavePedPro}/${body.chaveSitPro}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${badgeDecrypted}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const contentType = response.headers.get("content-type");
    const payload = contentType?.includes("application/json") ? await response.json() : await response.text();

    console.log("[PUT /situacao] Resposta API externa:", response.status, payload);

    if (!response.ok) {
      return NextResponse.json({ status: response.status, payload }, { status: response.status });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("[PUT /situacao] Erro interno:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
