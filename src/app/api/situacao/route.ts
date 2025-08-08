import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { JWT_REFRESH_SECRET, BADGE_SECRET, BADGE_IV } from "../../utils/env";

export async function PUT(req: NextRequest) {
  try {
    const { chavePedPro, chaveSitPro } = await req.json();
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    let badgeDecrypted: string;

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { badge: string };

      const decipher = crypto.createDecipheriv("aes-256-cbc", BADGE_SECRET, BADGE_IV);
      let decryptedBadge = decipher.update(decoded.badge, "hex", "utf8");
      decryptedBadge += decipher.final("utf8");

      badgeDecrypted = decryptedBadge;
    } catch {
      return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });
    }

    // badgeDecrypted é seu base64 original agora seguro
    const response = await fetch(`https://api.unitycorp.com.br/producao-marcar-etapa/${chavePedPro}/${chaveSitPro}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${badgeDecrypted}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
