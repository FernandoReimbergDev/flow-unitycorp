import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_REFRESH_SECRET } from "../../utils/env";

export async function GET() {
    const cookieStore = cookies(); // não precisa de await
    const refreshToken = (await cookieStore).get('refresh_token')?.value;

    if (!refreshToken) {
        return Response.json({}, { status: 204 });
    }

    try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
            username: string;
        };

        const newAccessToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '15m',
        });

        return Response.json({ accessToken: newAccessToken });
    } catch {
        return Response.json(
            { error: 'Token inválido ou expirado' },
            { status: 403 }
        );
    }
}
