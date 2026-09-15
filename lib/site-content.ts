export type Member = { id:string; name:string; role:string; bio:string; imageUrl:string; iconUrl:string; instagramUrl:string };
export type Show = { id:string; date:string; dateIso:string; time:string; place:string; city:string; note:string; coverUrl:string; status:"past"|"upcoming" };
export type MusicVideo = { id:string; title:string; url:string };
export type MusicTrack = { id:string; title:string; artist:string; coverUrl:string; url:string };
export type AlbumPhoto = { id:string; url:string; caption:string };
export type PhotoAlbum = { id:string; title:string; description:string; coverUrl:string; photos:AlbumPhoto[] };
export type SiteContent = {
  brand:{ logoUrl:string; tagline:string; city:string; accentColor:string; heroImageUrl:string; heroTitle:string; heroText:string };
  about:{ heading:string; text:string };
  members:Member[];
  shows:Show[];
  music:{ label:string; title:string; description:string; repertoire:string; tracks:MusicTrack[] };
  videos:MusicVideo[];
  albums:PhotoAlbum[];
  contact:{ heading:string; text:string; whatsapp:string; instagram:string };
};

export const defaultContent:SiteContent = {
  brand:{ logoUrl:"/valete-logo-cropped.png", tagline:"ROCK N’ ROLL É NOSSO COMPROMISSO.", city:"GRAVATAÍ · RIO GRANDE DO SUL", accentColor:"#c49a52", heroImageUrl:"/uploads/hero.png", heroTitle:"O ROCK NÃO PEDE LICENÇA.", heroText:"Duas guitarras. Baixo. Bateria. Uma noite para cantar alto." },
  about:{ heading:"QUATRO MÚSICOS. UMA NOITE INTEIRA DE ROCK.", text:"A Valete nasceu em Gravataí para levar ao palco o rock que marcou uma geração — das guitarras dos anos 2000 aos clássicos que pedem volume alto." },
  members:[
    {id:"william",name:"WILLIAM",role:"Voz · Guitarra base",bio:"Biografia em breve.",imageUrl:"/uploads/william.png",iconUrl:"",instagramUrl:""},
    {id:"maicon",name:"MAICON",role:"Guitarra",bio:"Biografia em breve.",imageUrl:"/uploads/maicon.jpg",iconUrl:"",instagramUrl:""},
    {id:"aurelio",name:"AURÉLIO",role:"Baixo",bio:"Biografia em breve.",imageUrl:"/uploads/aurelio.png",iconUrl:"",instagramUrl:""},
    {id:"rodrigo",name:"RODRIGO",role:"Bateria",bio:"Biografia em breve.",imageUrl:"",iconUrl:"",instagramUrl:""},
  ],
  shows:[
    {id:"maverick",date:"19 SETEMBRO",dateIso:"2026-09-19",time:"",place:"Bilhar do Nando",city:"Cachoeirinha - RS",note:"",coverUrl:"",status:"upcoming"},
    {id:"taberna",date:"24 SETEMBRO",dateIso:"2026-09-24",time:"",place:"Confraria das Máquinas",city:"Gravataí - RS",note:"",coverUrl:"",status:"upcoming"},
    {id:"itapua",date:"25 SETEMBRO",dateIso:"2026-09-25",time:"",place:"Taberna Velho Oeste",city:"Sapucaia do Sul - RS",note:"",coverUrl:"",status:"upcoming"},
  ],
  music:{label:"AUTORAL",title:"MÚSICAS DA VALETE",description:"Rock sentimental, estrada e intensidade. Ouça as músicas próprias da Valete.",repertoire:"POP ROCK NACIONAL · ROCK DOS ANOS 2000 · CLÁSSICOS INTERNACIONAIS · CRAZY TRAIN E MAIS",tracks:[{id:"entre-o-ceu-e-o-caos",title:"ENTRE O CÉU E O CAOS",artist:"Valete",coverUrl:"",url:""}]},
  videos:[{id:"outro-lugar",title:"Outro Lugar",url:"https://www.youtube.com/watch?v=XgY4Xh4hhDU"}],
  albums:[],
  contact:{heading:"SEU EVENTO PEDE ROCK?",text:"Festivais, pubs, encontros de motociclistas e eventos particulares. Fale com a Valete e consulte a agenda.",whatsapp:"",instagram:"https://www.instagram.com/bandavalete/"},
};

export function normalizeContent(value:unknown):SiteContent {
  if (!value || typeof value!=="object") return defaultContent;
  const v=value as Partial<SiteContent>;
  const brand={...defaultContent.brand,...v.brand};
  const incomingMusic=v.music as (Partial<SiteContent["music"]>&{videos?:MusicVideo[]})|undefined;
  const legacyVideos=incomingMusic?.videos;
  if(brand.accentColor==="#ff3b1f"||brand.accentColor==="#d6ff00") brand.accentColor=defaultContent.brand.accentColor;
  return {
    brand,
    about:{...defaultContent.about,...v.about},
    members:Array.isArray(v.members)?v.members.map(member=>({...member,iconUrl:member.iconUrl||"",instagramUrl:member.instagramUrl||""})):defaultContent.members,
    shows:Array.isArray(v.shows)?v.shows.map(show=>({...show,dateIso:show.dateIso||"",time:show.time||"",coverUrl:show.coverUrl||""})):defaultContent.shows,
    music:{
      label:incomingMusic?.label??defaultContent.music.label,
      title:incomingMusic?.title??defaultContent.music.title,
      description:incomingMusic?.description??defaultContent.music.description,
      repertoire:incomingMusic?.repertoire??defaultContent.music.repertoire,
      tracks:Array.isArray(incomingMusic?.tracks)?incomingMusic.tracks.map(track=>({...track,artist:track.artist||"Valete",coverUrl:track.coverUrl||"",url:track.url||""})):defaultContent.music.tracks,
    },
    videos:Array.isArray(v.videos)?v.videos:Array.isArray(legacyVideos)?legacyVideos:defaultContent.videos,
    albums:Array.isArray(v.albums)?v.albums.map(album=>({
      ...album,
      description:album.description||"",
      coverUrl:album.coverUrl||"",
      photos:Array.isArray(album.photos)?album.photos.map(photo=>({...photo,caption:photo.caption||""})):[],
    })):defaultContent.albums,
    contact:{...defaultContent.contact,...v.contact},
  };
}

function saoPauloDateKey(date=new Date()){
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
  const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function showStatus(show:Show){
  return show.dateIso?(show.dateIso<saoPauloDateKey()?"past":"upcoming"):show.status;
}

export function showDateLabel(show:Show){
  if(!show.dateIso)return show.date;
  const [year,month,day]=show.dateIso.split("-").map(Number);
  if(!year||!month||!day)return show.date;
  const label=new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"long",timeZone:"America/Sao_Paulo"}).format(new Date(Date.UTC(year,month-1,day,12)));
  return label.replace(" de "," ").toLocaleUpperCase("pt-BR");
}
