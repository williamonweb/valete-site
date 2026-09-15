import { createCmsSession, validateCredentials } from "@/lib/cms-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: unknown; password?: unknown; remember?: unknown };
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!validateCredentials(username, password)) {
      return Response.json({ ok: false }, { status: 401 });
    }
    await createCmsSession(body.remember === true);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "Login não configurado." }, { status: 500 });
  }
}
