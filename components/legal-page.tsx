"use client";
import { PublicFooter,PublicHeader } from "@/components/public-shell";
import { useSiteContent } from "@/hooks/use-site-content";

type LegalSection={heading:string;paragraphs:string[]};

export function LegalPage({kicker,title,intro,sections}:{kicker:string;title:string;intro:string;sections:LegalSection[]}){
  const content=useSiteContent();
  return <main className="public-site inner-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}>
    <PublicHeader content={content}/>
    <section className="legal-hero"><p>{kicker}</p><h1>{title}</h1><span>ATUALIZADO EM SETEMBRO DE 2026</span></section>
    <article className="legal-content">
      <p className="legal-intro">{intro}</p>
      {sections.map(section=><section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}</section>)}
      <p className="legal-contact">Dúvidas sobre este documento podem ser enviadas pelos canais disponíveis na página <a href="/contato">Contato</a>.</p>
    </article>
    <PublicFooter content={content}/>
  </main>;
}
