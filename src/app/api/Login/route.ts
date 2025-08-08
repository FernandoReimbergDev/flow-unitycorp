import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { JWT_SECRET, JWT_REFRESH_SECRET, BADGE_SECRET, BADGE_IV } from "../../utils/env";

export async function POST(req: NextRequest) {
  const regex = /^\d{3}[^a-zA-Z0-9\s]{1}\d{3}$/;

  try {
    const { key } = await req.json();
    console.log(`[Login API] Tentativa de login com key: ${key}`);

    if (!regex.test(key) || !key || key.length <= 4) {
      console.warn(`[Login API] Badge inválido: ${key}`);
      return NextResponse.json({ error: "Badge inválido." }, { status: 400 });
    }

    const [username, password] = key.split("}");
    const encoded = Buffer.from(`${username}:${password}`).toString("base64");

    const apiResponse = await fetch("https://api.unitycorp.com.br/producao-login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${encoded}` },
    });

    // 🔐 Garante que a resposta seja JSON antes de chamar .json()
    let data: any = null;
    const contentType = apiResponse.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await apiResponse.json();
    } else {
      const raw = await apiResponse.text();
      console.warn("[Login API] Resposta externa inválida ou vazia:", raw);
      return NextResponse.json({ error: "Resposta inválida da API externa", raw }, { status: 502 });
    }

    if (apiResponse.ok) {
      // Validação dos dados retornados
      if (!data.result?.nomeUsuario || !data.result?.foto) {
        console.error(`[Login API] Dados inválidos da API externa:`, data);
        return NextResponse.json({ error: "Dados de usuário inválidos." }, { status: 500 });
      }

      const user = {
        name: data.result.nomeUsuario,
        image: data.result.foto,
        username: username,
      };

      // Token leve para o middleware (1 minuto)
      const accessToken = jwt.sign({ name: user.name, image: user.image }, JWT_SECRET, { expiresIn: "1m" });

      // Token completo criptografado para APIs internas (2 minutos)
      const cipher = crypto.createCipheriv("aes-256-cbc", BADGE_SECRET, BADGE_IV);
      let encryptedBadge = cipher.update(encoded, "utf8", "hex");
      encryptedBadge += cipher.final("hex");

      const refreshToken = jwt.sign(
        {
          username,
          badge: encryptedBadge,
          name: user.name,
          image: user.image,
        },
        JWT_REFRESH_SECRET,
        { expiresIn: "2m" }
      );

      // Token para o front-end com dados do usuário (2 minutos)
      const userToken = jwt.sign(
        {
          name: user.name,
          image: user.image,
          username: user.username,
        },
        JWT_SECRET,
        { expiresIn: "2m" }
      );

      // Troca para garantir que cookies sejam setados corretamente
      const res = new NextResponse(JSON.stringify({ success: true, accessToken, user }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

      // Cookie para middleware (token leve)
      res.cookies.set("auth", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 1, // 1 minuto
        sameSite: "lax",
      });

      // Cookie criptografado para APIs internas
      res.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 2, // 2 minutos
        sameSite: "lax",
      });

      // Cookie para o front-end com dados do usuário
      res.cookies.set("userToken", userToken, {
        httpOnly: false, // Pode ser lido pelo JavaScript
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 2, // 2 minutos
        sameSite: "lax",
      });

      console.log(`[Login API] Login bem-sucedido para usuário: ${user.name}`);
      return res;
    }

    console.warn(`[Login API] Falha na autenticação:`, data);
    return NextResponse.json(data, { status: apiResponse.status });
  } catch (err) {
    console.error(`[Login API] Erro interno:`, err);
    return NextResponse.json({ error: "Erro interno do servidor", details: String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método GET não permitido" }, { status: 405 });
}
