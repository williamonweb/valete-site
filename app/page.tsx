"use client";
import { IntroAnimation } from "@/components/intro-animation";
import { PublicFooter,PublicHeader } from "@/components/public-shell";
import { useSiteContent } from "@/hooks/use-site-content";

export default function Home(){
  const content=useSiteContent();
  return <main className="public-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}>
    <IntroAnimation logo={content.brand.logoUrl}/>
    <PublicHeader content={content}/>
    <section className={content.brand.heroImageUrl?"home-hero has-banner":"home-hero"} style={content.brand.heroImageUrl?{backgroundImage:`linear-gradient(90deg,rgba(0,0,0,.9) 0%,rgba(0,0,0,.55) 46%,rgba(0,0,0,.1) 100%),url("${content.brand.heroImageUrl}")`}:undefined}>
      <div className="home-copy">
        <p className="hero-kicker">{content.brand.city}</p>
        <h1>{content.brand.heroTitle}</h1>
        <p className="hero-subtitle">{content.brand.heroText}</p>
        <div className="home-actions"><a className="rock-button" href="/agenda" target="_self">VER AGENDA <span>↗</span></a><a className="text-link" href="/contato" target="_self">CONTRATE A VALETE →</a></div>
      </div>
      {!content.brand.heroImageUrl&&<div className="banner-empty"><strong>FOTO DA BANDA</strong><span>Adicione pelo painel CMS</span></div>}
      <div className="home-rail"><span>ROCK NACIONAL</span><b>✦</b><span>ANOS 2000</span><b>✦</b><span>CLÁSSICOS PESADOS</span></div>
    </section>
    <PublicFooter content={content}/>
  </main>;
}
