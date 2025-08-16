import React, { useEffect, useState } from "react";
import {
  User as UserIcon,
  Mail,
  Edit,
  Save,
  X,
  Download,
  Shield,
  Trash2,
} from "lucide-react";
import axios from "axios";

interface ProfileData {
  name: string;
  email: string;
  joinDate: string; // ISO
  timezone: string;
}

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Change Password modal
  const [showChangePass, setShowChangePass] = useState(false);
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpBusy, setCpBusy] = useState(false);
  const [cpError, setCpError] = useState("");
  const [cpSuccess, setCpSuccess] = useState("");

  // Delete Account modal
  const [showDelete, setShowDelete] = useState(false);
  const [delConfirmText, setDelConfirmText] = useState("");
  const [delPassword, setDelPassword] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [delError, setDelError] = useState("");

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    joinDate: new Date().toISOString(),
    timezone: "UTC-5",
  });

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const loadProfile = async () => {
    if (!userId) {
      setLoading(false);
      setError("You’re not logged in. Please log in to view your profile.");
      return;
    }
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await axios.get<Partial<ProfileData>>(
        `http://localhost:5000/api/profile/${userId}`
      );
      const data = res.data || {};
      setProfileData({
        name: data.name || "",
        email: data.email || "",
        joinDate: data.joinDate || new Date().toISOString(),
        timezone: data.timezone || "UTC-5",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Save (profile fields only)
  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await axios.put(`http://localhost:5000/api/profile/${userId}`, {
        ...profileData,
      });
      setIsEditing(false);
      setNotice("Profile updated successfully.");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ profile: profileData }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = profileData.name?.trim() || "profile";
    a.href = url;
    a.download = `${safeName.replace(/\s+/g, "_")}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Change password
  const submitChangePassword = async () => {
    if (!userId) return;
    setCpError("");
    setCpSuccess("");
    if (!cpCurrent || !cpNew || !cpConfirm) {
      setCpError("Please fill all fields.");
      return;
    }
    if (cpNew !== cpConfirm) {
      setCpError("New passwords do not match.");
      return;
    }
    setCpBusy(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/change-password",
        {
          userId,
          currentPassword: cpCurrent,
          newPassword: cpNew,
        }
      );
      if (res.status === 200) {
        setCpSuccess("Password changed successfully.");
        setCpCurrent("");
        setCpNew("");
        setCpConfirm("");
        setTimeout(() => setShowChangePass(false), 900);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to change password.";
      setCpError(msg);
    } finally {
      setCpBusy(false);
    }
  };

  // Delete account
  const submitDeleteAccount = async () => {
    if (!userId) return;
    setDelError("");
    if (delConfirmText !== "DELETE") {
      setDelError('Please type "DELETE" to confirm.');
      return;
    }
    if (!delPassword) {
      setDelError("Please enter your password to confirm.");
      return;
    }
    setDelBusy(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/delete-account",
        { userId, password: delPassword }
      );
      if (res.status === 200) {
        window.location.href = "/";
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to delete account.";
      setDelError(msg);
    } finally {
      setDelBusy(false);
    }
  };

  if (!userId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
          You’re not logged in. Please log in to view your profile.
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading your profile…</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-primary-100 to-secondary-100 border border-gray-100">
        <div className="flex items-start justify-between">
          {/* Left: icon + title + subtitle */}
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-white/70">
              <UserIcon className="w-7 h-7 text-primary-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
              <p className="text-gray-700">
                Manage your personal details & account
              </p>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={`${
                    saving ? "opacity-60 cursor-not-allowed" : ""
                  } bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2`}
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving…" : "Save"}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Decorative blob */}
        <svg
          className="absolute -right-10 -bottom-10 w-72 opacity-20 pointer-events-none"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            className="text-primary-400"
            d="M38.1,-53.2C49.2,-45.6,57.4,-34.4,62.1,-22.2C66.9,-10.1,68.2,3.1,64.2,14.4C60.2,25.7,50.8,35.1,40.1,44.7C29.4,54.3,17.3,64,3.8,67.1C-9.8,70.2,-19.6,66.7,-30.1,61.1C-40.6,55.5,-51.9,47.8,-58.5,37.2C-65.1,26.5,-67,13.3,-64.6,1.2C-62.2,-10.9,-55.4,-21.7,-48.5,-32.2C-41.6,-42.7,-34.7,-52.9,-25.4,-61.1C-16.1,-69.4,-8.1,-75.7,2.1,-78.8C12.4,-81.8,24.8,-81,38.1,-53.2Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      {/* Notices */}
      {notice && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
          {notice}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Personal Information
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                {profileData.name}
              </div>
            )}
          </div>

          {/* Email (read-only in UI) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{profileData.email}</span>
            </div>
          </div>

          {/* Join Date & Timezone */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Join Date
              </label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                {new Date(profileData.joinDate).toLocaleDateString()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              {isEditing ? (
                <select
                  value={profileData.timezone}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      timezone: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="UTC-8">Pacific Time (UTC-8)</option>
                  <option value="UTC-7">Mountain Time (UTC-7)</option>
                  <option value="UTC-6">Central Time (UTC-6)</option>
                  <option value="UTC-5">Eastern Time (UTC-5)</option>
                </select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                  {profileData.timezone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account</h2>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setCpError("");
              setCpSuccess("");
              setShowChangePass(true);
            }}
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
          >
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600">
                Update your account password
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
          >
            <Download className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-600">
                Download your profile (JSON)
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setDelError("");
              setDelBusy(false);
              setDelPassword("");
              setDelConfirmText("");
              setShowDelete(true);
            }}
            className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center gap-3"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-600">
                This action cannot be undone
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePass && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <button
                type="button"
                onClick={() => setShowChangePass(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cpError && (
              <div className="mb-3 text-sm bg-red-50 text-red-800 border border-red-200 rounded p-2">
                {cpError}
              </div>
            )}
            {cpSuccess && (
              <div className="mb-3 text-sm bg-green-50 text-green-800 border border-green-200 rounded p-2">
                {cpSuccess}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={cpCurrent}
                  onChange={(e) => setCpCurrent(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={cpNew}
                  onChange={(e) => setCpNew(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be 8+ chars with upper, lower, number, special.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={cpConfirm}
                  onChange={(e) => setCpConfirm(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-300"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowChangePass(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitChangePassword}
                disabled={cpBusy}
                className={`px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 ${
                  cpBusy ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {cpBusy ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-700">
                Delete Account
              </h3>
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {delError && (
              <div className="mb-3 text-sm bg-red-50 text-red-800 border border-red-200 rounded p-2">
                {delError}
              </div>
            )}

            <p className="text-sm text-gray-700 mb-4">
              This will permanently delete your account and data. Type{" "}
              <span className="font-semibold">DELETE</span> to confirm.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type DELETE
                </label>
                <input
                  type="text"
                  value={delConfirmText}
                  onChange={(e) => setDelConfirmText(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={delPassword}
                  onChange={(e) => setDelPassword(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDeleteAccount}
                disabled={delBusy}
                className={`px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 ${
                  delBusy ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {delBusy ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
