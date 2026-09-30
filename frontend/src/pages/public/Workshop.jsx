
import { useEffect, useMemo, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Star,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Wrench,
  X,
} from "lucide-react";


import { workshopDetails } from "../../services/workshopService.js";

const Workshop = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const serviceId = searchParams.get("service");

  /* =====================================================
      FETCH WORKSHOPS
  ====================================================== */

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await workshopDetails.getworkshopDetails();

        console.log("Workshop API Response:", response);

        const data = Array.isArray(response?.data)
          ? response.data
          : [];

        setWorkshops(data);
      } catch (error) {
        console.error("Error fetching workshops:", error);

        setError(
          error.response?.data?.message ||
            error.message ||
            "Unable to load workshops."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  /* =====================================================
      FILTER WORKSHOPS BY SERVICE
  ====================================================== */

  const filteredWorkshops = useMemo(() => {
    if (!serviceId) {
      return workshops;
    }

    return workshops.filter((workshop) => {
      if (!Array.isArray(workshop.services)) {
        return false;
      }

      return workshop.services.some((service) => {
        /*
         * Supports different possible structures:
         *
         * services: ["serviceId"]
         *
         * services: [
         *   { _id: "serviceId", name: "Oil Change" }
         * ]
         *
         * services: [
         *   { serviceId: "serviceId" }
         * ]
         */

        if (typeof service === "string") {
          return String(service) === String(serviceId);
        }

        return (
          String(service?._id) === String(serviceId) ||
          String(service?.id) === String(serviceId) ||
          String(service?.serviceId) === String(serviceId)
        );
      });
    });
  }, [workshops, serviceId]);

  /* =====================================================
      REMOVE SERVICE FILTER
  ====================================================== */

  const clearServiceFilter = () => {
    searchParams.delete("service");
    setSearchParams(searchParams);
  };

  /* =====================================================
      LOADING
  ====================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full border-4 border-zinc-700 border-t-yellow-500 animate-spin" />

          <p className="mt-5 text-zinc-400 text-sm">
            Finding workshops...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
      ERROR
  ====================================================== */

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-800/80 border border-zinc-700 rounded-3xl p-8 text-center shadow-2xl">

          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-white mt-5">
            Unable to Load Workshops
          </h2>

          <p className="text-zinc-400 mt-3 leading-relaxed">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-7 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
      EMPTY
  ====================================================== */

  if (!workshops.length) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-yellow-500" />
          </div>

          <h2 className="text-2xl font-bold text-white mt-5">
            No Workshops Found
          </h2>

          <p className="text-zinc-400 mt-2">
            There are currently no workshops available.
          </p>

        </div>
      </div>
    );
  }

  /* =====================================================
      PAGE
  ====================================================== */

  return (
    <div className="min-h-screen bg-zinc-900 text-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="relative overflow-hidden px-4 pt-16 pb-14 md:pt-20 md:pb-16">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto text-center">

          <div className="inline-flex mt-5 items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">

            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />

            <span className="text-yellow-500 text-xs sm:text-sm font-bold uppercase tracking-widest">
              {serviceId
                ? "Service Workshops"
                : "Find Your Workshop"}
            </span>

          </div>

          <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">

            {serviceId ? (
              <>
                Workshops Offering{" "}
                <span className="text-yellow-500">
                  This Service
                </span>
              </>
            ) : (
              <>
                Choose a{" "}
                <span className="text-yellow-500">
                  Trusted Workshop
                </span>
              </>
            )}

          </h1>

          <p className="max-w-2xl mx-auto mt-5 text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed">
            {serviceId
              ? "Choose a workshop that provides the service you need and book your appointment."
              : "Find reliable automobile workshops near you and book your vehicle service with confidence."}
          </p>

          <div className="w-20 h-1 bg-yellow-500 rounded-full mx-auto mt-7" />

          {/* Service Filter */}

          {serviceId && (
            <div className="mt-7 flex justify-center">

              <button
                onClick={clearServiceFilter}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-sm font-semibold hover:bg-yellow-500 hover:text-black transition"
              >
                <Wrench size={16} />

                Showing workshops for selected service

                <X size={16} />
              </button>

            </div>
          )}

        </div>
      </section>

      {/* =================================================
          WORKSHOP COUNT
      ================================================= */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-zinc-500">
              Available Workshops
            </p>

            <h2 className="text-2xl font-black mt-1">
              {filteredWorkshops.length}{" "}
              <span className="text-yellow-500">
                {filteredWorkshops.length === 1
                  ? "Workshop"
                  : "Workshops"}
              </span>
            </h2>
          </div>

        </div>
      </div>

      {/* =================================================
          WORKSHOP GRID
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {filteredWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">

            {filteredWorkshops.map((workshop, index) => {

              const workshopId =
                workshop._id || workshop.id;

              return (
                <article
                  key={workshopId || index}
                  className="group bg-zinc-800/70 border border-zinc-700/80 rounded-2xl overflow-hidden hover:border-yellow-500/50 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-black/10"
                >

                  {/* ================= IMAGE ================= */}

                  <div className="relative h-52 sm:h-56 overflow-hidden bg-zinc-800">

                    {workshop.image ? (
                      <img
                        src={workshop.image}
                        alt={workshop.name || "Workshop"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <MapPin className="w-10 h-10 text-zinc-600" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Status */}

                    {workshop.status && (
                      <span
                        className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${
                          workshop.status.toLowerCase() === "open"
                            ? "bg-green-500/15 text-green-400 border border-green-500/30"
                            : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {workshop.status}
                      </span>
                    )}

                    {/* Rating */}

                    <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/65 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg">

                      <Star
                        size={15}
                        className="text-yellow-400 fill-yellow-400"
                      />

                      <span className="text-sm font-bold">
                        {workshop.rating || 0}
                      </span>

                    </div>

                  </div>

                  {/* ================= CONTENT ================= */}

                  <div className="p-5 sm:p-6">

                    <h2 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">
                      {workshop.name || "Unnamed Workshop"}
                    </h2>

                    {/* Location */}

                    {workshop.location && (
                      <div className="flex items-start gap-2 mt-3">

                        <MapPin
                          size={18}
                          className="text-yellow-500 mt-0.5 shrink-0"
                        />

                        <span className="text-sm text-zinc-400 leading-relaxed">
                          {workshop.location}
                        </span>

                      </div>
                    )}

                    {/* Information */}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">

                      {workshop.distance !== undefined && (
                        <div className="text-sm text-zinc-400">
                          <span className="text-white font-semibold">
                            {workshop.distance}
                          </span>{" "}
                          km away
                        </div>
                      )}

                      {workshop.reviews !== undefined && (
                        <div className="text-sm text-zinc-400">
                          <span className="text-white font-semibold">
                            {workshop.reviews}
                          </span>{" "}
                          reviews
                        </div>
                      )}

                    </div>

                    {/* Divider */}

                    <div className="border-t border-zinc-700/70 mt-5 pt-4">

                      {/* Hours */}

                      {(workshop.openingTime ||
                        workshop.closingTime) && (
                        <div className="flex items-center gap-2 text-sm text-zinc-400">

                          <Clock
                            size={16}
                            className="text-yellow-500 shrink-0"
                          />

                          <span>
                            {workshop.openingTime || "--"} -{" "}
                            {workshop.closingTime || "--"}
                          </span>

                        </div>
                      )}

                      {/* Price */}

                      {workshop.startingPrice !== undefined && (
                        <div className="mt-4">

                          <p className="text-xs text-zinc-500 uppercase tracking-wider">
                            Starting from
                          </p>

                          <p className="text-2xl font-black text-yellow-500 mt-0.5">
                            ₹{workshop.startingPrice}
                          </p>

                        </div>
                      )}

                    </div>

                    {/* Button */}

                    <NavLink
                      to={`/workshop/${workshopId}`} onClick={()=>{window.scroll(0,0)}}
                      className="mt-5 flex items-center justify-center gap-2 w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-yellow-500/10"
                    >
                      View Workshop

                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      />

                    </NavLink>

                  </div>

                </article>
              );
            })}

          </div>
        ) : (
          /* =================================================
              NO WORKSHOP FOR THIS SERVICE
          ================================================= */

          <div className="max-w-xl mx-auto text-center bg-zinc-800/70 border border-zinc-700 rounded-3xl p-10 sm:p-14">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-500/10 flex items-center justify-center">
              <Wrench className="w-8 h-8 text-yellow-500" />
            </div>

            <h2 className="text-2xl font-bold mt-6">
              No Workshop Available
            </h2>

            <p className="text-zinc-400 mt-3 leading-relaxed">
              Unfortunately, no workshop currently offers
              this particular service.
            </p>

            <button
              onClick={clearServiceFilter}
              className="mt-7 inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-bold transition"
            >
              <MapPin size={18} />
              View All Workshops
            </button>

          </div>
        )}

      </main>
    </div>
  );
};

export default Workshop;

