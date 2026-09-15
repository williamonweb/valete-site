"use client";
import { useEffect,useState } from "react";
import { defaultContent,SiteContent } from "@/lib/site-content";
export function useSiteContent(){
  const [content,setContent]=useState<SiteContent>(defaultContent);
  useEffect(()=>{fetch("/api/content").then(r=>r.json()).then(setContent).catch(()=>{});},[]);
  return content;
}
