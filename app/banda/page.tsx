"use client";
import { PageHero,PublicFooter,PublicHeader } from "@/components/public-shell";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger } from "@/components/ui/dialog";
import { useSiteContent } from "@/hooks/use-site-content";
import { AudioLines,Camera,Drum,Guitar,MicVocal } from "lucide-react";
import styles from "./banda.module.css";

function MemberSymbol({id,role,iconUrl}:{id:string;role:string;iconUrl:string}){
  if(iconUrl)return <img src={iconUrl} alt=""/>;
  if(id==="william"||role.toLowerCase().includes("voz"))return <MicVocal aria-hidden="true"/>;
  if(id==="rodrigo"||role.toLowerCase().includes("bateria"))return <Drum aria-hidden="true"/>;
  if(id==="aurelio"||role.toLowerCase().includes("baixo"))return <AudioLines aria-hidden="true"/>;
  return <Guitar aria-hidden="true"/>;
}

export default function Banda(){
  const content=useSiteContent();
  return <main className="public-site inner-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}><PublicHeader content={content}/><PageHero kicker="01 / A BANDA" title={content.about.heading} imageUrl={content.brand.aboutBannerUrl}/><section className="about-route"><p>{content.about.text}</p></section><section className="member-lineup" aria-label="Integrantes da Valete">{content.members.map((m,i)=><Dialog key={m.id}><DialogTrigger asChild><button className="member-card" aria-label={`Conheça ${m.name}`}><div className="member-card-photo">{m.imageUrl?<img src={m.imageUrl} alt={m.name}/>:<><strong>{m.name[0]}</strong><span>FOTO EM BREVE</span></>}<div className="member-symbol"><MemberSymbol id={m.id} role={m.role} iconUrl={m.iconUrl}/></div></div><div className="member-card-caption"><small>0{i+1} · {m.role}</small><h2>{m.name}</h2><span>CONHEÇA A HISTÓRIA →</span></div></button></DialogTrigger><DialogContent className="member-modal"><div className="member-modal-photo">{m.imageUrl?<img src={m.imageUrl} alt={m.name}/>:<strong>{m.name[0]}</strong>}<div className="member-symbol"><MemberSymbol id={m.id} role={m.role} iconUrl={m.iconUrl}/></div></div><div className="member-modal-copy"><DialogHeader><small>{m.role}</small><DialogTitle>{m.name}</DialogTitle><DialogDescription>A história de {m.name} na música e na Valete.</DialogDescription></DialogHeader><p>{m.bio}</p><MemberFacts member={m}/>{m.instagramUrl&&<a className="member-instagram" href={m.instagramUrl} target="_blank" rel="noreferrer"><Camera aria-hidden="true"/> INSTAGRAM DE {m.name} <span>↗</span></a>}</div></DialogContent></Dialog>)}</section><PublicFooter content={content}/></main>;
}

function MemberFacts({member}:{member:{favoriteBand:string;inspirations:string;hobby:string;favoriteSong:string}}){
  const facts=[["BANDA FAVORITA",member.favoriteBand],["INFLUÊNCIAS",member.inspirations],["HOBBY",member.hobby],["MÚSICA QUE MARCOU",member.favoriteSong]].filter(([,value])=>value);
  if(!facts.length)return null;
  return <dl className={styles.facts}>{facts.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
