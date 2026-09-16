import { requireCmsAdmin } from "@/lib/cms-auth";
import { loadSiteContentSafe } from "@/lib/site-content-server";
import CmsClient from "./cms-client";

export const dynamic="force-dynamic";

export default async function CmsPage(){
  const user=await requireCmsAdmin(true);
  const initialContent=await loadSiteContentSafe();
  return <CmsClient userName={user.displayName} initialContent={initialContent}/>;
}
