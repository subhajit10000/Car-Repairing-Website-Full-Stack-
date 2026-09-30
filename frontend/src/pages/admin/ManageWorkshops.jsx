import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import axiosInstance from "../../api/axiosInstance.js";
import { Plus, UserCog, Upload, X } from "lucide-react";

const emptyWorkshop = {
  name: "",
  image: "",
  location: "",
  openingTime: "09:00",
  closingTime: "18:00",
  startingPrice: 0,
  status: "Open",
};

const emptyManager = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  profilePhoto: null,
};

export default function ManageWorkshops() {
  const [workshops, setWorkshops] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyWorkshop);
  const [managerForms, setManagerForms] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      setError("");
      const [workshopsResponse, usersResponse] = await Promise.all([
        axiosInstance.get("/workshops"),
        axiosInstance.get("/users/admin/directory"),
      ]);
      setWorkshops(workshopsResponse.data?.data || []);
      setUsers(usersResponse.data?.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await axiosInstance.post("/workshops", {
        ...form,
        startingPrice: Number(form.startingPrice),
      });
      setForm(emptyWorkshop);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const getManagerForm = (id) => {
    const workshop = workshops.find((w) => w._id === id);
    const existing = workshop?.manager
      ? users.find((u) => u._id === (workshop.manager?._id || workshop.manager))
      : null;

    return managerForms[id] || {
      ...emptyManager,
      ...(existing || {}),
    };
  };

  const updateManagerForm = (id, key, value) => {
    setManagerForms((prev) => ({
      ...prev,
      [id]: { ...getManagerForm(id), [key]: value },
    }));
  };

  const assign = async (workshopId) => {
    const data = getManagerForm(workshopId);
    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      setError("Please fill first name, last name, email and phone number.");
      return;
    }

    const body = new FormData();
    body.append("firstName", data.firstName.trim());
    body.append("lastName", data.lastName.trim());
    body.append("email", data.email.trim());
    body.append("phone", data.phone.trim());
    if (data.profilePhoto) body.append("profilePhoto", data.profilePhoto);

    try {
      setBusy(workshopId);
      setError("");
      await axiosInstance.patch(`/workshops/${workshopId}/manager`, body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await load();
      setManagerForms((prev) => ({ ...prev, [workshopId]: emptyManager }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black">Workshops & Managers</h1>
        <p className="text-zinc-500 mt-1">
          Create workshops and assign a registered user as workshop manager.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={create}
          className="mt-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 grid md:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {[
            ["name", "Workshop name"],
            ["image", "Image URL"],
            ["location", "Location"],
            ["startingPrice", "Starting price"],
            ["openingTime", "Opening"],
            ["closingTime", "Closing"],
          ].map(([key, placeholder]) => (
            <input
              key={key}
              required
              type={key === "startingPrice" ? "number" : "text"}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-yellow-500"
            />
          ))}
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
          >
            <option>Open</option>
            <option>Closed</option>
          </select>
          <button className="rounded-xl bg-yellow-500 text-zinc-950 font-bold flex items-center justify-center gap-2">
            <Plus size={18} /> Add Workshop
          </button>
        </form>

        <div className="grid lg:grid-cols-2 gap-5 mt-6">
          {workshops.map((workshop) => {
            const manager = workshop.manager;
            const data = getManagerForm(workshop._id);

            return (
              <div
                key={workshop._id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-xl">{workshop.name}</h2>
                    <p className="text-zinc-500">{workshop.location}</p>
                  </div>
                  {manager && (
                    <span className="text-xs text-green-400 border border-green-500/20 bg-green-500/10 px-3 py-1 rounded-full h-fit">
                      Manager assigned
                    </span>
                  )}
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-5">
                  <div className="flex items-center gap-2 text-sm font-bold mb-4">
                    <UserCog size={17} className="text-yellow-500" />
                    {manager ? "Update Workshop Manager" : "Assign Workshop Manager"}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      value={data.firstName || ""}
                      onChange={(e) => updateManagerForm(workshop._id, "firstName", e.target.value)}
                      placeholder="First name"
                      className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
                    />
                    <input
                      value={data.lastName || ""}
                      onChange={(e) => updateManagerForm(workshop._id, "lastName", e.target.value)}
                      placeholder="Last name"
                      className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
                    />
                    <input
                      type="email"
                      value={data.email || manager?.email || ""}
                      onChange={(e) => updateManagerForm(workshop._id, "email", e.target.value)}
                      placeholder="Email"
                      className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
                    />
                    <input
                      type="tel"
                      value={data.phone || ""}
                      onChange={(e) => updateManagerForm(workshop._id, "phone", e.target.value)}
                      placeholder="Phone number"
                      className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
                    />
                  </div>

                  <label className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-3 cursor-pointer">
                    <Upload size={17} className="text-yellow-500" />
                    <span className="text-sm text-zinc-400 flex-1">
                      {data.profilePhoto?.name || "Upload profile photo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        updateManagerForm(workshop._id, "profilePhoto", e.target.files?.[0] || null)
                      }
                    />
                    {data.profilePhoto && (
                      <button
                        type="button"
                        onClick={() => updateManagerForm(workshop._id, "profilePhoto", null)}
                        className="text-zinc-500 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </label>

                  <p className="text-xs text-zinc-600 mt-2">
                    The email must belong to an existing registered account.
                  </p>

                  <button
                    type="button"
                    onClick={() => assign(workshop._id)}
                    disabled={busy === workshop._id}
                    className="mt-4 w-full rounded-xl bg-yellow-500 text-zinc-950 py-3 font-bold disabled:opacity-50"
                  >
                    {busy === workshop._id ? "Saving..." : "Save Manager"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
