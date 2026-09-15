"use client";
import { FormEvent, useState } from "react";
import { PageHero,PublicFooter,PublicHeader } from "@/components/public-shell";
import { useSiteContent } from "@/hooks/use-site-content";

function formatPhone(value:string){
  const digits=value.replace(/\D/g,"").slice(0,11);
  if(digits.length<=2)return digits;
  if(digits.length<=6)return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if(digits.length<=10)return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

export default function Contato(){
  const content=useSiteContent();
  const [form,setForm]=useState({name:"",phone:"",email:"",message:"",company:""});
  const [status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();setStatus("sending");
    try{
      const response=await fetch("/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(form)});
      if(!response.ok)throw new Error();
      setForm({name:"",phone:"",email:"",message:"",company:""});setStatus("success");
    }catch{setStatus("error");}
  };
  return <main className="public-site inner-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}>
    <PublicHeader content={content}/>
    <PageHero kicker="05 / FALE COM A GENTE" title={content.contact.heading} imageUrl={content.brand.contactBannerUrl}/>
    <section className="contact-route">
      <aside className="contact-copy">
        <p>{content.contact.text}</p>
        <div className="contact-direct">{content.contact.whatsapp?<a href={content.contact.whatsapp} target="_blank" rel="noreferrer">WHATSAPP <span>↗</span></a>:<span>WHATSAPP EM BREVE</span>}
          {content.contact.instagram?<a href={content.contact.instagram} target="_blank" rel="noreferrer">INSTAGRAM <span>↗</span></a>:<span>INSTAGRAM EM BREVE</span>}</div>
      </aside>
      <form className="contact-form" onSubmit={submit}>
        <header><small>CONTRATAÇÃO E CONTATO</small><h2>Conte pra gente.</h2><p>Deixe seus dados e a equipe da Valete retorna o contato.</p></header>
        <div className="contact-fields">
          <label><span>NOME</span><input required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
          <label><span>TELEFONE</span><input required inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={form.phone} onChange={e=>setForm({...form,phone:formatPhone(e.target.value)})}/></label>
          <label className="full"><span>E-MAIL</span><input required type="email" maxLength={160} autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
          <label className="full"><span>MENSAGEM</span><textarea required minLength={5} maxLength={2000} rows={6} placeholder="Conte sobre o evento, data e cidade." value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label>
          <label className="contact-honeypot" aria-hidden="true"><span>Empresa</span><input tabIndex={-1} autoComplete="off" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></label>
        </div>
        <div className="contact-submit"><button type="submit" disabled={status==="sending"}>{status==="sending"?"ENVIANDO…":"ENVIAR MENSAGEM →"}</button><small>Ao enviar, você concorda com nossa <a href="/privacidade">Política de Privacidade</a>.</small></div>
        <div className="contact-feedback" aria-live="polite">{status==="success"&&<p className="success">Mensagem enviada. Em breve a gente chama você.</p>}{status==="error"&&<p className="error">Não foi possível enviar agora. Tente novamente.</p>}</div>
      </form>
    </section>
    <PublicFooter content={content}/>
  </main>;
}
