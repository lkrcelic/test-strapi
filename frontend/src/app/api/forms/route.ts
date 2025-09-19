import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN;

// POST /api/forms
// Body: { name: string; email: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name: string | undefined = body.name ?? body.Name;  
    const email: string | undefined = body.email ?? body.Email;

    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }

    // Debug: show whether we have a token (do not log the token itself)
    console.log("[forms API] Forwarding to Strapi", {
      url: `${STRAPI_URL}/api/forms`,
      hasToken: Boolean(STRAPI_TOKEN),
    });

    const res = await fetch(`${STRAPI_URL}/api/forms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        data: {
          // Match your Strapi attribute names exactly (case-sensitive): Name, Email
          Name: name,
          Email: email,
        },
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      // Surface Strapi's error body to the client for easier debugging
      return NextResponse.json(
        data ?? { error: "Failed to create form" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unexpected error" }, { status: 500 });
  }
}
