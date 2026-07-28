import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { getRegisteredUsers } from "../services/registeredUserService";

const ITEMS_PER_PAGE = 5;

const RegisteredUser = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

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
      const data = await getRegisteredUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
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

  // Reset to page 1 whenever filters change, so hindi nakatambay
  // sa page na wala nang laman.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  );

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <>
      <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">
        REGISTERED USERS
      </h1>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 bg-gray-100 px-4 py-2.5 rounded-xl outline-none text-sm border border-transparent focus:border-green-600 focus:bg-white transition"
        />

        <div className="flex flex-wrap gap-3 items-center">
          {/* ROLE FILTER DROPDOWN */}
          <div ref={roleDropdownRef} className="relative flex-1 min-w-[140px] sm:flex-none">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen((prev) => !prev)}
              className="w-full sm:w-auto flex items-center justify-between gap-8 bg-gray-100 pl-4 pr-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 outline-none border border-transparent focus:border-green-600 focus:bg-white transition cursor-pointer sm:min-w-36"
            >
              {roleFilter}
              <FaChevronDown
                className={`text-gray-400 text-[10px] transition-transform ${
                  roleDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {roleDropdownOpen && (
              <div className="absolute z-10 mt-1.5 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-1">
                {["All Roles", "Buyer", "Farmer"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setRoleFilter(option);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      option === roleFilter
                        ? "bg-green-700 text-white font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STATUS FILTER DROPDOWN */}
          <div ref={statusDropdownRef} className="relative flex-1 min-w-[140px] sm:flex-none">
            <button
              type="button"
              onClick={() => setStatusDropdownOpen((prev) => !prev)}
              className="w-full sm:w-auto flex items-center justify-between gap-8 bg-gray-100 pl-4 pr-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 outline-none border border-transparent focus:border-green-600 focus:bg-white transition cursor-pointer sm:min-w-36"
            >
              {statusFilter}
              <FaChevronDown
                className={`text-gray-400 text-[10px] transition-transform ${
                  statusDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {statusDropdownOpen && (
              <div className="absolute z-10 mt-1.5 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-1">
                {["All Status", "approved", "pending"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setStatusFilter(option);
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      option === statusFilter
                        ? "bg-green-700 text-white font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-xs tracking-wider">
                <th className="pb-4 pr-4">User</th>
                <th className="pb-4 pr-4">Role</th>
                <th className="pb-4 pr-4">Joined</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    {/* USER */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                          {(user.fullName || user.name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium">
                            {user.fullName || user.name}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="pr-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          user.role?.toLowerCase() === "farmer"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* JOINED */}
                    <td className="pr-4 whitespace-nowrap">
                      {user.createdAt?.toDate
                        ? user.createdAt.toDate().toLocaleDateString()
                        : "-"}
                    </td>

                    {/* STATUS */}
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No registered users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredUsers.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              <IoIosArrowBack size={16} />
            </button>

            <span className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium bg-green-700 text-white">
              {currentPage}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition"
            >
              <IoIosArrowForward size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default RegisteredUser;
