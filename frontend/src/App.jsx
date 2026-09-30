
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";

import Home from "./pages/public/Home.jsx";
import About from "./pages/public/About.jsx";
import Workshop from "./pages/public/Workshop.jsx";
import Login from "./components/forms/LoginForm.jsx";
import Register from "./components/forms/RegisterForm.jsx";
import ServicesPage from "./pages/public/Services.jsx";
import CustomerDashboard from "./pages/customer/CustomerDashboard.jsx";
import MyBookings from "./pages/customer/MyBookings.jsx";
import MyVehicles from "./pages/customer/MyVehicles.jsx";
import Profile from "./pages/customer/Profile.jsx";
import BookService from "./pages/customer/BookService.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ManageBookings from "./pages/admin/ManageBookings.jsx";
import ManageWorkshops from "./pages/admin/ManageWorkshops.jsx";
import NotFound from "./pages/public/NotFound.jsx";
import WorkshopDetails from "./pages/workshop/WorkshopDetails.jsx";
import WorkshopDashboard from "./pages/workshop/WorkshopDashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import ManagerDashboard from "./pages/workshop/ManagerDashboard.jsx";
import ServiceAdvisorDashboard from "./pages/workshop/ServiceAdvisorDashboard.jsx";
import MechanicDashboard from "./pages/workshop/MechanicDashboard.jsx";
import PaymentFeedback from "./pages/customer/PaymentFeedback.jsx";
import Community from "./pages/customer/Community.jsx";
import SalesAnalytics from "./pages/analytics/SalesAnalytics.jsx";

const App = () => {
  const location = useLocation();

  // Hide footer on authentication pages
  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.includes("dashboard") ||
    location.pathname.startsWith("/analytics/sales") ||
    location.pathname.startsWith("/community") ||
    location.pathname.startsWith("/payments-feedback") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/admin/");
  const hideNavbar = hideFooter;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {!hideNavbar && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/service" element={<ServicesPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/workshop" element={<Workshop />} />
          <Route path="/customer-dashboard" element={<DashboardLayout><CustomerDashboard /></DashboardLayout>} />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-vehicles"
            element={
              <ProtectedRoute>
                <MyVehicles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment/:workshopId"
            element={
              <ProtectedRoute>
                <BookService />
              </ProtectedRoute>
            }
          />
          <Route path="/admin-dashboard" element={<RoleRoute allow={["ADMIN"]}><DashboardLayout><AdminDashboard /></DashboardLayout></RoleRoute>} />
          <Route
            path="/admin/bookings"
            element={
              <RoleRoute allow={["ADMIN", "WORKSHOP_MANAGER"]}>
                <DashboardLayout><ManageBookings /></DashboardLayout>
              </RoleRoute>
            }
          />
          <Route
            path="/workshop-dashboard"
            element={
              <RoleRoute allow={["WORKSHOP_MANAGER", "ADMIN"]}>
                <DashboardLayout><WorkshopDashboard /></DashboardLayout>
              </RoleRoute>
            }
          />
          <Route path="/manager-dashboard" element={<RoleRoute allow={["WORKSHOP_MANAGER"]}><ManagerDashboard /></RoleRoute>} />
          <Route path="/service-advisor-dashboard" element={<RoleRoute allow={["SERVICE_ADVISOR"]}><ServiceAdvisorDashboard /></RoleRoute>} />
          <Route path="/mechanic-dashboard" element={<RoleRoute allow={["MECHANIC"]}><MechanicDashboard /></RoleRoute>} />
          <Route path="/payments-feedback" element={<RoleRoute allow={["CUSTOMER"]}><PaymentFeedback /></RoleRoute>} />
          <Route path="/community" element={<RoleRoute allow={["CUSTOMER"]}><Community /></RoleRoute>} />
          <Route
            path="/analytics/sales"
            element={
              <RoleRoute allow={["ADMIN", "WORKSHOP_MANAGER"]}>
                <SalesAnalytics />
              </RoleRoute>
            }
          />
          <Route path="/admin/workshops" element={<RoleRoute allow={["ADMIN"]}><ManageWorkshops /></RoleRoute>} />
          <Route path="/Workshop/:id" element={<WorkshopDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!hideFooter && <Footer />}

    </div>
  );
};

export default App;
