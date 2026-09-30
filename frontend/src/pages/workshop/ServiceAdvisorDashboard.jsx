import { useEffect, useState } from "react";
import { MessageCircle, Send, CalendarDays, Image as ImageIcon, X } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import communityService from "../../services/communityService.js";

export default function ServiceAdvisorDashboard(){
 const [items,setItems]=useState([]),[selected,setSelected]=useState(null),[thread,setThread]=useState([]);
 const [message,setMessage]=useState(""),[image,setImage]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState("");

 const load=async()=>{try{const r=await communityService.getAppointments();setItems(r?.data||[])}catch(e){setError(e.message)}};
 useEffect(()=>{load()},[]);

 const openThread=async(appointment)=>{
  setSelected(appointment);setError("");
  try{const r=await communityService.getConversation(appointment._id);setThread(r?.data||[])}catch(e){setError(e.message)}
 };

 const send=async()=>{
  if(!selected||(!message.trim()&&!image))return;
  try{
   setBusy(true);setError("");
   const r=await communityService.sendMessage(selected._id,{text:message.trim(),image});
   setThread(current=>[...current,r?.data]);
   setMessage("");setImage(null);
  }catch(e){setError(e.message)}finally{setBusy(false)}
 };

 return <DashboardLayout><div className="max-w-7xl mx-auto"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-black">Service Advisor</h1><p className="text-zinc-500 mt-1">Message customers — text or photos show up in their Community tab.</p></div><MessageCircle className="text-yellow-500"/></div>{error&&<p className="mt-4 text-red-400">{error}</p>}<div className="grid lg:grid-cols-[1fr_1.3fr] gap-6 mt-8"><div className="space-y-3">{items.map(a=><button key={a._id} onClick={()=>openThread(a)} className={`w-full text-left p-5 rounded-2xl border ${selected?._id===a._id?"border-yellow-500 bg-yellow-500/10":"border-zinc-800 bg-zinc-900"}`}><p className="font-bold">{a.user?.firstName} {a.user?.lastName}</p><p className="text-sm text-zinc-500 mt-1">{a.vehicle?.make} {a.vehicle?.model} · {a.vehicle?.regNumber}</p><p className="text-xs text-zinc-600 mt-2"><CalendarDays size={13} className="inline mr-1"/>{a.status}</p></button>)}</div><div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">{selected?<>
  <h2 className="text-xl font-bold">Chat with {selected.user?.firstName}</h2>
  <div className="mt-4 space-y-3 max-h-[45vh] overflow-y-auto pr-1 flex-1">
   {thread.length===0&&<p className="text-zinc-600 text-sm">No messages yet — say hello below.</p>}
   {thread.map(m=><div key={m._id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
     <div className="flex items-center justify-between"><p className="text-xs font-semibold text-yellow-500">{m.sender?.firstName} {m.sender?.lastName}</p><p className="text-xs text-zinc-600">{new Date(m.createdAt).toLocaleString()}</p></div>
     {m.text&&<p className="mt-1 text-sm text-zinc-200 whitespace-pre-wrap">{m.text}</p>}
     {m.image?.url&&<img src={m.image.url} alt="Shared" className="mt-2 rounded-lg max-h-48 object-cover"/>}
   </div>)}
  </div>
  <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Repair update, advice, pickup instructions..." rows="3" className="w-full mt-4 bg-zinc-950 border border-zinc-800 rounded-xl p-3"/>
  <div className="flex items-center gap-3 mt-3">
   <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-zinc-700 cursor-pointer text-sm text-zinc-400 hover:border-yellow-500">
    <ImageIcon size={16} className="text-yellow-500"/>{image?image.name:"Attach photo"}
    <input type="file" accept="image/*" className="hidden" onChange={e=>setImage(e.target.files?.[0]||null)}/>
   </label>
   {image&&<button type="button" onClick={()=>setImage(null)} className="text-zinc-500 hover:text-red-400"><X size={16}/></button>}
   <button disabled={busy||(!message.trim()&&!image)} onClick={send} className="ml-auto px-5 py-2.5 rounded-xl bg-yellow-500 text-zinc-950 font-bold flex items-center gap-2 disabled:opacity-50"><Send size={16}/>{busy?"Sending...":"Send"}</button>
  </div>
 </>:<p className="text-zinc-500">Select a repair to message the customer.</p>}</div></div></div></DashboardLayout>
}
