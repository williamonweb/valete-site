import { normalizeContent } from "@/lib/site-content";
import { requireCmsAdmin } from "@/lib/cms-auth";
import { sql } from "@/lib/db";
import { loadSiteContent } from "@/lib/site-content-server";

export const dynamic="force-dynamic";

export async function GET(){
  try{
    return Response.json(await loadSiteContent(),{headers:{"Cache-Control":"no-store, no-cache, must-revalidate, max-age=0"}});
  }catch{return Response.json({ok:false,error:"Não foi possível carregar o conteúdo."},{status:503,headers:{"Cache-Control":"no-store, no-cache, must-revalidate, max-age=0"}});}
}

export async function PUT(request:Request){
  try{
    await requireCmsAdmin();
    const content=normalizeContent(await request.json());
    const now=new Date().toISOString();
    const value=JSON.stringify(content);
    await sql()`INSERT INTO cms_content (key,value,updated_at) VALUES ('site',${value},${now}) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value, updated_at=EXCLUDED.updated_at`;
    return Response.json({ok:true,content});
  }catch(error){
    const message=error instanceof Error?error.message:"ERROR";
    return Response.json({ok:false,error:message},{status:message==="UNAUTHENTICATED"?401:message==="FORBIDDEN"?403:500});
  }
}
