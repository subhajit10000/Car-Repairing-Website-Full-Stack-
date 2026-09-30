
import {useEffect,useState} from "react";
import {useParams,useNavigate} from "react-router-dom";
import {ArrowLeft,Printer,Receipt} from "lucide-react";
import bookingService from "../../services/bookingService.js";

const Invoice=()=>{
 const {id}=useParams(); const nav=useNavigate(); const [invoice,setInvoice]=useState(null); const [error,setError]=useState("");
 useEffect(()=>{bookingService.getInvoice(id).then(r=>setInvoice(r?.data?.data||r?.data)).catch(e=>setError(e.message));},[id]);
 if(error)return <div className="min-h-screen bg-zinc-900 text-white pt-24 text-center"><p className="text-red-400">{error}</p></div>;
 if(!invoice)return <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">Loading invoice...</div>;
 return <div className="min-h-screen bg-zinc-900 text-white pt-24 pb-16 px-4"><div className="max-w-3xl mx-auto bg-white text-zinc-900 rounded-3xl p-6 sm:p-10 print:shadow-none">
 <div className="flex justify-between gap-4 border-b pb-6"><div><h1 className="text-3xl font-black">Car<span className="text-yellow-600">Detailing</span></h1><p className="text-zinc-500">Repair Invoice</p></div><Receipt className="text-yellow-600 w-10 h-10"/></div>
 <div className="grid sm:grid-cols-2 gap-5 py-6 text-sm"><p><b>Invoice:</b> {invoice.invoiceNumber}<br/><b>Date:</b> {new Date(invoice.date).toLocaleString()}</p><p><b>Customer:</b> {invoice.customer?.firstName} {invoice.customer?.lastName}<br/><b>Email:</b> {invoice.customer?.email}</p><p><b>Workshop:</b> {invoice.workshop?.name}<br/>{invoice.workshop?.location}</p><p><b>Vehicle:</b> {invoice.vehicle?.make} {invoice.vehicle?.model}<br/><b>Registration:</b> {invoice.vehicle?.regNumber}</p></div>
 <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3">Service</th><th className="text-right">Estimated</th></tr></thead><tbody>{(invoice.services||[]).map(s=><tr key={s._id} className="border-b"><td className="py-3">{s.name}</td><td className="text-right">₹{Number(s.startingPrice||0).toLocaleString("en-IN")}</td></tr>)}</tbody></table>
 <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm"><div className="flex justify-between"><span>Estimate</span><span>₹{Number(invoice.estimatedCost||0).toLocaleString("en-IN")}</span></div><div className="flex justify-between text-xl font-black border-t pt-3"><span>Final Total</span><span>₹{Number(invoice.finalCost||0).toLocaleString("en-IN")}</span></div></div>
 <div className="mt-8 flex gap-3 print:hidden"><button onClick={()=>window.print()} className="px-5 py-3 rounded-xl bg-yellow-500 font-bold flex gap-2 items-center"><Printer size={18}/> Print / Save PDF</button><button onClick={()=>nav("/my-bookings")} className="px-5 py-3 rounded-xl border border-zinc-300 font-semibold flex gap-2 items-center"><ArrowLeft size={18}/> Back</button></div>
 </div></div>;
};
export default Invoice;
