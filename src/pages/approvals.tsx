import React, { useEffect, useState } from "react";
import { FiCheck, FiSearch, FiX } from "react-icons/fi";
import {
  getPendingUsers,
  approveUser as approveUserService,
  rejectUser as rejectUserService,
} from "../services/userService";

const RequestApproval = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("information");
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const pendingUsers = await getPendingUsers();
      setUsers(pendingUsers);
      setActiveUser(pendingUsers[0] || null);
    } catch (err: any) {
      console.error("Failed to fetch pending users:", err);
      setError("Failed to load pending requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchSearch = user.fullName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchFilter =
      filter === "All" || user.role?.toLowerCase() === filter.toLowerCase();

    return matchSearch && matchFilter;
  });

  const removeUserFromList = (uid: string) => {
    const updated = users.filter((u) => u.id !== uid);
    setUsers(updated);
    setActiveUser(updated[0] || null);
    setActiveTab("information");
  };

  const handleApprove = async () => {
    if (!activeUser || actionLoading) return;

    try {
      setActionLoading(true);
      await approveUserService(activeUser.id);
      removeUserFromList(activeUser.id);
    } catch (err: any) {
      console.error("Failed to approve user:", err);
      alert("Failed to approve user. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activeUser || actionLoading) return;

    const confirmed = window.confirm(
      `Are you sure you want to reject ${activeUser.fullName}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await rejectUserService(activeUser.id);
      removeUserFromList(activeUser.id);
    } catch (err: any) {
      console.error("Failed to reject user:", err);
      alert("Failed to reject user. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold mb-8">REQUEST APPROVAL</h1>

      {error && (
        <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* ================= LEFT PANEL ================= */}
        <div className="w-80 h-140 bg-white rounded-2xl shadow-sm p-6 flex flex-col">
          {/* SEARCH */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-100 px-4 py-2 rounded-lg outline-none text-sm pr-10"
            />
            <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
          </div>

          {/* FILTER */}
          <div className="flex gap-2 mb-6">
            {["All", "Farmer", "Buyer"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1 rounded-full text-xs font-medium transition ${
                  filter === type
                    ? "bg-green-700 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* USERS LIST */}
          <div className="space-y-3 overflow-y-auto">
            {loading ? (
              <div className="text-sm text-gray-400 text-center mt-10">
                Loading requests...
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setActiveUser(user);
                    setActiveTab("information");
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    activeUser?.id === user.id
                      ? "bg-green-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.fullName?.charAt(0)}
                    </div>

                    <span className="text-sm font-medium">
                      {user.fullName}
                    </span>
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full bg-purple-200 text-purple-800 capitalize">
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 text-center mt-10">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        {activeUser ? (
          <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col">
            {/* HEADER */}
            <div className="bg-green-700 text-white px-8 py-5 rounded-t-2xl flex justify-between items-center">
              <div className="flex flex-row items-center gap-4">
                <h1 className="text-2xl font-bold">Applicant:</h1>
                <h2 className="text-2xl font-bold">{activeUser.fullName}</h2>
              </div>

              <span className="bg-white text-green-700 px-4 py-1 rounded-full text-sm font-medium capitalize">
                {activeUser.role}
              </span>
            </div>

            {/* TABS */}
            <div className="px-8 pt-6">
              <div className="bg-gray-100 p-1 rounded-lg flex w-fit">
                <button
                  onClick={() => setActiveTab("information")}
                  className={`px-6 py-2 text-sm rounded-md transition ${
                    activeTab === "information"
                      ? "bg-white shadow font-medium text-green-700"
                      : "text-gray-500"
                  }`}
                >
                  Information
                </button>

                <button
                  onClick={() => setActiveTab("documents")}
                  className={`px-6 py-2 text-sm rounded-md transition ${
                    activeTab === "documents"
                      ? "bg-white shadow font-medium text-green-700"
                      : "text-gray-500"
                  }`}
                >
                  Documents
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 p-8 overflow-y-auto">
              {activeTab === "information" && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
                  <Info label="FULL NAME" value={activeUser.fullName} />
                  <Info label="EMAIL" value={activeUser.email} />
                  <Info label="PHONE NO." value={activeUser.phone} />
                  <Info label="ROLE" value={activeUser.role} />

                  {activeUser.role === "farmer" && (
                    <>
                      <Info label="FARM NAME" value={activeUser.farmName} />
                      <Info label="BARANGAY" value={activeUser.barangay} />
                      <Info
                        label="MUNICIPALITY"
                        value={activeUser.municipality}
                      />
                      <Info label="PROVINCE" value={activeUser.province} />
                    </>
                  )}
                </div>
              )}

              {activeTab === "documents" && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeUser.role === "buyer" && (
                    <DocumentCard
                      title="VALID ID"
                      file={activeUser.validID}
                      onPreview={setPreviewFile}
                    />
                  )}

                  {activeUser.role === "farmer" && (
                    <>
                      <DocumentCard
                        title="FARM PHOTO"
                        file={activeUser.farmPhoto}
                        onPreview={setPreviewFile}
                      />

                      <DocumentCard
                        title="PRODUCT PHOTO"
                        file={activeUser.productPhoto}
                        onPreview={setPreviewFile}
                      />

                      <DocumentCard
                        title="VALID ID"
                        file={activeUser.validID}
                        onPreview={setPreviewFile}
                      />

                      <DocumentCard
                        title="FARMER CERTIFICATE"
                        file={activeUser.farmerCert}
                        onPreview={setPreviewFile}
                      />

                      <DocumentCard
                        title="RSBA CERTIFICATE"
                        file={activeUser.rsbaCert}
                        onPreview={setPreviewFile}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="bg-gray-100 px-8 py-5 flex justify-end gap-4 rounded-b-2xl">
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX />
                Reject
              </button>

              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-2 bg-green-800 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiCheck />
                Approve
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400">
            {loading ? "Loading..." : "No pending requests"}
          </div>
        )}
      </div>

      {/* ================= IMAGE PREVIEW MODAL ================= */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative bg-white p-6 rounded-2xl max-w-4xl w-full shadow-xl">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
            >
              <FiX size={24} />
            </button>

            <div className="flex justify-center items-center">
              <img
                src={previewFile}
                alt="Preview"
                className="max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Info = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p className="text-gray-400 text-xs uppercase mb-2">{label}</p>

    <div className="bg-gray-100 px-4 py-3 rounded-md">{value || "N/A"}</div>
  </div>
);

const DocumentCard = ({
  title,
  file,
  onPreview,
}: {
  title: string;
  file?: string;
  onPreview: (file: string) => void;
}) => (
  <div className="flex flex-col">
    {/* Title */}
    <p className="text-gray-500 text-xs font-semibold tracking-wide uppercase mb-3">
      {title}
    </p>

    {/* Card */}
    <div
      className={`rounded-2xl border ${
        file
          ? "border-gray-300 bg-white shadow-sm"
          : "border-dashed border-gray-300 bg-gray-50"
      } transition-all duration-200`}
    >
      {file ? (
        <div onClick={() => onPreview(file)} className="cursor-pointer p-3">
          <div className="h-44 w-full overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
            <img src={file} alt={title} className="h-full w-full object-cover" />
          </div>

          <p className="text-center text-sm text-green-700 font-medium mt-3">
            Click to preview
          </p>
        </div>
      ) : (
        <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
          No file uploaded
        </div>
      )}
    </div>
  </div>
);

export default RequestApproval;
