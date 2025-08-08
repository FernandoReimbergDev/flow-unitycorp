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
    const { chavePedPro, chaveSitPro, chavePed, codPro, corPedPro, localProduto, localEmbalagem, quantidadeConferida } =
      await req.json();

    console.log(
      chavePedPro,
      chaveSitPro,
      chavePed,
      codPro,
      corPedPro,
      localProduto,
      localEmbalagem,
      quantidadeConferida
    );

    const cookieStore = await cookies();

    // Pega o refreshToken do cookie HttpOnly
    const refreshToken = cookieStore.get("refreshToken")?.value;
    console.log(refreshToken);

    if (!refreshToken) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    let badgeDecrypted: string;

    // Valida e decodifica JWT para obter o badge em base64
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { badge: string };

      const decipher = crypto.createDecipheriv("aes-256-cbc", BADGE_SECRET, BADGE_IV);
      let decryptedBadge = decipher.update(decoded.badge, "hex", "utf8");
      decryptedBadge += decipher.final("utf8");

      badgeDecrypted = decryptedBadge;
    } catch {
      return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
    }

    // Faz a requisição autenticada usando o badge extraído do JWT
    const requestBody = {
      tpedFollowUp: {
        chavePed: chavePed,
        descrGrupoFollowUp: DESCR_GRUPO_FOLLOWUP,
        descrFollowUp: `MATERIAL REVISADO - ${codPro} ${corPedPro}`,
        obsFollowUp: `Produto ${codPro} - Cor: ${corPedPro} - Qtd Conferida: ${quantidadeConferida}\nLocal: ${localProduto}\nAcessorios/Embalagem: ${localEmbalagem} `,
        destFollowUp: DEST_FOLLOWUP,
        feedBackFollowUp: FEEDBACK_FOLLOWUP,
        plataformaFollowUp: PLATAFORMA_FOLLOWUP,
      },
    };

    const response = await fetch(`https://api.unitycorp.com.br/producao-marcar-etapa/${chavePedPro}/${chaveSitPro}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${badgeDecrypted}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      return new NextResponse(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
