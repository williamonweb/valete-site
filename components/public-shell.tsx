"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SiteContent } from "@/lib/site-content";

const links=[["/","Início"],["/banda","A banda"],["/agenda","Agenda"],["/musica","Música"],["/videos","Vídeos"],["/fotos","Fotos"],["/contato","Contato"]];

export function PublicHeader({content}:{content:SiteContent}){
  const path=usePathname();const [open,setOpen]=useState(false);
  return <header className="site-header">
    <a className="site-logo" href="/" target="_self"><img src={content.brand.logoUrl} alt="Valete"/></a>
    <div className="site-tools">
      <nav className={open?"site-nav open":"site-nav"}>{links.map(([href,label])=><a key={href} className={path===href?"active":""} href={href} target="_self" onClick={()=>setOpen(false)}>{label}</a>)}</nav>
      <a className="cms-button" href="/cms" target="_self">CMS</a>
      <button className="site-menu" onClick={()=>setOpen(!open)} aria-expanded={open}>{open?"FECHAR":"MENU"}</button>
    </div>
  </header>;
}

export function PublicFooter({content}:{content:SiteContent}){
  return <footer className="site-footer">
    <div className="footer-top">
      <a className="footer-brand" href="/" target="_self"><img src={content.brand.logoUrl} alt="Valete"/></a>
      <div className="footer-signature"><p>{content.brand.tagline}</p><small>GRAVATAÍ · RIO GRANDE DO SUL</small></div>
      <nav className="footer-links" aria-label="Navegação do rodapé"><a href="/agenda" target="_self">Agenda</a><a href="/videos" target="_self">Vídeos</a><a href="/fotos" target="_self">Fotos</a><a href="/contato" target="_self">Contrate a banda</a><a href="/cms" target="_self">Painel</a></nav>
    </div>
    <div className="footer-bottom">
      <p>© 2026 VALETE. TODOS OS DIREITOS RESERVADOS.</p>
      <a className="forge-credit" href="https://forgelabss.com.br" target="_blank" rel="noreferrer">CRIADO POR <strong>FORGE LABS</strong> ↗</a>
      <nav className="footer-legal" aria-label="Informações legais"><a href="/termos" target="_self">Termos de Uso</a><a href="/privacidade" target="_self">Política de Privacidade</a></nav>
    </div>
  </footer>;
}

export function PageHero({kicker,title}:{kicker:string;title:string}){
  return <section className="page-hero"><p>{kicker}</p><h1>{title}</h1><span aria-hidden="true">VALETE</span></section>;
}
