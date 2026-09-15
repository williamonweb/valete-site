import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "valete_cms_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function requiredEnv(name: "CMS_USERNAME" | "CMS_PASSWORD" | "CMS_SECRET") {
  const value = process.env[name];
  if (!value) throw new Error(`Variável ${name} não configurada.`);
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", requiredEnv("CMS_SECRET")).update(payload).digest("base64url");
}

export function validateCredentials(username: string, password: string) {
  const expectedUser = Buffer.from(requiredEnv("CMS_USERNAME"));
  const expectedPassword = Buffer.from(requiredEnv("CMS_PASSWORD"));
  const receivedUser = Buffer.from(username);
  const receivedPassword = Buffer.from(password);
  return receivedUser.length === expectedUser.length &&
    receivedPassword.length === expectedPassword.length &&
    timingSafeEqual(receivedUser, expectedUser) &&
    timingSafeEqual(receivedPassword, expectedPassword);
}

export async function createCmsSession(remember = false) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : SESSION_DURATION_SECONDS;
  const expires = Math.floor(Date.now() / 1000) + maxAge;
  const payload = `${requiredEnv("CMS_USERNAME")}.${expires}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function destroyCmsSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isCmsAdmin() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [username, expiresText, receivedSignature] = parts;
  const payload = `${username}.${expiresText}`;
  const expectedSignature = Buffer.from(sign(payload));
  const signature = Buffer.from(receivedSignature);
  if (signature.length !== expectedSignature.length || !timingSafeEqual(signature, expectedSignature)) return false;
  return username === requiredEnv("CMS_USERNAME") && Number(expiresText) > Math.floor(Date.now() / 1000);
}

export async function requireCmsAdmin(redirectToLogin = false) {
  if (await isCmsAdmin()) return { displayName: requiredEnv("CMS_USERNAME") };
  if (redirectToLogin) redirect("/cms/login");
  throw new Error("UNAUTHENTICATED");
}
