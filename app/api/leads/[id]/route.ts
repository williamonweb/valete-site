import { requireCmsAdmin } from "@/lib/cms-auth";
import { sql } from "@/lib/db";

export const dynamic="force-dynamic";

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    await requireCmsAdmin();
    const {id}=await params;
    const leadId=Number(id);
    const body=await request.json() as {isRead?:unknown};
    if(!Number.isInteger(leadId)||leadId<1||typeof body.isRead!=="boolean"){
      return Response.json({ok:false,error:"Dados inválidos."},{status:400});
    }
    await sql()`UPDATE contact_leads SET is_read = ${body.isRead} WHERE id = ${leadId}`;
    return Response.json({ok:true});
  }catch(error){
    const message=error instanceof Error?error.message:"ERROR";
    return Response.json({error:message},{status:message==="FORBIDDEN"?403:401});
  }
}
