import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { cdnApiClient } from "../../services/authService";
import toast from "react-hot-toast";

const UserSettings: React.FC = () => {
  const { user, refreshToken, logout } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [enable2FA, setEnable2FA] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cdnApiClient.put("/auth/change-email", { new_email: newEmail });
      toast.success("Email updated!");
      setEmail(newEmail);
      setNewEmail("");
      await refreshToken();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update email");
    }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cdnApiClient.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
      logout();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update password");
    }
    setLoading(false);
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await cdnApiClient.post("/auth/2fa", { enable: !enable2FA });
      setEnable2FA(!enable2FA);
      setTwoFASecret(res.data.secret || "");
      toast.success("2FA status updated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update 2FA");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">User Settings</h2>
      <form onSubmit={handleChangeEmail} className="mb-6">
        <label className="block mb-2 font-semibold">Change Email</label>
        <input
          type="email"
          className="input input-bordered w-full mb-2"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder={email}
          required
        />
        <button className="btn btn-primary" disabled={loading} type="submit">
          Update Email
        </button>
      </form>
      <form onSubmit={handleChangePassword} className="mb-6">
        <label className="block mb-2 font-semibold">Change Password</label>
        <input
          type="password"
          className="input input-bordered w-full mb-2"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
          required
        />
        <input
          type="password"
          className="input input-bordered w-full mb-2"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="New Password"
          required
        />
        <button className="btn btn-primary" disabled={loading} type="submit">
          Update Password
        </button>
      </form>
      <form onSubmit={handle2FA} className="mb-6">
        <label className="block mb-2 font-semibold">Two-Factor Authentication (2FA)</label>
        <button className="btn btn-secondary" disabled={loading} type="submit">
          {enable2FA ? "Disable 2FA" : "Enable 2FA"}
        </button>
        {twoFASecret && (
          <div className="mt-2 text-xs text-gray-600">
            <span>Secret: {twoFASecret}</span>
            <br />
            <span>Scan this secret in your authenticator app.</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default UserSettings;
