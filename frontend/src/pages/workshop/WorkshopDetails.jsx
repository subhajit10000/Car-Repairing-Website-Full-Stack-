
import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Star,
  Clock,
  CalendarDays,
  Wrench,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  ShieldCheck,
  CarFront,
  Power,
} from "lucide-react";

import { workshopDetails, workshopService } from "../../services/workshopService.js";

const WorkshopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allServices, setAllServices] = useState([]);

  /* =========================================================
     FETCH ALL SERVICES
     (same catalog Services.jsx lists — cross-referenced below
     against this workshop's service ids so real names/prices
     show instead of raw ObjectId references)
  ========================================================= */

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await workshopService.getServices();
        setAllServices(response?.data || []);
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };

    fetchServices();
  }, []);

  /* =========================================================
     FETCH WORKSHOP
  ========================================================= */

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        /*
         * If getWorkshopById exists, use it.
         * Otherwise fetch all workshops and find the requested one.
         */

        if (typeof workshopDetails.getWorkshopById === "function") {
          response = await workshopDetails.getWorkshopById(id);

          const data =
            response?.data?.data ||
            response?.data ||
            response;

          setWorkshop(data);
        } else {
          response = await workshopDetails.getworkshopDetails();

          const workshops =
            Array.isArray(response?.data?.data)
              ? response.data.data
              : Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response)
              ? response
              : [];

          const foundWorkshop = workshops.find(
            (item) =>
              String(item._id || item.id) === String(id)
          );

          if (!foundWorkshop) {
            throw new Error("Workshop not found.");
          }

          setWorkshop(foundWorkshop);
        }
      } catch (err) {
        console.error("Error fetching workshop:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load workshop details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWorkshop();
    }
  }, [id]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full border-4 border-zinc-700 border-t-yellow-500 animate-spin" />

          <p className="mt-5 text-zinc-400">
            Loading workshop details...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !workshop) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-white mt-5">
            Workshop Not Found
          </h2>

          <p className="text-zinc-400 mt-3">
            {error ||
              "The requested workshop could not be found."}
          </p>

          <button
            onClick={() => navigate("/Workshop")}
            className="
              mt-7
              inline-flex
              items-center
              gap-2
              px-6
              py-3
              bg-yellow-500
              hover:bg-yellow-400
              text-black
              rounded-xl
              font-bold
              transition
            "
          >
            <ArrowLeft size={18} />
            Back to Workshops
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     DATA
  ========================================================= */

  const workshopId = workshop._id || workshop.id;

  // workshop.services is usually an array of Service ObjectId strings
  // (see backend/models/workshop.model.js), not populated documents.
  // Cross-reference those ids against the full active services catalog
  // (the same list Services.jsx fetches) so real names/prices/categories
  // show here instead of raw ids.
  const workshopServiceIds = (workshop.services || []).map((s) =>
    typeof s === "string" ? s : s?._id
  );

  const services =
    allServices.length > 0
      ? allServices.filter((service) => workshopServiceIds.includes(service._id))
      : (workshop.services || []).filter((s) => typeof s === "object" && s !== null);

  const isOpen =
    workshop.status?.toLowerCase() === "open";

  const isActive = workshop.isActive !== false;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-zinc-900 text-white">

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <NavLink
          to="/Workshop"
          className="
            inline-flex
            items-center
            gap-2
            text-zinc-400
            hover:text-yellow-500
            transition
          "
        >
          <ArrowLeft size={18} />
          Back to Workshops
        </NavLink>
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        <div
          className="
            relative
            h-70
            sm:h-95
            lg:h-115
            overflow-hidden
            rounded-3xl
            border
            border-zinc-700
          "
        >

          {/* Workshop Image */}

          {workshop.image ? (
            <img
              src={workshop.image}
              alt={workshop.name || "Workshop"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <CarFront className="w-20 h-20 text-zinc-600" />
            </div>
          )}

          {/* Image Overlay */}

          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

          {/* Status */}

          <div
            className={`
              absolute
              top-5
              left-5
              px-4
              py-2
              rounded-full
              text-sm
              font-bold
              backdrop-blur-md
              ${
                isOpen
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-red-500/15 text-red-400 border border-red-500/30"
              }
            `}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-current mr-2" />
            {workshop.status || "Closed"}
          </div>

          {/* Rating */}

          <div
            className="
              absolute
              top-5
              right-5
              flex
              items-center
              gap-2
              bg-black/70
              backdrop-blur-md
              border
              border-white/10
              px-4
              py-2
              rounded-xl
            "
          >
            <Star
              size={18}
              className="text-yellow-400 fill-yellow-400"
            />

            <span className="font-bold">
              {workshop.rating ?? 0}
            </span>

            <span className="text-zinc-400 text-sm">
              ({workshop.reviews ?? 0})
            </span>
          </div>

          {/* Hero Content */}

          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              p-6
              sm:p-8
              lg:p-10
            "
          >
            <p
              className="
                text-yellow-500
                text-xs
                sm:text-sm
                font-bold
                uppercase
                tracking-[0.2em]
              "
            >
              Trusted Automobile Workshop
            </p>

            <h1
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                font-black
                mt-2
              "
            >
              {workshop.name}
            </h1>

            {workshop.location && (
              <div className="flex items-start gap-2 mt-4 text-zinc-300">
                <MapPin
                  size={19}
                  className="text-yellow-500 mt-0.5 shrink-0"
                />

                <span>{workshop.location}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-10
        "
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="lg:col-span-2 space-y-8">

            {/* =================================================
                WORKSHOP INFORMATION
            ================================================= */}

            <section
              className="
                bg-zinc-800/70
                border
                border-zinc-700
                rounded-2xl
                p-6
                sm:p-8
              "
            >
              <div className="flex items-center gap-3 mb-6">

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-yellow-500/10
                    flex
                    items-center
                    justify-center
                  "
                >
                  <ShieldCheck
                    className="text-yellow-500"
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    Workshop Information
                  </h2>

                  <p className="text-sm text-zinc-500">
                    Professional automobile service
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Location */}

                <div
                  className="
                    bg-zinc-900/70
                    border
                    border-zinc-700
                    rounded-xl
                    p-5
                  "
                >
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="text-yellow-500 shrink-0"
                      size={21}
                    />

                    <div>
                      <p className="text-xs text-zinc-500 uppercase">
                        Location
                      </p>

                      <p className="text-zinc-200 mt-1">
                        {workshop.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opening Hours */}

                <div
                  className="
                    bg-zinc-900/70
                    border
                    border-zinc-700
                    rounded-xl
                    p-5
                  "
                >
                  <div className="flex items-start gap-3">
                    <Clock
                      className="text-yellow-500 shrink-0"
                      size={21}
                    />

                    <div>
                      <p className="text-xs text-zinc-500 uppercase">
                        Opening Hours
                      </p>

                      <p className="text-zinc-200 mt-1">
                        {workshop.openingTime} -{" "}
                        {workshop.closingTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Distance */}

                {workshop.distance !== undefined && (
                  <div
                    className="
                      bg-zinc-900/70
                      border
                      border-zinc-700
                      rounded-xl
                      p-5
                    "
                  >
                    <div className="flex items-start gap-3">
                      <MapPin
                        className="text-yellow-500 shrink-0"
                        size={21}
                      />

                      <div>
                        <p className="text-xs text-zinc-500 uppercase">
                          Distance
                        </p>

                        <p className="text-zinc-200 mt-1">
                          {workshop.distance} km away
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating */}

                <div
                  className="
                    bg-zinc-900/70
                    border
                    border-zinc-700
                    rounded-xl
                    p-5
                  "
                >
                  <div className="flex items-start gap-3">
                    <Star
                      className="text-yellow-500 fill-yellow-500 shrink-0"
                      size={21}
                    />

                    <div>
                      <p className="text-xs text-zinc-500 uppercase">
                        Customer Rating
                      </p>

                      <p className="text-zinc-200 mt-1">
                        {workshop.rating ?? 0} / 5
                        <span className="text-zinc-500 ml-2">
                          ({workshop.reviews ?? 0} reviews)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active Status */}

                <div
                  className="
                    bg-zinc-900/70
                    border
                    border-zinc-700
                    rounded-xl
                    p-5
                  "
                >
                  <div className="flex items-start gap-3">
                    <Power
                      className={
                        isActive
                          ? "text-green-500 shrink-0"
                          : "text-red-500 shrink-0"
                      }
                      size={21}
                    />

                    <div>
                      <p className="text-xs text-zinc-500 uppercase">
                        Workshop Status
                      </p>

                      <p
                        className={`mt-1 font-semibold ${
                          isActive
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next Available */}

                {workshop.nextAvailable && (
                  <div
                    className="
                      bg-zinc-900/70
                      border
                      border-zinc-700
                      rounded-xl
                      p-5
                    "
                  >
                    <div className="flex items-start gap-3">
                      <CalendarDays
                        className="text-yellow-500 shrink-0"
                        size={21}
                      />

                      <div>
                        <p className="text-xs text-zinc-500 uppercase">
                          Next Available
                        </p>

                        <p className="text-zinc-200 mt-1">
                          {workshop.nextAvailable}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                SERVICES
            ================================================= */}

            <section
              className="
                bg-zinc-800/70
                border
                border-zinc-700
                rounded-2xl
                p-6
                sm:p-8
              "
            >
              <div className="flex items-center gap-3 mb-6">

                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-yellow-500/10
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Wrench
                    className="text-yellow-500"
                    size={21}
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    Services Available
                  </h2>

                  <p className="text-sm text-zinc-500">
                    Services provided by this workshop
                  </p>
                </div>
              </div>

              {services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {services.map((service) => (
                    <div
                      key={service._id}
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                        bg-zinc-900/70
                        border
                        border-zinc-700
                        rounded-xl
                        px-4
                        py-4
                      "
                    >
                      <div className="flex items-start gap-3 min-w-0">

                        <CheckCircle2
                          size={18}
                          className="text-yellow-500 shrink-0 mt-0.5"
                        />

                        <div className="min-w-0">
                          <span className="text-zinc-200 font-medium">
                            {service.icon ? `${service.icon} ` : ""}
                            {service.name}
                          </span>

                          <p className="text-xs text-zinc-500 mt-1">
                            {service.category}
                            {service.estimatedTime
                              ? ` · ${service.estimatedTime}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      {service.startingPrice !== undefined &&
                        service.startingPrice !== null && (
                          <span className="text-yellow-500 font-bold whitespace-nowrap text-sm">
                            ₹{service.startingPrice}
                          </span>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Wrench
                    className="mx-auto text-zinc-600"
                    size={40}
                  />

                  <p className="text-zinc-500 mt-3">
                    No services available for this workshop.
                  </p>
                </div>
              )}
            </section>

            {/* =================================================
                RATING SECTION
            ================================================= */}

            <section
              className="
                bg-zinc-800/70
                border
                border-zinc-700
                rounded-2xl
                p-6
                sm:p-8
              "
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-zinc-500">
                    Customer Rating
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-4xl font-black text-white">
                      {workshop.rating ?? 0}
                    </span>

                    <div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={18}
                            className={
                              star <=
                              Math.round(
                                workshop.rating ?? 0
                              )
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-zinc-600"
                            }
                          />
                        ))}
                      </div>

                      <p className="text-xs text-zinc-500 mt-1">
                        Based on {workshop.reviews ?? 0} reviews
                      </p>
                    </div>
                  </div>
                </div>

                <Star
                  size={55}
                  className="hidden sm:block text-yellow-500/20 fill-yellow-500/10"
                />
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT BOOKING CARD
          ================================================= */}

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">

              <div
                className="
                  bg-zinc-800
                  border
                  border-zinc-700
                  rounded-3xl
                  overflow-hidden
                  shadow-2xl
                "
              >

                {/* Booking Header */}

                <div className="bg-yellow-500 p-6 text-black">

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-11
                        h-11
                        bg-black/10
                        rounded-xl
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <CalendarDays size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-black">
                        Book an Appointment
                      </h2>

                      <p className="text-black/60 text-sm mt-1">
                        Schedule your vehicle service
                      </p>
                    </div>

                  </div>
                </div>

                {/* Booking Body */}

                <div className="p-6">

                  {/* Starting Price */}

                  <div className="pb-5 border-b border-zinc-700">

                    <p
                      className="
                        text-xs
                        text-zinc-500
                        uppercase
                        tracking-wider
                      "
                    >
                      Service starting from
                    </p>

                    <div className="flex items-center mt-1">

                      <IndianRupee
                        size={24}
                        className="text-yellow-500"
                      />

                      <span className="text-3xl font-black text-yellow-500">
                        {workshop.startingPrice ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Location */}

                  <div className="flex items-start gap-3 py-5 border-b border-zinc-700">

                    <MapPin
                      size={20}
                      className="text-yellow-500 mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="text-xs text-zinc-500">
                        Workshop Location
                      </p>

                      <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                        {workshop.location}
                      </p>
                    </div>
                  </div>

                  {/* Opening Hours */}

                  <div className="flex items-start gap-3 py-5 border-b border-zinc-700">

                    <Clock
                      size={20}
                      className="text-yellow-500 mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="text-xs text-zinc-500">
                        Opening Hours
                      </p>

                      <p className="text-sm text-zinc-300 mt-1">
                        {workshop.openingTime} -{" "}
                        {workshop.closingTime}
                      </p>
                    </div>
                  </div>

                  {/* Next Available */}

                  {workshop.nextAvailable && (
                    <div className="flex items-start gap-3 py-5 border-b border-zinc-700">

                      <CalendarDays
                        size={20}
                        className="text-yellow-500 mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="text-xs text-zinc-500">
                          Next Available
                        </p>

                        <p className="text-sm text-zinc-300 mt-1">
                          {workshop.nextAvailable}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Book Button */}

                  <NavLink>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/book-appointment/${workshopId}`);

                      // Scroll the new page to the top
                      window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "instant",
                      });
                    }}
                    disabled={!isOpen || !isActive}
                    className={`
                      mt-6
                      flex
                      items-center
                      justify-center
                      gap-2
                      w-full
                      py-4
                      rounded-xl
                      font-black
                      transition-all
                      duration-300
                      ${
                        isOpen && isActive
                          ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/10"
                          : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                      }
                    `}
                  >
                    <CalendarDays size={19} />

                    {isOpen && isActive
                      ? "Book Appointment"
                      : "Workshop Unavailable"}

                    {isOpen && isActive && <ArrowRight size={18} />}
                  </button></NavLink>



                  {/* Security */}

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      mt-5
                      text-xs
                      text-zinc-500
                    "
                  >
                    <ShieldCheck size={15} />
                    Secure appointment booking
                  </div>
                </div>
              </div>

              {/* =================================================
                  QUICK INFORMATION
              ================================================= */}

              <div
                className="
                  mt-5
                  bg-zinc-800/70
                  border
                  border-zinc-700
                  rounded-2xl
                  p-5
                "
              >
                <p className="text-sm text-zinc-500">
                  Workshop Summary
                </p>

                <div className="space-y-4 mt-4">

                  {/* Rating */}

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">
                      Rating
                    </span>

                    <div className="flex items-center gap-1">
                      <Star
                        size={15}
                        className="text-yellow-500 fill-yellow-500"
                      />

                      <span className="text-white font-semibold">
                        {workshop.rating ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Reviews */}

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">
                      Reviews
                    </span>

                    <span className="text-white font-semibold">
                      {workshop.reviews ?? 0}
                    </span>
                  </div>

                  {/* Distance */}

                  {workshop.distance !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">
                        Distance
                      </span>

                      <span className="text-white font-semibold">
                        {workshop.distance} km
                      </span>
                    </div>
                  )}

                  {/* Services */}

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">
                      Services
                    </span>

                    <span className="text-white font-semibold">
                      {services.length}
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default WorkshopDetails;
