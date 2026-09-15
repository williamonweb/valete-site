"use client";
import { useEffect,useState } from "react";
export function IntroAnimation({logo}:{logo:string}){
  const [show,setShow]=useState(false);
  useEffect(()=>{
    const seen=sessionStorage.getItem("valete-intro");
    if(!seen){setShow(true);sessionStorage.setItem("valete-intro","1");const timer=setTimeout(()=>setShow(false),4100);return()=>clearTimeout(timer);}
  },[]);
  if(!show)return null;
  return <div className="intro-animation" aria-hidden="true"><img src={logo} alt=""/><p>GRAVATAÍ · RS</p></div>;
}
