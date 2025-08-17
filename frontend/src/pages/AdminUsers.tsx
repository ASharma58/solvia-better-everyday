// frontend/src/pages/AdminUsers.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  UserX,
  Shield,
  Download,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { User } from "../types/admin";
import axios from "axios";
import { API_URL } from "../constants/api";

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await axios.get<{ users: User[] }>(
        `${API_URL}/api/admin/users`,
        { params }
      );
      setUsers(res.data.users ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initial load

  // refetch when filters change (debounce search if you want)
  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

  const filteredUsers = useMemo(() => users, [users]);

  const callAction = async (
    userId: string,
    action: "activate" | "suspend" | "deactivate"
  ) => {
    setBusyId(userId);
    setError("");
    try {
      await axios.post(`${API_URL}/api/admin/users/${userId}/${action}`);
      // locally reflect the change without storing extras
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                status:
                  action === "activate"
                    ? "active"
                    : action === "suspend"
                    ? "suspended"
                    : "deactivated",
              }
            : u
        )
      );
    } catch (e: any) {
      setError(e?.response?.data?.error || "Action failed.");
    } finally {
      setBusyId(null);
    }
  };

  const exportUserData = async (userId: string) => {
    setBusyId(userId);
    setError("");
    try {
      await axios.post(`${API_URL}/api/admin/users/${userId}/export`);
      alert("Export started. The user will be notified when ready.");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Export failed.");
    } finally {
      setBusyId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800";
      case "deactivated":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage user accounts and privacy compliance
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Total Users: {users.length}
          </span>
        </div>
      </div>

      {/* Search / Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>
        {loading && (
          <div className="mt-3 text-sm text-gray-500">Loading users…</div>
        )}
        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.consent_given ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className="text-sm text-gray-900">
                        {user.consent_given ? "Given" : "Pending"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.location || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewUserDetails(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => exportUserData(user.id)}
                        disabled={busyId === user.id}
                        className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                        title="Export Data"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {user.status === "active" ? (
                        <button
                          onClick={() => callAction(user.id, "suspend")}
                          disabled={busyId === user.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title="Suspend User"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => callAction(user.id, "activate")}
                          disabled={busyId === user.id}
                          className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                          title="Activate User"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-sm text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                User Details
              </h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <p className="text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedUser.status
                      )}`}
                    >
                      {selectedUser.status.replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.location || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy & Consent */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Privacy & Consent
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Consent Given
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.consent_given ? "Yes" : "No"}
                      {selectedUser.consent_date && (
                        <span className="text-gray-500 ml-2">
                          (
                          {new Date(
                            selectedUser.consent_date
                          ).toLocaleDateString()}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Age Verified
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.age_verified ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data Retention Expiry
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.data_retention_expiry
                        ? new Date(
                            selectedUser.data_retention_expiry
                          ).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Settings
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Data Sharing
                      </span>
                      <span className="text-sm text-gray-900">
                        {selectedUser.privacy_settings.data_sharing
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Analytics</span>
                      <span className="text-sm text-gray-900">
                        {selectedUser.privacy_settings.analytics
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Marketing</span>
                      <span className="text-sm text-gray-900">
                        {selectedUser.privacy_settings.marketing
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Activity */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Account Activity
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Joined
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.joinDate
                        ? new Date(selectedUser.joinDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Login
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.last_login
                        ? new Date(selectedUser.last_login).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => exportUserData(selectedUser.id)}
                disabled={busyId === selectedUser.id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
