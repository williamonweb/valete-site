"use client";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogTrigger } from "@/components/ui/dialog";
import { PageHero,PublicFooter,PublicHeader } from "@/components/public-shell";
import { useSiteContent } from "@/hooks/use-site-content";
import { Images } from "lucide-react";

export default function Fotos(){
  const content=useSiteContent();
  return <main className="public-site inner-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}>
    <PublicHeader content={content}/>
    <PageHero kicker="06 / REGISTROS" title="FOTOS" imageUrl={content.brand.photosBannerUrl}/>
    <section className="albums-route">
      {content.albums.length?<div className="album-grid">{content.albums.map(album=>{
        const cover=album.coverUrl||album.photos[0]?.url;
        return <Dialog key={album.id}><DialogTrigger asChild><button className="album-card" aria-label={`Abrir álbum ${album.title}`}>
          <div className="album-cover">{cover?<img src={cover} alt=""/>:<Images aria-hidden="true"/>}<span>{album.photos.length} {album.photos.length===1?"FOTO":"FOTOS"}</span></div>
          <div className="album-caption"><h2>{album.title}</h2>{album.description&&<p>{album.description}</p>}<small>ABRIR ÁLBUM →</small></div>
        </button></DialogTrigger><DialogContent className="album-modal"><DialogHeader><small>ÁLBUM · {album.photos.length} {album.photos.length===1?"FOTO":"FOTOS"}</small><DialogTitle>{album.title}</DialogTitle>{album.description&&<DialogDescription>{album.description}</DialogDescription>}</DialogHeader>
          {album.photos.length?<div className="album-photo-grid">{album.photos.map(photo=><figure key={photo.id}><a href={photo.url} target="_blank" rel="noreferrer"><img src={photo.url} alt={photo.caption||album.title}/></a>{photo.caption&&<figcaption>{photo.caption}</figcaption>}</figure>)}</div>:<p className="album-empty">As fotos deste álbum serão adicionadas em breve.</p>}
        </DialogContent></Dialog>;
      })}</div>:<div className="albums-empty"><Images aria-hidden="true"/><h2>Álbuns em breve</h2><p>Os registros dos shows da Valete vão aparecer aqui.</p></div>}
    </section>
    <PublicFooter content={content}/>
  </main>;
}
