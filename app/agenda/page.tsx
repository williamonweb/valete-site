"use client";
import { PageHero,PublicFooter,PublicHeader } from "@/components/public-shell";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger } from "@/components/ui/dialog";
import { useSiteContent } from "@/hooks/use-site-content";
import { Show,showDateLabel,showStatus } from "@/lib/site-content";
import { CalendarDays,Clock,MapPin } from "lucide-react";
export default function Agenda(){
  const content=useSiteContent();
  const upcoming=content.shows.filter(s=>showStatus(s)==="upcoming").sort(sortUpcoming);
  const past=content.shows.filter(s=>showStatus(s)==="past").sort(sortPast);
  return <main className="public-site inner-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}><PublicHeader content={content}/><PageHero kicker="02 / NA ESTRADA" title="AGENDA"/><section className="agenda-route"><ShowGroup title="PRÓXIMOS SHOWS" items={upcoming} empty="Novas datas em breve."/><ShowGroup title="ÚLTIMOS SHOWS" items={past}/></section><PublicFooter content={content}/></main>;
}
function sortUpcoming(a:Show,b:Show){return (a.dateIso||"9999-99-99").localeCompare(b.dateIso||"9999-99-99");}
function sortPast(a:Show,b:Show){return (b.dateIso||"").localeCompare(a.dateIso||"");}
function ShowGroup({title,items,empty}:{title:string;items:Show[];empty?:string}){return <div className="show-group"><h2>{title}</h2>{!items.length&&<p className="empty-state">{empty}</p>}{items.map(s=><Dialog key={s.id}><DialogTrigger asChild><button className={s.coverUrl?"public-show-card has-cover":"public-show-card"}>{s.coverUrl&&<img src={s.coverUrl} alt=""/>}<time>{showDateLabel(s)}{s.time&&<small>{s.time}</small>}</time><div><h3>{s.place}</h3>{s.note&&<p>{s.note}</p>}</div><strong>{s.city}<span>VER DETALHES ↗</span></strong></button></DialogTrigger><DialogContent className="show-detail-modal"><div className="show-detail-cover">{s.coverUrl?<img src={s.coverUrl} alt={`Capa do show ${s.place}`}/>:<CalendarDays/>}</div><div className="show-detail-copy"><DialogHeader><small>AGENDA VALETE</small><DialogTitle>{s.place}</DialogTitle><DialogDescription>Informações da apresentação</DialogDescription></DialogHeader><dl><div><dt><CalendarDays/> DATA</dt><dd>{showDateLabel(s)}</dd></div>{s.time&&<div><dt><Clock/> HORÁRIO</dt><dd>{s.time}</dd></div>}<div><dt><MapPin/> LOCAL</dt><dd>{s.city}</dd></div></dl>{s.note&&<p>{s.note}</p>}</div></DialogContent></Dialog>)}</div>;}
