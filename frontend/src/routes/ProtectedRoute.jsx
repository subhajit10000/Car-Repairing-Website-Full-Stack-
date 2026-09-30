import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/storage.js";

// Wrap any route element that requires a logged-in user, e.g.:
// <Route path="/book-appointment/:workshopId" element={
//   <ProtectedRoute><BookService /></ProtectedRoute>
// } />
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return children;
};

export default ProtectedRoute;
