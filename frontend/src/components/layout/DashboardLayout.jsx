import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, UserCircle, LogOut, CalendarDays, Wrench, MessageCircle, Camera, CreditCard, Building2, TrendingUp } from "lucide-react";
import { getCurrentUser, clearAuth } from "../../utils/storage.js";
import axiosInstance from "../../api/axiosInstance.js";
import { ROLE_LABELS } from "../../constants/roles.js";

const links = {
  ADMIN: [
    ["Dashboard", "/admin-dashboard", LayoutDashboard],
    ["Workshops & Managers", "/admin/workshops", Building2],
    ["Bookings", "/admin/bookings", CalendarDays],
    ["Sales Analytics", "/analytics/sales", TrendingUp],
  ],
  CUSTOMER: [
    ["Dashboard", "/customer-dashboard", LayoutDashboard],
    ["My Bookings", "/my-bookings", CalendarDays],
    ["My Vehicles", "/my-vehicles", Wrench],
    ["Community", "/community", MessageCircle],
    ["Payments & Feedback", "/payments-feedback", CreditCard],
  ],
  WORKSHOP_MANAGER: [
    ["Dashboard", "/manager-dashboard", LayoutDashboard],
    ["Bookings", "/admin/bookings", CalendarDays],
    ["Workshop Operations", "/workshop-dashboard", Wrench],
    ["Sales Analytics", "/analytics/sales", TrendingUp],
  ],
  SERVICE_ADVISOR: [
    ["Dashboard", "/service-advisor-dashboard", LayoutDashboard],
    ["Customer Communication", "/service-advisor-dashboard?tab=communication", MessageCircle],
  ],
  MECHANIC: [
    ["Dashboard", "/mechanic-dashboard", LayoutDashboard],
    ["Repair Photos", "/mechanic-dashboard?tab=photos", Camera],
  ],
};

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [loggingOut, setLoggingOut] = useState(false);
  const role = user?.role?.toUpperCase() || "CUSTOMER";
  const navItems = links[role] || links.CUSTOMER;

  const logout = async () => {
    try { setLoggingOut(true); await axiosInstance.post("/auth/logout"); } catch {} finally { clearAuth(); navigate("/login", { replace: true }); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-zinc-800 bg-zinc-900/95 lg:flex lg:flex-col">
        <div className="px-6 py-6 border-b border-zinc-800">
          <Link to="/" className="text-xl font-black hover:opacity-90 transition">Car<span className="text-yellow-500">Detailing</span></Link>
          <p className="text-xs text-zinc-500 mt-1">{ROLE_LABELS[role] || role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(([label, to, Icon]) => (
            <NavLink key={label} to={to} className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
              <Icon size={18}/>{label}
            </NavLink>
          ))}
          <NavLink to="/profile" className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
            <UserCircle size={18}/> Profile
          </NavLink>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/70 mb-3">
            {user?.profilePicture?.url ? <img src={user.profilePicture.url} className="w-10 h-10 rounded-full object-cover"/> : <div className="w-10 h-10 rounded-full bg-yellow-500 text-zinc-950 grid place-items-center font-bold">{user?.firstName?.[0]}</div>}
            <div className="min-w-0"><p className="font-semibold truncate">{user?.firstName} {user?.lastName}</p><p className="text-xs text-zinc-500 truncate">{user?.email}</p></div>
          </div>
          <button onClick={logout} disabled={loggingOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition">
            <LogOut size={18}/>{loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
      <main className="w-full lg:ml-72 min-h-screen p-4 sm:p-6 lg:p-10 pt-20 lg:pt-10">{children}</main>
    </div>
  );
}
