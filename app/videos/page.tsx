"use client";
import { PageHero,PublicFooter,PublicHeader } from "@/components/public-shell";
import { useSiteContent } from "@/hooks/use-site-content";

function youtubeId(url:string){
  try{
    const parsed=new URL(url);
    if(parsed.hostname.includes("youtu.be"))return parsed.pathname.slice(1).split("/")[0];
    if(parsed.pathname.startsWith("/shorts/"))return parsed.pathname.split("/")[2];
    if(parsed.pathname.startsWith("/embed/"))return parsed.pathname.split("/")[2];
    return parsed.searchParams.get("v");
  }catch{return null;}
}

export default function Videos(){
  const content=useSiteContent();
  const videos=content.videos.map(video=>({...video,youtubeId:youtubeId(video.url)})).filter(video=>video.youtubeId);
  return <main className="public-site inner-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}>
    <PublicHeader content={content}/>
    <PageHero kicker="04 / NO PLAY" title="VÍDEOS" imageUrl={content.brand.videosBannerUrl}/>
    <section className="video-route">
      <header><div><small>ASSISTA E OUÇA</small><h2>Shows, ensaios e clipes</h2></div><p>O som da Valete direto do palco.</p></header>
      {videos.length?<div className="video-grid">{videos.map(video=><article key={video.id}><div className="video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`} title={video.title||"Vídeo da Valete"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div><h3>{video.title||"Valete no YouTube"}</h3></article>)}</div>:<p className="video-empty">Os próximos vídeos da Valete vão aparecer aqui.</p>}
    </section>
    <PublicFooter content={content}/>
  </main>;
}
