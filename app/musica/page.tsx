"use client";
import { PageHero,PublicFooter,PublicHeader } from "@/components/public-shell";
import { useSiteContent } from "@/hooks/use-site-content";

export default function Musica(){
  const content=useSiteContent();
  return <main className="public-site inner-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}><PublicHeader content={content}/><PageHero kicker="03 / O SOM" title="MÚSICA"/><section className="music-route"><div className="record"><span>{content.music.label}</span><div className="record-groove"><b>V</b></div><small>VALETE</small></div><div className="music-copy"><p>{content.music.label}</p><h2>{content.music.title}</h2><div>{content.music.description}</div></div></section><section className="repertoire-route"><small>NO REPERTÓRIO</small><p>{content.music.repertoire}</p></section><PublicFooter content={content}/></main>;
}
