"use client";
import { useEffect, useState } from "react";
import { defaultContent, Show, showDateLabel, showStatus, SiteContent } from "@/lib/site-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Bell, CalendarDays, CalendarPlus, Check, Clock, Mail, MapPin, Phone } from "lucide-react";

const sections=[["geral","Geral"],["integrantes","Integrantes"],["agenda","Agenda"],["musica","Música"],["videos","Vídeos"],["fotos","Fotos"],["mensagens","Contatos"],["contato","Config. contato"]];
type Lead={id:number;name:string;phone:string;email:string;message:string;isRead:number;createdAt:string};

export default function CmsClient({userName}:{userName:string}){
  const [active,setActive]=useState("geral");
  const [data,setData]=useState<SiteContent>(defaultContent);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [leads,setLeads]=useState<Lead[]>([]);
  const [showModalOpen,setShowModalOpen]=useState(false);
  const [newShow,setNewShow]=useState<Show>(()=>newShowDraft());
  useEffect(()=>{
    const refreshLeads=()=>fetch("/api/leads").then(r=>{if(!r.ok)throw new Error();return r.json();}).then(v=>setLeads(v.leads||[]));
    Promise.all([fetch("/api/content").then(r=>r.json()).then(v=>setData(v)),refreshLeads()])
      .catch(()=>toast.error("Não foi possível carregar todos os dados do painel.")).finally(()=>setLoading(false));
    const timer=window.setInterval(()=>refreshLeads().catch(()=>undefined),30000);
    return()=>window.clearInterval(timer);
  },[]);
  const unread=leads.filter(lead=>!lead.isRead).length;
  const indexedShows=data.shows.map((show,index)=>({show,index}));
  const upcomingShows=indexedShows.filter(({show})=>showStatus(show)==="upcoming").sort((a,b)=>(a.show.dateIso||"9999-99-99").localeCompare(b.show.dateIso||"9999-99-99"));
  const pastShows=indexedShows.filter(({show})=>showStatus(show)==="past").sort((a,b)=>(b.show.dateIso||"").localeCompare(a.show.dateIso||""));
  const update=<K extends keyof SiteContent>(key:K,value:SiteContent[K])=>setData({...data,[key]:value});
  const addShow=()=>{
    if(!newShow.dateIso||!newShow.place.trim()||!newShow.city.trim()){
      toast.error("Preencha a data, o local e a cidade do show.");
      return;
    }
    update("shows",[...data.shows,{...newShow,id:crypto.randomUUID(),date:showDateLabel(newShow),place:newShow.place.trim(),city:newShow.city.trim(),note:newShow.note.trim()}]);
    setNewShow(newShowDraft());
    setShowModalOpen(false);
    toast.success("Data adicionada. Clique em Salvar alterações para publicar.");
  };
  const save=async()=>{
    setSaving(true);
    try{
      const r=await fetch("/api/content",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify(data)});
      if(!r.ok) throw new Error();
      toast.success("Alterações publicadas no site.");
    }catch{toast.error("Não foi possível salvar. Tente novamente.");}
    finally{setSaving(false);}
  };
  const upload=async(file:File,onDone:(url:string)=>void)=>{
    const body=new FormData();body.append("file",file);toast.loading("Enviando imagem…",{id:"upload"});
    try{const r=await fetch("/api/upload",{method:"POST",body});const v=await r.json();if(!r.ok)throw new Error(v.error);onDone(v.url);toast.success("Imagem enviada.",{id:"upload"});}
    catch(e){toast.error(e instanceof Error?e.message:"Falha no envio.",{id:"upload"});}
  };
  const uploadMany=async(files:File[],onDone:(urls:string[])=>void)=>{
    if(!files.length)return;
    toast.loading(`Enviando ${files.length} ${files.length===1?"foto":"fotos"}…`,{id:"album-upload"});
    try{
      const urls:string[]=[];
      for(const file of files){
        const body=new FormData();body.append("file",file);
        const r=await fetch("/api/upload",{method:"POST",body});const v=await r.json();
        if(!r.ok)throw new Error(v.error);
        urls.push(v.url);
      }
      onDone(urls);
      toast.success(`${urls.length} ${urls.length===1?"foto adicionada":"fotos adicionadas"}.`,{id:"album-upload"});
    }catch(e){toast.error(e instanceof Error?e.message:"Falha no envio.",{id:"album-upload"});}
  };
  const setLeadRead=async(id:number,isRead:boolean)=>{
    try{
      const response=await fetch(`/api/leads/${id}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({isRead})});
      if(!response.ok)throw new Error();
      setLeads(current=>current.map(lead=>lead.id===id?{...lead,isRead:isRead?1:0}:lead));
    }catch{toast.error("Não foi possível atualizar o contato.");}
  };
  const logout=async()=>{
    await fetch("/api/auth/logout",{method:"POST"});
    window.location.href="/cms/login";
  };
  if(loading)return <main className="cms-loading">Carregando painel…</main>;
  return <main className="cms-shell">
    <Toaster richColors position="top-right"/>
    <aside className="cms-sidebar">
      <img src={data.brand.logoUrl} alt="Valete"/>
      <nav>{sections.map(([id,label])=><button key={id} className={active===id?"active":""} onClick={()=>setActive(id)}><span>{label}</span>{id==="mensagens"&&unread>0&&<span className="cms-nav-badge"><Bell size={13}/>{unread}</span>}</button>)}</nav>
      <div className="cms-sidebar-footer"><a href="/" target="_blank">Ver site ↗</a><button type="button" onClick={logout}>Sair do painel</button></div>
    </aside>
    <section className="cms-main">
      <header className="cms-header"><div><p>PAINEL VALETE</p><h1>{sections.find(s=>s[0]===active)?.[1]}</h1><small>Olá, {userName}</small></div>{active==="mensagens"?<div className={unread?"lead-summary unread":"lead-summary"}><Bell size={18}/><strong>{unread}</strong><span>{unread===1?"mensagem nova":"mensagens novas"}</span></div>:<Button onClick={save} disabled={saving}>{saving?"SALVANDO…":"SALVAR ALTERAÇÕES"}</Button>}</header>

      {active==="geral"&&<div className="cms-card-grid">
        <Editor title="Identidade visual">
          <Field label="Logo atual"><div className="logo-preview"><img src={data.brand.logoUrl} alt="Logo"/></div><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f,url=>update("brand",{...data.brand,logoUrl:url}));}}/></Field>
          <Field label="Cor de destaque"><div className="color-field"><Input type="color" value={data.brand.accentColor} onChange={e=>update("brand",{...data.brand,accentColor:e.target.value})}/><Input value={data.brand.accentColor} onChange={e=>update("brand",{...data.brand,accentColor:e.target.value})}/></div></Field>
        </Editor>
        <Editor title="Abertura">
          <Field label="Foto de banner"><div className="banner-preview">{data.brand.heroImageUrl?<img src={data.brand.heroImageUrl} alt="Banner"/>:<span>Nenhuma foto adicionada</span>}</div><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f,url=>update("brand",{...data.brand,heroImageUrl:url}));}}/></Field>
          <Field label="Cidade"><Input value={data.brand.city} onChange={e=>update("brand",{...data.brand,city:e.target.value})}/></Field>
          <Field label="Frase grande do banner"><Textarea rows={3} value={data.brand.heroTitle} onChange={e=>update("brand",{...data.brand,heroTitle:e.target.value})}/></Field>
          <Field label="Texto abaixo da frase"><Textarea rows={2} value={data.brand.heroText} onChange={e=>update("brand",{...data.brand,heroText:e.target.value})}/></Field>
          <Field label="Slogan da banda"><Input value={data.brand.tagline} onChange={e=>update("brand",{...data.brand,tagline:e.target.value})}/></Field>
        </Editor>
        <Editor title="Sobre a banda" wide>
          <Field label="Título"><Input value={data.about.heading} onChange={e=>update("about",{...data.about,heading:e.target.value})}/></Field>
          <Field label="Texto"><Textarea rows={5} value={data.about.text} onChange={e=>update("about",{...data.about,text:e.target.value})}/></Field>
        </Editor>
      </div>}

      {active==="integrantes"&&<div className="cms-stack">{data.members.map((member,index)=><Editor key={member.id} title={member.name}>
        <div className="member-editor">
          <div className="member-assets"><div className="photo-editor">{member.imageUrl?<img src={member.imageUrl} alt={member.name}/>:<span>SEM FOTO</span>}<label>Escolher foto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f,url=>{const members=[...data.members];members[index]={...member,imageUrl:url};update("members",members);});}}/></label></div><div className="icon-editor">{member.iconUrl?<img src={member.iconUrl} alt="Símbolo atual"/>:<span>SÍMBOLO AUTOMÁTICO</span>}<label>Trocar símbolo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f,url=>{const members=[...data.members];members[index]={...member,iconUrl:url};update("members",members);});}}/></label>{member.iconUrl&&<button type="button" onClick={()=>{const members=[...data.members];members[index]={...member,iconUrl:""};update("members",members);}}>Usar símbolo automático</button>}</div></div>
          <div><Field label="Nome"><Input value={member.name} onChange={e=>{const members=[...data.members];members[index]={...member,name:e.target.value};update("members",members);}}/></Field>
          <Field label="Função"><Input value={member.role} onChange={e=>{const members=[...data.members];members[index]={...member,role:e.target.value};update("members",members);}}/></Field>
          <Field label="Instagram do integrante"><Input placeholder="https://instagram.com/usuario" value={member.instagramUrl} onChange={e=>{const members=[...data.members];members[index]={...member,instagramUrl:e.target.value};update("members",members);}}/></Field>
          <Field label="Biografia"><Textarea rows={7} value={member.bio} onChange={e=>{const members=[...data.members];members[index]={...member,bio:e.target.value};update("members",members);}}/></Field></div>
        </div>
      </Editor>)}</div>}

      {active==="agenda"&&<section className="cms-agenda">
        <div className="agenda-cms-hero">
          <div><small>AGENDA DA BANDA</small><h2>Datas e apresentações</h2><p>Cadastre os próximos shows. Depois da data, o evento vai sozinho para Últimos shows.</p></div>
          <Button className="add-button agenda-add" type="button" onClick={()=>setShowModalOpen(true)}><CalendarPlus size={18}/> CADASTRAR NOVA DATA</Button>
        </div>
        <div className="agenda-summary-grid">
          <article><CalendarDays/><div><strong>{upcomingShows.length}</strong><span>{upcomingShows.length===1?"próximo show":"próximos shows"}</span></div></article>
          <article><Clock/><div><strong>{pastShows.length}</strong><span>{pastShows.length===1?"show arquivado":"shows arquivados"}</span></div></article>
        </div>
        <CmsShowGroup title="PRÓXIMOS SHOWS" empty="Nenhuma data futura cadastrada." items={upcomingShows} data={data} update={update}/>
        <CmsShowGroup title="ÚLTIMOS SHOWS" empty="Os shows realizados aparecerão aqui automaticamente." items={pastShows} data={data} update={update}/>
        <Dialog open={showModalOpen} onOpenChange={setShowModalOpen}>
          <DialogContent className="show-create-modal">
            <DialogHeader><small>NOVA APRESENTAÇÃO</small><DialogTitle>Cadastrar uma data</DialogTitle><DialogDescription>Preencha as informações que aparecerão na agenda do site.</DialogDescription></DialogHeader>
            <div className="show-create-fields">
              <Field label="Data do show *"><Input type="date" value={newShow.dateIso} onChange={e=>setNewShow({...newShow,dateIso:e.target.value})}/></Field>
              <Field label="Horário"><Input type="time" value={newShow.time} onChange={e=>setNewShow({...newShow,time:e.target.value})}/></Field>
              <Field label="Local *"><Input autoFocus placeholder="Ex.: Bilhar do Nando" value={newShow.place} onChange={e=>setNewShow({...newShow,place:e.target.value})}/></Field>
              <Field label="Cidade *"><Input placeholder="Ex.: Cachoeirinha - RS" value={newShow.city} onChange={e=>setNewShow({...newShow,city:e.target.value})}/></Field>
              <Field label="Destaque ou informação"><Input placeholder="Ex.: Entrada gratuita" value={newShow.note} onChange={e=>setNewShow({...newShow,note:e.target.value})}/></Field>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={()=>setShowModalOpen(false)}>Cancelar</Button><Button className="add-button" type="button" onClick={addShow}>ADICIONAR À AGENDA</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </section>}

      {active==="musica"&&<Editor title="Destaque musical"><Field label="Tipo"><Input value={data.music.label} onChange={e=>update("music",{...data.music,label:e.target.value})}/></Field><Field label="Título"><Input value={data.music.title} onChange={e=>update("music",{...data.music,title:e.target.value})}/></Field><Field label="Descrição"><Textarea rows={4} value={data.music.description} onChange={e=>update("music",{...data.music,description:e.target.value})}/></Field><Field label="Repertório"><Textarea rows={4} value={data.music.repertoire} onChange={e=>update("music",{...data.music,repertoire:e.target.value})}/></Field></Editor>}

      {active==="videos"&&<Editor title="Vídeos do YouTube">{data.videos.map((video,index)=><div className="video-editor" key={video.id}><Field label="Título do vídeo"><Input placeholder="Ex.: Valete ao vivo" value={video.title} onChange={e=>{const videos=[...data.videos];videos[index]={...video,title:e.target.value};update("videos",videos);}}/></Field><Field label="Link do YouTube"><Input placeholder="https://www.youtube.com/watch?v=..." value={video.url} onChange={e=>{const videos=[...data.videos];videos[index]={...video,url:e.target.value};update("videos",videos);}}/></Field><Button variant="destructive" onClick={()=>update("videos",data.videos.filter((_,i)=>i!==index))}>Remover vídeo</Button></div>)}<Button className="add-button" onClick={()=>update("videos",[...data.videos,{id:crypto.randomUUID(),title:"",url:""}])}>+ ADICIONAR VÍDEO</Button></Editor>}

      {active==="fotos"&&<div className="cms-stack">
        {data.albums.map((album,albumIndex)=><Editor key={album.id} title={album.title||"Novo álbum"}>
          <div className="album-editor-head"><div><Field label="Nome do álbum"><Input placeholder="Ex.: Moto Encontro 2026" value={album.title} onChange={e=>{const albums=[...data.albums];albums[albumIndex]={...album,title:e.target.value};update("albums",albums);}}/></Field><Field label="Descrição"><Textarea rows={3} placeholder="Conte um pouco sobre este registro." value={album.description} onChange={e=>{const albums=[...data.albums];albums[albumIndex]={...album,description:e.target.value};update("albums",albums);}}/></Field></div><Field label="Capa do álbum"><div className="album-cover-editor">{(album.coverUrl||album.photos[0]?.url)?<img src={album.coverUrl||album.photos[0]?.url} alt="Capa"/>:<span>SEM CAPA</span>}</div><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f,url=>{const albums=[...data.albums];albums[albumIndex]={...album,coverUrl:url};update("albums",albums);});}}/></Field></div>
          <div className="album-upload-row"><div><strong>Fotos do álbum</strong><small>Você pode selecionar várias imagens de uma vez.</small></div><label className="album-upload-button">+ ADICIONAR FOTOS<input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={e=>uploadMany(Array.from(e.target.files||[]),urls=>setData(current=>({...current,albums:current.albums.map((item,index)=>index===albumIndex?{...item,photos:[...item.photos,...urls.map(url=>({id:crypto.randomUUID(),url,caption:""}))]}:item)})))}/></label></div>
          {album.photos.length?<div className="cms-photo-grid">{album.photos.map((photo,photoIndex)=><div className="cms-photo-item" key={photo.id}><img src={photo.url} alt=""/><Input placeholder="Legenda da foto" value={photo.caption} onChange={e=>{const albums=[...data.albums];const photos=[...album.photos];photos[photoIndex]={...photo,caption:e.target.value};albums[albumIndex]={...album,photos};update("albums",albums);}}/><div><button type="button" onClick={()=>{const albums=[...data.albums];albums[albumIndex]={...album,coverUrl:photo.url};update("albums",albums);}}>Usar como capa</button><button type="button" className="danger" onClick={()=>{const albums=[...data.albums];albums[albumIndex]={...album,coverUrl:album.coverUrl===photo.url?"":album.coverUrl,photos:album.photos.filter((_,i)=>i!==photoIndex)};update("albums",albums);}}>Remover</button></div></div>)}</div>:<p className="cms-album-empty">Nenhuma foto adicionada neste álbum.</p>}
          <Button variant="destructive" onClick={()=>update("albums",data.albums.filter((_,i)=>i!==albumIndex))}>Excluir álbum</Button>
        </Editor>)}
        <Button className="add-button" onClick={()=>update("albums",[...data.albums,{id:crypto.randomUUID(),title:"Novo álbum",description:"",coverUrl:"",photos:[]}])}>+ CRIAR ÁLBUM</Button>
      </div>}

      {active==="mensagens"&&<section className="lead-inbox">
        <div className="lead-inbox-intro"><div><small>CAIXA DE ENTRADA</small><h2>Pedidos recebidos pelo site</h2></div><p>Os contatos mais recentes aparecem primeiro. Marque como lido depois que responder.</p></div>
        {leads.length?<div className="lead-list">{leads.map(lead=><article key={lead.id} className={lead.isRead?"lead-card":"lead-card unread"}>
          <header><div><span className="lead-status">{lead.isRead?"LIDO":"NOVO CONTATO"}</span><h3>{lead.name}</h3><time>{new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium",timeStyle:"short"}).format(new Date(lead.createdAt))}</time></div><button type="button" onClick={()=>setLeadRead(lead.id,!lead.isRead)}><Check size={15}/>{lead.isRead?"Marcar como novo":"Marcar como lido"}</button></header>
          <p className="lead-message">{lead.message}</p>
          <footer><a href={`tel:${lead.phone.replace(/\D/g,"")}`}><Phone size={15}/>{lead.phone}</a><a href={`mailto:${lead.email}`}><Mail size={15}/>{lead.email}</a></footer>
        </article>)}</div>:<div className="lead-empty"><Bell size={34}/><h2>Nenhum contato ainda</h2><p>Quando alguém enviar o formulário do site, a mensagem aparecerá aqui.</p></div>}
      </section>}

      {active==="contato"&&<Editor title="Contratação"><Field label="Título"><Input value={data.contact.heading} onChange={e=>update("contact",{...data.contact,heading:e.target.value})}/></Field><Field label="Texto"><Textarea rows={4} value={data.contact.text} onChange={e=>update("contact",{...data.contact,text:e.target.value})}/></Field><Field label="Link completo do WhatsApp"><Input placeholder="https://wa.me/55..." value={data.contact.whatsapp} onChange={e=>update("contact",{...data.contact,whatsapp:e.target.value})}/></Field><Field label="Link completo do Instagram"><Input placeholder="https://instagram.com/..." value={data.contact.instagram} onChange={e=>update("contact",{...data.contact,instagram:e.target.value})}/></Field></Editor>}
    </section>
  </main>;
}

function newShowDraft():Show{return {id:"",date:"",dateIso:"",time:"",place:"",city:"",note:"",status:"upcoming"};}

function CmsShowGroup({title,empty,items,data,update}:{title:string;empty:string;items:{show:Show;index:number}[];data:SiteContent;update:(key:"shows",value:Show[])=>void}){
  return <section className="cms-show-group">
    <header><h3>{title}</h3><span>{items.length}</span></header>
    {!items.length&&<p className="cms-show-empty">{empty}</p>}
    <div className="cms-show-list">{items.map(({show,index})=><article className="cms-show-card" key={show.id}>
      <div className="cms-show-date"><CalendarDays/><strong>{showDateLabel(show)||"SEM DATA"}</strong>{show.time&&<span>{show.time}</span>}</div>
      <div className="cms-show-place"><small>{showStatus(show)==="past"?"ARQUIVADO AUTOMATICAMENTE":"PRÓXIMA APRESENTAÇÃO"}</small><h4>{show.place||"Local não informado"}</h4><p><MapPin size={14}/>{show.city||"Cidade não informada"}</p>{!show.dateIso&&<em>Defina a data abaixo para ativar o arquivamento automático.</em>}</div>
      <div className="cms-show-edit">
        <Field label="Data"><Input type="date" value={show.dateIso} onChange={e=>{const shows=[...data.shows];shows[index]={...show,dateIso:e.target.value};update("shows",shows);}}/></Field>
        <Field label="Horário"><Input type="time" value={show.time} onChange={e=>{const shows=[...data.shows];shows[index]={...show,time:e.target.value};update("shows",shows);}}/></Field>
        <Field label="Local"><Input value={show.place} onChange={e=>{const shows=[...data.shows];shows[index]={...show,place:e.target.value};update("shows",shows);}}/></Field>
        <Field label="Cidade"><Input value={show.city} onChange={e=>{const shows=[...data.shows];shows[index]={...show,city:e.target.value};update("shows",shows);}}/></Field>
        <Field label="Destaque"><Input value={show.note} onChange={e=>{const shows=[...data.shows];shows[index]={...show,note:e.target.value};update("shows",shows);}}/></Field>
        <Button type="button" variant="destructive" onClick={()=>update("shows",data.shows.filter((_,i)=>i!==index))}>Excluir show</Button>
      </div>
    </article>)}</div>
  </section>;
}

function Editor({title,children,wide=false}:{title:string;children:React.ReactNode;wide?:boolean}){return <section className={wide?"cms-editor wide":"cms-editor"}><h2>{title}</h2>{children}</section>;}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="cms-field"><span>{label}</span>{children}</label>;}
