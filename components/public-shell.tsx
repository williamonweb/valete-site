"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SiteContent } from "@/lib/site-content";

const links=[["/","Início"],["/banda","A banda"],["/agenda","Agenda"],["/musica","Música"],["/videos","Vídeos"],["/fotos","Fotos"],["/camisetas","Camisetas"],["/contato","Contato"]];

export function PublicHeader({content}:{content:SiteContent}){
  const path=usePathname();const [open,setOpen]=useState(false);
  return <header className="site-header">
    <Link className="site-logo" href="/"><img src={content.brand.logoUrl} alt="Valete"/></Link>
    <div className="site-tools">
      <nav className={open?"site-nav open":"site-nav"}>{links.map(([href,label])=><Link key={href} className={path===href?"active":""} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}</nav>
      <a className="cms-button" href="/cms" target="_self">CMS</a>
      <button className="site-menu" onClick={()=>setOpen(!open)} aria-expanded={open}>{open?"FECHAR":"MENU"}</button>
    </div>
  </header>;
}

export function PublicFooter({content}:{content:SiteContent}){
  return <footer className="site-footer">
    <div className="footer-top">
      <Link className="footer-brand" href="/"><img src={content.brand.logoUrl} alt="Valete"/></Link>
      <div className="footer-signature"><p>{content.brand.tagline}</p><small>GRAVATAÍ · RIO GRANDE DO SUL</small></div>
      <nav className="footer-links" aria-label="Navegação do rodapé"><Link href="/agenda">Agenda</Link><Link href="/videos">Vídeos</Link><Link href="/fotos">Fotos</Link><Link href="/camisetas">Camisetas</Link><Link href="/contato">Contrate a banda</Link><a href="/cms" target="_self">Painel</a></nav>
    </div>
    <div className="footer-bottom">
      <p>© 2026 VALETE. TODOS OS DIREITOS RESERVADOS.</p>
      <a className="forge-credit" href="https://forgelabss.com.br" target="_blank" rel="noreferrer">CRIADO POR <strong>FORGE LABS</strong> ↗</a>
      <nav className="footer-legal" aria-label="Informações legais"><Link href="/termos">Termos de Uso</Link><Link href="/privacidade">Política de Privacidade</Link></nav>
    </div>
  </footer>;
}

export function PageHero({kicker,title,imageUrl=""}:{kicker:string;title:string;imageUrl?:string}){
  return <section className={imageUrl?"page-hero has-banner":"page-hero"}>{imageUrl&&<img src={imageUrl} alt=""/>}<p>{kicker}</p><h1>{title}</h1></section>;
}
