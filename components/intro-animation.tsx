"use client";
import { useEffect,useState } from "react";
export function IntroAnimation({logo}:{logo:string}){
  const [show,setShow]=useState(false);
  useEffect(()=>{
    let hideTimer:ReturnType<typeof setTimeout>|undefined;
    const startTimer=setTimeout(()=>{
      const seen=sessionStorage.getItem("valete-intro");
      if(!seen){setShow(true);sessionStorage.setItem("valete-intro","1");hideTimer=setTimeout(()=>setShow(false),4100);}
    },0);
    return()=>{clearTimeout(startTimer);if(hideTimer)clearTimeout(hideTimer);};
  },[]);
  if(!show)return null;
  return <div className="intro-animation" aria-hidden="true"><img src={logo} alt=""/><p>GRAVATAÍ · RS</p></div>;
}
