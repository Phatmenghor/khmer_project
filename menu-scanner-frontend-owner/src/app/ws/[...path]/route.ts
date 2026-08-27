import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "";

async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl;
  const url = `${BACKEND}${pathname}${search}`;

  // Forward all headers except Next.js internals
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!key.startsWith("x-middleware") && key !== "host") {
      headers.set(key, value);
    }
  });

  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body,
      // @ts-ignore — Node.js fetch supports this
      duplex: "half",
    });

    const resHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      // Don't forward encoding headers — Next.js handles its own encoding
      if (key !== "content-encoding" && key !== "transfer-encoding") {
        resHeaders.set(key, value);
      }
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    const isConnRefused =
      err?.cause?.code === "ECONNREFUSED" ||
      err?.code === "ECONNREFUSED" ||
      err?.message?.includes("ECONNREFUSED") ||
      err?.message?.includes("fetch failed");

    const status = isConnRefused ? 503 : 502;
    const message = isConnRefused
      ? "Service unavailable. The server is not reachable. Please try again later."
      : "Bad gateway. Could not connect to the backend server.";

    return NextResponse.json({ status: "error", message }, { status });
  }
}

export const GET     = proxy;
export const POST    = proxy;
export const PUT     = proxy;
export const PATCH   = proxy;
export const DELETE  = proxy;
export const OPTIONS = proxy;
