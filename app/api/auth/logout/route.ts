import { destroyCmsSession } from "@/lib/cms-auth";

export async function POST() {
  await destroyCmsSession();
  return Response.json({ ok: true });
}
