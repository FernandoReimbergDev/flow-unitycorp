import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json(
            { success: true, message: "Logout realizado com sucesso." },
            { status: 200 }
        );

        response.cookies.set("refresh_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 0,
        });

        return response;
    } catch (error) {
        console.error("Erro ao deslogar:", error);
        return NextResponse.json(
            { success: false, message: "Erro ao realizar logout." },
            { status: 500 }
        );
    }
}
