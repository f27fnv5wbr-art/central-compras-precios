'use client';

import {useMemo,useState} from 'react';
import {normalize,type Item,type Line,type Unit} from '../lib/model';

type Props={
 items:Item[];
 lines:Line[];
 onSave:(id:string,name:string,unit:Unit)=>string|null;
 onRemove:(id:string)=>void;
};

export default function MasterEditor({items,lines,onSave,onRemove}:Props){
 const [query,setQuery]=useState('');
 const [editing,setEditing]=useState<string|null>(null);
 const [name,setName]=useState('');
 const [unit,setUnit]=useState<Unit>('kg');
 const [error,setError]=useState('');
 const filtered=useMemo(()=>items.filter(item=>normalize(item.name).includes(normalize(query))).sort((a,b)=>a.name.localeCompare(b.name,'es')),[items,query]);
 function begin(item:Item){setEditing(item.id);setName(item.name);setUnit(item.unit);setError('')}
 function save(){if(!editing)return;const message=onSave(editing,name,unit);if(message){setError(message);return}setEditing(null);setError('')}
 return <section className="card">
  <div className="sectionhead"><div><h2>Lista de artículos maestros</h2><p>Busca, modifica el nombre o la unidad y guarda cada cambio. Si cambia la unidad, los vínculos incompatibles quedarán por revisar.</p></div></div>
  <input className="search" aria-label="Buscar artículo maestro" placeholder="Buscar artículo maestro" value={query} onChange={e=>setQuery(e.target.value)}/>
  {error&&<p className="error" role="alert">{error}</p>}
  <div className="tablewrap preview"><table><thead><tr><th>Artículo</th><th>Unidad</th><th>Vínculos</th><th>Acciones</th></tr></thead><tbody>
   {filtered.map(item=><tr key={item.id}>
    <td>{editing===item.id?<input aria-label="Nombre del artículo" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save()}}/>:item.name}</td>
    <td>{editing===item.id?<select aria-label="Unidad del artículo" value={unit} onChange={e=>setUnit(e.target.value as Unit)}><option value="kg">kg</option><option value="ud">ud</option><option value="l">l</option></select>:item.unit}</td>
    <td>{lines.filter(line=>line.masterId===item.id).length}</td>
    <td>{editing===item.id?<><button onClick={save}>Guardar</button><button className="secondary" onClick={()=>{setEditing(null);setError('')}}>Cancelar</button></>:<><button className="secondary" onClick={()=>begin(item)}>Editar</button><button className="secondary" onClick={()=>onRemove(item.id)}>Quitar</button></>}</td>
   </tr>)}
  </tbody></table></div>
  <p className="muted">{filtered.length} de {items.length} artículos. Quitar un artículo no borra los precios históricos.</p>
 </section>
}
