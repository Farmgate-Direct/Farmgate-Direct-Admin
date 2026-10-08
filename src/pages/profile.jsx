import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import {
  FiX,
  FiLogIn,
  FiLogOut,
  FiUserCheck,
  FiUserX,
  FiUserPlus,
  FiActivity,
  FiLock,
  FiDownload,
  FiEdit,
} from "react-icons/fi";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../FirebaseConfig";
import { getCurrentAdmin, updateAdminProfile } from "../services/adminService";
import { getRegisteredUsers } from "../services/registeredUserService";
import {
  getRecentAdminActivities,
  logAdminActivity,
} from "../services/adminActivityService";
import { toastSuccess, toastError } from "../utils/toast";

const SkeletonLine = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const toMillis = (ts) => {
  if (!ts) return 0;
  try {
    if (ts.toDate) return ts.toDate().getTime();
  } catch {
    return 0;
  }
  const parsed = new Date(ts).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatDateTime = (ts) => {
  if (!ts) return "—";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const formatRelative = (ts) => {
  const millis = toMillis(ts);
  if (!millis) return "—";
  const diff = Date.now() - millis;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  if (hrs < 48) return "Yesterday";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const ACTION_TITLE = {
  login: "Logged in",
  logout: "Logged out",
  approve_registration: "Approved registration",
  decline_registration: "Declined registration",
  ban_user: "Banned user",
  unban_user: "Unbanned user",
  create_admin: "Created admin",
  update_profile_name: "Updated profile name",
  update_password: "Changed password",
  export_report: "Downloaded report",
};

const ActivityTimeline = ({ items, currentAdminId }) => (
  <ul>
    {items.map((item, idx) => {
      const style = ACTIVITY_STYLE[item.type] || {
        icon: <FiActivity size={14} />,
        bg: "bg-gray-100 text-gray-600",
      };
      const isLast = idx === items.length - 1;
      const isYou = currentAdminId && item.actorId === currentAdminId;
      return (
        <li key={item.key} className="relative flex gap-3">
          <div className="flex flex-col items-center shrink-0 self-stretch">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ring-4 ring-white shrink-0 ${style.bg}`}
            >
              {style.icon}
            </div>
            {!isLast && <span className="w-px flex-1 bg-gray-100" />}
          </div>
          <div className={`min-w-0 flex-1 ${isLast ? "pb-1" : "pb-4"}`}>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {item.title}
              </p>
              {isYou && (
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-700 text-white">
                  You
                </span>
              )}
              <span
                className="ml-auto shrink-0 text-[11px] text-gray-400"
                title={formatDateTime(item.time)}
              >
                {formatRelative(item.time)}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate mt-px">
              {item.actor}
              {item.desc ? ` — ${item.desc}` : ""}
              {" • "}
              {formatDateTime(item.time)}
            </p>
          </div>
        </li>
      );
    })}
  </ul>
);

const ACTIVITY_STYLE = {
  login: { icon: <FiLogIn size={14} />, bg: "bg-blue-100 text-blue-700" },
  logout: { icon: <FiLogOut size={14} />, bg: "bg-gray-100 text-gray-600" },
  approve_registration: { icon: <FiUserCheck size={14} />, bg: "bg-green-100 text-green-700" },
  decline_registration: { icon: <FiUserX size={14} />, bg: "bg-orange-100 text-orange-700" },
  ban_user: { icon: <FiUserX size={14} />, bg: "bg-red-100 text-red-600" },
  unban_user: { icon: <FiUserCheck size={14} />, bg: "bg-teal-100 text-teal-700" },
  create_admin: { icon: <FiUserPlus size={14} />, bg: "bg-green-100 text-green-700" },
  update_profile_name: { icon: <FiEdit size={14} />, bg: "bg-purple-100 text-purple-700" },
  update_password: { icon: <FiLock size={14} />, bg: "bg-yellow-100 text-yellow-700" },
  export_report: { icon: <FiDownload size={14} />, bg: "bg-indigo-100 text-indigo-700" },
  // Fallback entries for accounts created before activity logging.
  admin_created: { icon: <FiUserPlus size={14} />, bg: "bg-green-100 text-green-700" },
  approved: { icon: <FiUserCheck size={14} />, bg: "bg-green-100 text-green-700" },
  banned: { icon: <FiUserX size={14} />, bg: "bg-red-100 text-red-600" },
};

const Profile = () => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileName, setProfileName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showAllActivityModal, setShowAllActivityModal] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const loadActivity = async (adminsData) => {
    try {
      setActivitiesLoading(true);
      const logs = await getRecentAdminActivities(15);
      if (logs.length > 0) {
        setActivities(
          logs.map((log) => ({
            key: log.id,
            type: log.action,
            title: ACTION_TITLE[log.action] || "Activity",
            actor: log.adminName || "Administrator",
            actorId: log.adminId || null,
            desc: log.description || "",
            millis: toMillis(log.createdAt),
            time: log.createdAt,
          })),
        );
        return;
      }
      const users = await getRegisteredUsers();
      const events = [];

      (adminsData || []).forEach((admin) => {
        if (admin.lastLogin && toMillis(admin.lastLogin) > 0) {
          events.push({
            key: `login-${admin.id}`,
            type: "login",
            title: "Login",
            actor: admin.name || admin.email || "Administrator",
            desc: "Logged in to the admin panel",
            millis: toMillis(admin.lastLogin),
            time: admin.lastLogin,
          });
        }
        if (admin.createdAt && toMillis(admin.createdAt) > 0) {
          events.push({
            key: `created-${admin.id}`,
            type: "admin_created",
            title: "Administrator added",
            actor: admin.name || admin.email || "Administrator",
            desc: `Joined as ${admin.role || "admin"}`,
            millis: toMillis(admin.createdAt),
            time: admin.createdAt,
          });
        }
      });

      (users || []).forEach((user) => {
        const name = user.fullName || user.name || user.email || "User";
        if (user.approvedAt && toMillis(user.approvedAt) > 0) {
          events.push({
            key: `approved-${user.id}`,
            type: "approved",
            title: "Approved registration",
            actor: name,
            desc: `Approved as ${user.role || "user"}`,
            millis: toMillis(user.approvedAt),
            time: user.approvedAt,
          });
        } else if (
          user.status === "banned" &&
          user.updatedAt &&
          toMillis(user.updatedAt) > 0
        ) {
          events.push({
            key: `banned-${user.id}`,
            type: "banned",
            title: "Banned user",
            actor: name,
            desc: "Account access revoked",
            millis: toMillis(user.updatedAt),
            time: user.updatedAt,
          });
        } else if (
          user.status === "approved" &&
          user.updatedAt &&
          toMillis(user.updatedAt) > 0 &&
          !user.approvedAt
        ) {
          events.push({
            key: `unbanned-${user.id}`,
            type: "approved",
            title: "Unbanned user",
            actor: name,
            desc: "Account access restored",
            millis: toMillis(user.updatedAt),
            time: user.updatedAt,
          });
        }
      });

      events.sort((a, b) => b.millis - a.millis);
      setActivities(events.slice(0, 15));
    } catch {
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const current = await getCurrentAdmin();
      setCurrentAdmin(current);
      setProfileName(current?.name || "");
      loadActivity(current ? [current] : []);
    } catch {
      setActivitiesLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleSaveProfile = async () => {
    if (!currentAdmin) return;
    const trimmed = profileName.trim();
    if (!trimmed) {
      toastError("Update failed", "Full name cannot be empty.");
      return;
    }
    if (trimmed.length > 100) {
      toastError("Update failed", "Full name is too long.");
      return;
    }
    try {
      setSavingProfile(true);
      await updateAdminProfile(currentAdmin.id, trimmed);
      setCurrentAdmin((prev) => ({ ...prev, name: trimmed }));
      logAdminActivity("update_profile_name", `Changed profile name to ${trimmed}`);
      toastSuccess("Profile updated", "Your full name has been saved.");
    } catch {
      toastError("Update failed", "Could not save your profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toastError("Update failed", "Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      toastError("Update failed", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword.length > 128) {
      toastError("Update failed", "New password is too long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError("Update failed", "New passwords do not match.");
      return;
    }
    const user = auth.currentUser;
    if (!user || !user.email) {
      toastError("Update failed", "No authenticated user. Please log in again.");
      return;
    }
    try {
      setPwSaving(true);
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      logAdminActivity("update_password", "Changed account password");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toastSuccess("Password updated", "Your password has been changed.");
    } catch {
      toastError("Update failed", "Could not update your password. Please try again.");
    } finally {
      setPwSaving(false);
    }
  };

  const roleStyle = () => "bg-green-100 text-green-700";

  const statusStyle = (status) =>
    status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";

  if (loading) {
    return (
      <>
        <div className="mb-5 sm:mb-6 lg:mb-8">
          <SkeletonLine className="h-7 w-48" />
          <SkeletonLine className="h-4 w-72 mt-2" />
        </div>
        <div className="flex flex-col gap-4 sm:gap-5 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 min-w-0">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 space-y-4 min-w-0">
                <SkeletonLine className="h-5 w-40" />
                <SkeletonLine className="h-11 w-full rounded-xl" />
                <SkeletonLine className="h-11 w-full rounded-xl" />
                <SkeletonLine className="h-11 w-32 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 space-y-4 min-w-0">
            <SkeletonLine className="h-5 w-56" />
            <SkeletonLine className="h-11 w-full rounded-xl" />
            <SkeletonLine className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-5 sm:mb-6 lg:mb-8">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-gray-800">
          Profile & Settings
        </h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account.</p>
      </div>
      <div className="flex flex-col gap-4 sm:gap-5 min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 min-w-0">
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 min-w-0">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <FaUser size={15} />
              </div>
              <h2 className="text-base font-semibold text-gray-800">My Profile</h2>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 mb-5">
              <div className="w-12 h-12 shrink-0 rounded-full bg-green-700 text-white flex items-center justify-center text-base font-bold">
                {currentAdmin?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-gray-800 truncate">
                  {currentAdmin?.name || "—"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {currentAdmin?.email || "—"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${roleStyle(currentAdmin?.role)}`}
                >
                  {currentAdmin?.role || "—"}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(currentAdmin?.status)}`}
                >
                  {currentAdmin?.status || "—"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Full name"
                  maxLength={100}
                  className="w-full bg-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm text-gray-700 placeholder:text-gray-400 border border-transparent focus:border-green-700 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={currentAdmin?.email || ""}
                  className="w-full bg-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm text-gray-500 border border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Role
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={currentAdmin?.role || ""}
                    className="w-full bg-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm text-gray-500 capitalize border border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Account Status
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={currentAdmin?.status || ""}
                    className="w-full bg-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm text-gray-500 border border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Account Created
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formatDateTime(currentAdmin?.createdAt)}
                    className="w-full bg-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm text-gray-500 border border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Last Login
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formatDateTime(currentAdmin?.lastLogin)}
                    className="w-full bg-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm text-gray-500 border border-transparent"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={() => {
                    setShowPasswordModal(true);
                  }}
                  className="flex-1 min-h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  Change Password
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex-1 min-h-11 bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 lg:p-6 min-w-0 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <FiActivity size={15} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-800 truncate leading-tight">
                  Recent Admin Activity
                </h2>
                <p className="text-xs text-gray-400 truncate">
                  {activitiesLoading
                    ? "Loading activity…"
                    : activities.length > 0
                      ? "Latest actions across admins"
                      : "No activity yet"}
                </p>
              </div>
              {!activitiesLoading && activities.length > 0 && (
                <span className="ml-auto shrink-0 flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  {activities.length}
                </span>
              )}
            </div>
            {activitiesLoading ? (
              <div className="space-y-4 pt-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonLine className="w-9 h-9 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonLine className="h-3.5 w-3/4" />
                      <SkeletonLine className="h-2.5 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <>
                <ActivityTimeline
                  items={activities.slice(0, 8)}
                  currentAdminId={currentAdmin?.id}
                />
                {activities.length > 8 && (
                  <div className="mt-auto pt-3">
                    <button
                      onClick={() => setShowAllActivityModal(true)}
                      className="w-full min-h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-600 transition"
                    >
                      View all {activities.length} activities
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-10 text-center">
                <div className="w-11 h-11 mx-auto rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                  <FiActivity size={18} />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  No recent admin activity yet.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Logins, bans, approvals and downloads will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAllActivityModal && (
        <div
          onClick={() => setShowAllActivityModal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease-out] max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                <FiActivity size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-800 text-[15px] tracking-tight truncate">
                  All Admin Activity
                </h3>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {activities.length} recent action{activities.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setShowAllActivityModal(false)}
                className="shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl p-2 transition"
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
              <ActivityTimeline items={activities} currentAdminId={currentAdmin?.id} />
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div
          onClick={() => !pwSaving && setShowPasswordModal(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease-out]"
          >
            <div className="px-6 py-5 bg-green-700 text-white flex items-center gap-3">
              <div className="w-9 h-9 shrink-0 rounded-full bg-white/15 flex items-center justify-center">
                <FiLock size={16} />
              </div>
              <h2 className="text-base font-bold tracking-tight flex-1">
                Change Password
              </h2>
              <button
                onClick={() => !pwSaving && setShowPasswordModal(false)}
                aria-label="Close"
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition"
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="px-6 py-6 space-y-3">
              <input
                type="password"
                placeholder="Current password"
                autoComplete="current-password"
                maxLength={128}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm text-gray-700 placeholder:text-gray-400 border border-transparent focus:border-green-700 focus:bg-white transition"
              />
              <input
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                maxLength={128}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm text-gray-700 placeholder:text-gray-400 border border-transparent focus:border-green-700 focus:bg-white transition"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                maxLength={128}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm text-gray-700 placeholder:text-gray-400 border border-transparent focus:border-green-700 focus:bg-white transition"
              />
            </div>
            <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={pwSaving}
                className="flex-1 min-h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordUpdate}
                disabled={pwSaving}
                className="flex-1 min-h-11 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
              >
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
