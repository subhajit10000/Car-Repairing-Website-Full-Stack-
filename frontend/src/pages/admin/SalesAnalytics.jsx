import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import axiosInstance from "../../api/axiosInstance.js";
import { getCurrentUser } from "../../utils/storage.js";

const money = (n) => `₹${Number(n || 0).toLocaleString()}`;

// Shared by ADMIN (all workshops) and WORKSHOP_MANAGER (own workshop only —
// enforced server-side in analytics.controller.js).
export default function SalesAnalytics() {
  const user = getCurrentUser();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const [data, setData] = useState(null);
  const [workshopFilter, setWorkshopFilter] = useState("");
  const [workshopOptions, setWorkshopOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (workshop = "") => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/analytics/sales", { params: workshop ? { workshop } : {} });
      const d = res.data?.data;
      setData(d);
      // Keep the full workshop list for the admin filter from the unfiltered call.
      if (!workshop && isAdmin) setWorkshopOptions(d?.byWorkshop || []);
    } catch (e) {
      setError(e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onFilter = (e) => {
    setWorkshopFilter(e.target.value);
    load(e.target.value);
  };

  const stats = data
    ? [
        ["Total Revenue", money(data.totalRevenue)],
        ["Total Bookings", data.totalBookings],
        ["Completed", data.completedBookings],
        ["In Progress / Pending", data.pendingBookings],
        ["Cancelled", data.cancelledBookings],
      ]
    : [];

  const tooltipStyle = { background: "#18181b", border: "1px solid #3f3f46", borderRadius: 12 };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Sales Analytics</h1>
          <p className="text-zinc-500 mt-1">
            {isAdmin ? "Revenue and bookings across workshops." : "Revenue and bookings for your workshop."}
          </p>
        </div>
        {isAdmin && (
          <select
            value={workshopFilter}
            onChange={onFilter}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm"
          >
            <option value="">All workshops</option>
            {workshopOptions.map((w) => (
              <option key={w.workshopId} value={w.workshopId}>{w.name}</option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="mt-4 text-red-400">{error}</p>}
      {loading && <p className="mt-8 text-zinc-500">Loading analytics...</p>}

      {!loading && data && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            {stats.map(([label, value]) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <p className="text-xs uppercase font-bold text-zinc-500">{label}</p>
                <p className="text-2xl font-black mt-2 text-yellow-500">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="font-bold mb-4">Monthly Revenue</h2>
              {data.monthlyRevenue.length === 0 ? (
                <p className="text-zinc-500 text-sm">No data yet.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.monthlyRevenue}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(v)} />
                      <Line type="monotone" dataKey="revenue" stroke="#eab308" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="font-bold mb-4">Monthly Bookings</h2>
              {data.monthlyRevenue.length === 0 ? (
                <p className="text-zinc-500 text-sm">No data yet.</p>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyRevenue}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                      <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                      <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="bookings" fill="#eab308" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {isAdmin && !workshopFilter && data.byWorkshop.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-6">
              <h2 className="font-bold mb-4">Revenue by Workshop</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 border-b border-zinc-800">
                      <th className="py-3">Workshop</th>
                      <th className="py-3">Bookings</th>
                      <th className="py-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byWorkshop.map((w) => (
                      <tr key={w.workshopId} className="border-b border-zinc-800/60">
                        <td className="py-3 font-semibold">{w.name}</td>
                        <td className="py-3">{w.bookings}</td>
                        <td className="py-3 text-yellow-500 font-bold">{money(w.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
