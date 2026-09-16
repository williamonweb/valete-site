"use client";
import { createContext,createElement,useContext,useEffect,useState } from "react";
import type { ReactNode } from "react";
import { defaultContent,SiteContent } from "@/lib/site-content";

const SiteContentContext=createContext<SiteContent|undefined>(undefined);
const CONTENT_EVENT="valete:content-updated";

export function SiteContentProvider({initialContent,children}:{initialContent:SiteContent;children:ReactNode}){
  const [content,setContent]=useState(initialContent);
  useEffect(()=>{
    const load=async()=>{
      try{
        const response=await fetch(`/api/content?updated=${Date.now()}`,{cache:"no-store"});
        if(!response.ok)return;
        const value=await response.json() as SiteContent;
        setContent(value);
      }catch{}
    };
    const receive=(event:Event)=>setContent((event as CustomEvent<SiteContent>).detail);
    const refreshWhenVisible=()=>{if(document.visibilityState==="visible")load();};
    window.addEventListener(CONTENT_EVENT,receive);
    window.addEventListener("focus",load);
    document.addEventListener("visibilitychange",refreshWhenVisible);
    load();
    const timer=window.setInterval(load,30000);
    return()=>{
      window.clearInterval(timer);
      window.removeEventListener(CONTENT_EVENT,receive);
      window.removeEventListener("focus",load);
      document.removeEventListener("visibilitychange",refreshWhenVisible);
    };
  },[]);
  return createElement(SiteContentContext.Provider,{value:content},children);
}

export function publishSiteContent(content:SiteContent){
  if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent(CONTENT_EVENT,{detail:content}));
}

export function useSiteContent(){
  return useContext(SiteContentContext)??defaultContent;
}
