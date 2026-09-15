"use client";
import { PageHero,PublicFooter,PublicHeader } from "@/components/public-shell";
import { useSiteContent } from "@/hooks/use-site-content";
import { MusicTrack } from "@/lib/site-content";
import { Music2,Play } from "lucide-react";

export default function Musica(){
  const content=useSiteContent();
  return <main className="public-site inner-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}><PublicHeader content={content}/><PageHero kicker="03 / O SOM" title="MÚSICA"/><section className="music-library"><header><small>{content.music.label}</small><h2>{content.music.title}</h2><p>{content.music.description}</p></header>{content.music.tracks.length?<div className="music-track-grid">{content.music.tracks.map(track=><TrackCard key={track.id} track={track}/>)}</div>:<div className="music-track-empty"><Music2/><p>As músicas próprias da Valete aparecerão aqui.</p></div>}</section><section className="repertoire-route"><small>NO REPERTÓRIO</small><p>{content.music.repertoire}</p></section><PublicFooter content={content}/></main>;
}

function platformLabel(url:string){if(url.includes("music.youtube"))return "YOUTUBE MUSIC";if(url.includes("youtube")||url.includes("youtu.be"))return "YOUTUBE";if(url.includes("spotify"))return "SPOTIFY";return url?"OUVIR AGORA":"EM BREVE";}
function TrackCard({track}:{track:MusicTrack}){
  const content=<><div className="music-track-cover">{track.coverUrl?<img src={track.coverUrl} alt={`Capa de ${track.title}`}/>:<><strong>V</strong><span>VALETE</span></>}<span className="music-track-play"><Play fill="currentColor"/></span></div><div className="music-track-copy"><h3>{track.title}</h3><p>{track.artist||"Valete"}</p><small>{platformLabel(track.url)}</small></div></>;
  return track.url?<a className="music-track-card" href={track.url} target="_blank" rel="noreferrer">{content}</a>:<article className="music-track-card disabled">{content}</article>;
}
