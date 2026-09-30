import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  StickyNote,
  Wrench,
} from "lucide-react";

import Button from "../../components/ui/Button.jsx";
import { workshopDetails, workshopService } from "../../services/workshopService.js";
import bookingService from "../../services/bookingService.js";
import vehicleService from "../../services/vehicleService.js";
import { getCurrentUser } from "../../utils/storage.js";

// Fixed slot list — the backend just stores whichever string is submitted.
const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
];

const inputClasses =
  "w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 hover:border-zinc-600";

const labelClasses = "block text-sm font-medium text-zinc-300 mb-2";

const BookService = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const [workshop, setWorkshop] = useState(null);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    regNumber: "",
  });
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("manual");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || "");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [booked, setBooked] = useState(null);

  /* =========================================================
     FETCH WORKSHOP + SERVICES
  ========================================================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const [workshopRes, servicesRes] = await Promise.all([
          workshopDetails.getworkshopDetails(),
          workshopService.getServices(),
        ]);

        const workshops = Array.isArray(workshopRes?.data?.data)
          ? workshopRes.data.data
          : Array.isArray(workshopRes?.data)
          ? workshopRes.data
          : Array.isArray(workshopRes)
          ? workshopRes
          : [];

        const foundWorkshop = workshops.find(
          (item) => String(item._id || item.id) === String(workshopId)
        );

        if (!foundWorkshop) {
          throw new Error("Workshop not found.");
        }

        setWorkshop(foundWorkshop);
        setAllServices(servicesRes?.data || []);
      } catch (err) {
        console.error("Error loading booking page:", err);

        setLoadError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load this workshop. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (workshopId) {
      fetchData();
    }
  }, [workshopId]);

  // Load the user's saved garage so they can pick one instead of typing
  // vehicle details by hand. Failing silently here just falls back to the
  // manual entry fields, which is why it's not part of loadError above.
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehicleService.getMyVehicles();
        const data = response?.data?.data || response?.data || [];
        setSavedVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching saved vehicles:", err);
      }
    };

    fetchVehicles();
  }, []);

  const handleSelectSavedVehicle = (id) => {
    setSelectedVehicleId(id);

    if (id === "manual") {
      setVehicle({ make: "", model: "", year: "", regNumber: "" });
      return;
    }

    const found = savedVehicles.find((v) => v._id === id);
    if (found) {
      setVehicle({
        make: found.make || "",
        model: found.model || "",
        year: found.year || "",
        regNumber: found.regNumber || "",
      });
    }
  };

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  // workshop.services is usually an array of Service ObjectId strings
  // (see backend/models/workshop.model.js). Cross-reference against the
  // full active services list so we can show real names/prices.
  const availableServices = useMemo(() => {
    if (!workshop) return [];

    const workshopServiceIds = (workshop.services || []).map((s) =>
      typeof s === "string" ? s : s?._id
    );

    return allServices.filter((service) =>
      workshopServiceIds.includes(service._id)
    );
  }, [workshop, allServices]);

  // Feature 4: running estimate shown to the customer as they pick
  // services, before they even submit — mirrors the backend's
  // estimatedCost calculation in appointment.controller.js.
  const estimatedTotal = useMemo(() => {
    return availableServices
      .filter((service) => selectedServiceIds.includes(service._id))
      .reduce((sum, service) => sum + (service.startingPrice || 0), 0);
  }, [availableServices, selectedServiceIds]);

  const isOpen = workshop?.status?.toLowerCase() === "open";
  const isActive = workshop?.isActive !== false;
  const canBook = isOpen && isActive;

  const todayStr = new Date().toISOString().split("T")[0];

  const toggleService = (id) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prev) => ({ ...prev, [name]: value }));
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (selectedServiceIds.length === 0) {
      setSubmitError("Please select at least one service.");
      return;
    }
    if (!vehicle.make.trim() || !vehicle.model.trim() || !vehicle.regNumber.trim()) {
      setSubmitError("Please fill in your vehicle's make, model, and registration number.");
      return;
    }
    if (!appointmentDate) {
      setSubmitError("Please choose an appointment date.");
      return;
    }
    if (!timeSlot) {
      setSubmitError("Please choose a time slot.");
      return;
    }
    if (!contactPhone.trim()) {
      setSubmitError("Please provide a contact phone number.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        workshopId,
        serviceIds: selectedServiceIds,
        vehicle: {
          make: vehicle.make.trim(),
          model: vehicle.model.trim(),
          ...(vehicle.year && { year: Number(vehicle.year) }),
          regNumber: vehicle.regNumber.trim(),
        },
        appointmentDate,
        timeSlot,
        contactPhone: contactPhone.trim(),
        ...(notes.trim() && { notes: notes.trim() }),
      };

      const response = await bookingService.bookAppointment(payload);

      setBooked(response?.data?.data || response?.data || null);
    } catch (err) {
      setSubmitError(err.message || "Unable to book this appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full border-4 border-zinc-700 border-t-yellow-500 animate-spin" />
          <p className="mt-5 text-zinc-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     LOAD ERROR
  ========================================================= */

  if (loadError || !workshop) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-white mt-5">Something went wrong</h2>

          <p className="text-zinc-400 mt-3">
            {loadError || "This workshop could not be found."}
          </p>

          <button
            onClick={() => navigate("/Workshop")}
            className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition"
          >
            <ArrowLeft size={18} />
            Back to Workshops
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     SUCCESS
  ========================================================= */

  if (booked) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-lg bg-zinc-800 border border-zinc-700 rounded-3xl p-8 sm:p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-6">
            Appointment Booked!
          </h2>

          <p className="text-zinc-400 mt-3">
            Your appointment at{" "}
            <span className="text-yellow-500 font-semibold">{workshop.name}</span>{" "}
            has been requested for{" "}
            <span className="text-white font-semibold">
              {new Date(appointmentDate).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>{" "}
            at <span className="text-white font-semibold">{timeSlot}</span>.
          </p>

          <p className="text-zinc-500 text-sm mt-2">
            You'll see it under "My Bookings" once the workshop confirms it.
          </p>

          {booked.estimatedCost != null && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5">
              <span className="text-xs text-zinc-400">Estimated Cost:</span>
              <span className="text-yellow-500 font-bold">₹{booked.estimatedCost}</span>
            </div>
          )}

          <p className="text-zinc-500 text-xs mt-2">
            A confirmation email with these details has been sent to your inbox. We'll
            email you again as the workshop updates your repair's progress, and the
            final invoice will follow once it's complete.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/my-bookings")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition"
            >
              View My Bookings
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate("/Workshop")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white font-semibold transition"
            >
              Back to Workshops
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <NavLink
          to={`/Workshop/${workshopId}`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-yellow-500 transition"
        >
          <ArrowLeft size={18} />
          Back to {workshop.name}
        </NavLink>

        {/* Header */}
        <div className="mt-6 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
            <CalendarDays className="w-7 h-7 text-black" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Book an Appointment</h1>
            <p className="text-zinc-400 mt-1 flex items-center gap-1.5 text-sm">
              <MapPin size={14} className="text-yellow-500" />
              {workshop.name} &middot; {workshop.location}
            </p>
          </div>
        </div>

        {!canBook && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={18} className="shrink-0" />
            This workshop isn't currently accepting bookings. Please check back later.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Services */}
          <section className="bg-zinc-800 border border-zinc-700 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <Wrench size={20} className="text-yellow-500" />
                <h2 className="text-lg font-bold">Select Services</h2>
              </div>

              {selectedServiceIds.length > 0 && (
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Estimated Total</p>
                  <p className="text-yellow-500 font-bold text-lg">₹{estimatedTotal}</p>
                </div>
              )}
            </div>

            {availableServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableServices.map((service) => {
                  const checked = selectedServiceIds.includes(service._id);

                  return (
                    <label
                      key={service._id}
                      className={`flex items-start gap-3 rounded-xl border px-4 py-4 cursor-pointer transition ${
                        checked
                          ? "border-yellow-500 bg-yellow-500/5"
                          : "border-zinc-700 bg-zinc-900/70 hover:border-zinc-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleService(service._id)}
                        className="mt-1 w-4 h-4 accent-yellow-500 rounded shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-zinc-100 font-medium truncate">
                            {service.icon ? `${service.icon} ` : ""}
                            {service.name}
                          </span>
                          <span className="text-yellow-500 font-bold whitespace-nowrap text-sm">
                            ₹{service.startingPrice}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-500 mt-1">
                          {service.category}
                          {service.estimatedTime ? ` · ${service.estimatedTime}` : ""}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">
                No services are currently listed for this workshop.
              </p>
            )}
          </section>

          {/* Vehicle */}
          <section className="bg-zinc-800 border border-zinc-700 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <CarFront size={20} className="text-yellow-500" />
                <h2 className="text-lg font-bold">Vehicle Details</h2>
              </div>

              <NavLink
                to="/my-vehicles"
                className="text-xs font-semibold text-yellow-500 hover:text-yellow-400 transition"
              >
                Manage Vehicles
              </NavLink>
            </div>

            {savedVehicles.length > 0 && (
              <div className="mb-5">
                <label className={labelClasses}>Use a saved vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => handleSelectSavedVehicle(e.target.value)}
                  className={`${inputClasses.replace("pl-12", "pl-4")} appearance-none`}
                >
                  <option value="manual">Enter details manually</option>
                  {savedVehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.make} {v.model}
                      {v.year ? ` (${v.year})` : ""} &middot; {v.regNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Make</label>
                <input
                  name="make"
                  value={vehicle.make}
                  onChange={handleVehicleChange}
                  placeholder="e.g. Maruti Suzuki"
                  required
                  className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-3.5 px-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 hover:border-zinc-600"
                />
              </div>

              <div>
                <label className={labelClasses}>Model</label>
                <input
                  name="model"
                  value={vehicle.model}
                  onChange={handleVehicleChange}
                  placeholder="e.g. Swift"
                  required
                  className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-3.5 px-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 hover:border-zinc-600"
                />
              </div>

              <div>
                <label className={labelClasses}>Year (optional)</label>
                <input
                  name="year"
                  type="number"
                  min="1950"
                  max={new Date().getFullYear() + 1}
                  value={vehicle.year}
                  onChange={handleVehicleChange}
                  placeholder="e.g. 2021"
                  className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-3.5 px-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 hover:border-zinc-600"
                />
              </div>

              <div>
                <label className={labelClasses}>Registration Number</label>
                <input
                  name="regNumber"
                  value={vehicle.regNumber}
                  onChange={handleVehicleChange}
                  placeholder="e.g. WB37AB1234"
                  required
                  className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-3.5 px-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 hover:border-zinc-600 uppercase"
                />
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="bg-zinc-800 border border-zinc-700 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <CalendarDays size={20} className="text-yellow-500" />
              <h2 className="text-lg font-bold">Schedule</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Appointment Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="date"
                    min={todayStr}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Time Slot</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    required
                    className={`${inputClasses} appearance-none`}
                  >
                    <option value="" disabled>
                      Select a slot
                    </option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-zinc-800 border border-zinc-700 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <Phone size={20} className="text-yellow-500" />
              <h2 className="text-lg font-bold">Contact & Notes</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClasses}>Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Notes (optional)</label>
                <div className="relative">
                  <StickyNote className="absolute left-4 top-4 w-5 h-5 text-zinc-500" />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Anything the workshop should know beforehand?"
                    className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 hover:border-zinc-600 resize-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Error */}
          {submitError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={18} className="shrink-0" />
              {submitError}
            </div>
          )}

          <Button type="submit" disabled={submitting || !canBook} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-900/30 border-t-zinc-950" />
                Booking...
              </span>
            ) : (
              <>
                Confirm Booking
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BookService;
