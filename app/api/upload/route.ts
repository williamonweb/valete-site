import { requireCmsAdmin } from "@/lib/cms-auth";
import { put } from "@vercel/blob";

export const dynamic="force-dynamic";
const allowed=new Set(["image/jpeg","image/png","image/webp"]);

export async function POST(request:Request){
  try{
    await requireCmsAdmin();
    const data=await request.formData();
    const file=data.get("file");
    if(!(file instanceof File)) return Response.json({error:"Selecione uma imagem."},{status:400});
    if(!allowed.has(file.type)||file.size>5*1024*1024) return Response.json({error:"Use JPG, PNG ou WEBP de até 5 MB."},{status:400});
    const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
    const key=`valete/uploads/${crypto.randomUUID()}.${ext}`;
    const blob=await put(key,file,{access:"public",addRandomSuffix:false});
    return Response.json({url:blob.url});
  }catch(error){
    const message=error instanceof Error?error.message:"ERROR";
    return Response.json({error:message},{status:message==="FORBIDDEN"?403:401});
  }
}
