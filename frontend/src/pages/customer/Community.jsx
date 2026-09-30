import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Wrench } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import communityService from "../../services/communityService.js";

// Feature 1: read-only view of every message a service advisor has sent this
// customer, grouped by appointment. Reachable from the "Community" button in
// the sidebar (see components/layout/DashboardLayout.jsx).
export default function Community() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await communityService.getMyConversations();
        const data = r?.data || [];
        setMessages(data);
        const firstAppointment = data[0]?.appointment?._id || data[0]?.appointment;
        if (firstAppointment) setActiveId(firstAppointment);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const threads = useMemo(() => {
    const grouped = new Map();
    for (const m of messages) {
      const appointmentId = m.appointment?._id || m.appointment;
      if (!appointmentId) continue;
      if (!grouped.has(appointmentId)) {
        grouped.set(appointmentId, {
          id: appointmentId,
          appointment: m.appointment,
          workshop: m.workshop,
          items: [],
        });
      }
      grouped.get(appointmentId).items.push(m);
    }
    // messages arrive newest-first; sort each thread's items oldest-first for display
    return Array.from(grouped.values()).map((thread) => ({
      ...thread,
      items: [...thread.items].reverse(),
    }));
  }, [messages]);

  const activeThread = threads.find((t) => t.id === activeId) || threads[0] || null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">Community</h1>
            <p className="text-zinc-500 mt-1">Messages and photos your service advisors have shared with you.</p>
          </div>
          <MessageCircle className="text-yellow-500" />
        </div>

        {error && <p className="mt-4 text-red-400">{error}</p>}
        {loading && <p className="mt-6 text-zinc-500">Loading conversations...</p>}

        {!loading && threads.length === 0 && !error && (
          <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center text-zinc-500">
            No messages yet. Once a service advisor sends you an update, it will show up here.
          </div>
        )}

        {threads.length > 0 && (
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-6 mt-8">
            <div className="space-y-3">
              {threads.map((thread) => {
                const last = thread.items[thread.items.length - 1];
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveId(thread.id)}
                    className={`w-full text-left p-5 rounded-2xl border ${
                      activeThread?.id === thread.id ? "border-yellow-500 bg-yellow-500/10" : "border-zinc-800 bg-zinc-900"
                    }`}
                  >
                    <p className="font-bold flex items-center gap-2">
                      <Wrench size={14} className="text-yellow-500" /> {thread.workshop?.name || "Workshop"}
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">
                      {thread.appointment?.vehicle?.make} {thread.appointment?.vehicle?.model} · {thread.appointment?.vehicle?.regNumber}
                    </p>
                    <p className="text-xs text-zinc-600 mt-2 truncate">{last?.text || (last?.image?.url ? "Photo shared" : "")}</p>
                  </button>
                );
              })}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              {activeThread ? (
                <>
                  <h2 className="text-xl font-bold">{activeThread.workshop?.name || "Workshop"}</h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {activeThread.appointment?.vehicle?.make} {activeThread.appointment?.vehicle?.model} · {activeThread.appointment?.vehicle?.regNumber}
                  </p>
                  <div className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {activeThread.items.map((m) => (
                      <div key={m._id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-yellow-500">
                            {m.sender?.firstName} {m.sender?.lastName}
                            <span className="text-zinc-600 font-normal"> · Service Advisor</span>
                          </p>
                          <p className="text-xs text-zinc-600">{new Date(m.createdAt).toLocaleString()}</p>
                        </div>
                        {m.text && <p className="mt-2 text-zinc-200 whitespace-pre-wrap">{m.text}</p>}
                        {m.image?.url && (
                          <img src={m.image.url} alt="Shared" className="mt-3 rounded-xl max-h-80 object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-zinc-500">Select a conversation.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
