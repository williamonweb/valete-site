"use client";

import { FormEvent, useState } from "react";
import { PublicFooter, PublicHeader } from "@/components/public-shell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSiteContent } from "@/hooks/use-site-content";
import { MerchItem } from "@/lib/site-content";
import { ArrowRight, Check, Shirt } from "lucide-react";
import styles from "./camisetas.module.css";

type FormState={name:string;phone:string;email:string;color:string;size:string;note:string;company:string};

function formatPhone(value:string){
  const digits=value.replace(/\D/g,"").slice(0,11);
  if(digits.length<=2)return digits;
  if(digits.length<=6)return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if(digits.length<=10)return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}

export default function Camisetas(){
  const content=useSiteContent();
  const [selected,setSelected]=useState<MerchItem|null>(null);
  const [form,setForm]=useState<FormState>({name:"",phone:"",email:"",color:"",size:"",note:"",company:""});
  const [status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");
  const choose=(item:MerchItem)=>{setSelected(item);setForm({name:"",phone:"",email:"",color:item.colors[0]||"",size:item.sizes[0]||"",note:"",company:""});setStatus("idle");};
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();if(!selected)return;setStatus("sending");
    const message=["INTERESSE EM CAMISETA VALETE",`Modelo: ${selected.name}`,`Tamanho: ${form.size}`,`Cor: ${form.color}`,selected.priceLabel?`Informação: ${selected.priceLabel}`:"",form.note?`Observação: ${form.note}`:""].filter(Boolean).join("\n");
    try{
      const response=await fetch("/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:form.name,phone:form.phone,email:form.email,message,company:form.company})});
      if(!response.ok)throw new Error();setStatus("success");
    }catch{setStatus("error");}
  };

  return <main className="public-site inner-site" style={{"--accent":content.brand.accentColor} as React.CSSProperties}>
    <PublicHeader content={content}/><section className={styles.hero}>{content.brand.merchBannerUrl&&<img src={content.brand.merchBannerUrl} alt="Camisetas oficiais da Valete"/>}<div><small>06 / VISTA O ROCK</small><h1>CAMISETAS</h1><p>MERCH OFICIAL VALETE</p></div></section>
    <section className={styles.route}>
      <header className={styles.intro}><div><small>MERCH OFICIAL</small><h2>LEVE A VALETE COM VOCÊ.</h2></div><p>Escolha o modelo, o tamanho e a cor. A equipe entra em contato para confirmar disponibilidade, pagamento e entrega.</p></header>
      {content.merch.length?<div className={styles.grid}>{content.merch.map(item=><button className={styles.card} type="button" key={item.id} onClick={()=>choose(item)}>
        <span className={styles.image}>{item.imageUrl?<img src={item.imageUrl} alt={item.name}/>:<span><Shirt/><b>VALETE</b><small>MERCH OFICIAL</small></span>}<i>VER MODELO <ArrowRight/></i></span>
        <span className={styles.copy}><small>{item.priceLabel||"CONSULTE DISPONIBILIDADE"}</small><strong>{item.name}</strong><p>{item.description}</p><span>{item.colors.length} {item.colors.length===1?"COR":"CORES"} · {item.sizes.join(" · ")}</span></span>
      </button>)}</div>:<div className={styles.empty}><Shirt/><h2>Novidades em breve.</h2><p>Os modelos oficiais da Valete aparecerão aqui.</p></div>}
    </section>

    <Dialog open={!!selected} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className={styles.modal}>{selected&&<>
      <div className={styles.modalImage}>{selected.imageUrl?<img src={selected.imageUrl} alt={selected.name}/>:<span><Shirt/><b>VALETE</b><small>MERCH OFICIAL</small></span>}</div>
      <form className={styles.form} onSubmit={submit}>{status==="success"?<div className={styles.success}><Check/><small>PEDIDO RECEBIDO</small><h2>Valeu pelo interesse!</h2><p>A equipe da Valete recebeu sua escolha e entrará em contato para confirmar os detalhes.</p><button type="button" onClick={()=>setSelected(null)}>FECHAR</button></div>:<>
        <DialogHeader><small>CAMISETA OFICIAL</small><DialogTitle>{selected.name}</DialogTitle><DialogDescription>{selected.description}</DialogDescription></DialogHeader>
        {selected.priceLabel&&<strong className={styles.price}>{selected.priceLabel}</strong>}
        <div className={styles.fields}>
          <label><span>TAMANHO *</span><select required value={form.size} onChange={e=>setForm({...form,size:e.target.value})}>{selected.sizes.map(size=><option key={size}>{size}</option>)}</select></label>
          <label><span>COR *</span><select required value={form.color} onChange={e=>setForm({...form,color:e.target.value})}>{selected.colors.map(color=><option key={color}>{color}</option>)}</select></label>
          <label><span>SEU NOME *</span><input required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
          <label><span>TELEFONE *</span><input required inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" value={form.phone} onChange={e=>setForm({...form,phone:formatPhone(e.target.value)})}/></label>
          <label className={styles.full}><span>E-MAIL *</span><input required type="email" maxLength={160} autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
          <label className={styles.full}><span>OBSERVAÇÃO</span><textarea rows={3} maxLength={500} placeholder="Ex.: Prefiro retirar pessoalmente." value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label>
          <label className={styles.honeypot} aria-hidden="true"><span>Empresa</span><input tabIndex={-1} autoComplete="off" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></label>
        </div>
        <button className={styles.submit} type="submit" disabled={status==="sending"}>{status==="sending"?"ENVIANDO…":"TENHO INTERESSE →"}</button>
        {status==="error"&&<p className={styles.error}>Não foi possível enviar agora. Confira os dados e tente novamente.</p>}
        <small className={styles.disclaimer}>Este formulário não realiza cobrança. A equipe confirmará disponibilidade, pagamento e entrega.</small>
      </>}</form>
    </>}</DialogContent></Dialog>
    <PublicFooter content={content}/>
  </main>;
}
