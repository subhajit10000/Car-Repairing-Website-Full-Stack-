import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  AlertCircle,
  Boxes,
  CalendarDays,
  Gauge,
  Plus,
  Settings,
  Trash2,
  Users,
  Wrench,
} from "lucide-react";

import managerService from "../../services/managerService.js";
import { getCurrentUser } from "../../utils/storage.js";

const inputClasses =
  "w-full bg-zinc-900/80 border border-zinc-700 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 hover:border-zinc-600";

const TABS = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "services", label: "Services", icon: Wrench },
  { id: "employees", label: "Employees", icon: Users },
  { id: "inventory", label: "Inventory", icon: Boxes },
];

const Card = ({ children, className = "" }) => (
  <div className={`bg-zinc-800 border border-zinc-700 rounded-2xl p-5 sm:p-6 ${className}`}>
    {children}
  </div>
);

const ErrorBanner = ({ message }) =>
  message ? (
    <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mt-4">
      <AlertCircle size={18} className="shrink-0" />
      {message}
    </div>
  ) : null;

/* =========================================================
   OVERVIEW TAB — feature 6: shows/edits only this manager's
   own workshop's operational fields.
========================================================= */
const OverviewTab = ({ workshop, onSaved }) => {
  const [form, setForm] = useState({
    status: workshop?.status || "Closed",
    openingTime: workshop?.openingTime || "",
    closingTime: workshop?.closingTime || "",
    nextAvailable: workshop?.nextAvailable || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await managerService.updateWorkshop(workshop._id, form);
      const updated = response?.data?.data || response?.data;
      onSaved?.(updated);
      setSuccess("Workshop details updated.");
    } catch (err) {
      setError(err.message || "Unable to update workshop.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card>
        <h3 className="text-white font-bold flex items-center gap-2">
          <Settings size={18} className="text-yellow-500" />
          {workshop?.name}
        </h3>
        <p className="text-zinc-400 text-sm mt-1">{workshop?.location}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-500 text-xs">Rating</p>
            <p className="text-zinc-200 mt-0.5">{workshop?.rating ?? 0} / 5</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Reviews</p>
            <p className="text-zinc-200 mt-0.5">{workshop?.reviews ?? 0}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Starting Price</p>
            <p className="text-zinc-200 mt-0.5">₹{workshop?.startingPrice ?? 0}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Services Offered</p>
            <p className="text-zinc-200 mt-0.5">{workshop?.services?.length ?? 0}</p>
          </div>
        </div>

        <NavLink
          to="/admin/bookings"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold transition"
        >
          <CalendarDays size={16} />
          Manage Bookings & Repair Status
        </NavLink>
      </Card>

      <Card>
        <h3 className="text-white font-bold">Operating Details</h3>
        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className={`${inputClasses} appearance-none`}
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Opening Time</label>
              <input
                value={form.openingTime}
                onChange={(e) => setForm((p) => ({ ...p, openingTime: e.target.value }))}
                placeholder="09:00 AM"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Closing Time</label>
              <input
                value={form.closingTime}
                onChange={(e) => setForm((p) => ({ ...p, closingTime: e.target.value }))}
                placeholder="06:00 PM"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Next Available (shown to customers)</label>
            <input
              value={form.nextAvailable}
              onChange={(e) => setForm((p) => ({ ...p, nextAvailable: e.target.value }))}
              placeholder="Today, 3:00 PM"
              className={inputClasses}
            />
          </div>

          {error && <ErrorBanner message={error} />}
          {success && <p className="text-green-400 text-xs">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Card>
    </div>
  );
};

/* =========================================================
   SERVICES TAB — feature 2: create/update/remove services
   offered at this workshop only.
========================================================= */
const ServicesTab = ({ workshopId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    startingPrice: "",
    estimatedTime: "",
    icon: "🔧",
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await managerService.getAllServices();
      const all = response?.data?.data || response?.data || [];
      setServices(
        (Array.isArray(all) ? all : []).filter((s) =>
          (s.availableAt || []).some((w) => (typeof w === "string" ? w : w?._id) === workshopId),
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to load services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workshopId) fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await managerService.createService({
        ...form,
        startingPrice: Number(form.startingPrice),
      });
      setForm({ name: "", category: "", description: "", startingPrice: "", estimatedTime: "", icon: "🔧" });
      setShowForm(false);
      fetchServices();
    } catch (err) {
      setError(err.message || "Unable to create this service.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this service from your workshop?")) return;
    try {
      setError("");
      await managerService.deleteService(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err.message || "Unable to remove this service.");
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Wrench size={18} className="text-yellow-500" />
          Services at Your Workshop
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold transition"
        >
          <Plus size={14} />
          Add Service
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-zinc-700 pt-4">
          <input
            required
            placeholder="Service name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputClasses}
          />
          <input
            required
            placeholder="Category (e.g. Detailing)"
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className={inputClasses}
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Starting price (₹)"
            value={form.startingPrice}
            onChange={(e) => setForm((p) => ({ ...p, startingPrice: e.target.value }))}
            className={inputClasses}
          />
          <input
            required
            placeholder="Estimated time (e.g. 45 mins)"
            value={form.estimatedTime}
            onChange={(e) => setForm((p) => ({ ...p, estimatedTime: e.target.value }))}
            className={inputClasses}
          />
          <textarea
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className={`${inputClasses} sm:col-span-2`}
            rows={2}
          />
          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Service"}
          </button>
        </form>
      )}

      <ErrorBanner message={error} />

      {loading ? (
        <p className="text-zinc-500 text-sm mt-4">Loading services...</p>
      ) : services.length === 0 ? (
        <p className="text-zinc-500 text-sm mt-4">
          No services set up yet — add one above.
        </p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {services.map((service) => (
            <div
              key={service._id}
              className="flex items-center justify-between gap-3 bg-zinc-900/70 border border-zinc-700 rounded-xl px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-zinc-100 font-medium truncate">
                  {service.icon} {service.name}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {service.category} · ₹{service.startingPrice} · {service.estimatedTime}
                </p>
              </div>
              <button
                onClick={() => handleRemove(service._id)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition shrink-0"
                title="Remove from your workshop"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

/* =========================================================
   EMPLOYEES TAB — feature 2: add/remove employees, own
   workshop only (enforced server-side).
========================================================= */
const EmployeesTab = ({ workshopId }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", role: "MECHANIC" });
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await managerService.getWorkshopEmployees(workshopId);
      const data = response?.data?.data || response?.data || [];
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workshopId) fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await managerService.addWorkshopEmployee(workshopId, form);
      setForm({ email: "", role: "MECHANIC" });
      fetchEmployees();
    } catch (err) {
      setError(err.message || "Unable to add this employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (employeeId) => {
    if (!window.confirm("Remove this employee from your workshop?")) return;
    try {
      setError("");
      await managerService.removeWorkshopEmployee(workshopId, employeeId);
      setEmployees((prev) => prev.filter((e) => e._id !== employeeId));
    } catch (err) {
      setError(err.message || "Unable to remove this employee.");
    }
  };

  return (
    <Card>
      <h3 className="text-white font-bold flex items-center gap-2">
        <Users size={18} className="text-yellow-500" />
        Your Team
      </h3>

      <form onSubmit={handleAdd} className="mt-4 flex flex-wrap gap-3 border-t border-zinc-700 pt-4">
        <input
          required
          type="email"
          placeholder="Employee's registered email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          className={`${inputClasses} flex-1 min-w-[200px]`}
        />
        <select
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          className={`${inputClasses} w-44 appearance-none`}
        >
          <option value="MECHANIC">Mechanic</option>
          <option value="SERVICE_ADVISOR">Service Advisor</option>
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </form>
      <p className="text-xs text-zinc-500 mt-2">
        The person must already have a Car Detailing account with this email.
      </p>

      <ErrorBanner message={error} />

      {loading ? (
        <p className="text-zinc-500 text-sm mt-4">Loading team...</p>
      ) : employees.length === 0 ? (
        <p className="text-zinc-500 text-sm mt-4">No employees yet.</p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {employees.map((emp) => (
            <div
              key={emp._id}
              className="flex items-center justify-between gap-3 bg-zinc-900/70 border border-zinc-700 rounded-xl px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-zinc-100 font-medium truncate">
                  {emp.firstName} {emp.lastName}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{emp.email} · {emp.role}</p>
              </div>
              {emp.role !== "WORKSHOP_MANAGER" && (
                <button
                  onClick={() => handleRemove(emp._id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition shrink-0"
                  title="Remove employee"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

/* =========================================================
   INVENTORY TAB — feature 2: parts/supplies, own workshop
   only (enforced server-side).
========================================================= */
const InventoryTab = ({ workshopId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", category: "", quantity: "", unit: "pcs", unitCost: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await managerService.getWorkshopInventory(workshopId);
      const data = response?.data?.data || response?.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workshopId) fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await managerService.addInventoryItem(workshopId, {
        ...form,
        quantity: Number(form.quantity) || 0,
        unitCost: Number(form.unitCost) || 0,
      });
      setForm({ name: "", category: "", quantity: "", unit: "pcs", unitCost: "" });
      fetchInventory();
    } catch (err) {
      setError(err.message || "Unable to add this item.");
    } finally {
      setSubmitting(false);
    }
  };

  const adjustQuantity = async (item, delta) => {
    const newQty = Math.max(0, (item.quantity || 0) + delta);
    try {
      setError("");
      await managerService.updateInventoryItem(item._id, { quantity: newQty });
      setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, quantity: newQty } : i)));
    } catch (err) {
      setError(err.message || "Unable to update quantity.");
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Remove this item from inventory?")) return;
    try {
      setError("");
      await managerService.deleteInventoryItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setError(err.message || "Unable to remove this item.");
    }
  };

  return (
    <Card>
      <h3 className="text-white font-bold flex items-center gap-2">
        <Boxes size={18} className="text-yellow-500" />
        Inventory
      </h3>

      <form onSubmit={handleAdd} className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-zinc-700 pt-4">
        <input
          required
          placeholder="Item name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className={`${inputClasses} col-span-2`}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          className={inputClasses}
        />
        <input
          type="number"
          min="0"
          placeholder="Qty"
          value={form.quantity}
          onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
          className={inputClasses}
        />
        <input
          type="number"
          min="0"
          placeholder="Unit cost"
          value={form.unitCost}
          onChange={(e) => setForm((p) => ({ ...p, unitCost: e.target.value }))}
          className={inputClasses}
        />
        <button
          type="submit"
          disabled={submitting}
          className="col-span-2 sm:col-span-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Item"}
        </button>
      </form>

      <ErrorBanner message={error} />

      {loading ? (
        <p className="text-zinc-500 text-sm mt-4">Loading inventory...</p>
      ) : items.length === 0 ? (
        <p className="text-zinc-500 text-sm mt-4">No inventory items yet.</p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {items.map((item) => {
            const low = item.quantity <= (item.reorderLevel ?? 5);
            return (
              <div
                key={item._id}
                className="flex items-center justify-between gap-3 bg-zinc-900/70 border border-zinc-700 rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-zinc-100 font-medium truncate">
                    {item.name}
                    {low && (
                      <span className="ml-2 text-[10px] font-bold text-red-400 border border-red-500/30 bg-red-500/10 rounded-full px-2 py-0.5">
                        LOW STOCK
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {item.category} · ₹{item.unitCost}/{item.unit}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => adjustQuantity(item, -1)}
                    className="w-7 h-7 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 transition"
                  >
                    −
                  </button>
                  <span className="text-sm text-zinc-200 w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => adjustQuantity(item, 1)}
                    className="w-7 h-7 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 transition"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

/* =========================================================
   PAGE
========================================================= */
const WorkshopDashboard = () => {
  const currentUser = getCurrentUser();
  const workshopId = currentUser?.workshop;

  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      if (!workshopId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await managerService.getWorkshop(workshopId);
        setWorkshop(response?.data?.data || response?.data || null);
      } catch (err) {
        setError(err.message || "Unable to load your workshop.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workshopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full border-4 border-zinc-700 border-t-yellow-500 animate-spin" />
          <p className="mt-5 text-zinc-400">Loading your workshop...</p>
        </div>
      </div>
    );
  }

  if (!workshopId) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-3xl p-8 text-center">
          <AlertCircle className="mx-auto text-yellow-500" size={36} />
          <h2 className="text-xl font-bold text-white mt-4">No Workshop Assigned</h2>
          <p className="text-zinc-400 mt-2 text-sm">
            Your account isn't assigned to a workshop yet. Contact an admin to get set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
            <Gauge className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Workshop Dashboard</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Manage {workshop?.name || "your workshop"}'s services, team and inventory
            </p>
          </div>
        </div>

        <ErrorBanner message={error} />

        <div className="flex flex-wrap gap-2 mt-8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                tab === id
                  ? "bg-yellow-500 text-black border-yellow-500"
                  : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "overview" && <OverviewTab workshop={workshop} onSaved={setWorkshop} />}
          {tab === "services" && <ServicesTab workshopId={workshopId} />}
          {tab === "employees" && <EmployeesTab workshopId={workshopId} />}
          {tab === "inventory" && <InventoryTab workshopId={workshopId} />}
        </div>
      </div>
    </div>
  );
};

export default WorkshopDashboard;
