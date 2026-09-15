"use client";
import { useEffect, useState } from "react";
import { defaultContent, MusicTrack, Show, showDateLabel, showStatus, SiteContent } from "@/lib/site-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Bell, CalendarDays, CalendarPlus, Check, Clock, Disc3, Mail, MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react";

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
  const [editingShowIndex,setEditingShowIndex]=useState<number|null>(null);
  const [trackModalOpen,setTrackModalOpen]=useState(false);
  const [editingTrackIndex,setEditingTrackIndex]=useState<number|null>(null);
  const [trackDraft,setTrackDraft]=useState<MusicTrack>(()=>newTrackDraft());
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
  const openNewShow=()=>{setEditingShowIndex(null);setNewShow(newShowDraft());setShowModalOpen(true);};
  const openEditShow=(index:number)=>{setEditingShowIndex(index);setNewShow({...data.shows[index]});setShowModalOpen(true);};
  const saveShowDraft=()=>{
    if(!newShow.dateIso||!newShow.place.trim()||!newShow.city.trim()){
      toast.error("Preencha a data, o local e a cidade do show.");
      return;
    }
    if(newShow.linkUrl&&!/^https?:\/\//i.test(newShow.linkUrl)){toast.error("O link do evento deve começar com https://");return;}
    const normalized={...newShow,id:newShow.id||crypto.randomUUID(),date:showDateLabel(newShow),place:newShow.place.trim(),city:newShow.city.trim(),note:newShow.note.trim(),linkUrl:newShow.linkUrl.trim(),linkLabel:newShow.linkLabel.trim()};
    if(editingShowIndex===null)update("shows",[...data.shows,normalized]);
    else{const shows=[...data.shows];shows[editingShowIndex]=normalized;update("shows",shows);}
    setNewShow(newShowDraft());
    setShowModalOpen(false);
    toast.success(editingShowIndex===null?"Data adicionada. Clique em Salvar alterações para publicar.":"Show atualizado. Clique em Salvar alterações para publicar.");
    setEditingShowIndex(null);
  };
  const openNewTrack=()=>{setEditingTrackIndex(null);setTrackDraft(newTrackDraft());setTrackModalOpen(true);};
  const openEditTrack=(index:number)=>{setEditingTrackIndex(index);setTrackDraft({...data.music.tracks[index]});setTrackModalOpen(true);};
  const saveTrackDraft=()=>{
    if(!trackDraft.title.trim()){toast.error("Informe o nome da música.");return;}
    if(trackDraft.url&&!/^https?:\/\//i.test(trackDraft.url)){toast.error("Cole o link completo da música, começando com https://");return;}
    const normalized={...trackDraft,id:trackDraft.id||crypto.randomUUID(),title:trackDraft.title.trim(),artist:trackDraft.artist.trim()||"Valete",url:trackDraft.url.trim()};
    const tracks=[...data.music.tracks];
    if(editingTrackIndex===null)tracks.push(normalized);else tracks[editingTrackIndex]=normalized;
    update("music",{...data.music,tracks});
    setTrackModalOpen(false);setEditingTrackIndex(null);setTrackDraft(newTrackDraft());
    toast.success("Música adicionada. Clique em Salvar alterações para publicar.");
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

      {active==="agenda"&&<section className="w-full space-y-8">
        <div className="grid items-center gap-6 border border-[#4b402e] bg-[linear-gradient(120deg,#211b13,#111_62%)] p-6 shadow-[inset_4px_0_0_#c49a52] md:grid-cols-[minmax(0,1fr)_auto] md:p-8">
          <div><small className="font-black tracking-[.18em] text-[#c49a52]">AGENDA DA BANDA</small><h2 className="mt-2 text-3xl font-black tracking-[-.045em] text-white">Datas e apresentações</h2><p className="mt-2 max-w-2xl leading-6 text-[#969696]">Cadastre os próximos shows. Depois da data, o evento vai automaticamente para Últimos shows.</p></div>
          <Button className="add-button !h-12 !w-full gap-2 px-5 md:!w-auto" type="button" onClick={openNewShow}><CalendarPlus size={18}/> CADASTRAR NOVA DATA</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="flex min-h-24 items-center gap-5 border border-[#303030] bg-[#171717] px-6 py-5"><CalendarDays className="size-7 text-[#c49a52]"/><div><strong className="block text-3xl font-black text-white">{upcomingShows.length}</strong><span className="mt-1 block text-xs font-black uppercase tracking-[.12em] text-[#858585]">{upcomingShows.length===1?"próximo show":"próximos shows"}</span></div></article>
          <article className="flex min-h-24 items-center gap-5 border border-[#303030] bg-[#171717] px-6 py-5"><Clock className="size-7 text-[#c49a52]"/><div><strong className="block text-3xl font-black text-white">{pastShows.length}</strong><span className="mt-1 block text-xs font-black uppercase tracking-[.12em] text-[#858585]">{pastShows.length===1?"show arquivado":"shows arquivados"}</span></div></article>
        </div>
        <CmsShowGroup title="PRÓXIMOS SHOWS" empty="Nenhuma data futura cadastrada." items={upcomingShows} data={data} update={update} onEdit={openEditShow}/>
        <CmsShowGroup title="ÚLTIMOS SHOWS" empty="Os shows realizados aparecerão aqui automaticamente." items={pastShows} data={data} update={update} onEdit={openEditShow}/>
        <Dialog open={showModalOpen} onOpenChange={setShowModalOpen}>
          <DialogContent className="!w-[min(680px,calc(100vw-30px))] !max-w-none !gap-0 !rounded-none !border-[#514631] !bg-[#101010] !p-0 !text-white">
            <DialogHeader className="border-b border-[#303030] px-6 py-6 pr-14 sm:px-8"><small className="font-black tracking-[.17em] text-[#c49a52]">{editingShowIndex===null?"NOVA APRESENTAÇÃO":"EDITAR APRESENTAÇÃO"}</small><DialogTitle className="mt-2 text-3xl font-black tracking-[-.04em] text-white">{editingShowIndex===null?"Cadastrar uma data":"Editar show"}</DialogTitle><DialogDescription className="mt-1 text-[#858585]">Preencha as informações que aparecerão na agenda do site.</DialogDescription></DialogHeader>
            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 sm:px-8 [&_.cms-field]:!m-0 [&_.cms-field:nth-child(n+3)]:sm:col-span-2 [&_input]:!h-11 [&_input]:!border-[#3d3d3d] [&_input]:!bg-[#090909] [&_input]:!text-white">
              <Field label="Data do show *"><Input type="date" value={newShow.dateIso} onChange={e=>setNewShow({...newShow,dateIso:e.target.value})}/></Field>
              <Field label="Horário"><Input type="time" value={newShow.time} onChange={e=>setNewShow({...newShow,time:e.target.value})}/></Field>
              <Field label="Local *"><Input autoFocus placeholder="Ex.: Bilhar do Nando" value={newShow.place} onChange={e=>setNewShow({...newShow,place:e.target.value})}/></Field>
              <Field label="Cidade *"><Input placeholder="Ex.: Cachoeirinha - RS" value={newShow.city} onChange={e=>setNewShow({...newShow,city:e.target.value})}/></Field>
              <Field label="Destaque ou informação"><Input placeholder="Ex.: Entrada gratuita" value={newShow.note} onChange={e=>setNewShow({...newShow,note:e.target.value})}/></Field>
              <Field label="Link do evento, ingresso ou reserva (opcional)"><Input type="url" placeholder="https://instagram.com/p/..." value={newShow.linkUrl} onChange={e=>setNewShow({...newShow,linkUrl:e.target.value})}/></Field>
              <Field label="Texto do botão"><Input placeholder="Ex.: GARANTIR INGRESSO" value={newShow.linkLabel} onChange={e=>setNewShow({...newShow,linkLabel:e.target.value})}/></Field>
              <Field label="Capa do show (opcional)"><div className="grid gap-3 sm:grid-cols-[170px_minmax(0,1fr)]"><div className="grid aspect-video place-items-center overflow-hidden border border-[#393939] bg-[#080808] text-xs font-black tracking-[.1em] text-[#555]">{newShow.coverUrl?<img className="h-full w-full object-cover" src={newShow.coverUrl} alt="Capa do show"/>:<span>SEM CAPA</span>}</div><div className="flex flex-col justify-center gap-2"><Input className="!h-auto py-2 file:mr-3 file:text-[#c49a52]" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f,url=>setNewShow(current=>({...current,coverUrl:url})));}}/>{newShow.coverUrl&&<Button className="!h-9 !border-[#4a3535] !bg-transparent !text-[#d48c83]" type="button" variant="outline" onClick={()=>setNewShow({...newShow,coverUrl:""})}>Remover capa</Button>}</div></div></Field>
            </div>
            <DialogFooter className="border-t border-[#303030] bg-[#0b0b0b] px-6 py-5 sm:px-8"><Button className="!border-[#444] !bg-transparent !text-[#aaa]" type="button" variant="outline" onClick={()=>setShowModalOpen(false)}>Cancelar</Button><Button className="add-button !min-h-11" type="button" onClick={saveShowDraft}>{editingShowIndex===null?"ADICIONAR À AGENDA":"SALVAR EDIÇÃO"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </section>}

      {active==="musica"&&<div className="space-y-7">
        <Editor title="Apresentação da página"><Field label="Tipo"><Input value={data.music.label} onChange={e=>update("music",{...data.music,label:e.target.value})}/></Field><Field label="Título"><Input value={data.music.title} onChange={e=>update("music",{...data.music,title:e.target.value})}/></Field><Field label="Descrição"><Textarea rows={3} value={data.music.description} onChange={e=>update("music",{...data.music,description:e.target.value})}/></Field><Field label="Repertório"><Textarea rows={3} value={data.music.repertoire} onChange={e=>update("music",{...data.music,repertoire:e.target.value})}/></Field></Editor>
        <section className="border border-[#303030] bg-[#151515] p-5 sm:p-7"><header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div><small className="font-black tracking-[.16em] text-[#c49a52]">MÚSICAS PRÓPRIAS</small><h2 className="mt-2 text-2xl font-black tracking-[-.04em] text-white">Biblioteca da Valete</h2><p className="mt-2 text-sm text-[#858585]">Capas quadradas com links para YouTube Music, YouTube ou Spotify.</p></div><Button className="add-button !h-11 !w-full gap-2 sm:!w-auto" type="button" onClick={openNewTrack}><Plus size={17}/> ADICIONAR MÚSICA</Button></header>
          {data.music.tracks.length?<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.music.tracks.map((track,index)=><article key={track.id} className="grid grid-cols-[92px_minmax(0,1fr)] gap-4 border border-[#333] bg-[#0d0d0d] p-3"><div className="grid aspect-square place-items-center overflow-hidden bg-[#211c14] text-[#c49a52]">{track.coverUrl?<img className="h-full w-full object-cover" src={track.coverUrl} alt=""/>:<Disc3 size={34}/>}</div><div className="min-w-0 self-center"><h3 className="truncate text-base font-black text-white">{track.title}</h3><p className="mt-1 truncate text-sm text-[#858585]">{track.artist||"Valete"}</p><div className="mt-3 flex gap-2"><Button className="!h-8 gap-1.5 !border-[#555] !bg-transparent px-3 !text-white" type="button" variant="outline" onClick={()=>openEditTrack(index)}><Pencil size={13}/> Editar</Button><Button className="!size-8 !p-0" type="button" variant="destructive" aria-label={`Excluir ${track.title}`} onClick={()=>update("music",{...data.music,tracks:data.music.tracks.filter((_,i)=>i!==index)})}><Trash2 size={14}/></Button></div></div></article>)}</div>:<div className="grid min-h-52 place-items-center border border-dashed border-[#3a3a3a] text-center text-[#666]"><div><Disc3 className="mx-auto mb-3"/><p>Nenhuma música adicionada.</p></div></div>}
        </section>
        <Dialog open={trackModalOpen} onOpenChange={setTrackModalOpen}><DialogContent className="!w-[min(650px,calc(100vw-30px))] !max-w-none !gap-0 !rounded-none !border-[#514631] !bg-[#101010] !p-0 !text-white"><DialogHeader className="border-b border-[#303030] px-6 py-6 pr-14 sm:px-8"><small className="font-black tracking-[.17em] text-[#c49a52]">{editingTrackIndex===null?"NOVA MÚSICA":"EDITAR MÚSICA"}</small><DialogTitle className="mt-2 text-3xl font-black tracking-[-.04em] text-white">Música própria</DialogTitle><DialogDescription className="mt-1 text-[#858585]">Adicione a capa e o endereço onde o público poderá ouvir.</DialogDescription></DialogHeader><div className="grid gap-4 px-6 py-6 sm:px-8 [&_.cms-field]:!m-0 [&_input]:!h-11 [&_input]:!border-[#3d3d3d] [&_input]:!bg-[#090909] [&_input]:!text-white"><Field label="Nome da música *"><Input autoFocus placeholder="Ex.: Entre o Céu e o Caos" value={trackDraft.title} onChange={e=>setTrackDraft({...trackDraft,title:e.target.value})}/></Field><Field label="Artista"><Input placeholder="Valete" value={trackDraft.artist} onChange={e=>setTrackDraft({...trackDraft,artist:e.target.value})}/></Field><Field label="Link para ouvir"><Input type="url" placeholder="https://music.youtube.com/watch?v=..." value={trackDraft.url} onChange={e=>setTrackDraft({...trackDraft,url:e.target.value})}/></Field><Field label="Capa quadrada"><div className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)]"><div className="grid aspect-square place-items-center overflow-hidden border border-[#393939] bg-[#080808] text-[#c49a52]">{trackDraft.coverUrl?<img className="h-full w-full object-cover" src={trackDraft.coverUrl} alt="Capa da música"/>:<Disc3 size={42}/>}</div><div className="flex flex-col justify-center gap-2"><Input className="!h-auto py-2 file:mr-3 file:text-[#c49a52]" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f)upload(f,url=>setTrackDraft(current=>({...current,coverUrl:url})));}}/>{trackDraft.coverUrl&&<Button className="!h-9 !border-[#4a3535] !bg-transparent !text-[#d48c83]" type="button" variant="outline" onClick={()=>setTrackDraft({...trackDraft,coverUrl:""})}>Remover capa</Button>}</div></div></Field></div><DialogFooter className="border-t border-[#303030] bg-[#0b0b0b] px-6 py-5 sm:px-8"><Button className="!border-[#444] !bg-transparent !text-[#aaa]" type="button" variant="outline" onClick={()=>setTrackModalOpen(false)}>Cancelar</Button><Button className="add-button !min-h-11" type="button" onClick={saveTrackDraft}>{editingTrackIndex===null?"ADICIONAR MÚSICA":"SALVAR EDIÇÃO"}</Button></DialogFooter></DialogContent></Dialog>
      </div>}

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

