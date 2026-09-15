"use client";
import { PageHero,PublicFooter,PublicHeader } from "@/components/public-shell";
import { useSiteContent } from "@/hooks/use-site-content";
export default function Agenda(){
  const content=useSiteContent();const upcoming=content.shows.filter(s=>s.status==="upcoming");const past=content.shows.filter(s=>s.status==="past");
  return <main className="public-site inner-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}><PublicHeader content={content}/><PageHero kicker="02 / NA ESTRADA" title="AGENDA"/><section className="agenda-route"><ShowGroup title="PRÓXIMOS SHOWS" items={upcoming} empty="Novas datas em breve."/><ShowGroup title="JÁ PASSAMOS POR AQUI" items={past}/></section><PublicFooter content={content}/></main>;
}
function ShowGroup({title,items,empty}:{title:string;items:{id:string;date:string;place:string;city:string;note:string}[];empty?:string}){return <div className="show-group"><h2>{title}</h2>{!items.length&&<p className="empty-state">{empty}</p>}{items.map(s=><article key={s.id}><time>{s.date}</time><div><h3>{s.place}</h3><p>{s.note}</p></div><strong>{s.city}</strong></article>)}</div>;}
