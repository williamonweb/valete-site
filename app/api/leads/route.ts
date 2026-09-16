import { requireCmsAdmin } from "@/lib/cms-auth";
import { sql } from "@/lib/db";

export const dynamic="force-dynamic";

type LeadInput={name?:unknown;phone?:unknown;email?:unknown;message?:unknown;company?:unknown};

function clean(value:unknown,max:number){
  return typeof value==="string"?value.trim().slice(0,max):"";
}

export async function POST(request:Request){
  try{
    const body=await request.json() as LeadInput;
    if(clean(body.company,100)) return Response.json({ok:true},{status:201});
    const name=clean(body.name,100);
    const phone=clean(body.phone,30);
    const email=clean(body.email,160).toLowerCase();
    const message=clean(body.message,2000);
    const phoneDigits=phone.replace(/\D/g,"");
    const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if(name.length<2||phoneDigits.length<10||phoneDigits.length>15||!emailOk||message.length<5){
      return Response.json({ok:false,error:"Confira os campos e tente novamente."},{status:400});
    }
    const createdAt=new Date().toISOString();
    await sql()`INSERT INTO contact_leads (name,phone,email,message,is_read,created_at) VALUES (${name},${phone},${email},${message},false,${createdAt})`;
    return Response.json({ok:true},{status:201});
  }catch{
    return Response.json({ok:false,error:"Não foi possível enviar agora. Tente novamente."},{status:500});
  }
}

export async function GET(){
  try{
    await requireCmsAdmin();
    await sql()`ALTER TABLE contact_leads ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ`;
    const rows=await sql()`SELECT id,name,phone,email,message,CASE WHEN is_read THEN 1 ELSE 0 END AS "isRead",delivered_at AS "deliveredAt",created_at AS "createdAt" FROM contact_leads ORDER BY created_at DESC LIMIT 200`;
    return Response.json({leads:rows});
  }catch(error){
    const message=error instanceof Error?error.message:"ERROR";
    return Response.json({error:message},{status:message==="UNAUTHENTICATED"?401:message==="FORBIDDEN"?403:500});
  }
}
