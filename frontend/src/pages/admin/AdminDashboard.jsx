import { NavLink } from "react-router-dom";
import { CalendarDays } from "lucide-react";

import { getCurrentUser } from "../../utils/storage.js";

// /admin-dashboard is LoginForm's post-login redirect target for the ADMIN
// role. The other admin pages (ManageServices, ManageUsers, ManageWorkshops)
// are still empty stubs and have no routes yet — wire those in as they're
// built out.
const AdminDashboard = () => {
  const user = getCurrentUser();

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-2xl sm:text-3xl font-black">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Admin tools (manage bookings, services, workshops, users) are on
          their way.
        </p>

        <NavLink
          to="/admin/bookings"
          className="mt-8 bg-zinc-800 border border-zinc-700 hover:border-yellow-500/50 rounded-2xl p-6 flex items-start gap-4 transition"
        >
          <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-yellow-500" />
          </div>

          <div>
            <h3 className="font-bold text-white">Appointments</h3>
            <p className="text-sm text-zinc-500 mt-1">
              View every customer's appointment and cancel any of them.
            </p>
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminDashboard;
