import { requireCmsAdmin } from "@/lib/cms-auth";
import CmsClient from "./cms-client";

export const dynamic="force-dynamic";

export default async function CmsPage(){
  const user=await requireCmsAdmin(true);
  return <CmsClient userName={user.displayName}/>;
}
