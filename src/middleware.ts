import { NextResponse, type MiddlewareConfig } from "next/server";
import type { NextRequest } from "next/server";

// Origens permitidas (CORS em dev)
const allowedOrigins = [
  "http://localhost:3000",
  "https://flow.unitycorp.com.br",
  "*.unitycorp.com.br",
  "*.unitybrindes.com.br",
  "https://flow.unitybrindes.com.br",
  "https://flow-unitybrindes.vercel.app/",
  "https://flow-unitybrindes-xzjo.vercel.app",
];

// IPs permitidos (usado somente em produção agora)
// const allowedIPs = [
//   "127.0.0.1",
//   "::1",
//   "localhost",
//   "200.155.132.138",
//   "177.94.212.118",
//   "192.168.20.36",
//   "165.232.158.219",
//   "64.23.255.79",
// ];

// Rotas públicas e comportamentos
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

  // Verificação de IPs - somente em produção
  // if (process.env.NODE_ENV === "production") {
  //   if (!allowedIPs.includes(ip)) {
  //     console.warn(`[Middleware Blocked IP] ${ip}`);
  //     return new NextResponse("Acesso não autorizado", { status: 403 });
  //   }
  // }

  // Verificação de origem - somente se origin estiver presente
  if (origin && !allowedOrigins.includes(origin)) {
    console.warn(`[Middleware Blocked Origin] ${origin}`);
    return new NextResponse("Origin Not Allowed", { status: 403 });
  }

  // Captura do cookie correto gerado pela API de login
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Redireciona "/" para "/produto", se autenticado
  if (path === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = refreshToken ? "/produto" : REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  // Rota pública
  const publicRoute = publicRoutes.find((route) => route.path === path);

  if (publicRoute) {
    if (refreshToken && publicRoute.whenAuthenticated === "redirect") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/produto";
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Rota protegida, mas sem refreshToken => redireciona
  if (!refreshToken) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Define quais rotas passam pelo middleware
export const config: MiddlewareConfig = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public/|assets/).*)"],
};
