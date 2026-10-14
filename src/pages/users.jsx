import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaUsers } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiUserX, FiUserCheck, FiSearch } from "react-icons/fi";
import {
  getRegisteredUsers,
  banUser,
  unbanUser,
} from "../services/registeredUserService";
import { logAdminActivity } from "../services/adminActivityService";
import { toastSuccess, toastError } from "../utils/toast";

const ITEMS_PER_PAGE = 5;

const SkeletonLine = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const RowSkeleton = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-3 pr-4">
        <SkeletonLine className="h-4 w-full max-w-24" />
      </td>
    ))}
  </tr>
);

const UserCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-[10px] p-4 space-y-3">
    <div className="flex items-center gap-3">
      <SkeletonLine className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="h-3 w-36" />
      </div>
    </div>
    <div className="flex justify-between items-center">
      <SkeletonLine className="h-5 w-16 rounded-full" />
      <SkeletonLine className="h-5 w-16 rounded-full" />
    </div>
  </div>
);

const RegisteredUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const tableRef = useRef(null);
  const [colWidths, setColWidths] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(e.target)
      ) {
        setRoleDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target)
      ) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getRegisteredUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = user.fullName || user.name || "";
      const email = user.email || "";
      const role = user.role || "";
      const status = user.status || "";
      const matchesSearch =
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());
      const matchesRole =
        roleFilter === "All Roles" ||
        role.toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus =
        statusFilter === "All Status" ||
        status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
    setColWidths(null);
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE),
  );

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const displayUsers = useMemo(() => {
    const list = [...paginatedUsers];
    while (list.length < ITEMS_PER_PAGE) list.push(null);
    return list;
  }, [paginatedUsers]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    if (loading || currentPage !== 1 || paginatedUsers.length === 0) return;
    const table = tableRef.current;
    if (!table) return;
    const heads = table.querySelectorAll("thead th");
    if (heads.length === 0) return;
    const tableWidth = table.getBoundingClientRect().width;
    if (!tableWidth) return;
    setColWidths(
      Array.from(heads).map(
        (th) => `${(th.getBoundingClientRect().width / tableWidth) * 100}%`,
      ),
    );
  }, [loading, currentPage, paginatedUsers]);

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-[#DCFCE7] text-[#14532d]";
      case "banned":
        return "bg-[#FDE8E8] text-[#DC2626]";
      case "pending":
        return "bg-[#FEF3C7] text-[#D97706]";
      default:
        return "bg-[#F6F6F6] text-gray-500";
    }
  };

  const roleStyle = (role) =>
    role?.toLowerCase() === "farmer"
      ? "bg-[#DCFCE7] text-[#14532d]"
      : "bg-[#eff6ff] text-[#2563EB]";

  const formatDate = (createdAt) => {
    if (!createdAt) return "N/A";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openBanModal = (user) => setActionTarget({ user, action: "ban" });
  const openUnbanModal = (user) => setActionTarget({ user, action: "unban" });
  const closeActionModal = () => {
    if (actionLoading) return;
    setActionTarget(null);
  };

  const confirmAction = async () => {
    if (!actionTarget) return;
    const { user, action } = actionTarget;
    try {
      setActionLoading(true);
      if (action === "ban") {
        await banUser(user.id);
      } else {
        await unbanUser(user.id);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: action === "ban" ? "banned" : "approved" }
            : u,
        ),
      );
      const targetName =
        user.fullName || user.name || user.email || "User";
      logAdminActivity(
        action === "ban" ? "ban_user" : "unban_user",
        action === "ban"
          ? `Banned user ${targetName}`
          : `Unbanned user ${targetName}`,
        { targetId: user.id, targetName },
      );
      toastSuccess(
        action === "ban" ? "User banned" : "User unbanned",
        action === "ban"
          ? `${targetName} lost access to the app.`
          : `${targetName} can access the app again.`,
      );
      setActionTarget(null);
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      toastError("Action failed", `Could not ${action} this user. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const renderAction = (user) => {
    const status = user.status?.toLowerCase();
    if (status === "pending") {
      return <span className="text-xs text-gray-500 italic">No action</span>;
    }
    if (status === "banned") {
      return (
        <button
          onClick={() => openUnbanModal(user)}
          className="min-h-9 px-3 py-1.5 rounded-[5px] text-xs font-semibold bg-[#DCFCE7] text-[#14532d] hover:opacity-90 active:opacity-85 transition"
        >
          Unban
        </button>
      );
    }
    return (
      <button
        onClick={() => openBanModal(user)}
        className="min-h-9 px-3 py-1.5 rounded-[5px] text-xs font-semibold bg-[#FDE8E8] text-[#DC2626] hover:opacity-90 active:opacity-85 transition"
      >
        Ban
      </button>
    );
  };

  return (
    <>
      <div className="rounded-[10px] p-[18px] sm:p-6 lg:p-8 mb-5 sm:mb-6 lg:mb-8 flex justify-between items-center" style={{ backgroundColor: "#14532d" }}>
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-widest text-[#bbf7d0] uppercase">
            Users
          </p>
          <h1 className="text-xl font-black text-white">
            Registered Users
          </h1>
          <p className="text-xs text-[#dcfce7] mt-1">
            Manage buyer and farmer accounts across the platform.
          </p>
        </div>
        <div className="hidden sm:flex w-16 h-16 rounded-full bg-white items-center justify-center shrink-0 ml-4">
          <FaUsers size={28} color="#14532d" />
        </div>
      </div>
      <div className="bg-white rounded-[10px] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center gap-3 p-4 sm:p-5 lg:p-6 border-b border-gray-100">
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-sm pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email"
              maxLength={100}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-[5px] outline-none text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#14532d] transition"
            />
          </div>
          <div className="flex gap-3 md:ml-auto">
            <div ref={roleDropdownRef} className="relative flex-1 md:flex-none md:w-40">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 bg-white border border-gray-200 pl-4 pr-3.5 py-2.5 rounded-[5px] text-sm font-medium text-gray-700 outline-none focus:border-[#14532d] transition cursor-pointer"
              >
                <span className="truncate">{roleFilter}</span>
                <FaChevronDown
                  className={`text-gray-400 text-[10px] shrink-0 transition-transform ${
                    roleDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {roleDropdownOpen && (
                <div className="absolute left-0 z-10 mt-1.5 w-full bg-white rounded-[10px] shadow-lg border border-gray-100 overflow-hidden py-1">
                  {["All Roles", "Buyer", "Farmer"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setRoleFilter(option);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition ${
                        option === roleFilter
                          ? "bg-[#14532d] text-white font-bold"
                          : "text-gray-700 hover:bg-[#F6F6F6]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div ref={statusDropdownRef} className="relative flex-1 md:flex-none md:w-40">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 bg-white border border-gray-200 pl-4 pr-3.5 py-2.5 rounded-[5px] text-sm font-medium text-gray-700 outline-none focus:border-[#14532d] transition cursor-pointer"
              >
                <span className="truncate capitalize">{statusFilter}</span>
                <FaChevronDown
                  className={`text-gray-400 text-[10px] shrink-0 transition-transform ${
                    statusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {statusDropdownOpen && (
                <div className="absolute right-0 z-10 mt-1.5 w-full bg-white rounded-[10px] shadow-lg border border-gray-100 overflow-hidden py-1">
                  {["All Status", "approved", "pending", "banned"].map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setStatusFilter(option);
                          setStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm capitalize transition ${
                          option === statusFilter
                            ? "bg-[#14532d] text-white font-bold"
                            : "text-gray-700 hover:bg-[#F6F6F6]"
                        }`}
                      >
                        {option}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="hidden sm:block overflow-x-auto relative">
            <table
              ref={tableRef}
              className={`w-full min-w-160 text-sm ${colWidths ? "table-fixed" : ""}`}
            >
              {colWidths && (
                <colgroup>
                  {colWidths.map((w, i) => (
                    <col key={i} style={{ width: w }} />
                  ))}
                </colgroup>
              )}
              <thead>
                <tr className="text-left text-gray-500 uppercase text-[11px] font-semibold tracking-[1.5px]">
                  <th className="pb-4 pr-4 font-semibold">User</th>
                  <th className="pb-4 pr-4 font-semibold">Role</th>
                  <th className="pb-4 pr-4 font-semibold">Joined</th>
                  <th className="pb-4 pr-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <RowSkeleton key={i} cols={5} />
                  ))
                ) : paginatedUsers.length > 0 ? (
                  displayUsers.map((user, i) =>
                    user ? (
                    <tr key={user.id} className="hover:bg-[#F6F6F6] transition">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-[#14532d] text-white flex items-center justify-center text-xs font-bold">
                            {(user.fullName || user.name || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {user.fullName || user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="pr-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${roleStyle(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="pr-4 whitespace-nowrap text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="pr-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${statusStyle(
                            user.status,
                          )}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>{renderAction(user)}</td>
                    </tr>
                    ) : (
                      <tr key={`empty-${i}`} aria-hidden="true" className="opacity-0 pointer-events-none select-none">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-gray-300" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">—</p>
                              <p className="text-xs truncate">—</p>
                            </div>
                          </div>
                        </td>
                        <td className="pr-4">
                          <span className="px-3 py-1 rounded-full text-xs">—</span>
                        </td>
                        <td className="pr-4 text-sm">—</td>
                        <td className="pr-4">
                          <span className="px-3 py-1 rounded-full text-xs">—</span>
                        </td>
                        <td>
                          <span className="inline-block min-h-9 px-3 py-1.5 text-xs">—</span>
                        </td>
                      </tr>
                    ),
                  )
                ) : (
                  Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <tr key={`empty-${i}`} aria-hidden="true" className="opacity-0 pointer-events-none select-none">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-gray-300" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">—</p>
                            <p className="text-xs truncate">—</p>
                          </div>
                        </div>
                      </td>
                      <td className="pr-4">
                        <span className="px-3 py-1 rounded-full text-xs">—</span>
                      </td>
                      <td className="pr-4 text-sm">—</td>
                      <td className="pr-4">
                        <span className="px-3 py-1 rounded-full text-xs">—</span>
                      </td>
                      <td>
                        <span className="inline-block min-h-9 px-3 py-1.5 text-xs">—</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!loading && paginatedUsers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 pointer-events-none">
                No registered users found.
              </div>
            )}
          </div>
          <div className="sm:hidden space-y-3 relative">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <UserCardSkeleton key={i} />
              ))
            ) : paginatedUsers.length > 0 ? (
              displayUsers.map((user, i) =>
                user ? (
                <div key={user.id} className="bg-white border border-gray-100 rounded-[10px] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-[#14532d] text-white flex items-center justify-center text-xs font-bold">
                      {(user.fullName || user.name || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {user.fullName || user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${roleStyle(user.role)}`}
                    >
                      {user.role}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize ${statusStyle(
                        user.status,
                      )}`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Joined {formatDate(user.createdAt)}
                    </span>
                    {renderAction(user)}
                  </div>
                </div>
                ) : (
                  <div
                    key={`empty-${i}`}
                    aria-hidden="true"
                    className="bg-white border border-gray-100 rounded-[10px] p-4 opacity-0 pointer-events-none select-none"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 shrink-0 rounded-full bg-gray-300" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">—</p>
                        <p className="text-xs truncate">—</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="px-3 py-1 rounded-full text-xs">—</span>
                      <span className="px-3 py-1 rounded-full text-xs">—</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-xs">—</span>
                      <span className="text-xs">—</span>
                    </div>
                  </div>
                ),
              )
            ) : (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  aria-hidden="true"
                  className="bg-white border border-gray-100 rounded-[10px] p-4 opacity-0 pointer-events-none select-none"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-gray-300" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">—</p>
                      <p className="text-xs truncate">—</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="px-3 py-1 rounded-full text-xs">—</span>
                    <span className="px-3 py-1 rounded-full text-xs">—</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs">—</span>
                    <span className="text-xs">—</span>
                  </div>
                </div>
              ))
            )}
            {!loading && paginatedUsers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 pointer-events-none">
                No registered users found.
              </div>
            )}
          </div>
          {!loading && (
            <div
              className={`flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100 ${
                filteredUsers.length === 0
                  ? "invisible pointer-events-none select-none"
                  : ""
              }`}
              aria-hidden={filteredUsers.length === 0 || undefined}
            >
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="min-w-11 min-h-11 sm:w-8 sm:h-8 sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-[5px] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F6F6F6] transition"
              >
                <IoIosArrowBack size={16} />
              </button>
              <span className="min-w-11 min-h-11 sm:w-8 sm:h-8 sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-[5px] text-sm font-semibold bg-[#14532d] text-white">
                {currentPage}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="min-w-11 min-h-11 sm:w-8 sm:h-8 sm:min-w-0 sm:min-h-0 flex items-center justify-center rounded-[5px] text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F6F6F6] transition"
              >
                <IoIosArrowForward size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      {actionTarget && (
        <div
          onClick={closeActionModal}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-[10px] shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease-out]"
          >
            <div
              className={`px-6 py-5 flex items-center gap-3 ${
                actionTarget.action === "ban" ? "bg-[#DC2626]" : "bg-[#14532d]"
              } text-white`}
            >
              <div className="w-9 h-9 shrink-0 rounded-full bg-white/15 flex items-center justify-center">
                {actionTarget.action === "ban" ? (
                  <FiUserX size={18} />
                ) : (
                  <FiUserCheck size={18} />
                )}
              </div>
              <h2 className="text-base font-bold tracking-tight truncate">
                {actionTarget.action === "ban" ? "Ban User" : "Unban User"}
              </h2>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div className="flex items-center gap-3 bg-[#F6F6F6] rounded-[10px] p-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#14532d] text-white flex items-center justify-center text-sm font-bold">
                  {(actionTarget.user.fullName || actionTarget.user.name || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {actionTarget.user.fullName || actionTarget.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {actionTarget.user.email}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {actionTarget.action === "ban"
                  ? "Are you sure you want to ban this user? They will lose access to the app until you unban them."
                  : "This will restore the user's access to the app. Do you want to continue?"}
              </p>
            </div>
            <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeActionModal}
                disabled={actionLoading}
                className="flex-1 min-h-11 bg-[#F6F6F6] hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-[5px] text-sm font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={actionLoading}
                className={`flex-1 min-h-11 px-4 py-2.5 rounded-[5px] text-sm font-semibold text-white transition disabled:opacity-60 ${
                  actionTarget.action === "ban"
                    ? "bg-[#DC2626] hover:opacity-90 active:opacity-85"
                    : "bg-[#14532d] hover:opacity-90 active:opacity-85"
                }`}
              >
                {actionLoading
                  ? "Please wait..."
                  : actionTarget.action === "ban"
                    ? "Yes, Ban User"
                    : "Yes, Unban User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisteredUser;
