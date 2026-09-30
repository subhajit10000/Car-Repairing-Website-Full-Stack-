import { useEffect, useState } from "react";
import analyticsService from "../../services/analyticsService.js";
import { BarChart3, IndianRupee, CalendarCheck, CheckCircle2 } from "lucide-react";

export default function SalesAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    analyticsService.getSales()
      .then((r) => setData(r?.data?.data || r?.data))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="mt-4 text-red-400">{error}</p>;
  if (!data) return <div className="mt-6 text-zinc-500">Loading sales analytics...</div>;

  const s = data.summary || {};
  const max = Math.max(...(data.monthly || []).map((x) => Number(x.collectedSales || 0)), 1);

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4"><BarChart3 className="text-yellow-500"/><h2 className="text-xl font-bold">Sales Analytics</h2></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Collected sales", `₹${Number(s.collectedSales || 0).toLocaleString("en-IN")}`, IndianRupee],
          ["Appointments", s.appointments || 0, CalendarCheck],
          ["Completed", s.completed || 0, CheckCircle2],
          ["Estimated sales", `₹${Number(s.estimatedSales || 0).toLocaleString("en-IN")}`, BarChart3],
        ].map(([label,value,Icon]) => <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"><Icon size={18} className="text-yellow-500"/><p className="text-2xl font-black mt-3">{value}</p><p className="text-xs text-zinc-500 mt-1">{label}</p></div>)}
      </div>
      <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="font-bold">Monthly collected sales</p>
        <div className="mt-5 space-y-4">
          {(data.monthly || []).map((m) => {
            const label = `${m._id.month}/${m._id.year}`;
            const value = Number(m.collectedSales || 0);
            return <div key={label} className="grid grid-cols-[70px_1fr_100px] gap-3 items-center text-sm">
              <span className="text-zinc-500">{label}</span>
              <div className="h-3 rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-yellow-500 rounded-full" style={{width:`${Math.max((value/max)*100, value ? 2 : 0)}%`}}/></div>
              <span className="text-right">₹{value.toLocaleString("en-IN")}</span>
            </div>;
          })}
        </div>
      </div>
      {data.workshops?.length > 0 && <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5"><p className="font-bold mb-4">Workshop sales</p>{data.workshops.map(w=><div key={w._id} className="flex justify-between py-3 border-b border-zinc-800 last:border-0"><span>{w.name || "Workshop"}</span><span className="text-yellow-500 font-bold">₹{Number(w.collectedSales || 0).toLocaleString("en-IN")}</span></div>)}</div>}
    </section>
  );
}
