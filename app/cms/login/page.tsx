"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CmsLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
        remember: form.get("remember") === "on",
      }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("Usuário ou senha incorretos.");
      return;
    }
    router.replace("/cms");
    router.refresh();
  }

  return <main className="login-page">
    <form className="login-card" onSubmit={submit}>
      <img src="/valete-logo-cropped.png" alt="Valete"/>
      <p>PAINEL DA BANDA</p>
      <h1>CMS VALETE</h1>
      <label><span>Usuário</span><input name="username" autoComplete="username" required/></label>
      <label><span>Senha</span><input name="password" type="password" autoComplete="current-password" required/></label>
      <label className="login-remember"><input name="remember" type="checkbox"/> <span>Lembrar meu acesso</span></label>
      {error && <div className="login-error">{error}</div>}
      <button type="submit" disabled={loading}>{loading ? "ENTRANDO…" : "ENTRAR"}</button>
      <small>ROCK N&apos; ROLL É NOSSO COMPROMISSO!</small>
    </form>
  </main>;
}
