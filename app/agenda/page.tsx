"use client";

import { PageHero, PublicFooter, PublicHeader } from "@/components/public-shell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSiteContent } from "@/hooks/use-site-content";
import { Show, showDateLabel, showStatus } from "@/lib/site-content";
import { ArrowUpRight, CalendarDays, Clock, MapPin, Music2 } from "lucide-react";
import styles from "./agenda.module.css";

export default function Agenda() {
  const content = useSiteContent();
  const upcoming = content.shows.filter(show => showStatus(show) === "upcoming").sort(sortUpcoming);
  const past = content.shows.filter(show => showStatus(show) === "past").sort(sortPast);

  return <main className="public-site inner-site" style={{ "--accent": content.brand.accentColor } as React.CSSProperties}>
    <PublicHeader content={content} />
    <PageHero kicker="02 / NA ESTRADA" title="AGENDA" />
    <section className={styles.route}>
      <header className={styles.intro}>
        <div><small>VALETE AO VIVO</small><h2>PRÓXIMAS PARADAS</h2><p>Confira onde a Valete vai tocar e abra cada apresentação para ver todas as informações.</p></div>
        <div className={styles.counter}><strong>{String(upcoming.length).padStart(2, "0")}</strong><span>{upcoming.length === 1 ? "DATA CONFIRMADA" : "DATAS CONFIRMADAS"}</span></div>
      </header>
      <ShowGroup title="PRÓXIMOS SHOWS" items={upcoming} empty="Novas datas serão anunciadas em breve." />
      <ShowGroup title="ÚLTIMOS SHOWS" items={past} past />
    </section>
    <PublicFooter content={content} />
  </main>;
}

function sortUpcoming(a: Show, b: Show) { return (a.dateIso || "9999-99-99").localeCompare(b.dateIso || "9999-99-99"); }
function sortPast(a: Show, b: Show) { return (b.dateIso || "").localeCompare(a.dateIso || ""); }

function ShowGroup({ title, items, empty, past = false }: { title: string; items: Show[]; empty?: string; past?: boolean }) {
  return <section className={`${styles.group} ${past ? styles.past : ""}`}>
    <header className={styles.groupTitle}><span>{title}</span><i>{items.length}</i></header>
    {!items.length && <div className={styles.empty}><CalendarDays /><p>{empty}</p></div>}
    <div className={styles.grid}>{items.map(show => <ShowCard key={show.id} show={show} />)}</div>
  </section>;
}

function ShowCard({ show }: { show: Show }) {
  const label = showDateLabel(show);
  const [day, ...monthParts] = label.split(" ");
  const month = monthParts.join(" ");
  const actionUrl = /^https?:\/\//i.test(show.linkUrl) ? show.linkUrl : "";

  return <Dialog>
    <DialogTrigger asChild>
      <button className={styles.card} type="button">
        <span className={styles.poster}>
          {show.coverUrl ? <img src={show.coverUrl} alt={`Capa do show no ${show.place}`} /> : <span className={styles.posterFallback}><Music2 /><b>VALETE</b><small>ROCK AO VIVO</small></span>}
          <span className={styles.dateBadge}><strong>{day}</strong><small>{month}</small></span>
          <span className={styles.detailsTag}>VER DETALHES <ArrowUpRight /></span>
        </span>
        <span className={styles.cardCopy}>
          <small>{show.time ? `${show.time} · ` : ""}APRESENTAÇÃO</small>
          <strong>{show.place}</strong>
          <span><MapPin />{show.city}</span>
          {show.note && <p>{show.note}</p>}
        </span>
      </button>
    </DialogTrigger>
    <DialogContent className={styles.modal}>
      <div className={styles.modalPoster}>{show.coverUrl ? <img src={show.coverUrl} alt={`Capa do show no ${show.place}`} /> : <span><Music2 /><b>VALETE</b><small>ROCK AO VIVO</small></span>}</div>
      <div className={styles.modalCopy}>
        <DialogHeader><small>AGENDA VALETE</small><DialogTitle>{show.place}</DialogTitle><DialogDescription>Informações da apresentação</DialogDescription></DialogHeader>
        <dl>
          <div><dt><CalendarDays /> DATA</dt><dd>{label}</dd></div>
          {show.time && <div><dt><Clock /> HORÁRIO</dt><dd>{show.time}</dd></div>}
          <div><dt><MapPin /> CIDADE</dt><dd>{show.city}</dd></div>
        </dl>
        {show.note && <p>{show.note}</p>}
        {actionUrl && <a className={styles.action} href={actionUrl} target="_blank" rel="noreferrer">{show.linkLabel || "MAIS INFORMAÇÕES"}<ArrowUpRight /></a>}
      </div>
    </DialogContent>
  </Dialog>;
}
