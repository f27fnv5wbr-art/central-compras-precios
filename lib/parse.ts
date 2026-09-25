import type {Unit} from './model';
export type Draft={code:string;name:string;price:number;unit:Unit;sourceRow:number|null;packNote:string};
const price=(v:unknown)=>{if(typeof v==='number')return v;let s=String(v??'').trim().replace(/[€\s]/g,'');if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(',','.');return Number(s)};
const unit=(v:unknown):Unit=>/\b(kg|kilo|uk)\b/i.test(String(v))?'kg':/\b(l|litro)\b/i.test(String(v))?'l':'ud';
export async function parseFile(file:File):Promise<Draft[]>{
 if(/\.pdf$/i.test(file.name))return parsePdf(file);
 const XLSX=await import('xlsx');const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});const rows:unknown[][]=[];
 for(const sheet of wb.SheetNames)rows.push(...XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheet],{header:1,defval:''}));
 const header=rows.findIndex(r=>r.some(c=>/^(código|codigo|producto|artículo|articulo|descripción|descripcion)$/i.test(String(c).trim())));
 const h=header>=0?rows[header].map(x=>String(x).toLowerCase().trim()):[];
 const col=(terms:string[])=>h.findIndex(x=>terms.some(t=>x===t||x.includes(t)));
 const hotelsa=h.includes('precio um')&&h.includes('ref');
 const nameIdx=hotelsa?1:Math.max(0,col(['descripción','descripcion','producto','artículo','articulo','nombre']));
 const priceIdx=hotelsa?5:col(['precio um','precio unitario','precio','importe']);
 if(priceIdx<0)throw Error('No encuentro una columna de precio. Usa encabezados Producto y Precio, o la tarifa original.');
 const codeIdx=hotelsa?0:col(['ref','código','codigo']);const unitIdx=hotelsa?6:col(['unidad','ud. venta','ud venta']);
 return rows.slice(header+1).flatMap((r,i)=>{const n=String(r[nameIdx]??'').trim(),p=price(r[priceIdx]);if(!n||!Number.isFinite(p)||p<=0)return [];
  const sale=unitIdx>=0?String(r[unitIdx]??''):'';
  // Hotelsa's Precio UM is a price per sale measure. A box price is never silently compared with kg.
  const u:Unit=hotelsa&&/^(caja|bolsa|saco)$/i.test(sale)?'ud':unit(sale||n);
  return [{code:codeIdx>=0?String(r[codeIdx]??'').trim():'',name:n,price:p,unit:u,sourceRow:header+i+2,packNote:hotelsa?`Venta: ${sale}; unidades caja: ${r[4]}; precio caja: ${r[7]}`:''}];});
}
async function parsePdf(file:File):Promise<Draft[]>{
 const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/legacy/build/pdf.worker.mjs',import.meta.url).toString();
 const doc=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
 const rows=new Map<string,{x:number;text:string}[]>();
 for(let page=1;page<=doc.numPages;page++){const content=await(await doc.getPage(page)).getTextContent();for(const it of content.items){if(!('str'in it)||!it.str.trim())continue;const key=`${page}:${Math.round(it.transform[5]*2)/2}`;const list=rows.get(key)||[];list.push({x:it.transform[4],text:it.str});rows.set(key,list)}}
 const found:Draft[]=[];
 for(const cells of rows.values()){cells.sort((a,b)=>a.x-b.x);const text=cells.map(x=>x.text).join(' ');
  const regex=/(?:^|\s)(\d{1,5})\s+(.+?)\s+(UK|UP)\s+(\d{1,4}[,.]\d{2,4})(?=\s|#|$)/gi;
  for(const m of text.matchAll(regex)){const p=price(m[4]);if(p>0)found.push({code:m[1],name:m[2].trim(),price:p,unit:m[3].toUpperCase()==='UK'?'kg':'ud',sourceRow:null,packNote:`Unidad original: ${m[3].toUpperCase()}`})}
 }
 if(!found.length)throw Error('No se reconocieron líneas de precio en este PDF. Exporta la tarifa a Excel o CSV con columnas Producto y Precio.');
 return found;
}
