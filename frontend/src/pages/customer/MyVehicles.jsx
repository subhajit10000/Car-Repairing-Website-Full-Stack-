import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CarFront,
  Palette,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import Button from "../../components/ui/Button.jsx";
import vehicleService from "../../services/vehicleService.js";

const emptyForm = { make: "", model: "", year: "", regNumber: "", color: "" , image: null};

const inputClasses =
  "w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 hover:border-zinc-600";

const labelClasses = "block text-sm font-medium text-zinc-300 mb-2";

const VehicleForm = ({ initial, onCancel, onSubmit, submitting, formError }) => {
  const [form, setForm] = useState(initial || emptyForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-800 border border-zinc-700 rounded-3xl p-6 sm:p-8 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClasses}>Make</label>
          <input
            name="make"
            value={form.make}
            onChange={handleChange}
            placeholder="e.g. Maruti Suzuki"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Model</label>
          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="e.g. Swift"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Year (optional)</label>
          <input
            name="year"
            type="number"
            min="1950"
            max={new Date().getFullYear() + 1}
            value={form.year}
            onChange={handleChange}
            placeholder="e.g. 2021"
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>Registration Number</label>
          <input
            name="regNumber"
            value={form.regNumber}
            onChange={handleChange}
            placeholder="e.g. WB37AB1234"
            required
            className={`${inputClasses} uppercase`}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClasses}>Color (optional)</label>
          <input
            name="color"
            value={form.color}
            onChange={handleChange}
            placeholder="e.g. White"
            className={inputClasses}
          />
        </div>
      </div>

      {formError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={18} className="shrink-0" />
          {formError}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Vehicle"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Feature 3: vehicle photo upload (Cloudinary-backed).
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);
  const uploadTargetId = useRef(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await vehicleService.getMyVehicles();
      const data = response?.data?.data || response?.data || [];

      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(err.message || "Unable to load your vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const buildPayload = (form) => ({
    make: form.make.trim(),
    model: form.model.trim(),
    ...(form.year && { year: Number(form.year) }),
    regNumber: form.regNumber.trim(),
    ...(form.color?.trim() && { color: form.color.trim() }),
  });

  const handleAdd = async (form) => {
    try {
      setSubmitting(true);
      setFormError("");

      const response = await vehicleService.addVehicle(buildPayload(form));
      const created = response?.data?.data || response?.data;

      if (created) {
        setVehicles((prev) => [created, ...prev]);
      } else {
        fetchVehicles();
      }

      setShowAddForm(false);
    } catch (err) {
      setFormError(err.message || "Unable to add this vehicle.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      setSubmitting(true);
      setFormError("");

      const response = await vehicleService.updateVehicle(id, buildPayload(form));
      const updated = response?.data?.data || response?.data;

      setVehicles((prev) =>
        prev.map((v) => (v._id === id ? updated || { ...v, ...form } : v))
      );

      setEditingId(null);
    } catch (err) {
      setFormError(err.message || "Unable to update this vehicle.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this vehicle from your garage?")) return;

    try {
      setDeletingId(id);
      setError("");

      await vehicleService.deleteVehicle(id);

      setVehicles((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      setError(err.message || "Unable to remove this vehicle.");
    } finally {
      setDeletingId(null);
    }
  };

  // Feature 3: opens the hidden file picker for a specific vehicle, then
  // uploads whatever image the user selects to Cloudinary via the backend.
  const handlePickImage = (id) => {
    uploadTargetId.current = id;
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0];
    const id = uploadTargetId.current;
    e.target.value = "";
    if (!file || !id) return;

    try {
      setUploadingId(id);
      setError("");

      const response = await vehicleService.uploadImage(id, file);
      const updated = response?.data?.data || response?.data;

      if (updated) {
        setVehicles((prev) => prev.map((v) => (v._id === id ? updated : v)));
      } else {
        fetchVehicles();
      }
    } catch (err) {
      setError(err.message || "Unable to upload this photo.");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full border-4 border-zinc-700 border-t-yellow-500 animate-spin" />
          <p className="mt-5 text-zinc-400">Loading your vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelected}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
              <CarFront className="w-7 h-7 text-black" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black">My Vehicles</h1>
              <p className="text-zinc-400 mt-1 text-sm">
                Save your vehicles for faster booking
              </p>
            </div>
          </div>

          {!showAddForm && (
            <button
              onClick={() => {
                setEditingId(null);
                setFormError("");
                setShowAddForm(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition"
            >
              <Plus size={18} />
              Add Vehicle
            </button>
          )}
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Add form */}
        {showAddForm && (
          <div className="mt-8">
            <VehicleForm
              onCancel={() => setShowAddForm(false)}
              onSubmit={handleAdd}
              submitting={submitting}
              formError={formError}
            />
          </div>
        )}

        {/* Vehicle list */}
        {vehicles.length === 0 && !showAddForm ? (
          <div className="mt-10 bg-zinc-800 border border-zinc-700 rounded-3xl p-10 text-center">
            <CarFront className="mx-auto text-zinc-600" size={40} />
            <p className="text-zinc-400 mt-4">
              You haven't added any vehicles yet.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition"
            >
              <Plus size={18} />
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {vehicles.map((vehicle) =>
              editingId === vehicle._id ? (
                <VehicleForm
                  key={vehicle._id}
                  initial={{
                    make: vehicle.make || "",
                    model: vehicle.model || "",
                    year: vehicle.year || "",
                    regNumber: vehicle.regNumber || "",
                    color: vehicle.color || "",
                  }}
                  onCancel={() => {
                    setEditingId(null);
                    setFormError("");
                  }}
                  onSubmit={(form) => handleUpdate(vehicle._id, form)}
                  submitting={submitting}
                  formError={formError}
                />
              ) : (
                <div
                  key={vehicle._id}
                  className="bg-zinc-800 border border-zinc-700 rounded-3xl p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => handlePickImage(vehicle._id)}
                      title="Upload/change vehicle photo"
                      className="relative w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 overflow-hidden group"
                    >
                      {vehicle.image?.url ? (
                        <img
                          src={vehicle.image.url}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CarFront className="w-6 h-6 text-yellow-500" />
                      )}

                      <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        {uploadingId === vehicle._id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                          <Camera size={16} className="text-white" />
                        )}
                      </span>
                    </button>

                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {vehicle.make} {vehicle.model}
                        {vehicle.year ? ` (${vehicle.year})` : ""}
                      </h3>
                      <p className="text-sm text-zinc-400 mt-1">
                        {vehicle.regNumber}
                      </p>
                      {vehicle.color && (
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                          <Palette size={12} className="text-yellow-500" />
                          {vehicle.color}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePickImage(vehicle._id)}
                        className="text-xs font-semibold text-yellow-500 hover:text-yellow-400 transition mt-1"
                      >
                        {vehicle.image?.url ? "Change photo" : "Upload photo"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setFormError("");
                        setEditingId(vehicle._id);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 text-sm font-semibold transition"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(vehicle._id)}
                      disabled={deletingId === vehicle._id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition disabled:opacity-50"
                    >
                      {deletingId === vehicle._id ? (
                        "Removing..."
                      ) : (
                        <>
                          <Trash2 size={15} />
                          Remove
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVehicles;