function newShowDraft():Show{return {id:"",date:"",dateIso:"",time:"",place:"",city:"",note:"",coverUrl:"",linkUrl:"",linkLabel:"",status:"upcoming"};}
function newTrackDraft():MusicTrack{return {id:"",title:"",artist:"Valete",coverUrl:"",url:""};}

function CmsShowGroup({title,empty,items,data,update,onEdit}:{title:string;empty:string;items:{show:Show;index:number}[];data:SiteContent;update:(key:"shows",value:Show[])=>void;onEdit:(index:number)=>void}){
  return <section className="space-y-3">
    <header className="flex items-center gap-3"><h3 className="m-0 text-xs font-black tracking-[.16em] text-[#aaa]">{title}</h3><span className="grid size-6 place-items-center rounded-full bg-[#292929] text-[.68rem] font-black text-[#c49a52]">{items.length}</span></header>
    {!items.length&&<p className="m-0 border border-dashed border-[#3a3a3a] p-8 text-center text-[#6e6e6e]">{empty}</p>}
    <div className="space-y-3">{items.map(({show,index})=><article className="grid overflow-hidden border border-[#333] bg-[#151515] lg:grid-cols-[180px_minmax(0,1fr)_auto]" key={show.id}>
      <div className="relative min-h-44 overflow-hidden border-b border-[#303030] bg-[#0b0b0b] lg:min-h-56 lg:border-r lg:border-b-0">{show.coverUrl?<img className="absolute inset-0 h-full w-full object-cover" src={show.coverUrl} alt=""/>:<div className="grid h-full min-h-44 place-items-center bg-[linear-gradient(145deg,#272015,#080808)] text-[#c49a52]"><div className="text-center"><CalendarDays className="mx-auto mb-3 size-8"/><strong className="block text-xl font-black">VALETE</strong><small className="tracking-[.14em]">ROCK AO VIVO</small></div></div>}<span className="absolute bottom-3 left-3 bg-[#c49a52] px-3 py-2 text-xs font-black text-black">{showDateLabel(show)||"SEM DATA"}{show.time?` · ${show.time}`:""}</span></div>
      <div className="flex min-h-28 flex-col justify-center px-6 py-5"><small className="font-black tracking-[.12em] text-[#c49a52]">{showStatus(show)==="past"?"ARQUIVADO AUTOMATICAMENTE":"PRÓXIMA APRESENTAÇÃO"}</small><h4 className="my-2 text-2xl font-black tracking-[-.035em] text-white">{show.place||"Local não informado"}</h4><p className="m-0 flex items-center gap-2 text-sm text-[#909090]"><MapPin size={15}/>{show.city||"Cidade não informada"}</p>{show.note&&<p className="mt-3 text-sm text-[#b0b0b0]">{show.note}</p>}{show.linkUrl&&<span className="mt-4 text-xs font-black tracking-[.1em] text-[#c49a52]">↗ {show.linkLabel||"MAIS INFORMAÇÕES"}</span>}{!show.dateIso&&<em className="mt-3 text-xs text-[#d59b7d]">Edite este show e selecione a data para ativar o arquivamento automático.</em>}</div>
      <div className="flex items-center gap-2 border-t border-[#303030] px-5 py-4 lg:border-t-0 lg:border-l"><Button className="!h-10 gap-2 !border-[#555] !bg-transparent !text-white" type="button" variant="outline" onClick={()=>onEdit(index)}><Pencil size={15}/> Editar</Button><Button className="!size-10 !p-0" aria-label={`Excluir ${show.place}`} type="button" variant="destructive" onClick={()=>update("shows",data.shows.filter((_,i)=>i!==index))}><Trash2 size={16}/></Button></div>
    </article>)}</div>
  </section>;
}

function Editor({title,children,wide=false}:{title:string;children:React.ReactNode;wide?:boolean}){return <section className={wide?"cms-editor wide":"cms-editor"}><h2>{title}</h2>{children}</section>;}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="cms-field"><span>{label}</span>{children}</label>;}
