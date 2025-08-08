import { NextResponse } from 'next/server'

export async function GET() {
    const content = `
User-agent: *
Disallow: /
  `.trim()

    return new NextResponse(content, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    })
}
