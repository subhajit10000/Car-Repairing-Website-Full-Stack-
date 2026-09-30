import { useEffect, useState } from "react";
import notificationService from "../../services/notificationService.js";
import { Bell, Check } from "lucide-react";

export default function ManagerNotifications() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const r = await notificationService.getMine();
      const data = r?.data?.data || r?.data || {};
      setItems(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => { load(); const timer = setInterval(load, 30000); return () => clearInterval(timer); }, []);

  const markRead = async (id) => {
    await notificationService.markRead(id);
    load();
  };

  return (
    <section className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Bell className="text-yellow-500"/><h2 className="font-bold">Notifications</h2>{unread > 0 && <span className="px-2 py-0.5 rounded-full bg-yellow-500 text-zinc-950 text-xs font-black">{unread}</span>}</div>
        {unread > 0 && <button onClick={async()=>{await notificationService.markAllRead();load()}} className="text-xs text-yellow-500">Mark all read</button>}
      </div>
      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
        {items.map((n) => <button key={n._id} onClick={()=>!n.read&&markRead(n._id)} className={`w-full text-left p-3 rounded-xl border ${n.read ? "border-zinc-800 bg-zinc-950" : "border-yellow-500/30 bg-yellow-500/5"}`}>
          <div className="flex gap-3"><Bell size={16} className="mt-1 text-yellow-500 shrink-0"/><div className="flex-1"><p className="font-semibold text-sm">{n.title}</p><p className="text-xs text-zinc-500 mt-1">{n.message}</p><p className="text-[10px] text-zinc-600 mt-2">{new Date(n.createdAt).toLocaleString()}</p></div>{n.read && <Check size={15} className="text-zinc-600"/>}</div>
        </button>)}
        {!items.length && <p className="text-sm text-zinc-600 py-3">No notifications yet.</p>}
      </div>
    </section>
  );
}
