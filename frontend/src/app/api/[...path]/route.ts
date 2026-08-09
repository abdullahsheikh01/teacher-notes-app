import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

type Ctx = { params: Promise<{ path: string[] }> };

async function forward(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const target = `${BACKEND_URL}/api/${path.join("/")}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  const upstream = await fetch(target, init);

  const resHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) resHeaders.set("content-type", upstreamContentType);

  return new Response(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  return forward(req, ctx);
}
