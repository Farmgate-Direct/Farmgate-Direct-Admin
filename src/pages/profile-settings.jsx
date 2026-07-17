import { useEffect, useState } from "react";

import {
  FaUser,
  FaLock,
  FaUserShield,
  FaPlus,
  FaBan,
  FaCheckCircle,
  FaEdit,
  FaSearch,
} from "react-icons/fa";

import {
  getCurrentAdmin,
  getAllAdmins,
  toggleAdminStatus,
  updateAdminProfile,
  createAdmin,
} from "../services/adminService";

const Profile = () => {
  const [currentAdmin, setCurrentAdmin] = useState(null);

  const [admins, setAdmins] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [showAddAdmin, setShowAddAdmin] = useState(false);

  const [showEditAdmin, setShowEditAdmin] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const isSuperAdmin = currentAdmin?.role === "super admin";

  // LOAD FIRESTORE DATA

  const loadAdmins = async () => {
    try {
      const current = await getCurrentAdmin();

      setCurrentAdmin(current);

      const data = await getAllAdmins();

      setAdmins(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // SEARCH

  const filteredAdmins = admins.filter((admin) =>
    admin.name?.toLowerCase().includes(search.toLowerCase()),
  );

  // CREATE ADMIN

  const handleCreateAdmin = async () => {
    if (!isSuperAdmin) {
      alert("Only Super Admin can add admin");

      return;
    }

    try {
      await createAdmin(newAdmin);

      alert("Admin successfully created");

      setShowAddAdmin(false);

      setNewAdmin({
        name: "",
        email: "",
        password: "",
        role: "admin",
      });

      loadAdmins();
    } catch (error) {
      console.log(error);

      alert(error.message);
    }
  };

  // OPEN EDIT MODAL

  const handleOpenEdit = (admin) => {
    if (!isSuperAdmin) return;

    setEditingAdmin({
      id: admin.id,
      name: admin.name || "",
      email: admin.email || "",
      role: admin.role || "admin",
    });

    setShowEditAdmin(true);
  };

  // SAVE EDIT

  const handleSaveEdit = async () => {
    if (!isSuperAdmin || !editingAdmin) return;

    try {
      await updateAdminProfile(editingAdmin.id, {
        name: editingAdmin.name,
        role: editingAdmin.role,
      });

      alert("Admin updated");

      setShowEditAdmin(false);

      setEditingAdmin(null);

      loadAdmins();
    } catch (error) {
      console.log(error);

      alert(error.message);
    }
  };

  // TOGGLE ACTIVATE / DEACTIVATE

  const handleToggleStatus = (admin) => {
    if (!isSuperAdmin) return;

    setSelectedAdmin(admin);
    setShowStatusModal(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedAdmin) return;

    try {
      await toggleAdminStatus(selectedAdmin.id, selectedAdmin.status);

      setShowStatusModal(false);
      setSelectedAdmin(null);

      loadAdmins();
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-8">PROFILE & SETTINGS</h1>

      <div className="flex gap-6 items-start">
        {/* ================= PERSONAL INFORMATION ================= */}

        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaUser className="text-green-700 text-xl" />

            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs uppercase text-gray-500">
                Full Name
              </label>

              <input
                type="text"
                defaultValue={currentAdmin?.name || ""}
                className="w-full mt-2 bg-gray-100 px-4 py-3 rounded-lg outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500">
                Email Address
              </label>

              <input
                type="email"
                readOnly
                defaultValue={currentAdmin?.email || ""}
                className="w-full mt-2 bg-gray-100 px-4 py-3 rounded-lg outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500">Role</label>

              <input
                type="text"
                readOnly
                defaultValue={currentAdmin?.role || ""}
                className="w-full mt-2 bg-gray-100 px-4 py-3 rounded-lg outline-none text-sm"
              />
            </div>

            <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg transition">
              Save Changes
            </button>
          </div>
        </div>

        {/* ================= CHANGE PASSWORD ================= */}

        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <FaLock className="text-green-700 text-xl" />

            <h2 className="text-lg font-semibold">Change Password</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs uppercase text-gray-500">
                Current Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-2 bg-gray-100 px-4 py-3 rounded-lg outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500">
                New Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-2 bg-gray-100 px-4 py-3 rounded-lg outline-none text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                className="w-full mt-2 bg-gray-100 px-4 py-3 rounded-lg outline-none text-sm"
              />
            </div>

            <button className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg transition">
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* ================= ADMIN MANAGEMENT ================= */}

      <section className="mt-6 bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <FaUserShield className="text-green-700 text-xl" />

            <h2 className="text-lg font-semibold">Administrator Management</h2>
          </div>

          {/* ONLY SUPER ADMIN CAN ADD */}

          {isSuperAdmin && (
            <button
              onClick={() => setShowAddAdmin(true)}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg transition"
            >
              <FaPlus />
              Add Admin
            </button>
          )}
        </div>

        {/* SEARCH */}

        <div className="relative w-80 mb-6">
          <input
            type="text"
            placeholder="Search administrator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 px-4 py-3 rounded-lg outline-none text-sm pr-10"
          />

          <FaSearch className="absolute right-4 top-4 text-gray-400" />
        </div>

        {/* TABLE */}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
              <th className="pb-4">Administrator</th>

              <th>Role</th>

              <th>Status</th>

              <th>Last Login</th>

              {/* ACTIONS HEADER — SUPER ADMIN ONLY */}

              {isSuperAdmin && <th>Actions</th>}
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {filteredAdmins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50 transition">
                {/* ADMIN INFO */}

                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">
                      {admin.name?.charAt(0)}
                    </div>

                    <div>
                      <p className="font-medium">{admin.name}</p>

                      <p className="text-xs text-gray-400">{admin.email}</p>
                    </div>
                  </div>
                </td>

                {/* ROLE */}

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admin.role === "super admin"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {admin.role}
                  </span>
                </td>

                {/* STATUS */}

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      admin.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {admin.status}
                  </span>
                </td>

                {/* LAST LOGIN */}

                <td className="text-gray-400">
                  {admin.lastLogin
                    ? admin.lastLogin.toDate
                      ? admin.lastLogin.toDate().toLocaleString()
                      : admin.lastLogin
                    : "Never"}
                </td>

                {/* ACTIONS — SUPER ADMIN ONLY (whole column hidden otherwise) */}

                {isSuperAdmin && (
                  <td>
                    <div className="flex gap-2">
                      {/* EDIT */}

                      <button
                        onClick={() => handleOpenEdit(admin)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs"
                      >
                        <FaEdit />
                      </button>

                      {/* ACTIVATE / DEACTIVATE */}

                      <button
                        onClick={() => handleToggleStatus(admin)}
                        className={`px-3 py-2 rounded-lg text-xs ${
                          admin.status === "Active"
                            ? "bg-red-100 hover:bg-red-200 text-red-600"
                            : "bg-green-100 hover:bg-green-200 text-green-700"
                        }`}
                      >
                        {admin.status === "Active" ? (
                          <FaBan />
                        ) : (
                          <FaCheckCircle />
                        )}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ================= ADD ADMIN MODAL ================= */}

      {showAddAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-5">Create Administrator</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={newAdmin.name}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, name: e.target.value })
              }
              className="w-full bg-gray-100 px-4 py-3 rounded-lg mb-3 outline-none text-sm"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={newAdmin.email}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, email: e.target.value })
              }
              className="w-full bg-gray-100 px-4 py-3 rounded-lg mb-3 outline-none text-sm"
            />

            <input
              type="password"
              placeholder="Password"
              value={newAdmin.password}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, password: e.target.value })
              }
              className="w-full bg-gray-100 px-4 py-3 rounded-lg mb-3 outline-none text-sm"
            />

            <select
              value={newAdmin.role}
              onChange={(e) =>
                setNewAdmin({ ...newAdmin, role: e.target.value })
              }
              className="w-full bg-gray-100 px-4 py-3 rounded-lg outline-none text-sm"
            >
              <option value="admin">Admin</option>

              <option value="super admin">Super Admin</option>
            </select>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddAdmin(false)}
                className="bg-gray-200 hover:bg-gray-300 px-5 py-3 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateAdmin}
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT ADMIN MODAL ================= */}

      {showEditAdmin && editingAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-2xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-5">Edit Administrator</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={editingAdmin.name}
              onChange={(e) =>
                setEditingAdmin({ ...editingAdmin, name: e.target.value })
              }
              className="w-full bg-gray-100 px-4 py-3 rounded-lg mb-3 outline-none text-sm"
            />

            {/* EMAIL READ ONLY — CAN'T CHANGE AUTH EMAIL FROM HERE */}

            <input
              type="email"
              readOnly
              value={editingAdmin.email}
              className="w-full bg-gray-100 px-4 py-3 rounded-lg mb-3 outline-none text-sm text-gray-400"
            />

            <select
              value={editingAdmin.role}
              onChange={(e) =>
                setEditingAdmin({ ...editingAdmin, role: e.target.value })
              }
              className="w-full bg-gray-100 px-4 py-3 rounded-lg outline-none text-sm"
            >
              <option value="admin">Admin</option>

              <option value="super admin">Super Admin</option>
            </select>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditAdmin(false);
                  setEditingAdmin(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 px-5 py-3 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-lg text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ACTIVATE / DEACTIVATE MODAL ================= */}

      {showStatusModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-105 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-center mt-5">
              {selectedAdmin.status === "Active"
                ? "Deactivate Administrator"
                : "Activate Administrator"}
            </h2>

            <p className="text-gray-500 text-center mt-3 leading-6">
              {selectedAdmin.status === "Active" ? (
                <>
                  Are you sure you want to deactivate{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedAdmin.name}
                  </span>
                  ? This administrator will no longer be able to access the
                  system.
                </>
              ) : (
                <>
                  Are you sure you want to activate{" "}
                  <span className="font-semibold text-gray-700">
                    {selectedAdmin.name}
                  </span>
                  ? This administrator will regain access to the system.
                </>
              )}
            </p>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedAdmin(null);
                }}
                className="px-5 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmToggleStatus}
                className={`px-5 py-3 rounded-lg text-white transition ${
                  selectedAdmin.status === "Active"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-700 hover:bg-green-800"
                }`}
              >
                {selectedAdmin.status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
