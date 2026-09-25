export type Unit = 'kg'|'ud'|'l';
export type Supplier = {id:string;name:string};
export type Tariff = {id:string;supplierId:string;name:string;effectiveDate:string;createdAt:string};
export type Item = {id:string;name:string;unit:Unit};
export type Line = {id:string;tariffId:string;supplierId:string;code:string;name:string;price:number;unit:Unit;masterId:string|null;sourceRow:number|null;packNote:string};
export type Data = {suppliers:Supplier[];tariffs:Tariff[];items:Item[];lines:Line[]};
export const empty:Data={suppliers:[],tariffs:[],items:[],lines:[]};
export const id=()=>crypto.randomUUID();
export const normalize=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\b(uk|up)\b/g,'').replace(/[^a-z0-9]+/g,' ').trim();
export const money=(v:number)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:4}).format(v);
export function activeLines(data:Data){const today=new Date().toISOString().slice(0,10);const sorted=data.tariffs.filter(t=>t.effectiveDate<=today).sort((a,b)=>b.effectiveDate.localeCompare(a.effectiveDate)||b.createdAt.localeCompare(a.createdAt));const seen=new Set<string>();const out:Line[]=[];for(const t of sorted){for(const l of data.lines.filter(x=>x.tariffId===t.id)){const key=l.supplierId+'|'+(l.code||normalize(l.name));if(!seen.has(key)){seen.add(key);out.push(l)}}}return out}
export function compare(data:Data,masterId:string){const item=data.items.find(x=>x.id===masterId);if(!item)return [];return activeLines(data).filter(l=>l.masterId===masterId&&l.unit===item.unit).sort((a,b)=>a.price-b.price)}
