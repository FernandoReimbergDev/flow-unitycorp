import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_REFRESH_SECRET } from '../../utils/env';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('refresh_token')?.value;

    if (!token) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as {
            name: string;
            image: string;
            username: string;
        };

        const user = {
            name: decoded.name,
            image: decoded.image,
            username: decoded.username,
        };

        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ user: null }, { status: 403 });
    }
}
