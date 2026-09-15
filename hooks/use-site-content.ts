"use client";
import { useEffect,useState } from "react";
import { defaultContent,SiteContent } from "@/lib/site-content";

let cachedContent:SiteContent|null=null;

export function useSiteContent(){
  const [content,setContent]=useState<SiteContent>(()=>cachedContent??defaultContent);
  useEffect(()=>{
    const load=()=>fetch(`/api/content?updated=${Date.now()}`,{cache:"no-store"}).then(r=>r.json()).then((value:SiteContent)=>{cachedContent=value;setContent(value);}).catch(()=>{});
    const refreshWhenVisible=()=>{if(document.visibilityState==="visible")load();};
    load();window.addEventListener("focus",load);document.addEventListener("visibilitychange",refreshWhenVisible);
    const timer=window.setInterval(load,30000);
    return()=>{window.clearInterval(timer);window.removeEventListener("focus",load);document.removeEventListener("visibilitychange",refreshWhenVisible);};
  },[]);
  return content;
}
