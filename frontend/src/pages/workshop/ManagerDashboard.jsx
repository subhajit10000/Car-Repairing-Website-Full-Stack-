import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useEffect, useRef, useState } from "react";
import { Boxes, Users, Wrench, CalendarDays, Plus, Trash2, Save, Upload, X, Bell } from "lucide-react";
import managerService from "../../services/managerService.js";
import { workshopService } from "../../services/workshopService.js";
import bookingService from "../../services/bookingService.js";
import notificationService from "../../services/notificationService.js";
import communityService from "../../services/communityService.js";

const emptyEmployee = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "MECHANIC",
  profilePhoto: null,
};

const ManagerDashboard = () => {
  const [workshop, setWorkshop] = useState(null);
  const [services, setServices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("bookings");
  const [error, setError] = useState("");
  const [employee, setEmployee] = useState(emptyEmployee);
  const [newItem, setNewItem] = useState({
    name: "", sku: "", quantity: 0, unit: "pcs", unitPrice: 0, reorderLevel: 0,
  });

  // Feature 3: notification bell showing new-appointment alerts for this workshop.
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const r = await notificationService.getMyNotifications();
      setNotifications(r?.data?.notifications || []);
      setUnreadCount(r?.data?.unreadCount || 0);
    } catch {
      // Non-fatal — the rest of the dashboard should still work.
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const openNotifications = async () => {
    setShowNotifications((v) => !v);
    if (unreadCount > 0) {
      try {
        await notificationService.markAllRead();
        setUnreadCount(0);
        setNotifications((cur) => cur.map((n) => ({ ...n, isRead: true })));
      } catch {
        // Ignore — worst case the badge stays until the next successful call.
      }
    }
  };

  const load = async () => {
    try {
      setError("");
      const [w, s, i, b] = await Promise.all([
        managerService.getMyWorkshop(),
        workshopService.getServices(),
        managerService.getInventory(),
        // Feature 2: this endpoint (unlike /appointments) also populates
        // assignedMechanic, so the mechanic dropdown below can show who's
        // already on a booking.
        communityService.getAppointments(),
      ]);
      setWorkshop(w?.data?.data || w?.data);
      setServices(s?.data || []);
      setInventory(i?.data?.data || i?.data || []);
      setBookings(b?.data?.data || b?.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const addService = async (id) => {
    try { await managerService.addService(id); await load(); } catch (e) { setError(e.message); }
  };
  const removeService = async (id) => {
    try { await managerService.removeService(id); await load(); } catch (e) { setError(e.message); }
  };

  const addEmployee = async () => {
    if (!employee.firstName || !employee.lastName || !employee.email || !employee.phone) {
      setError("Please fill first name, last name, email and phone number.");
      return;
    }

    const body = new FormData();
    body.append("firstName", employee.firstName.trim());
    body.append("lastName", employee.lastName.trim());
    body.append("email", employee.email.trim());
    body.append("phone", employee.phone.trim());
    body.append("role", employee.role);
    if (employee.profilePhoto) body.append("profilePhoto", employee.profilePhoto);

    try {
      setError("");
      await managerService.addEmployee(body);
      setEmployee(emptyEmployee);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const removeEmployee = async (id) => {
    try { await managerService.removeEmployee(id); await load(); } catch (e) { setError(e.message); }
  };

  const addInventory = async () => {
    try {
      await managerService.addInventory({
        ...newItem,
        quantity: Number(newItem.quantity),
        unitPrice: Number(newItem.unitPrice),
        reorderLevel: Number(newItem.reorderLevel),
      });
      setNewItem({ name: "", sku: "", quantity: 0, unit: "pcs", unitPrice: 0, reorderLevel: 0 });
      await load();
    } catch (e) { setError(e.message); }
  };

  // Feature 2: workshop manager assigns a mechanic (from their own workshop's
  // roster) to a booking.
  const mechanics = (workshop?.employees || []).filter((e) => e.role === "MECHANIC");

  const assignMechanic = async (bookingId, mechanicId) => {
    if (!mechanicId) return;
    try {
      await managerService.assignMechanic(bookingId, mechanicId);
      // Re-fetch so the assigned mechanic's name is populated for display.
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const updateStatus = async (booking) => {
    const status = window.prompt(
      "New status: CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED",
      booking.status,
    );
    if (!status) return;

    const note = window.prompt("Progress note (optional):", "");
    let finalCost = booking.finalCost;
    if (status === "COMPLETED") {
      finalCost = window.prompt("Final amount:", String(booking.estimatedCost || 0));
    }

    try {
      const response = await bookingService.updateProgress(booking._id, {
        status,
        note,
        ...(finalCost !== null && finalCost !== undefined && finalCost !== ""
          ? { finalCost: Number(finalCost) }
          : {}),
      });
      const updated = response?.data?.data || response?.data;
      setBookings((current) =>
        current.map((item) => (item._id === booking._id ? updated : item)),
      );
    } catch (e) {
      setError(e.message);
    }
  };

  const tabs = [
    ["bookings", CalendarDays, "Repair Progress"],
    ["services", Wrench, "Services"],
    ["employees", Users, "Employees"],
    ["inventory", Boxes, "Inventory"],
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Workshop Manager</h1>
            <p className="text-zinc-400 mt-1">{workshop?.name || "Loading workshop..."}</p>
          </div>

          <div className="relative" ref={notifRef}>
            <button
              onClick={openNotifications}
              className="relative p-3 rounded-xl border border-zinc-700 hover:border-yellow-500"
            >
              <Bell size={20} className={unreadCount > 0 ? "text-yellow-500" : "text-zinc-400"} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-2xl shadow-xl z-20">
                <p className="px-4 py-3 border-b border-zinc-700 font-bold text-sm">Notifications</p>
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-zinc-500 text-center">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className={`px-4 py-3 border-b border-zinc-700/60 text-sm ${n.isRead ? "text-zinc-400" : "text-zinc-100"}`}>
                      <p>{n.message}</p>
                      <p className="text-xs text-zinc-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-8">
          {tabs.map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 rounded-xl border flex gap-2 items-center ${
                tab === key
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {tab === "bookings" && (
          <div className="mt-6 space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 flex flex-wrap justify-between gap-4">
                <div>
                  <p className="font-bold">{b.user?.firstName} {b.user?.lastName} · {b.vehicle?.regNumber}</p>
                  <p className="text-sm text-zinc-400 mt-1">{b.vehicle?.make} {b.vehicle?.model} · {b.status}</p>
                  <p className="text-sm text-yellow-500 mt-1">
                    Estimate ₹{b.estimatedCost || 0}
                    {b.finalCost != null && ` · Final ₹${b.finalCost}`}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Estimate payment: {b.estimatePayment?.status || "PENDING"} · Final payment: {b.finalPayment?.status || "PENDING"}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Wrench size={14} className="text-yellow-500" />
                    <select
                      value={b.assignedMechanic?._id || ""}
                      onChange={(e) => assignMechanic(b._id, e.target.value)}
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm"
                    >
                      <option value="">
                        {mechanics.length ? "Assign mechanic..." : "No mechanics in workshop"}
                      </option>
                      {mechanics.map((m) => (
                        <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
                      ))}
                    </select>
                    {b.assignedMechanic && (
                      <span className="text-xs text-zinc-500">
                        Currently: {b.assignedMechanic.firstName} {b.assignedMechanic.lastName}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => updateStatus(b)}
                  className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-bold h-fit"
                >
                  <Save size={16} className="inline mr-2" /> Update Progress
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "services" && (
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {services.map((s) => {
              const assigned = (workshop?.services || []).some(
                (x) => (x._id || x).toString() === s._id,
              );
              return (
                <div key={s._id} className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 flex justify-between">
                  <div><b>{s.name}</b><p className="text-sm text-zinc-500">₹{s.startingPrice} · {s.category}</p></div>
                  {assigned
                    ? <button onClick={() => removeService(s._id)} className="text-red-400"><Trash2 /></button>
                    : <button onClick={() => addService(s._id)} className="text-yellow-500"><Plus /></button>}
                </div>
              );
            })}
          </div>
        )}

        {tab === "employees" && (
          <div className="mt-6">
            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5">
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={employee.firstName} onChange={(e) => setEmployee({ ...employee, firstName: e.target.value })} placeholder="First name" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
                <input value={employee.lastName} onChange={(e) => setEmployee({ ...employee, lastName: e.target.value })} placeholder="Last name" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
                <input type="email" value={employee.email} onChange={(e) => setEmployee({ ...employee, email: e.target.value })} placeholder="Email" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
                <input type="tel" value={employee.phone} onChange={(e) => setEmployee({ ...employee, phone: e.target.value })} placeholder="Phone number" className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
                <select value={employee.role} onChange={(e) => setEmployee({ ...employee, role: e.target.value })} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3">
                  <option>MECHANIC</option>
                  <option>SERVICE_ADVISOR</option>
                </select>
                <label className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-700 px-4 cursor-pointer">
                  <Upload size={17} className="text-yellow-500" />
                  <span className="text-sm text-zinc-400 flex-1 truncate">{employee.profilePhoto?.name || "Profile photo"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setEmployee({ ...employee, profilePhoto: e.target.files?.[0] || null })} />
                  {employee.profilePhoto && <button type="button" onClick={() => setEmployee({ ...employee, profilePhoto: null })}><X size={16} /></button>}
                </label>
              </div>
              <p className="text-xs text-zinc-600 mt-3">The email must belong to an existing registered account.</p>
              <button onClick={addEmployee} className="mt-4 px-5 py-3 bg-yellow-500 text-black font-bold rounded-xl">Save Employee</button>
            </div>

            <div className="mt-4 space-y-3">
              {(workshop?.employees || []).map((e) => (
                <div key={e._id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex justify-between">
                  <span>{e.firstName} {e.lastName} · {e.email} · {e.phone || "No phone"} · {e.role}</span>
                  <button onClick={() => removeEmployee(e._id)} className="text-red-400"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "inventory" && (
          <div className="mt-6">
            <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.keys(newItem).map((key) => (
                <input key={key} value={newItem[key]} onChange={(e) => setNewItem({ ...newItem, [key]: e.target.value })} placeholder={key} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3" />
              ))}
              <button onClick={addInventory} className="px-4 py-3 bg-yellow-500 text-black font-bold rounded-xl">Add</button>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {inventory.map((item) => (
                <div key={item._id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex justify-between">
                  <span>{item.name} · {item.quantity} {item.unit} · ₹{item.unitPrice}</span>
                  <button onClick={async () => { await managerService.removeInventory(item._id); load(); }} className="text-red-400"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function WrappedManagerDashboard() {
  return <DashboardLayout><ManagerDashboard /></DashboardLayout>;
}
