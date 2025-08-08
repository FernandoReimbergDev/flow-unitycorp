import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Logout realizado com sucesso." }, { status: 200 });

    // Limpa o cookie auth (para middleware)
    response.cookies.set("auth", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    // Limpa o cookie refreshToken (para APIs internas)
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    // Limpa o cookie userToken (para front-end)
    response.cookies.set("userToken", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Erro ao deslogar:", error);
    return NextResponse.json({ success: false, message: "Erro ao realizar logout." }, { status: 500 });
  }
}
