import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { cdnApiClient } from "../../services/authService";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";

const UserSettings: React.FC = () => {
  const { user, refreshToken, logout } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFASecret, setTwoFASecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [twoFACode, setTwoFACode] = useState("");

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

  const start2FASetup = async () => {
    setLoading(true);
    try {
      const res = await cdnApiClient.post("/auth/2fa", { enable: true });
      setTwoFASecret(res.data.secret);
      setOtpauthUrl(res.data.otpauth_url);
      setShow2FASetup(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to start 2FA setup");
    }
    setLoading(false);
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cdnApiClient.post("/auth/2fa/verify", { token: twoFACode });
      toast.success("2FA enabled!");
      setShow2FASetup(false);
      setTwoFACode("");
      await refreshToken();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Invalid code");
    }
    setLoading(false);
  };

  const handle2FADisable = async () => {
    setLoading(true);
    try {
      await cdnApiClient.post("/auth/2fa", { enable: false });
      toast.success("2FA disabled");
      setShow2FASetup(false);
      setTwoFASecret("");
      setOtpauthUrl("");
      await refreshToken();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to disable 2FA");
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
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Two-Factor Authentication (2FA)</label>
        {user?.is_2fa_enabled ? (
          <button className="btn btn-secondary" disabled={loading} onClick={handle2FADisable} type="button">
            Disable 2FA
          </button>
        ) : show2FASetup ? (
          <div className="flex flex-col items-center space-y-4 p-4 border rounded bg-gray-50">
            {otpauthUrl && (
              <div>
                <pre className="text-xs bg-gray-100 p-2 rounded mb-2">
                  {JSON.stringify({ otpauthUrl, twoFASecret }, null, 2)}
                </pre>
                <QRCode value={otpauthUrl} size={128} />
                <span className="text-xs mt-2">Scan this QR code in your authenticator app.</span>
                {twoFASecret && (
                  <span className="text-xs break-all">Authenticator Key: <b>{twoFASecret}</b></span>
                )}
              </div>
            )}
            <form onSubmit={handle2FAVerify} className="w-full flex flex-col items-center space-y-2">
              <input
                type="text"
                className="input input-bordered w-full"
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                pattern="[0-9]{6}"
                maxLength={6}
              />
              <button className="btn btn-primary w-full" disabled={loading} type="submit">
                Confirm & Enable 2FA
              </button>
            </form>
          </div>
        ) : (
          <button className="btn btn-secondary" disabled={loading} onClick={start2FASetup} type="button">
            Enable 2FA
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
