
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaSearch,
  FaCar,
  FaTools,
  FaClock,
  FaArrowRight,
  FaCheckCircle,
  FaWrench,
  FaExclamationTriangle,
  FaSlidersH,
} from "react-icons/fa";
import { workshopService } from "../../services/workshopService.js";

const Service = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH SERVICES =================
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await workshopService.getServices();

        setServices(response?.data || []);
      } catch (error) {
        console.error("Error fetching services:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load services. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // ================= CATEGORIES =================
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        services
          .map((service) => service.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [services]);

  // ================= FILTER SERVICES =================
  const filteredServices = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !searchText ||
        service.name?.toLowerCase().includes(searchText) ||
        service.description?.toLowerCase().includes(searchText) ||
        service.category?.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || service.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [services, search, category]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-zinc-900 text-white">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative isolate overflow-hidden">
        {/* Background effects */}
        <div className="absolute -left-40 top-10 -z-10 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute -right-40 top-0 -z-10 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(234,179,8,0.08),transparent_45%)]" />

        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-4xl text-center">

            {/* Badge */}
            <div className="mb-6 mt-7 inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-yellow-500">
              <FaWrench />
              Professional Car Care
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Give Your Car
              <span className="block text-yellow-500">
                The Care It Deserves.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8 lg:text-lg">
              From routine maintenance to advanced repairs, discover
              professional automotive services from trusted workshops.
            </p>

            {/* Hero Stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3">
                <FaTools className="text-yellow-500" />
                <span className="text-sm text-zinc-300">
                  Expert Technicians
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3">
                <FaCheckCircle className="text-yellow-500" />
                <span className="text-sm text-zinc-300">
                  Quality Service
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3">
                <FaClock className="text-yellow-500" />
                <span className="text-sm text-zinc-300">
                  Fast Turnaround
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom glow */}
        <div className="h-px bg-linear-to-r from-transparent via-yellow-500/30 to-transparent" />
      </section>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}
      <section className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900/95 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />

              <input
                type="text"
                placeholder="Search for a service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <div className="mr-1 hidden items-center gap-2 text-zinc-500 sm:flex">
                <FaSlidersH />
              </div>

              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    category === item
                      ? "bg-yellow-500 text-zinc-950 shadow-lg shadow-yellow-500/20"
                      : "border border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-yellow-500/40 hover:text-yellow-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

        {/* Heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-yellow-500">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />

              {loading
                ? "Loading services..."
                : `${filteredServices.length} Services Available`}
            </div>

            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Explore Our Services
            </h2>

            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              Professional solutions to keep your vehicle safe, reliable,
              and performing at its best.
            </p>
          </div>

          {(category !== "All" || search) && !loading && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-fit rounded-lg px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-yellow-500"
            >
              Clear filters ×
            </button>
          )}
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-800/60 p-6"
              >
                <div className="flex justify-between">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-700" />
                  <div className="h-6 w-20 rounded-full bg-zinc-700" />
                </div>

                <div className="mt-6 h-6 w-3/4 rounded bg-zinc-700" />

                <div className="mt-4 h-4 w-full rounded bg-zinc-700" />
                <div className="mt-2 h-4 w-5/6 rounded bg-zinc-700" />

                <div className="mt-7 h-px bg-zinc-700" />

                <div className="mt-5 h-5 w-24 rounded bg-zinc-700" />
                <div className="mt-4 h-4 w-32 rounded bg-zinc-700" />
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
              <FaExclamationTriangle className="text-2xl text-red-400" />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              Unable to Load Services
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-yellow-500 px-6 py-3 text-sm font-bold text-zinc-950 transition hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =====================================================
            SERVICE CARDS
        ===================================================== */}
        {!loading && !error && filteredServices.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredServices.map((service) => (
              <div
                key={service._id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/40 hover:bg-zinc-800 hover:shadow-2xl hover:shadow-yellow-500/5"
              >
                {/* Card top accent */}
                <div className="absolute left-0 top-0 h-1 w-0 bg-yellow-500 transition-all duration-300 group-hover:w-full" />

                {/* Icon + Category */}
                <div className="flex items-start justify-between gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 text-2xl text-yellow-500 transition-all duration-300 group-hover:bg-yellow-500 group-hover:text-zinc-950">
                    {service.icon || <FaCar />}
                  </div>

                  <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400">
                    {service.category || "General"}
                  </span>
                </div>

                {/* Name */}
                <h3 className="mt-6 text-xl font-bold tracking-tight transition-colors group-hover:text-yellow-500">
                  {service.name}
                </h3>

                {/* Description */}
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500">
                  {service.description ||
                    "Professional automotive service performed by experienced technicians."}
                </p>

                {/* Price + Time */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-700/70 pt-5">

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                      Starting from
                    </p>

                    <p className="mt-1 text-xl font-black text-yellow-500">
                      ₹{service.startingPrice ?? "N/A"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                      Estimated time
                    </p>

                    <div className="mt-2 flex items-center justify-end gap-2 text-sm font-semibold text-zinc-300">
                      <FaClock className="text-yellow-500" />
                      {service.estimatedTime || "Varies"}
                    </div>
                  </div>
                </div>

                {/* Includes */}
                {service.includes?.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 text-sm font-bold text-zinc-300">
                      What's included
                    </p>

                    <ul className="space-y-2">
                      {service.includes.slice(0, 4).map((item, index) => (
                        <li
                          key={`${service._id}-${index}`}
                          className="flex items-start gap-2.5 text-sm text-zinc-500"
                        >
                          <FaCheckCircle className="mt-1 shrink-0 text-xs text-yellow-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {service.includes.length > 4 && (
                      <p className="mt-3 text-xs font-medium text-zinc-600">
                        +{service.includes.length - 4} more included
                      </p>
                    )}
                  </div>
                )}

                {/* Available Workshops */}
                <div className="mt-auto pt-6">

                  {service.availableAt?.length > 0 && (
                    <div className="mb-4 flex items-center justify-between border-t border-zinc-700/70 pt-4">
                      <div>
                        <p className="text-xs text-zinc-600">
                          Available at
                        </p>

                        <p className="mt-1 text-sm font-semibold text-zinc-300">
                          {service.availableAt.length} workshops
                        </p>
                      </div>

                      <FaCar className="text-zinc-600" />
                    </div>
                  )}

                  <NavLink
                    to="/workshop"
                    onClick={() => window.scrollTo(0, 0)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 text-sm font-bold text-zinc-950 transition-all duration-200 hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20"
                  >
                    Visit Workshop
                    <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            NO RESULTS
        ===================================================== */}
        {!loading && !error && filteredServices.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-800/50 px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 text-2xl text-zinc-500">
              <FaSearch />
            </div>

            <h3 className="mt-6 text-xl font-bold">
              No services found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              We couldn't find any services matching your search.
              Try another keyword or category.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-yellow-500 px-6 py-3 text-sm font-bold text-zinc-950 transition hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20"
            >
              Show All Services
            </button>
          </div>
        )}
      </main>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="relative overflow-hidden border-t border-zinc-800 bg-zinc-950">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-xl text-zinc-950 shadow-lg shadow-yellow-500/20">
            <FaCar />
          </div>

          <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            Not Sure What Your Car Needs?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Get your vehicle inspected by professional technicians and
            discover exactly what your car needs to stay in top condition.
          </p>

          <NavLink
            to="/workshop"
            onClick={() => window.scrollTo(0, 0)}
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-yellow-500 px-7 py-3.5 text-sm font-bold text-zinc-950 transition-all hover:bg-yellow-400 hover:shadow-xl hover:shadow-yellow-500/20"
          >
            Find a Workshop
            <FaArrowRight className="text-xs" />
          </NavLink>
        </div>
      </section>
    </div>
  );
};

export default Service;
