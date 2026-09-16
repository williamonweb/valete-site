import { requireCmsAdmin } from "@/lib/cms-auth";
import { sql } from "@/lib/db";

export const dynamic="force-dynamic";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    await requireCmsAdmin();
    await sql()`ALTER TABLE contact_leads ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ`;
    const {id}=await params;
    const leadId=Number(id);
    const body=await request.json() as {isRead?:unknown;delivered?:unknown};
    const hasRead=typeof body.isRead==="boolean";
    const hasDelivered=typeof body.delivered==="boolean";
    if(!Number.isInteger(leadId)||leadId<1||(!hasRead&&!hasDelivered)){
      return Response.json({ok:false,error:"Dados inválidos."},{status:400});
    }
    if(hasRead)await sql()`UPDATE contact_leads SET is_read = ${body.isRead as boolean} WHERE id = ${leadId}`;
    const deliveredAt=hasDelivered?(body.delivered?new Date().toISOString():null):undefined;
    if(hasDelivered)await sql()`UPDATE contact_leads SET delivered_at = ${deliveredAt as string|null} WHERE id = ${leadId}`;
    return Response.json({ok:true,deliveredAt});
  }catch(error){
    const message=error instanceof Error?error.message:"ERROR";
    return Response.json({error:message},{status:message==="UNAUTHENTICATED"?401:message==="FORBIDDEN"?403:500});
  }
}
