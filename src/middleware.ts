import { NextResponse, type MiddlewareConfig } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:3000",
  "https://flow.unitycorp.com.br",
  "*.unitycorp.com.br",
  "*.unitybrindes.com.br",
  "https://flow.unitycorp.com.br",
  "https://flow.unitybrindes.com.br",
  "https://flow-unitybrindes.vercel.app/",
  "https://flow-unitybrindes-xzjo.vercel.app",
];

const allowedIPs = [
  "127.0.0.1",
  "::1",
  "localhost", // se quiser cobrir casos de hostname
  "200.155.132.138",
  "177.94.212.118",
  "192.168.20.36",
];

const publicRoutes = [
  { path: "/sign-in", whenAuthenticated: "redirect" },
  { path: "/sign-out", whenAuthenticated: "next" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/sign-in";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const origin = request.headers.get("origin") || "";
  const method = request.method;
  const ip = request.headers.get("x-forwarded-for") || "IP Desconhecido";

  console.log(`[Middleware Log] ${method} - ${path} - IP: ${ip}`);

  if (!allowedIPs.includes(ip)) {
    console.warn(`[Middleware Blocked IP] ${ip}`);
    return new NextResponse("Acesso não autorizado", { status: 403 });
  }

  // 🌐 CORS origin check (dev)
  if (origin && !allowedOrigins.includes(origin)) {
    console.warn(`[Middleware Blocked Origin] ${origin}`);
    return new NextResponse("Origin Not Allowed", { status: 403 });
  }

  // 🔐 Captura o token
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // 🚪 Sempre redireciona "/" para "/produto"
  if (path === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/produto";

    // Verifica se está autenticado antes de redirecionar para /produto
    if (!refreshToken) {
      redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    }

    return NextResponse.redirect(redirectUrl);
  }

  // 🧾 Verifica se está em rota pública
  const publicRoute = publicRoutes.find((route) => route.path === path);

  if (publicRoute) {
    // Usuário autenticado tentando acessar rota pública que deve redirecionar
    if (refreshToken && publicRoute.whenAuthenticated === "redirect") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/produto";
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next(); // rota pública liberada
  }

  // 🔐 Se não tiver refresh_token, redireciona
  if (!refreshToken) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  // ✅ Passa pra rota protegida
  return NextResponse.next();
}

// Rota protegida por padrão, exceto exceções no matcher
export const config: MiddlewareConfig = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public/|assets/).*)"],
};
