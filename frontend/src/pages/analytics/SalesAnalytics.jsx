import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { IndianRupee, Wrench, ReceiptText, TrendingUp } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import analyticsService from "../../services/analyticsService.js";
import { workshopDetails } from "../../services/workshopService.js";
import { getCurrentUser } from "../../utils/storage.js";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <div className="flex items-center gap-2 text-zinc-500 text-sm"><Icon size={16} className="text-yellow-500" />{label}</div>
    <p className="text-2xl font-black mt-2">{value}</p>
  </div>
);

export default function SalesAnalytics() {
  const user = getCurrentUser();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const [workshops, setWorkshops] = useState([]);
  const [workshopId, setWorkshopId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdmin) {
      workshopDetails
        .getworkshopDetails()
        .then((r) => setWorkshops(r?.data || []))
        .catch(() => {});
    }
  }, [isAdmin]);

  useEffect(() => {
    setLoading(true);
    setError("");
    analyticsService
      .getSalesAnalytics(workshopId || undefined)
      .then((r) => setData(r?.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [workshopId]);

  const monthlyChart = (data?.monthly || []).map((m) => ({
    label: `${MONTH_NAMES[m.month - 1]} '${String(m.year).slice(2)}`,
    revenue: m.revenue,
  }));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-black">Sales Analytics</h1>
            <p className="text-zinc-500 mt-1">
              {isAdmin ? "Revenue across every workshop." : "Revenue for your workshop."}
            </p>
          </div>
          {isAdmin && workshops.length > 0 && (
            <select
              value={workshopId}
              onChange={(e) => setWorkshopId(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm"
            >
              <option value="">All workshops</option>
              {workshops.map((w) => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          )}
        </div>

        {error && <p className="mt-4 text-red-400">{error}</p>}
        {loading && <p className="mt-6 text-zinc-500">Loading analytics...</p>}

        {!loading && data && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${data.totalRevenue.toLocaleString("en-IN")}`} />
              <StatCard icon={Wrench} label="Completed Repairs" value={data.completedCount} />
              <StatCard icon={ReceiptText} label="Avg. Ticket Size" value={`₹${data.avgTicket.toLocaleString("en-IN")}`} />
              <StatCard icon={TrendingUp} label="In Progress Now" value={data.statusBreakdown?.IN_PROGRESS || 0} />
            </div>

            <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 mt-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="font-bold mb-4">Monthly revenue</h2>
                {monthlyChart.length === 0 ? (
                  <p className="text-zinc-600 text-sm">No completed repairs yet.</p>
                ) : (
                  <div style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={monthlyChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="label" stroke="#71717a" fontSize={12} />
                        <YAxis stroke="#71717a" fontSize={12} />
                        <Tooltip
                          contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 12 }}
                          formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="#eab308" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="font-bold mb-4">Booking status</h2>
                <div className="space-y-3">
                  {Object.entries(data.statusBreakdown || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">{status.replace("_", " ")}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="font-bold mb-4">Top services</h2>
                {(data.topServices || []).length === 0 ? (
                  <p className="text-zinc-600 text-sm">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.topServices.map((s) => (
                      <div key={s.serviceId} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300">{s.name}</span>
                        <span className="text-yellow-500 font-bold">{s.bookings} bookings</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isAdmin && !workshopId && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <h2 className="font-bold mb-4">Revenue by workshop</h2>
                  {(data.byWorkshop || []).length === 0 ? (
                    <p className="text-zinc-600 text-sm">No completed repairs yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.byWorkshop.map((w) => (
                        <div key={w.workshopId} className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">{w.name}</span>
                          <span className="font-bold">₹{w.revenue.toLocaleString("en-IN")} · {w.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
