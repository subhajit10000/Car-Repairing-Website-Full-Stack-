import { NavLink } from "react-router-dom";
import { CalendarDays, CarFront, Wrench } from "lucide-react";

import { getCurrentUser } from "../../utils/storage.js";

// /customer-dashboard is LoginForm's post-login redirect target for the
// CUSTOMER role.
const CustomerDashboard = () => {
  const user = getCurrentUser();

  const links = [
    {
      to: "/my-bookings",
      icon: CalendarDays,
      title: "My Bookings",
      description: "View, track and cancel your service appointments",
    },
    {
      to: "/service",
      icon: Wrench,
      title: "Book a Service",
      description: "Browse workshops and book a new appointment",
    },
    {
      to: "/my-vehicles",
      icon: CarFront,
      title: "My Vehicles",
      description: "Add and manage the vehicles in your garage",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-2xl sm:text-3xl font-black">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Here's a quick overview of your account
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
          {links.map(({ to, icon: Icon, title, description }) => (
            <NavLink
              key={to}
              to={to}
              className="bg-zinc-800 border border-zinc-700 hover:border-yellow-500/50 rounded-2xl p-6 flex items-start gap-4 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-yellow-500" />
              </div>

              <div>
                <h3 className="font-bold text-white">{title}</h3>
                <p className="text-sm text-zinc-500 mt-1">{description}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
