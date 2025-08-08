import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { JWT_SECRET, JWT_REFRESH_SECRET, BADGE_SECRET, BADGE_IV } from "../../utils/env";

export async function POST(req: NextRequest) {
  const regex = /^\d{3}[^a-zA-Z0-9\s]{1}\d{3}$/;

  try {
    const { key } = await req.json();
    console.log(key);

    if (!regex.test(key) || !key || key.length <= 4) {
      return NextResponse.json({ error: "Badge inválido." }, { status: 400 });
    }

    const [username, password] = key.split("}");
    const encoded = Buffer.from(`${username}:${password}`).toString("base64");

    const response = await fetch("https://api.unitycorp.com.br/producao-login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${encoded}` },
    });

    const data = await response.json();

    if (response.ok) {
      const payload = { name: data.result.nomeUsuario, image: data.result.foto };
      const cipher = crypto.createCipheriv("aes-256-cbc", BADGE_SECRET, BADGE_IV);
      let encryptedBadge = cipher.update(encoded, "utf8", "hex");
      encryptedBadge += cipher.final("hex");
      const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1m" });
      const refreshToken = jwt.sign(
        {
          username,
          badge: encryptedBadge,
          name: data.result.nomeUsuario,
          image: data.result.foto,
        },
        JWT_REFRESH_SECRET,
        { expiresIn: "2m" }
      );
      const response = NextResponse.json({ success: true, accessToken, user: payload }, { status: 200 });

      response.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 2,
      });

      return response;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    return NextResponse.json({ error: "Erro interno - next" }, { status: 500 });
  }
}
