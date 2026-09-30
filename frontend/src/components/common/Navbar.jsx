
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Menu,
  X,
  LogIn,
  LogOut,
  UserPlus,
  UserCircle,
  CarFront,
  Gauge,
} from "lucide-react";

import {
  isAuthenticated,
  getCurrentUser,
  clearAuth,
} from "../../utils/storage.js";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Authentication state
  const [loggedIn, setLoggedIn] = useState(() => isAuthenticated());
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  // Logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* =====================================================
     GET DASHBOARD PATH BASED ON USER ROLE
  ===================================================== */

  const getDashboardPath = () => {
    const role = currentUser?.role?.toUpperCase();

    if (role === "ADMIN") {
      return "/admin-dashboard";
    }

    if (role === "WORKSHOP_MANAGER") {
      return "/workshop-dashboard";
    }

    if (role === "CUSTOMER") {
      return "/customer-dashboard";
    }

    // Fallback
    return "/customer-dashboard";
  };

  /* =====================================================
     CHECK AUTHENTICATION WHEN ROUTE CHANGES
  ===================================================== */

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();

      setLoggedIn(authenticated);

      if (authenticated) {
        setCurrentUser(getCurrentUser());
      } else {
        setCurrentUser(null);
      }
    };

    checkAuth();
  }, [location.pathname]);

  /* =====================================================
     LISTEN FOR STORAGE CHANGES
  ===================================================== */

  useEffect(() => {
    const handleStorageChange = () => {
      const authenticated = isAuthenticated();

      setLoggedIn(authenticated);

      if (authenticated) {
        setCurrentUser(getCurrentUser());
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  /* =====================================================
     CLOSE MOBILE MENU
  ===================================================== */

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    clearAuth();

    // Immediately update navbar
    setLoggedIn(false);
    setCurrentUser(null);

    // Close modal and menu
    setShowLogoutModal(false);
    closeMenu();

    // Go to home
    navigate("/");
    window.scrollTo(0, 0);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  /* =====================================================
     NAVIGATION LINKS
  ===================================================== */

  const navLinks = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "About",
      path: "/about",
    },
    {
      name: "Service",
      path: "/service",
    },
    {
      name: "Workshop",
      path: "/Workshop",
    },
  ];

  const linkClasses = ({ isActive }) =>
    `relative text-sm font-semibold transition-colors duration-300 ${
      isActive
        ? "text-yellow-500"
        : "text-zinc-400 hover:text-white"
    }`;

  return (
    <>
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="fixed top-0 left-0 right-0 z-50 px-2.5 xs:px-3 sm:px-4 pt-2.5 sm:pt-3 lg:pt-4">
        <div className="w-full max-w-7xl mx-auto">

          <div
            className="
              relative
              flex
              items-center
              justify-between
              min-h-14
              sm:min-h-16
              px-3
              xs:px-4
              sm:px-5
              lg:px-6
              rounded-2xl
              border
              border-zinc-700/80
              bg-zinc-900/90
              backdrop-blur-xl
              shadow-2xl
              shadow-black/30
            "
          >

            {/* =================================================
                LOGO
            ================================================= */}

            <Link
              to="/"
              onClick={() => {
                closeMenu();
                window.scrollTo(0, 0);
              }}
              className="
                flex
                items-center
                gap-2
                sm:gap-3
                min-w-0
                group
              "
            >
              <div
                className="
                  shrink-0
                  w-9
                  h-9
                  sm:w-10
                  sm:h-10
                  rounded-xl
                  bg-yellow-500
                  flex
                  items-center
                  justify-center
                  shadow-lg
                  shadow-yellow-500/20
                  group-hover:scale-105
                  group-hover:rotate-1
                  transition-all
                  duration-300
                "
              >
                <CarFront className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-black" />
              </div>

              <span
                className="
                  min-w-0
                  truncate
                  text-sm
                  xs:text-base
                  sm:text-lg
                  font-black
                  text-white
                  tracking-wide
                  sm:tracking-wider
                "
              >
                Car Detailing
              </span>
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
                Visible on lg and above
            ================================================= */}

            <div className="hidden lg:flex items-center gap-5 xl:gap-8 2xl:gap-9">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => window.scrollTo(0, 0)}
                  className={linkClasses}
                >
                  {({ isActive }) => (
                    <span className="relative inline-block py-2 whitespace-nowrap">
                      {link.name}

                      {isActive && (
                        <span
                          className="
                            absolute
                            -bottom-1.5
                            left-1/2
                            -translate-x-1/2
                            w-1.5
                            h-1.5
                            rounded-full
                            bg-yellow-500
                            shadow-lg
                            shadow-yellow-500/50
                          "
                        />
                      )}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            {/* =================================================
                DESKTOP AUTH
                Visible on lg and above
            ================================================= */}

            <div className="hidden lg:flex items-center gap-1 xl:gap-2">

              {loggedIn ? (
                <>
                  {/* Dashboard */}

                  <Link
                    to={getDashboardPath()}
                    onClick={() => window.scrollTo(0, 0)}
                    className="
                      flex
                      items-center
                      gap-1.5
                      xl:gap-2
                      px-3
                      xl:px-4
                      py-2.5
                      rounded-xl
                      text-sm
                      font-semibold
                      text-zinc-300
                      hover:text-white
                      hover:bg-zinc-800
                      transition-all
                      duration-300
                      whitespace-nowrap
                    "
                  >
                    <Gauge className="w-4 h-4 shrink-0" />
                    <span>Dashboard</span>
                  </Link>

                  {/* Profile (feature 8: OTP-gated email/phone edit) */}

                  <Link
                    to="/profile"
                    onClick={() => window.scrollTo(0, 0)}
                    className="
                      flex
                      items-center
                      gap-1.5
                      xl:gap-2
                      px-3
                      xl:px-4
                      py-2.5
                      rounded-xl
                      text-sm
                      font-semibold
                      text-zinc-300
                      hover:text-white
                      hover:bg-zinc-800
                      transition-all
                      duration-300
                      whitespace-nowrap
                    "
                  >
                    <UserCircle className="w-4 h-4 shrink-0" />
                    <span>Profile</span>
                  </Link>

                  {/* Username */}

                  {currentUser?.firstName && (
                    <span
                      className="
                        hidden
                        xl:block
                        text-sm
                        font-semibold
                        text-zinc-300
                        px-1
                        2xl:px-2
                        whitespace-nowrap
                      "
                    >
                      Hi, {currentUser.firstName}
                    </span>
                  )}

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex
                      items-center
                      gap-1.5
                      xl:gap-2
                      px-3
                      xl:px-4
                      py-2.5
                      rounded-xl
                      bg-yellow-500
                      hover:bg-yellow-400
                      text-black
                      text-sm
                      font-bold
                      shadow-lg
                      shadow-yellow-500/10
                      hover:shadow-yellow-500/30
                      transition-all
                      duration-300
                      whitespace-nowrap
                    "
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Login */}

                  <Link
                    to="/login"
                    onClick={() => window.scrollTo(0, 0)}
                    className="
                      flex
                      items-center
                      gap-1.5
                      xl:gap-2
                      px-3
                      xl:px-4
                      py-2.5
                      rounded-xl
                      text-sm
                      font-semibold
                      text-zinc-300
                      hover:text-white
                      hover:bg-zinc-800
                      transition-all
                      duration-300
                      whitespace-nowrap
                    "
                  >
                    <LogIn className="w-4 h-4 shrink-0" />
                    <span>Login</span>
                  </Link>

                  {/* Register */}

                  <Link
                    to="/register"
                    onClick={() => window.scrollTo(0, 0)}
                    className="
                      flex
                      items-center
                      gap-1.5
                      xl:gap-2
                      px-3
                      xl:px-4
                      py-2.5
                      rounded-xl
                      bg-yellow-500
                      hover:bg-yellow-400
                      text-black
                      text-sm
                      font-bold
                      shadow-lg
                      shadow-yellow-500/10
                      hover:shadow-yellow-500/30
                      transition-all
                      duration-300
                      whitespace-nowrap
                    "
                  >
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>

            {/* =================================================
                MOBILE / TABLET MENU BUTTON
                Visible below lg
            ================================================= */}

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="
                lg:hidden
                shrink-0
                flex
                items-center
                justify-center
                w-10
                h-10
                rounded-xl
                text-zinc-300
                hover:text-yellow-500
                hover:bg-zinc-800
                active:bg-zinc-700
                transition-all
                duration-300
              "
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* =================================================
              MOBILE / TABLET MENU
          ================================================= */}

          {isMenuOpen && (
            <div
              className="
                lg:hidden
                mt-2
                p-3
                sm:p-4
                rounded-2xl
                border
                border-zinc-700
                bg-zinc-900/95
                backdrop-blur-xl
                shadow-2xl
                shadow-black/30
                max-h-[calc(100vh-90px)]
                overflow-y-auto
              "
            >

              {/* Mobile Links */}

              <div className="space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => {
                      closeMenu();
                      window.scrollTo(0, 0);
                    }}
                    className={({ isActive }) =>
                      `
                        flex
                        items-center
                        min-h-12
                        px-4
                        py-3
                        rounded-xl
                        text-sm
                        font-semibold
                        transition-all
                        duration-300
                        ${
                          isActive
                            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/10"
                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }
                      `
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>

              {/* Divider */}

              <div className="h-px bg-zinc-800 my-4" />

              {/* User information */}

              {loggedIn && currentUser?.firstName && (
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    mb-3
                    rounded-xl
                    bg-zinc-800/70
                    border
                    border-zinc-700/70
                  "
                >
                  <div
                    className="
                      w-9
                      h-9
                      rounded-full
                      bg-yellow-500
                      flex
                      items-center
                      justify-center
                      text-black
                      font-bold
                      shrink-0
                    "
                  >
                    {currentUser.firstName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500">
                      Welcome back
                    </p>

                    <p className="text-sm font-semibold text-white truncate">
                      Hi, {currentUser.firstName}
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile Authentication */}

              <div
                className="
                  grid
                  grid-cols-1
                  xs:grid-cols-2
                  gap-2.5
                  sm:gap-3
                "
              >

                {loggedIn ? (
                  <>
                    {/* Dashboard */}

                    <NavLink
                      to={getDashboardPath()}
                      onClick={() => {
                        closeMenu();
                        window.scrollTo(0, 0);
                      }}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        min-h-12
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-zinc-700
                        text-zinc-300
                        hover:bg-zinc-800
                        hover:text-white
                        text-sm
                        font-semibold
                        transition-all
                        duration-300
                      "
                    >
                      <Gauge className="w-4 h-4" />
                      Dashboard
                    </NavLink>

                    {/* Profile (feature 8) */}

                    <NavLink
                      to="/profile"
                      onClick={() => {
                        closeMenu();
                        window.scrollTo(0, 0);
                      }}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        min-h-12
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-zinc-700
                        text-zinc-300
                        hover:bg-zinc-800
                        hover:text-white
                        text-sm
                        font-semibold
                        transition-all
                        duration-300
                      "
                    >
                      <UserCircle className="w-4 h-4" />
                      Profile
                    </NavLink>

                    {/* Logout */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        min-h-12
                        px-4
                        py-3
                        rounded-xl
                        bg-yellow-500
                        hover:bg-yellow-400
                        active:bg-yellow-300
                        text-black
                        text-sm
                        font-bold
                        transition-all
                        duration-300
                      "
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    {/* Login */}

                    <Link
                      to="/login"
                      onClick={() => {
                        closeMenu();
                        window.scrollTo(0, 0);
                      }}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        min-h-12
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-zinc-700
                        text-zinc-300
                        hover:bg-zinc-800
                        hover:text-white
                        text-sm
                        font-semibold
                        transition-all
                        duration-300
                      "
                    >
                      <LogIn className="w-4 h-4" />
                      Login
                    </Link>

                    {/* Register */}

                    <Link
                      to="/register"
                      onClick={() => {
                        closeMenu();
                        window.scrollTo(0, 0);
                      }}
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        min-h-12
                        px-4
                        py-3
                        rounded-xl
                        bg-yellow-500
                        hover:bg-yellow-400
                        active:bg-yellow-300
                        text-black
                        text-sm
                        font-bold
                        transition-all
                        duration-300
                      "
                    >
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* =====================================================
          LOGOUT CONFIRMATION MODAL
      ===================================================== */}

      {showLogoutModal && (
        <div
          className="
            fixed
            inset-0
            z-100
            flex
            items-center
            justify-center
            px-4
            py-6
            bg-black/70
            backdrop-blur-sm
          "
          onClick={cancelLogout}
        >
          <div
            className="
              w-full
              max-w-md
              max-h-[90vh]
              overflow-y-auto
              rounded-2xl
              border
              border-zinc-700
              bg-zinc-900
              p-5
              sm:p-7
              shadow-2xl
              shadow-black/50
            "
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Icon */}

            <div className="flex justify-center mb-5">
              <div
                className="
                  flex
                  items-center
                  justify-center
                  w-14
                  h-14
                  rounded-full
                  bg-yellow-500/10
                  border
                  border-yellow-500/20
                "
              >
                <LogOut className="w-6 h-6 text-yellow-500" />
              </div>
            </div>

            {/* Title */}

            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-white
                text-center
              "
            >
              Confirm Logout
            </h2>

            {/* Message */}

            <p
              className="
                mt-3
                text-sm
                sm:text-base
                text-zinc-400
                text-center
                leading-relaxed
              "
            >
              Are you sure you want to logout
              {currentUser?.firstName
                ? `, ${currentUser.firstName}`
                : ""}
              ?
            </p>

            <p className="mt-1 text-xs text-zinc-500 text-center">
              You will need to login again to access your account.
            </p>

            {/* Modal Buttons */}

            <div
              className="
                grid
                grid-cols-1
                xs:grid-cols-2
                gap-3
                mt-7
              "
            >

              {/* Cancel */}

              <button
                type="button"
                onClick={cancelLogout}
                className="
                  flex-1
                  min-h-12
                  px-4
                  py-3
                  rounded-xl
                  border
                  border-zinc-700
                  bg-zinc-800
                  text-zinc-300
                  text-sm
                  font-semibold
                  hover:bg-zinc-700
                  hover:text-white
                  transition-all
                  duration-300
                "
              >
                Cancel
              </button>

              {/* Confirm */}

              <button
                type="button"
                onClick={confirmLogout}
                className="
                  flex-1
                  min-h-12
                  px-4
                  py-3
                  rounded-xl
                  bg-yellow-500
                  text-black
                  text-sm
                  font-bold
                  hover:bg-yellow-400
                  shadow-lg
                  shadow-yellow-500/10
                  hover:shadow-yellow-500/30
                  transition-all
                  duration-300
                "
              >
                Yes, Logout
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
