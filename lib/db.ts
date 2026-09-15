import { neon } from "@neondatabase/serverless";

export function sql() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL não configurada.");
  return neon(value);
}
