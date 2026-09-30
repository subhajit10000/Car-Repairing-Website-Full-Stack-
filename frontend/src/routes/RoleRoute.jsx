import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../utils/storage.js";

// Wrap any route element that requires a specific role, e.g.:
// <Route path="/admin/bookings" element={
//   <RoleRoute allow={["ADMIN", "WORKSHOP_MANAGER"]}><ManageBookings /></RoleRoute>
// } />
// Backend still enforces the same check on every request (see
// backend/middlewares/role.middleware.js) — this just avoids flashing a
// privileged page at someone who isn't allowed to see it.
const RoleRoute = ({ allow = [], children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  const role = getCurrentUser()?.role?.toUpperCase();

  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
