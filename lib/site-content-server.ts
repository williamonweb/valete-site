import "server-only";

import { defaultContent, normalizeContent, SiteContent } from "@/lib/site-content";
import { sql } from "@/lib/db";

export async function loadSiteContent():Promise<SiteContent>{
  const rows=await sql()`SELECT value FROM cms_content WHERE key = 'site' LIMIT 1` as Array<{value:string}>;
  return rows[0]?normalizeContent(JSON.parse(rows[0].value)):defaultContent;
}

export async function loadSiteContentSafe():Promise<SiteContent>{
  try{return await loadSiteContent();}
  catch{return defaultContent;}
}
